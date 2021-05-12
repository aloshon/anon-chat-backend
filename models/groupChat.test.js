"use strict";

const {
  BadRequestError,
} = require("../expressError");
const db = require("../db.js");
const GroupChat = require("./groupChat.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testUsers,
  testGroupChats
} = require("./testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

let currentGMT = new Date();
const timestamp = currentGMT.toUTCString();

/** 
 * TESTS THAT CHECK FOR DATA USING UNIQUE_ID CANNOT BE TESTED TO FAIL
 *  AS THE DB HAS RECORD OF ALL UNIQUE_ID'S 
 *  AND WILL NOT TAKE A FAKE/EDITED ONE
 */

describe("createGroupChat", () => {
    test("works", async () => {
        const newGroupChat = {
            title: "test",
            description: "test",
            timestamp,
            creator_id: testUsers[0].id,
            creatorToGuestList: testUsers[0]
        }
        let groupChat = await GroupChat.createGroupChat(newGroupChat);
        expect(groupChat).toEqual({
            id: expect.any(Number),
            unique_id: expect.any(String),
            title: "test",
            description: "test",
            timestamp: expect.any(String),
            creator_id: testUsers[0].id,
            
        });
    });

    test("throws bad request if missing data", async () => {
        try {
            await GroupChat.createGroupChat({
                title: "test",
                timestamp
            });
            fail();
        } catch(e) {
            expect(e instanceof BadRequestError).toBeTruthy();
        }
    });
});


describe("getInvitedGroupChats", () => {
    test("works", async () => {
        const groupChats = await GroupChat.getInvitedGroupChats(testUsers[0].id);
        expect(groupChats.length).toEqual(2);
    });
});


describe("getGroupChat", () => {
    test("works", async () => {
        const groupChat = await GroupChat.getGroupChat(testGroupChats[0].unique_id);
        expect(groupChat).toEqual({
            id: expect.any(Number),
            unique_id: expect.any(String),
            title: "test1",
            description: "testing",
            timestamp: expect.any(String),
            creator_id: testUsers[0].id,
            guests: [{
                user_id: expect.any(Number),
                username: "user1"
            }]
        });
    });

});


describe("getMessages", () => {
    test("works", async () => {
        const messages = await GroupChat.getMessages(testGroupChats[0].unique_id);
        expect(messages).toEqual([{
            id: expect.any(Number),
            message: "this is chat 1",
            user_id: testUsers[0].id,
            timestamp: expect.any(String)
        }]);
    });
});


describe("sendMessage", () => {
    test("works", async () => {
        const messageToSend = {
            message: "Hello!",
            user_id: testUsers[0].id,
            group_chat_id: testGroupChats[0].id,
            timestamp
        }

        const message = await GroupChat.sendMessage(messageToSend);

        expect(message).toEqual({message: "success"})
    });

    test("throws bad request if data is invalid", async () => {
        try {
            const messageToSend = {
                message: {},
                user_id: '2',
                group_chat_id: testGroupChats[0].id,
                timestamp
            }
            await GroupChat.sendMessage(messageToSend);
            fail();
        } catch(e) {
            expect(e instanceof BadRequestError).toBeTruthy();
        }
    });
});


describe("checkListLength", () => {
    test("works", async () => {
        const res = await GroupChat.checkListLength(testGroupChats[0].id);
        expect(res).toEqual(1);
    });
});


describe("inviteGuest", () => {
    test("works", async () => {
        const guest = {
            username: testUsers[1].username,
            user_id: testUsers[1].id,
            group_chat_id: testGroupChats[0].id
        };

        const res = await GroupChat.inviteGuest(guest);
        expect(res).toEqual(guest);
    });

    test("throws bad request if data is invalid", async () => {
        try {
            const guest = {
                username: 'incorrect',
                user_id: 'Number',
                group_chat_id: testGroupChats[0].id
            }
            await GroupChat.inviteGuest(guest);
            fail();
        } catch(e) {
            expect(e instanceof BadRequestError).toBeTruthy();
        }
    });
});


describe("getCreatorId", () => {
    test("works", async () => {
        const res = await GroupChat.getCreatorId(testGroupChats[0].unique_id);
        expect(res).toEqual(testUsers[0].id);
    });
});

describe("deleteGroupChat", () => {
    test("works", async () => {
        const res = await GroupChat.deleteGroupChat(testGroupChats[1].unique_id);
        expect(res).toEqual(expect.any(Object));
        expect(res.description).toEqual("testing");
    });
})