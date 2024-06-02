import { sql } from "../database/database.js";

const countByQuestion = async ( questionId ) => {
    const result = await sql`SELECT COUNT(user_uuid) AS count_vote FROM question_upvotes WHERE question_id = ${questionId};`;
    return result[0];
};

const addUpvoteQuestions = async (questionId, userUuid) => {
    await sql`INSERT INTO question_upvotes(user_uuid, question_id) VALUES(${userUuid}, ${questionId})`
};

const findByUserAndQuestion = async (questionId, userUuid) => {
    const result = await sql`SELECT * FROM question_upvotes WHERE question_id = ${questionId} AND user_uuid = ${userUuid}`;
    if(result && result.length > 0) {
        return result
    } else {
        return null;
    }
}

export { countByQuestion, addUpvoteQuestions, findByUserAndQuestion };