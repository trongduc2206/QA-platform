/* Create your schema here */
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id),
  user_uuid TEXT NOT NULL,
  question TEXT NOT NULL, 
  posted_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_upvoted TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id),
  user_uuid TEXT NOT NULL,
  answer TEXT NOT NULL,
  posted_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_upvoted TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE question_upvotes (
  id SERIAL PRIMARY KEY,
  user_uuid TEXT NOT NULL,
  question_id INTEGER REFERENCES questions(id),
  upvote_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE answer_upvotes (
  id SERIAL PRIMARY KEY,
  user_uuid TEXT NOT NULL,
  answer_id INTEGER REFERENCES answers(id),
  upvote_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX q_course_id_idx ON 
  questions (course_id);

CREATE INDEX a_question_id_idx ON 
  answers (question_id);

CREATE INDEX qu_user_uuid_question_id_idx ON 
  question_upvotes (user_uuid, question_id);

CREATE INDEX au_user_uuid__id_idx ON 
  answer_upvotes (user_uuid, answer_id);

