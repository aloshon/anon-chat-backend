const bcrypt = require("bcrypt");

const db = require("../db.js");
const {BCRYPT_WORK_FACTOR} = require("../config");


const testUsers = [];
const testGroupChats = [];
let currentGMT = new Date();
const timestamp = currentGMT.toUTCString();

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
        
    testUsers.splice(0, 0, ...users.rows.map(u => ({id: u.id, username: u.username})))
        
    const groupChats = await db.query(`
      INSERT INTO group_chats(title, description, timestamp, creator_id)
      VALUES ('test1', 'testing', $3, $1),
            ('test2', 'testing', $3, $2)
      RETURNING *`, 
            [testUsers[0].id, testUsers[1].id, timestamp]);

    testGroupChats.splice(0, 0, ...groupChats.rows.map(g => g))
       
    await db.query(`
      INSERT INTO guests (username, user_id, group_chat_id)
      VALUES ('user1', $1, $3),
             ('user2', $2, $4),
             ('user1', $1, $4)`,
             [testUsers[0].id, testUsers[1].id, testGroupChats[0].id, testGroupChats[1].id]);
  
    await db.query(`
        INSERT INTO chat_messages(message, user_id, group_chat_id, timestamp)
        VALUES('this is chat 1', $1, $3, $5),
            ('this is chat 2!!!!!!!', $2, $4, $5)`, 
            [testUsers[0].id, testUsers[1].id, testGroupChats[0].id, testGroupChats[1].id, timestamp]);

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
    commonAfterAll,
    testUsers,
    testGroupChats
  };