import { sql } from "../database/database.js";

const findByQuestionId = async ( questionId, limit, offset ) => {
    return await sql`SELECT * FROM answers WHERE question_id = ${questionId} ORDER BY last_upvoted DESC LIMIT ${limit} OFFSET ${offset};`;
};

const findAllByQuestionId = async (questionId) => {
    return await sql`SELECT * FROM answers WHERE question_id = ${questionId} `;
;}

const findById = async (id) => {
    const result = await sql`SELECT * FROM answers WHERE id = ${id};`;
    if(result && result.length > 0) {
        return result[0];
    } else {
        return null;
    }
};

const findLatestPostedByUser = async (userUuid) => {
    const result = await sql`SELECT * FROM answers WHERE user_uuid=${userUuid} ORDER BY posted_time DESC LIMIT 1;`;
    if(result && result.length > 0) {
        return result[0];
    } else {
        return null;
    }
};

const addAnswer = async (questionId, userUuid, answer) => {
    const id = await sql`INSERT INTO answers(question_id, user_uuid, answer) VALUES(${questionId}, ${userUuid}, ${answer}) RETURNING id;`;
    return id[0].id;
};

const updateUpvoteTime = async (id, time) => {
    await sql`UPDATE answers SET last_upvoted = ${time} WHERE id = ${id}`;
};


export { findByQuestionId, findById, findLatestPostedByUser, addAnswer, updateUpvoteTime, findAllByQuestionId};