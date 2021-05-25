#!/usr/bin/env node
const db = require("./db");
const deleteOldData = async () => {
    console.log("DID IT WORK?1")
    let twoDaysAgoUTC = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const res = await db.query(
        `DELETE FROM chat_messages WHERE timestamp < $1
        RETURNING user_id`,[twoDaysAgoUTC.toUTCString()]
    );
    console.log(twoDaysAgoUTC.toUTCString())
    console.log(res.rows);

    const gRes = await db.query(
        `DELETE FROM guests AS "g"
        USING group_chats AS "gc" WHERE
        g.group_chat_id = gc.id
        AND gc.timestamp < $1
        RETURNING g.user_id, gc.timestamp`,[twoDaysAgoUTC.toUTCString()]
    );
    console.log(gRes.rows);

    const gcRes = await db.query(
        `DELETE FROM group_chats WHERE timestamp < $1
        RETURNING id`,[twoDaysAgoUTC.toUTCString()]
    );
    console.log(gcRes.rows);

    console.log("DID IT ALL WORK THO??")

    process.exit();
}

deleteOldData();