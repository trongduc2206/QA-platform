TODO: There is a brief description of the application in REFLECTION.md that highlights key design decisions for the application. The document also contains a reflection of possible improvements that should be done to improve the performance of the application.

# Add new question and generate answer by language model
## Redis-stream
Whenever an user adds a new question to the system, the service "qa-api" sends a message to the redis stream.

There is a separated application called "answer-generator" that receives questions then generates and save corresponding answers to the database. In the "answer-generator", there is a redis consumer client that reads the stream to achieve the questions, which are sent to the stream from the service "qa-api".

## Conclusion
This approach can help improve the scalability of the main application, which is the "qa-api" because the subcribing funtionality is moved to another separated application. This approach also satisfies the requirement of generating answers in the background. The API for adding question provided by the main application only sends the message to the stream then returns the response for the client. All the works of generating answers are done by "answer-generator"

# Auto update new questions and answer
## Redis-stream
Whenever a question or an answer is added, the API provided by the "qa-api" sends a message to the redis-stream

A separated application called "data-updater" reads the stream then receives the new question or answer.

## Web Socket
The course page and the question page open web socket connections to the "data-updater" application. Therefore, whenever the "data-updater" achieves new question or answer, "data-updater" applications will send new data to the client through the web socket connections. From that, the client can get the new data without refreshing.

## Conclusion
Again, this approach can help improve the scalability of the main application, which is the "qa-api", because the subcribing funtionality is moved to another separated application. In addition, web socket connections are difficult to be shared among instances of the service "qa-api" when it is scaled up. It is the reason that made me decide to create the "data-updater" for this function. 

# Possible improvements
By default, after not seeing any message for 180s, the web socket connection will be automatically closed. I am using an interval to send messages with each web socket connection to keep them alive. This is not a good way for production so I might need to find other way for recreating web socket connections from the client. 




