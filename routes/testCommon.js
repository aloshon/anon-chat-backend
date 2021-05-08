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

    // Extra users just to test that guests lists keep the 10 user limit
    testUsers[3] = (await User.register({
        username: "user4",
        password: "password4",
        isAdmin: false
    }));

    testUsers[4] = (await User.register({
        username: "user5",
        password: "password5",
        isAdmin: false
    }));

    testUsers[5] = (await User.register({
        username: "user6",
        password: "password6",
        isAdmin: false
    }));

    testUsers[6] = (await User.register({
        username: "user7",
        password: "password7",
        isAdmin: false
    }));

    testUsers[7] = (await User.register({
        username: "user8",
        password: "password8",
        isAdmin: false
    }));

    testUsers[8] = (await User.register({
        username: "user9",
        password: "password9",
        isAdmin: false
    }));

    testUsers[9] = (await User.register({
        username: "user10",
        password: "password10",
        isAdmin: false
    }));

    testUsers[10] = (await User.register({
        username: "user11",
        password: "password11",
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

    testGroupChats[1] = (await GroupChat.createGroupChat({
        title: "testGuest",
        description: "testGuestLimit",
        timestamp,
        creator_id: testUsers[0].id,
        creatorToGuestList: testUsers[0]
    }));

    // Add the max number of guests to this group chats's guest list
    for(let i = 1; i < testUsers.length; i++){
        await GroupChat.inviteGuest({
            username: testUsers[i].username,
            user_id: testUsers[i].id,
            group_chat_id: testGroupChats[1].id
        });
    }
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