#!/usr/bin/env node
const db = require("../db");

let twoDaysAgoUTC = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
twoDaysAgoUTC.toUTCString();

const deleteOldMessages = async () => {
    await db.query(
        `DELETE FROM chat_messages WHERE timestamp < $1`,[twoDaysAgoUTC]
    );
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
    console.log("DID IT WORK?")
}

deleteOldMessages();
deleteOldGuests();
deleteOldGroupChats();
process.exit();