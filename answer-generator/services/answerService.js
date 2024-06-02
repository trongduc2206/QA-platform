import { sql } from "../database/database.js";

const addAnswer = async (questionId, userUuid, answer) => {
    console.log('answer to be added to database:');
    console.log(answer);
    await sql`INSERT INTO answers(question_id, user_uuid, answer) VALUES(${questionId}, ${userUuid}, ${answer});`;
};

export {addAnswer};