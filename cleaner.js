const db = require("./db");

const deleteOldData = async () => {
    let twoDaysAgoUTC = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    twoDaysAgoUTC.toUTCString();
    console.log("DID IT WORK?1")
    const res = await db.query(
        `DELETE FROM chat_messages WHERE timestamp < $1`,[twoDaysAgoUTC]
    );
    console.log(res.rows);

    await db.query(
        `DELETE FROM guests
        WHERE group_chat_id IN (
            SELECT group_chat_id FROM group_chats
            WHERE timestamp < $1
        )`,[twoDaysAgoUTC]
    );

    const gcRes = await db.query(
        `DELETE FROM group_chats WHERE timestamp < $1`,[twoDaysAgoUTC]
    );
    console.log(gcRes.rows)

    console.log("DID IT ALL WORK THO??")
}

// const deleteOldGuests = async () => {
//     await db.query(
//         `DELETE FROM guests as "g"
//             LEFT JOIN group_chats AS "gc"
//           ON gc.group_chat_id = g.group_chat_id
//           WHERE gc.timestamp < $1`,[twoDaysAgoUTC]
//     );
// }

// const deleteOldGroupChats = async () => {
//     await db.query(
//         `DELETE FROM group_chats WHERE timestamp < $1`,[twoDaysAgoUTC]
//     );
//     console.log("DID IT WORK?3")
// }

module.exports = deleteOldData;