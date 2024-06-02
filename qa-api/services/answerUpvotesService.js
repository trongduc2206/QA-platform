import { sql } from "../database/database.js";

const countByAnswer = async ( answerId ) => {
    const result = await sql`SELECT COUNT(user_uuid) AS count_vote FROM answer_upvotes WHERE answer_id = ${answerId};`;
    return result[0];
};

const addUpvoteAnswers = async (answerId, userUuid) => {
    await sql`INSERT INTO answer_upvotes(user_uuid, answer_id) VALUES(${userUuid}, ${answerId});`;
};

const findByUserAndAnswer = async (answerId, userUuid) => {
    const result = await sql`SELECT * FROM answer_upvotes WHERE answer_id = ${answerId} AND user_uuid = ${userUuid}`;
    if(result && result.length > 0) {
        return result
    } else {
        return null;
    }
}

export { countByAnswer, addUpvoteAnswers, findByUserAndAnswer };