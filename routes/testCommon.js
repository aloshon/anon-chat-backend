"use strict";

const db = require("../db.js");
const User = require("../models/user");
const GroupChat = require("../models/groupChat");
const {createToken} = require("../tokens");

const testUsers = [];
const testGroupChats = [];

async function commonBeforeAll(){
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM group_chats");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM users");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM chat_messages");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM guests");
    // noinspection SqlWithoutWhere
    await db.query("DELETE FROM block_list");

    let currentGMT = new Date();
    const timestamp = currentGMT.toUTCString();

    testUsers[0] = (await User.register({
        username: "user1",
        password: "password1",
        isAdmin: false
    }));

    testUsers[1] = (await User.register({
        username: "user2",
        password: "password2",
        isAdmin: false
    }));

    testUsers[2] = (await User.register({
        username: "user3",
        password: "password3",
        isAdmin: false
    }));

    await User.blockUser(testUsers[0].username, testUsers[2].username);

    testGroupChats[0] = (await GroupChat.createGroupChat({
        title: "test",
        description: "test",
        timestamp,
        creator_id: testUsers[0].id,
        creatorToGuestList: testUsers[0]
    }));

};

async function commonBeforeEach() {
    await db.query("BEGIN");
}
  
async function commonAfterEach() {
    await db.query("ROLLBACK");
}
  
async function commonAfterAll() {
    await db.end();
}

const user1Token = createToken({ user_id: 1, username: "user1", isAdmin: false });
const user2Token = createToken({ user_id: 2, username: "user2", isAdmin: false });
const user3Token = createToken({ user_id: 3, username: "user3", isAdmin: false });
const adminToken = createToken({ user_id: 4, username: "admin", isAdmin: true });

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    user1Token,
    user2Token,
    user3Token,
    adminToken,
    testUsers,
    testGroupChats
}