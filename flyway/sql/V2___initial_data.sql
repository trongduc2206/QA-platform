INSERT INTO courses (title) VALUES ('Web Software Development');

INSERT INTO courses (title) VALUES ('Designing and Building Scalable Web Applications');

INSERT INTO courses (title) VALUES ('Full Stack Web Development');

INSERT INTO questions (course_id, user_uuid, question) VALUES (1, 'c60b17b2-9891-4201-98d9-e01ff63e3b56', 'What is the command for starting an application with Docker compose?');

INSERT INTO answers (question_id, user_uuid, answer) VALUES (1, '16fcd467-8735-4c41-92bb-d066ef30b127', 'docker compose up -d');

INSERT INTO question_upvotes (user_uuid, question_id) VALUES ('5b2a8f91-43bd-478e-a634-1cad6c6297af', 1);

INSERT INTO answer_upvotes (user_uuid, answer_id) VALUES ('8800815c-bc8a-40e7-b2cd-9923504b52b6', 1);