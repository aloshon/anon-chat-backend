"use strict";

const request = require("supertest");

const {app} = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  user1Token,
  testUsers,
  testGroupChats
} = require("./testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /guests/:group_chat_id", () => {
    test("works", async () => {
        const userRes = await request(app).post("/auth/token")
            .send({
                username: testUsers[0].username,
                password: "password1"
            });

        const res = await request(app).post(`/guests/${testGroupChats[0].unique_id}`)
            .send({
                unique_id: testGroupChats[0].unique_id,
                user_id: testUsers[1].id,
                username: testUsers[1].username,
                group_chat_id: testGroupChats[0].id
            })
            .set("authorization", `Bearer ${userRes.body.token}`);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({user_id: testUsers[1].id, username: testUsers[1].username, group_chat_id: testGroupChats[0].id})
    });

    test("guest list is limited to 10 users max", async () => {
        const userRes = await request(app).post("/auth/token")
            .send({
                username: testUsers[0].username,
                password: "password1"
            });

        const res = await request(app).post(`/guests/${testGroupChats[1].unique_id}`)
            .send({
                unique_id: testGroupChats[1].unique_id,
                user_id: testUsers[10].id,
                username: testUsers[10].username,
                group_chat_id: testGroupChats[1].id
            })
            .set("authorization", `Bearer ${userRes.body.token}`);

        expect(res.statusCode).toEqual(400);
        expect(res.body.error.message).toEqual("Guest list cannot exceed 10 users")
    });

    test("throws unauthorized if anonymous", async () => {
        const res = await request(app).post(`/guests/${testGroupChats[0].unique_id}`)
            .send({
                unique_id: testGroupChats[0].unique_id,
                user_id: testUsers[1].id,
                username: testUsers[1].username,
                group_chat_id: testGroupChats[0].id
            });

        expect(res.statusCode).toEqual(401);
    });

    test("throws forbidden if user is not the creator ", async () => {
        const res = await request(app).post(`/guests/${testGroupChats[0].unique_id}`)
            .send({
                unique_id: testGroupChats[0].unique_id,
                user_id: testUsers[1].id,
                username: testUsers[1].username,
                group_chat_id: testGroupChats[0].id
            })
            .set("authorization", `Bearer ${user1Token}`)

        expect(res.statusCode).toEqual(403);
    });

    test("throws not found if user tries to invite someone who blocked them", async () => {
        const userRes = await request(app).post("/auth/token")
            .send({
                username: testUsers[0].username,
                password: "password1"
            });

        const res = await request(app).post(`/guests/${testGroupChats[0].unique_id}`)
            .send({
                unique_id: testGroupChats[0].unique_id,
                user_id: testUsers[2].id,
                username: testUsers[2].username,
                group_chat_id: testGroupChats[0].id
            })
            .set("authorization", `Bearer ${userRes.body.token}`);

        expect(res.statusCode).toEqual(404);
    });
})