import { connect } from "./deps.js";
import * as answerService from "./services/answerService.js"

// const consumerClient = await connect({
//   hostname: "redis",
//   port: 6379,
// });

let consumerClient;
try {
  if(Deno.env.get("REDIS_HOST") && Deno.env.get("REDIS_PORT")) {
    console.log("cache - redis k8s")
    const host = Deno.env.get("REDIS_HOST");
    const port = Deno.env.get("REDIS_PORT");
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
  } else {
    console.log("cache - redis normal")
    consumerClient = await connect({
      hostname: "redis",
      port: 6379,
    }); 
  }
} catch(e) {
  console.log("redis connection failed")
  console.log(e)
}

const randomUUID = crypto.randomUUID().toString();
const consumerName = `consumer-${randomUUID}`;
try {
  // https://redis.io/commands/xgroup-create/
  await consumerClient.xgroupCreate('questionStream', 'myconsumergroup', '0', {
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
          key: 'questionStream',
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

      // const question = message.question;
      // const questionData = {
      //   question: question
      // }

      // console.log(question);
      const questionId = message.questionId;

      for (let i = 1; i <= 3; i++) {
        const answer = await fetch("http://llm-api:7000/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        });
        const answerJsonData = await answer.json();
        console.log(answer);

        const answerText = answerJsonData[0]['generated_text']
        console.log('generated answer');
        console.log(answerText)

        await answerService.addAnswer(questionId, 'language model', answerText);
        console.log(`add answer -> ${answerText} to the database`);
      }



      // Use XACK to acknowledge successful processing of this
      // stream entry.
      // https://redis.io/commands/xack/
      const entryId = response.messages[0].xid.unixMs;
      await consumerClient.xack('questionStream', 'myconsumergroup', entryId);

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
      await consumerClient.xgroupCreate('questionStream', 'myconsumergroup', '0', {
        MKSTREAM: true
      });
      console.log('Created consumer group.');
    } catch (e) {
      console.log('Consumer group already exists, skipped creation.');
    }
  }
}



