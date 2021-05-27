#!/usr/bin/env node
const db = require("./db");
const deleteOldData = async () => {
    let twoDaysAgoUTC = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    await db.query(
        `DELETE FROM chat_messages WHERE timestamp < $1`,[twoDaysAgoUTC.toUTCString()]
    );

    await db.query(
        `DELETE FROM guests AS "g"
        USING group_chats AS "gc" WHERE
        g.group_chat_id = gc.id
        AND gc.timestamp < $1`,[twoDaysAgoUTC.toUTCString()]
    );

    await db.query(
        `DELETE FROM group_chats WHERE timestamp < $1`,[twoDaysAgoUTC.toUTCString()]
    );

    process.exit();
}

deleteOldData();