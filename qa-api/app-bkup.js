import { serve, connect } from "./deps.js";
import * as coursesService from "./services/coursesService.js"
import * as questionService from "./services/questionsService.js"
import * as answerService from "./services/answersService.js"
import * as questionUpvotesService from "./services/questionUpvotesService.js"
import * as answerUpvotesService from "./services/answerUpvotesService.js"

import { createClient, commandOptions } from "npm:redis@4.6.4";

// const producerClient = createClient({
//   url: "redis://redis:6379",
//   pingInterval: 1000,
// });
let producerClient;
if(Deno.env.get("REDIS_HOST") && Deno.env.get("REDIS_PASS")) {
  console.log("k8s")
  producerClient = await connect({
    hostname: "rfs-redis-cluster",
    port: 26379,
  })
} else {
  console.log("normal")
  producerClient = await connect({
    hostname: "redis",
    port: 6379,
  });
}



// const consumerClient = createClient({
//   url: "redis://redis:6379",
//   pingInterval: 1000,
// });

// await consumerClient.connect();

const handleRequest = async (request) => {
  const url = new URL(request.url);
  console.log(url.pathname);
  if (url.pathname === "/courses" && request.method === "GET") {
    const courses = await coursesService.findAll();
    // console.log(courses);
    return Response.json(courses);
  } else if (url.pathname.match("/course/[0-9]+") && request.method === "GET") {
    const urlParts = url.pathname.split("/");
    const courseId = urlParts[2];
    const questions = await questionService.findByCourseId(courseId);
    // console.log(questions);
    const addUpvoteQuestions = await Promise.all( questions.map( async (question) => {
      let upvotes = await questionUpvotesService.countByQuestion(question.id);
      console.log(upvotes)
      question.upvotes = upvotes['count_vote'];
      return question;
    }))
    // console.log(addUpvoteQuestions)
    // for(let i = 0; i < questions.length;i++) {
    //   let upvotes = await questionUpvotesService.countByQuestion(questions[i].id);
    //   questions[i].upvotes = upvotes.countVote;
    //   console.log()
    // }
    const course = await coursesService.findById(courseId);
    console.log(course); 
    const response = {
      course: course,
      questions: addUpvoteQuestions
    }
    return Response.json(response);
  } else if(url.pathname === "/questions" && request.method === "POST") {
    const requestData = await request.json();
    console.log(requestData);
    await questionService.addQuestion(requestData.courseId, requestData.userUuid, requestData.question);

    // await producerClient.connect();
    const streamData = {
      question: requestData.question
    }
    // await producerClient.xAdd(
    //   'questionStream',
    //   '*',
    //   {
    //     data: JSON.stringify(streamData)
    //   }
    // )

    await producerClient.xadd('questionStream', '*', {data: JSON.stringify(streamData)});

    const response = {result: true}
    return Response.json(response)
  } else if(url.pathname.match("/questions/upvote") && request.method === "POST") {
    const requestData = await request.json();
    console.log(requestData);

    //check whether user upvote a question or not
    const checkUserUpvote = await questionUpvotesService.findByUserAndQuestion(requestData.questionId, requestData.userUuid);
    if(!checkUserUpvote) {
      const currentTime = Date.now();
      await questionUpvotesService.addUpvoteQuestions(requestData.questionId, requestData.userUuid);
      await questionService.updateUpvoteTime(requestData.questionId, currentTime); 
      const response = {result: true}
      return Response.json(response)
    } else {
      const response = {result: false}
      return Response.json(response)
    }    
  } else if(url.pathname.match("/question/[0-9]+") && request.method === "GET") {
    const urlParts = url.pathname.split("/");
    const questionId = urlParts[2];

    const question = await questionService.findById(questionId);

    const answers = await answerService.findByQuestionId(questionId);
    const addUpvoteAnswers = await Promise.all( answers.map( async (answer) => {
      let upvotes = await answerUpvotesService.countByAnswer(answer.id);
      console.log(upvotes)
      answer.upvotes = upvotes['count_vote'];
      return answer;
    }))

    const response = {
      question: question,
      answers: addUpvoteAnswers
    }
    return Response.json(response);
  } else if(url.pathname === "/answers" && request.method === "POST") {
    const requestData = await request.json();
    console.log(requestData);
    await answerService.addAnswer(requestData.questionId, requestData.userUuid, requestData.answer);
    const response = {result: true}
    return Response.json(response)
  } else if(url.pathname.match("/answers/upvote") && request.method === "POST") {
    const requestData = await request.json();
    console.log(requestData);

    //check whether user upvote an answer or not
    const checkUserUpvote = await answerUpvotesService.findByUserAndAnswer(requestData.answerId, requestData.userUuid);
    if(!checkUserUpvote) {
      const currentTime = Date.now();
      await answerUpvotesService.addUpvoteAnswers(requestData.answerId, requestData.userUuid);
      await answerService.updateUpvoteTime(requestData.answerId, currentTime);
      const response = {result: true}
      return Response.json(response)
    } else {
      const response = {result: false}
      return Response.json(response)
    }    
  }
  else {
    const data = await request.json();

    const response = await fetch("http://llm-api:7000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response;
}
};

const portConfig = { port: 7777, hostname: "0.0.0.0" };
serve(handleRequest, portConfig);


// const randomUUID = crypto.randomUUID().toString();
// const consumerName = `consumer-${randomUUID}`;
// try {
//   // https://redis.io/commands/xgroup-create/
//   await consumerClient.xGroupCreate('questionStream', 'myconsumergroup', '0', {
//     MKSTREAM: true
//   });
//   console.log('Created consumer group.');
// } catch (e) {
//   console.log('Consumer group already exists, skipped creation.');
// }

// console.log(`Starting consumer`);

// while (true) {
//   try {
//     // https://redis.io/commands/xreadgroup/
//     let response = await consumerClient.xReadGroup(
//       commandOptions({
//         isolated: true
//       }),
//       'myconsumergroup',
//       consumerName, [
//       // XREADGROUP can read from multiple streams, starting at a
//       // different ID for each...
//       {
//         key: 'questionStream',
//         id: '>' // Next entry ID that no consumer in this group has read
//       }
//     ], {
//       // Read 1 entry at a time, block for 5 seconds if there are none.
//       COUNT: 1,
//       BLOCK: 3000
//     }
//     );

//     if (response) {
//       // Response is an array of streams, each containing an array of
//       // entries:
//       //
//       // [
//       //   {
//       //      "name": "mystream",
//       //      "messages": [
//       //        {
//       //          "id": "1642088708425-0",
//       //          "message": {
//       //            "num": "999"
//       //          }
//       //        }
//       //      ]
//       //    }
//       //  ]

//       console.group("stream consumer group:")
//       console.log(JSON.stringify(response));

//       const message = JSON.parse(response[0].messages[0].message.data);

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

      


//       // Use XACK to acknowledge successful processing of this
//       // stream entry.
//       // https://redis.io/commands/xack/
//       const entryId = response[0].messages[0].id;
//       await consumerClient.xAck('questionStream', 'myconsumergroup', entryId);

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
