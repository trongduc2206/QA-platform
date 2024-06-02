import { sql } from "../database/database.js";

const findAll = async () => {
    return await sql`SELECT * FROM courses;`;
};

const findById = async (id) => {
    const course = await sql`SELECT * FROM courses WHERE id = ${id}`;
    if(course && course.length > 0) {
        return course[0];
    } else {
        return null;
    }
    
}

export { findAll, findById };