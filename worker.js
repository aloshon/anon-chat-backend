#!/usr/bin/env node
const db = require("./db");
const deleteOldData = async () => {
    await db.query(
        `DELETE FROM chat_messages WHERE DATE(timestamp) < (NOW() at time zone 'utc')::timestamptz - INTERVAL '2 DAY'`
    );

    await db.query(
        `DELETE FROM guests AS "g"
        USING group_chats AS "gc" WHERE
        g.group_chat_id = gc.id
        AND 
        DATE(gc.timestamp) < (NOW() at time zone 'utc')::timestamptz - INTERVAL '2 DAY'`
    );

    await db.query(
        `DELETE FROM group_chats WHERE DATE(timestamp) < (NOW() at time zone 'utc')::timestamptz - INTERVAL '2 DAY'`
    );

    process.exit();
}

deleteOldData();