"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  user1Token,
  user3Token,
  testUsers,
  testGroupChats
} = require("./testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

let currentGMT = new Date();
const timestamp = currentGMT.toUTCString();

describe("GET /message/:unique_id", () => {
    test("works", async () => {
        const res = await request(app).get(`/message/${testGroupChats[0].unique_id}`)
            .set("authorization", `Bearer ${user1Token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({messages: []});
    });

    test("throws forbidden if not on the guest list", async () => {
        const res = await request(app).get(`/message/${testGroupChats[0].unique_id}`)
            .set("authorization", `Bearer ${user3Token}`);

        expect(res.statusCode).toEqual(403);
    });

    test("throws unauthorized if anonymous", async () => {
        const res = await request(app).get(`/message/${testGroupChats[0].unique_id}`);

        expect(res.statusCode).toEqual(401);
    });
});


describe("POST /message/:unique_id", () => {
    test("works", async () => {
        const res = await request(app).post(`/message/${testGroupChats[0].unique_id}`)
            .send({
                unique_id: testGroupChats[0].unique_id,
                message: "hello", 
                user_id: testUsers[0].id, 
                group_chat_id: testGroupChats[0].id, 
                timestamp})
            .set("authorization", `Bearer ${user1Token}`)

        expect(res.statusCode).toEqual(201);

        const messageRes = await request(app).get(`/message/${testGroupChats[0].unique_id}`)
            .set("authorization", `Bearer ${user1Token}`);

        expect(messageRes.statusCode).toEqual(200);
        expect(messageRes.body).toEqual({ messages: [{id: expect.any(Number), message: "hello", user_id: testUsers[0].id, timestamp: expect.any(String)}]})
    });

    test("throws forbidden if not on the guest list", async () => {
        const res = await request(app).post(`/message/${testGroupChats[0].unique_id}`)
            .send({
                unique_id: testGroupChats[0].unique_id,
                message: "hello", 
                user_id: testUsers[2].id, 
                group_chat_id: testGroupChats[0].id, 
                timestamp})
            .set("authorization", `Bearer ${user3Token}`);

        expect(res.statusCode).toEqual(403);
    });

    test("throws unauthorized if anonymous", async () => {
        const res = await request(app).post(`/message/${testGroupChats[0].unique_id}`)
            .send({
                unique_id: testGroupChats[0].unique_id,
                message: "hello", 
                user_id: testUsers[0].id, 
                group_chat_id: testGroupChats[0].id, 
                timestamp});

        expect(res.statusCode).toEqual(401);
    });
});