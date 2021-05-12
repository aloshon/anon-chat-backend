const db = require("../db");

let twoDaysAgoUTC = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
twoDaysAgoUTC.toUTCString();

const deleteOldData = async () => {
    await db.query(
        `DELETE FROM chat_messages WHERE timestamp < $1`,[twoDaysAgoUTC]
    );

    await db.query(
        `DELETE FROM guests as "g"
            LEFT JOIN group_chats AS "gc"
          ON gc.group_chat_id = g.group_chat_id
          WHERE gc.timestamp < $1`,[twoDaysAgoUTC]
    );

    await db.query(
        `DELETE FROM group_chats WHERE timestamp < $1`,[twoDaysAgoUTC]
    )
}

deleteOldData();
process.exit();