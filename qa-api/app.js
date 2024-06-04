import { serve, connect } from "./deps.js";
import * as coursesService from "./services/coursesService.js"
import * as questionService from "./services/questionsService.js"
import * as answerService from "./services/answersService.js"
import * as questionUpvotesService from "./services/questionUpvotesService.js"
import * as answerUpvotesService from "./services/answerUpvotesService.js"
import { cacheMethodCalls } from "./util/cacheUtil.js";
const questionSocketMap = new Map();
const answerSocketMap = new Map();

console.log("hello qa-api");

const cachedCourseService = cacheMethodCalls("courseService", coursesService, []);
const cachedQuestionService = cacheMethodCalls("questionService", questionService, ["addQuestion", "updateUpvoteTime"]);
const cachedQuestionUpvotesService = cacheMethodCalls("questionUpvotesService", questionUpvotesService, ["addUpvoteQuestions"]);
const cachedAnswerUpvotesService = cacheMethodCalls("answerUpvotesService",answerUpvotesService, ["addUpvoteAnswers"]);

let producerClient;
if(Deno.env.get("REDIS_HOST") && Deno.env.get("REDIS_PORT")) {
  console.log("k8s")
  const host = Deno.env.get("REDIS_HOST");
  const port = Deno.env.get("REDIS_PORT");
  try {
    if(Deno.env.get("REDIS_PASS")) {
      const password = Deno.env.get("REDIS_PASS")
      producerClient = await connect({
        hostname: host,
        port: port,
        password: password
      })
    } else {
      producerClient = await connect({
        hostname: host,
        port: port,
      })
    }
  } catch (e) {
    console.log(e);
    console.log(host)
    console.log(port)
  }
} else {
  console.log("normal")
  try {
    producerClient = await connect({
    hostname: "redis",
    port: 6379,
    });
  } catch(e) {
    console.log(e);
  }
}


const handleRequest = async (request) => {
    const url = new URL(request.url);
    console.log(url.pathname);
    if (url.pathname === "/courses" && request.method === "GET") {
      const courses = await cachedCourseService.findAll();
      // console.log(courses);
      return Response.json(courses);
    } else if (url.pathname.match("/course/[0-9]+") && request.method === "GET") {
      const urlParts = url.pathname.split("/");
      const courseId = urlParts[2];
      // const questions = await questionService.findByCourseId(courseId, 20, 0);
      const questions = await cachedQuestionService.findByCourseId(courseId, 20, 0);
      // console.log(questions);
      const addUpvoteQuestions = await Promise.all( questions.map( async (question) => {
        // let upvotes = await questionUpvotesService.countByQuestion(question.id);
        let upvotes = await cachedQuestionUpvotesService.countByQuestion(question.id);
        // console.log(upvotes)
        question.upvotes = upvotes['count_vote'];
        return question;
      }))
      // console.log(addUpvoteQuestions)
      // for(let i = 0; i < questions.length;i++) {
      //   let upvotes = await questionUpvotesService.countByQuestion(questions[i].id);
      //   questions[i].upvotes = upvotes.countVote;
      //   console.log()
      // }
      const course = await cachedCourseService.findById(courseId);

      // const allQuestions = await questionService.findAllByCourseId(courseId);
      const allQuestions = await cachedQuestionService.findAllByCourseId(courseId);
      // console.log(course); 
      const response = {
        course: course,
        questions: addUpvoteQuestions,
        totalQuestion: allQuestions.length
      }
      return Response.json(response);
    } else if(url.pathname === "/questions" && request.method === "GET") {
      const limit = url.searchParams.get('limit');
      const offset = url.searchParams.get('offset');
      const courseId = url.searchParams.get('courseId');

      // const questions = await questionService.findByCourseId(courseId, limit, offset);
      const questions = await cachedQuestionService.findByCourseId(courseId, limit, offset);
      const addUpvoteQuestions = await Promise.all( questions.map( async (question) => {
        // let upvotes = await questionUpvotesService.countByQuestion(question.id);
        let upvotes = await cachedQuestionUpvotesService.countByQuestion(question.id);
        // console.log(upvotes)
        question.upvotes = upvotes['count_vote'];
        return question;
      }));
      const response = {
        questions: addUpvoteQuestions
      }
      return Response.json(response)
    } else if(url.pathname === "/questions" && request.method === "POST") {
      const requestData = await request.json();
      // console.log(requestData);
      
      //check time span
      // const latestPostedQuestion = await questionService.findLatestPostedByUser(requestData.userUuid);
      const latestPostedQuestion = await cachedQuestionService.findLatestPostedByUser(requestData.userUuid);
      console.log("LATEST POSTED QUESTION")
      console.log(latestPostedQuestion)
      if(latestPostedQuestion) {
        const latestPostedTime = latestPostedQuestion['posted_time'];
        console.log("LATEST POSTED TIME")
        console.log(latestPostedTime);
        console.log("LATEST POSTED TIME PARSED BY DATE")
        console.log(Date.parse(latestPostedQuestion));
        const currentTime = Date.now();
        const diffTime = currentTime - latestPostedTime;
        const diffSeconds = Math.floor(diffTime / 1000 );
        if(diffSeconds < 60) {
          const response = {result: false}
          return Response.json(response)
        }
      }
      // const questionId = await questionService.addQuestion(requestData.courseId, requestData.userUuid, requestData.question);
      const questionId = await cachedQuestionService.addQuestion(requestData.courseId, requestData.userUuid, requestData.question);
  
      // await producerClient.connect();
      const streamData = {
        questionId: questionId,
        question: requestData.question
      }

      const streamDataForUpdater = {
            type: 'question',
            data: {
              id: questionId,
              course_id: requestData.courseId,
              user_uuid: requestData.userUuid,
              question: requestData.question,
              upvotes: 0
            }
      }
      // await producerClient.xAdd(
      //   'questionStream',
      //   '*',
      //   {
      //     data: JSON.stringify(streamData)
      //   }
      // )
  
      await producerClient.xadd('questionStream', '*', {data: JSON.stringify(streamData)});
      await producerClient.xadd('qaStream', '*', {data: JSON.stringify(streamDataForUpdater)});
      
      // questionSockets.forEach((socket) => {console.log("questionSocket send");socket.send(requestData.userUuid)})

      // try {
      //   if(questionSocketMap.has(requestData.courseId)) {
      //     const sockets = questionSocketMap.get(requestData.courseId);
      //     const socketData = {
      //       id: questionId,
      //       course_id: requestData.courseId,
      //       user_uuid: requestData.userUuid,
      //       question: requestData.question,
      //       upvotes: 0
      //     }
      //     sockets.forEach((socket) => socket.send(JSON.stringify(socketData)))
      //   }
      // } catch(e) {
      //   console.log(e)
      // }

      const response = {result: true}
      return Response.json(response)
    } else if(url.pathname.match("/questions/upvote") && request.method === "POST") {
      const requestData = await request.json();
      // console.log(requestData);
  
      //check whether user upvote a question or not
      // const checkUserUpvote = await questionUpvotesService.findByUserAndQuestion(requestData.questionId, requestData.userUuid);
      const checkUserUpvote = await cachedQuestionUpvotesService.findByUserAndQuestion(requestData.questionId, requestData.userUuid);
      if(!checkUserUpvote) {
        const currentTime = Date.now();
        // await questionUpvotesService.addUpvoteQuestions(requestData.questionId, requestData.userUuid);
        await cachedQuestionUpvotesService.addUpvoteQuestions(requestData.questionId, requestData.userUuid);
        // await questionService.updateUpvoteTime(requestData.questionId, currentTime); 
        await cachedQuestionService.updateUpvoteTime(requestData.questionId, currentTime); 
        const response = {result: true}
        return Response.json(response)
      } else {
        const response = {result: false}
        return Response.json(response)
      }    
    } else if(url.pathname.match("/question/[0-9]+") && request.method === "GET") {
      const urlParts = url.pathname.split("/");
      const questionId = urlParts[2];
  
      // const question = await questionService.findById(questionId);
      const question = await cachedQuestionService.findById(questionId);
  
      const answers = await answerService.findByQuestionId(questionId, 20, 0);
      const addUpvoteAnswers = await Promise.all( answers.map( async (answer) => {
        // let upvotes = await answerUpvotesService.countByAnswer(answer.id);
        let upvotes = await cachedAnswerUpvotesService.countByAnswer(answer.id);
        console.log(upvotes)
        answer.upvotes = upvotes['count_vote'];
        return answer;
      }))
  
      const allAnswers = await answerService.findAllByQuestionId(questionId);
      const numOfPage = Math.ceil(allAnswers.length / 20)

      const response = {
        question: question,
        answers: addUpvoteAnswers,
        totalAnswer: allAnswers.length,
        numOfPage: numOfPage
      }
      return Response.json(response);
    } else if(url.pathname === ("/answers") && request.method === "GET") {
      const urlParts = url.pathname.split("/");
      // const offset = urlParts[2];

      console.log(url.searchParams)

      const limit = url.searchParams.get('limit');
      const offset = url.searchParams.get('offset');
      const questionId = url.searchParams.get('questionId');
      console.log(limit);
      console.log(offset);

      const answers = await answerService.findByQuestionId(questionId, limit, offset);
      const addUpvoteAnswers = await Promise.all( answers.map( async (answer) => {
        // let upvotes = await answerUpvotesService.countByAnswer(answer.id);
        let upvotes = await cachedAnswerUpvotesService.countByAnswer(answer.id);
        console.log(upvotes)
        answer.upvotes = upvotes['count_vote'];
        return answer;
      }))
      const response = {
        answers: addUpvoteAnswers
      }
      return Response.json(response);
    } else if(url.pathname === "/answers" && request.method === "POST") {
      const requestData = await request.json();
      // console.log(requestData);
      const latestPostedQuestion = await answerService.findLatestPostedByUser(requestData.userUuid);
      console.log("LATEST POSTED QUESTION")
      console.log(latestPostedQuestion)
      if(latestPostedQuestion) {
        const latestPostedTime = latestPostedQuestion['posted_time'];
        console.log("LATEST POSTED TIME")
        console.log(latestPostedTime);
        console.log("LATEST POSTED TIME PARSED BY DATE")
        console.log(Date.parse(latestPostedQuestion));
        const currentTime = Date.now();
        const diffTime = currentTime - latestPostedTime;
        const diffSeconds = Math.floor(diffTime / 1000 );
        if(diffSeconds < 60) {
          const response = {result: false}
          return Response.json(response)
        }
      }
      const id = await answerService.addAnswer(requestData.questionId, requestData.userUuid, requestData.answer);
      // answerSockets.forEach((socket) => socket.send(requestData.userUuid))

      // try {
      //   if(answerSocketMap.has(requestData.questionId)) {
      //     const sockets = answerSocketMap.get(requestData.questionId);
      //     const socketData = {
      //       id: id,
      //       question_id: requestData.questionId,
      //       user_uuid: requestData.userUuid,
      //       answer: requestData.answer,
      //       upvotes: 0
      //     }
      //     sockets.forEach((socket) => socket.send(JSON.stringify(socketData)))
      //   }
      // } catch(e) {
      //   console.log(e)
      // }
      const streamDataForUpdater = {
        type: 'answer',
        data: {
          id: id,
          question_id: requestData.questionId,
          user_uuid: requestData.userUuid,
          answer: requestData.answer,
          upvotes: 0
        }
      }

      await producerClient.xadd('qaStream', '*', {data: JSON.stringify(streamDataForUpdater)});

      // try {
      //   const sockets = await redisClient.get(requestData.questionId)
      //   if(sockets) {
      //     const socketData = {
      //       id: id,
      //       question_id: requestData.questionId,
      //       user_uuid: requestData.userUuid,
      //       answer: requestData.answer,
      //       upvotes: 0
      //     }
      //     console.log(sockets);
      //     const socketObjs = JSON.parse(sockets);
      //     console.log(socketObjs);
      //     socketObjs.forEach((socket) => socket.send(JSON.stringify(socketData)))
      //   }
      // } catch(e) {
      //   console.log(e)
      // }

      const response = {result: true}
      return Response.json(response)
    }
    //  else if(url.pathname.match("/answers/upvote") && request.method === "POST") {
    //   const requestData = await request.json();
    //   // console.log(requestData);
  
    //   //check whether user upvote an answer or not
    //   const checkUserUpvote = await answerUpvotesService.findByUserAndAnswer(requestData.answerId, requestData.userUuid);
    //   if(!checkUserUpvote) {
    //     const currentTime = Date.now();
    //     await answerUpvotesService.addUpvoteAnswers(requestData.answerId, requestData.userUuid);
    //     await answerService.updateUpvoteTime(requestData.answerId, currentTime);
    //     const response = {result: true}
    //     return Response.json(response)
    //   } else {
    //     const response = {result: false}
    //     return Response.json(response)
    //   }    
    // } else if (url.pathname.match("/ws/questions/[0-9]+")) {
    //   const urlParts = url.pathname.split("/");
    //   const courseId = urlParts[3];
    //   const { socket, response } = Deno.upgradeWebSocket(request);
    //   // questionSockets.add(socket);
    //   if(questionSocketMap.has(courseId)) {
    //     const currentSockets = questionSocketMap.get(courseId);
    //     console.log("already has socket map with size " + currentSockets.size)
    //     currentSockets.add(socket);
    //     console.log("new socket map with size " + currentSockets.size);
    //     questionSocketMap.set(courseId, currentSockets);
    //   } else {
    //     console.log("socket map has not existed")
    //     const newSockets = new Set();
    //     newSockets.add(socket);
    //     questionSocketMap.set(courseId, newSockets);
    //   }
    //   let interval = setInterval(() => {
    //     socket.send("ping");
    //   }, 10000);
    //   socket.onclose = () => {
    //     // questionSockets.delete(socket);
    //     clearInterval(interval);
    //     questionSocketMap.get(courseId).delete(socket);
    //   };

    //   return response;
    // } else if (url.pathname.match("/ws/answer/[0-9]+")) {
    //   const urlParts = url.pathname.split("/");
    //   const questionId = urlParts[3];
    //   console.log("ws answers " + questionId);
    //   const { socket, response } = Deno.upgradeWebSocket(request);
    //   console.log("socket");
    //   console.log(socket);
    //   console.log("string socket");
    //   console.log(JSON.stringify(socket));

    //   // answerSockets.add(socket);

    //   // if(answerSocketMap.has(questionId)) {
    //   //   const currentSockets = answerSocketMap.get(questionId);
    //   //   console.log("already has socket map with size " + currentSockets.size)
    //   //   currentSockets.add(socket);
    //   //   console.log("new socket map with size " + currentSockets.size);
    //   //   answerSocketMap.set(questionId, currentSockets);
    //   // } else {
    //   //   console.log("socket map has not existed")
    //   //   const newSockets = new Set();
    //   //   newSockets.add(socket);
    //   //   answerSocketMap.set(questionId, newSockets);
    //   // }
    //   const sockets = await redisClient.get(questionId);
    //   if(sockets) {
    //     console.log(sockets);
    //     const socketObjs = JSON.parse(sockets);
    //     socketObjs.push(socket);
    //     await redisClient.set(questionId, JSON.stringify(sockets));
    //   } else {
    //     console.log("newSockets")
    //     const newSockets = [];
    //     newSockets.push(socket);
    //     console.log("raw array");
    //     console.log(newSockets)
    //     console.log("string array");
    //     console.log(JSON.stringify(newSockets));
    //     await redisClient.set(questionId, JSON.stringify(newSockets));
    //   }

    //   let interval = setInterval(() => {
    //     socket.send("ping");
    //   }, 10000);

    //   socket.onclose = () => {
    //     // answerSockets.delete(socket);
    //     clearInterval(interval);
    //     answerSocketMap.get(questionId).delete(socket);

    //   };

    //   return response;
    // }
  else if(url.pathname === "/metrics" && request.method === "GET") {
    const response = {
      service: "qa-api",
      systemMemoryInfo: Deno.systemMemoryInfo(),
      memoryUsage: Deno.memoryUsage(),
    }
    return Response.json(response)
  }
  else {
      const response = {
        status: 404
      }
      return Response.json(response)
  }
}

const portConfig = { port: 7777, hostname: "0.0.0.0" };
// serve(handleRequest, portConfig);
Deno.serve(portConfig, handleRequest);

// const randomUUID = crypto.randomUUID().toString();
// const consumerName = `consumer-${randomUUID}`;
// try {
//   // https://redis.io/commands/xgroup-create/
//   await consumerClient.xgroupCreate('questionStream', 'myconsumergroup', '0', {
//     MKSTREAM: true
//   });
//   console.log('Created consumer group.');
// } catch (e) {
//   console.log('Consumer group already exists, skipped creation.');
// }

// console.log(`Starting consumer`);

// while (true) {
//   try { 

//     let [response] = await consumerClient.xreadgroup(
//       [
//         {
//           key: 'questionStream',
//           xid: '>'
//         }
//       ],
//       {
//         group: 'myconsumergroup',
//         consumer: consumerName,
//         count: 1,
//         block: 3000
//       }
//     )

//     if (response) {
//       console.group("stream consumer group:")
//       console.log(response)
//       console.log(JSON.stringify(response));

//       const message = JSON.parse(response.messages[0].fieldValues.data);

//       console.log("Stream message:");
//       console.log(message);

//       // const question = message.question;
//       // const questionData = {
//       //   question: question
//       // }

//       // console.log(question);

//       const answer = await fetch("http://llm-api:7000/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(message),
//       });
//       const answerJsonData = await answer.json();
//       console.log(answer);
//       console.log(answerJsonData);
//       console.log('generated answer');
//       console.log(answerJsonData[0])

//       console.log(answerJsonData[0]['generated_text'])

      


//       // Use XACK to acknowledge successful processing of this
//       // stream entry.
//       // https://redis.io/commands/xack/
//       const entryId = response.messages[0].xid.unixMs;
//       await consumerClient.xack('questionStream', 'myconsumergroup', entryId);

//       console.log(`Acknowledged processing of entry ${entryId}.`);
//     } else {
//       // Response is null, we have read everything that is
//       // in the stream right now...
//       console.log('No new stream entries.');
//     }
//   } catch (err) {
//     console.error(err);
//   }
// }


