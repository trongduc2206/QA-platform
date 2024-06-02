import { postgres } from "../deps.js";

const PGPASS = Deno.env.get("PGPASS");
let sql;
if(PGPASS && PGPASS !== "") {
    const PGPASSTRIM = PGPASS.trim();
    const PGPASS_PARTS = PGPASSTRIM.split(":");
    const host = PGPASS_PARTS[0];
    const port = PGPASS_PARTS[1];
    const database = PGPASS_PARTS[2];
    const username = PGPASS_PARTS[3];
    const password = PGPASS_PARTS[4];

    sql = postgres({
    host,
    port,
    database,
    username,
    password,
    }); 
} else {
    sql = postgres({});
}


export { sql };