#!/usr/bin/env node
const db = require("./db");

let twoDaysAgoUTC = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
twoDaysAgoUTC.toUTCString();
console.log("DID IT WORK?1")
const deleteOldMessages = async () => {
    console.log("DID IT WORK?2")
    const res = await db.query(
        `DELETE FROM chat_messages WHERE timestamp < $1`,[twoDaysAgoUTC]
    );
    console.log(res.rows);
}

const deleteOldGuests = async () => {
    await db.query(
        `DELETE FROM guests as "g"
            LEFT JOIN group_chats AS "gc"
          ON gc.group_chat_id = g.group_chat_id
          WHERE gc.timestamp < $1`,[twoDaysAgoUTC]
    );
}

const deleteOldGroupChats = async () => {
    await db.query(
        `DELETE FROM group_chats WHERE timestamp < $1`,[twoDaysAgoUTC]
    );
    console.log("DID IT WORK?3")
}
console.log("DID IT WORK?4")
deleteOldMessages();
deleteOldGuests();
deleteOldGroupChats();
process.exit();