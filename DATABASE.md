TODO: The DATABASE.md outlines the database schema and justifies the used indexes and database denormalization decisions.

# Database schema
There are 5 tables:
1. courses: This table stores course data
2. questions: This table stores question data and has a foreign key to the "courses" table in order to specify the course that the question belongs to. There are "user_uuid" field and "posted_time" that can help to prevent users from posting more than 1 question within the timespan of 1 minute. The "last_upvoted" field is used for sorting
3. answers: This table stores answer data and has a foreign key to the "questions" table in order to specify the question that the answer belongs to. Other fields of this table have similar meaning with the "question" table.
4. question_upvotes: This table stores the upvote data of the question. I decided to create a separated table for this kind of data because I also want to store the "user_uuid" of the user who upvoted the question. This is really difficult to achieve if I put the upvote data in the "questions" table.
5. answer_upvotes: This table stores the upvote data of the question. My reason for creating this table is the same as for the "question_upvotes" table.

# Indexes
I found the most frequently used queries from my application and then detect the fields that are the most frequently queried. Based on that, I created some indexes to improve the performance of querying



TODO for merits: Caching decisions are outlined in DATABASE.md.

# Caching
Except the service for table "answers", all other services for other tables are cached with redis. The cached data in redis is flushed with "insert" or "update" methods. The service for table "answers" is not cached because there are two different services, which are "qa-api" and "answer-generator", work with this table. The action of one service may not flush the cached data in redis of the other service, which leads to inconsistentcy of data between two services