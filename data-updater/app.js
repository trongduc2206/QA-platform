import { serve, connect } from "./deps.js";
const answerSocketMap = new Map();
const questionSocketMap = new Map();


const handleRequest = async (request) => {
    const url = new URL(request.url);
    if (url.pathname.match("/question/[0-9]+")) {
        const urlParts = url.pathname.split("/");
        const courseId = urlParts[2];
        const { socket, response } = Deno.upgradeWebSocket(request);
        // questionSockets.add(socket);
        if(questionSocketMap.has(courseId)) {
          const currentSockets = questionSocketMap.get(courseId);
          console.log("already has socket map with size " + currentSockets.size)
          currentSockets.add(socket);
          console.log("new socket map with size " + currentSockets.size);
          questionSocketMap.set(courseId, currentSockets);
        } else {
          console.log("socket map has not existed")
          const newSockets = new Set();
          newSockets.add(socket);
          questionSocketMap.set(courseId, newSockets);
        }
        let interval = setInterval(() => {
          socket.send("ping");
        }, 10000);
        socket.onclose = () => {
          // questionSockets.delete(socket);
          clearInterval(interval);
          questionSocketMap.get(courseId).delete(socket);
        };
  
        return response;
    } else if (url.pathname.match("/answer/[0-9]+")) {
        const urlParts = url.pathname.split("/");
        const questionId = urlParts[2];
        console.log("ws answers " + questionId);
        const { socket, response } = Deno.upgradeWebSocket(request);

        if(answerSocketMap.has(questionId)) {
            const currentSockets = answerSocketMap.get(questionId);
            console.log("already has socket map with size " + currentSockets.size)
            currentSockets.add(socket);
            console.log("new socket map with size " + currentSockets.size);
            answerSocketMap.set(questionId, currentSockets);
        } else {
            console.log("socket map has not existed")
            const newSockets = new Set();
            newSockets.add(socket);
            answerSocketMap.set(questionId, newSockets);
        }
        let interval = setInterval(() => {
            socket.send("ping");
          }, 10000);
        socket.onclose = () => {
            // answerSockets.delete(socket);
            clearInterval(interval);
            answerSocketMap.get(questionId).delete(socket);
        };

        return response;
    }  else if(url.pathname === "/metrics" && request.method === "GET") {
      const response = {
        service: "qa-api",
        systemMemoryInfo: Deno.systemMemoryInfo(),
        memoryUsage: Deno.memoryUsage(),
      }
      return Response.json(response)
    }
    else {
    }
    
}

const portConfig = { port: 7777, hostname: "0.0.0.0" };
serve(handleRequest, portConfig);

let consumerClient;
if(Deno.env.get("REDIS_HOST") && Deno.env.get("REDIS_PORT")) {
  console.log("k8s")
  const host = Deno.env.get("REDIS_HOST");
  const port = Deno.env.get("REDIS_PORT");
  try {
    if(Deno.env.get("REDIS_PASS")) {
      const password = Deno.env.get("REDIS_PASS")
      consumerClient = await connect({
        hostname: host,
        port: port,
        password: password
      })
    } else {
      consumerClient = await connect({
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
    consumerClient = await connect({
    hostname: "redis",
    port: 6379,
    });
  } catch(e) {
    console.log(e);
  }
}
  
  const randomUUID = crypto.randomUUID().toString();
  const consumerName = `consumer-${randomUUID}`;
  try {
    // https://redis.io/commands/xgroup-create/
    await consumerClient.xgroupCreate('qaStream', 'myconsumergroup', '0', {
      MKSTREAM: true
    });
    console.log('Created consumer group.');
  } catch (e) {
    console.log('Consumer group already exists, skipped creation.');
  }
  
  console.log(`Starting consumer`);
  
  while (true) {
    try {
  
      let [response] = await consumerClient.xreadgroup(
        [
          {
            key: 'qaStream',
            xid: '>'
          }
        ],
        {
          group: 'myconsumergroup',
          consumer: consumerName,
          count: 1,
          block: 3000
        }
      )
  
      if (response) {
        console.group("stream consumer group:")
        console.log(response)
        console.log(JSON.stringify(response));
  
        const message = JSON.parse(response.messages[0].fieldValues.data);
  
        console.log("Stream message:");
        console.log(message);
        console.log(message.type);
        console.log(message.data);


        if(message.type === 'question') {
            console.log("new question")
            const question = message.data;
            try {
                if(questionSocketMap.has(question['course_id'])) {
                  const sockets = questionSocketMap.get(question['course_id']);
                  sockets.forEach((socket) => socket.send(JSON.stringify(question)))
                }
              } catch(e) {
                console.log(e)
              }
        } else if (message.type === 'answer') {
            console.log("new answer")
            const answer = message.data
            console.log(answer);
            try {
                console.log(answer['question_id'])
                if(answerSocketMap.has(answer['question_id'])) {
                  const sockets = answerSocketMap.get(answer['question_id']);
                  sockets.forEach((socket) => socket.send(JSON.stringify(answer)))
                }
              } catch(e) {
                console.log(e)
              }
        }
  
        // const question = message.question;
        // const questionData = {
        //   question: question
        // }
  
        // console.log(question);
        // const questionId = message.questionId;
  
        // for (let i = 1; i <= 3; i++) {
        //   const answer = await fetch("http://llm-api:7000/", {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(message),
        //   });
        //   const answerJsonData = await answer.json();
        //   console.log(answer);
  
        //   const answerText = answerJsonData[0]['generated_text']
        //   console.log('generated answer');
        //   console.log(answerText)
  
        //   await answerService.addAnswer(questionId, 'language model', answerText);
        //   console.log(`add answer -> ${answerText} to the database`);
        // }
  
  
  
        // Use XACK to acknowledge successful processing of this
        // stream entry.
        // https://redis.io/commands/xack/
        const entryId = response.messages[0].xid.unixMs;
        await consumerClient.xack('qaStream', 'myconsumergroup', entryId);
  
        console.log(`Acknowledged processing of entry ${entryId}.`);
      } else {
        // Response is null, we have read everything that is
        // in the stream right now...
        console.log('No new stream entries.');
      }
    } catch (err) {
      console.error(err);
      try {
        // https://redis.io/commands/xgroup-create/
        await consumerClient.xgroupCreate('qaStream', 'myconsumergroup', '0', {
          MKSTREAM: true
        });
        console.log('Created consumer group.');
      } catch (e) {
        console.log('Consumer group already exists, skipped creation.');
      }
    }
  }
  