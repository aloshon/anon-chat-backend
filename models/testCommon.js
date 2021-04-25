const bcrypt = require("bcrypt");

const db = require("../db.js");
const {BCRYPT_WORK_FACTOR} = require("../config");


async function commonBeforeAll() {
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM group_chats");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM users");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM chat_messages");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM guests");

    const users = await db.query(`
          INSERT INTO users(username,
                            password)
          VALUES ('user1', $1),
                 ('user2', $2),
                 ('user3', $3)
          RETURNING id, username`,
        [
          await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
          await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
          await bcrypt.hash("password3", BCRYPT_WORK_FACTOR)
        ]);
    console.log(users.rows)
  
    const groupChats = await db.query(`
      INSERT INTO group_chats(title, description, timestamp, creator_id)
      VALUES ('test1', 'testing', 'Thu, 18 Mar 2021 13:41:33 GMT', $1),
            ('test2', 'testing', 'Fri, 19 Mar 2021 11:37:13 GMT', $2)
      RETURNING id`, 
            [users.rows[0].id, users.rows[1].id]);
  
    await db.query(`
      INSERT INTO guests (username, user_id, group_chat_id)
      VALUES ('user1', $1, $3),
             ('user2', $2, $4),
             ('user1', $1, $4)`,
             [users.rows[0].id, users.rows[1].id, groupChats.rows[0].id, groupChats.rows[1].id]);
  
    await db.query(`
        INSERT INTO chat_messages(message, user_id, group_chat_id, timestamp)
        VALUES('this is chat 1', $1, $3, '2021-03-12 11:02:53.522807'),
            ('this is chat 2!!!!!!!', $2, $4, '2021-03-14 11:02:53.522807')`, 
            [users.rows[0].id, users.rows[1].id, groupChats.rows[0].id, groupChats.rows[1].id]);

    await db.query(`
        INSERT INTO block_list(blocked_username, username)
        VALUES('user1', 'user3')`);
  }
  
  async function commonBeforeEach() {
    await db.query("BEGIN");
  }
  
  async function commonAfterEach() {
    await db.query("ROLLBACK");
  }
  
  async function commonAfterAll() {
    await db.end();
  }
  
  
  module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll
  };