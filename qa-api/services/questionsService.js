import { sql } from "../database/database.js";

const findByCourseId = async ( courseId, limit, offset ) => {
    return await sql`SELECT * FROM questions WHERE course_id = ${courseId} ORDER BY last_upvoted DESC LIMIT ${limit} OFFSET ${offset};`;
};

const findAllByCourseId = async ( courseId ) => {
    return await sql`SELECT * FROM questions WHERE course_id = ${courseId};`;
};

const findById = async (id) => {
    const result = await sql`SELECT * FROM questions WHERE id = ${id};`;
    if(result && result.length > 0) {
        return result[0];
    } else {
        return null;
    }
};

const findLatestPostedByUser = async (userUuid) => {
    const result = await sql`SELECT * FROM questions WHERE user_uuid=${userUuid} ORDER BY posted_time DESC LIMIT 1;`;
    if(result && result.length > 0) {
        return result[0];
    } else {
        return null;
    }
}

const addQuestion = async (courseId, userUuid, question) => {
    const result = await sql`INSERT INTO questions(course_id, user_uuid, question) VALUES(${courseId}, ${userUuid}, ${question}) RETURNING id;`;
    return result[0].id;
};

const updateUpvoteTime = async (id, time) => {
    await sql`UPDATE questions SET last_upvoted = ${time} WHERE id = ${id}`;
};

export { findByCourseId, findAllByCourseId, findById, findLatestPostedByUser, addQuestion, updateUpvoteTime };