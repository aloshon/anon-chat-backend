"use strict";

const request = require("supertest");

const {app} = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  user3Token,
  testUsers,
  testGroupChats
} = require("./testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("GET /chat", () => {
    test("works", async () => {
        const userRes = await request(app).post("/auth/token")
            .send({
                username: testUsers[0].username,
                password: "password1"
            });

        const res = await request(app).get(`/chat`)
            .set("authorization", `Bearer ${userRes.body.token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({groupChats: [{
            id: expect.any(Number),
            unique_id: expect.any(String),
            title: "test",
            description: "test",
            timestamp: expect.any(String),
            creator_id: testUsers[0].id
        },
        {
            id: expect.any(Number),
            unique_id: expect.any(String),
            title: "testGuest",
            description: "testGuestLimit",
            timestamp: expect.any(String),
            creator_id: testUsers[0].id
        }
    ]});
    });

    test("throws unauthorized if anonymous", async () => {
        const res = await request(app).get("/chat");

        expect(res.statusCode).toEqual(401)
    });
});


describe("POST /chat", () => {
    test("works", async () => {
        const userRes = await request(app).post("/auth/token")
            .send({
                username: testUsers[0].username,
                password: "password1"
            });

        const res = await request(app).post(`/chat`)
            .send({
                title: "testing",
                description: "this is a test",
                creator_id: testUsers[0].id,
                creatorToGuestList: testUsers[0]
            })
            .set("authorization", `Bearer ${userRes.body.token}`);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({groupChat: {
            id: expect.any(Number),
            title: "testing",
            description: "this is a test",
            timestamp: expect.any(String),
            creator_id: testUsers[0].id,
            unique_id: expect.any(String),
            guests: [{
                group_chat_id: expect.any(Number),
                user_id: expect.any(Number),
                username: "user1",
            }]
        }});
    });

    test("throws unauthorized if anonymous", async () => {
        const res = await request(app).post("/chat")
            .send({
                title: "testing",
                description: "this is a test",
                creator_id: testUsers[0].id,
                creatorToGuestList: testUsers[0]
            });

        expect(res.statusCode).toEqual(401)
    });
});


describe("GET /chat/:unique_id", () => {
    test("works", async () => {
        const userRes = await request(app).post("/auth/token")
            .send({
                username: testUsers[0].username,
                password: "password1"
            });

        const res = await request(app).get(`/chat/${testGroupChats[0].unique_id}`)
            .set("authorization", `Bearer ${userRes.body.token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({groupChat: {
            id: expect.any(Number),
            unique_id: expect.any(String),
            title: "test",
            description: "test",
            timestamp: expect.any(String),
            creator_id: testUsers[0].id,
            guests: [
                {
                    user_id: testUsers[0].id,
                    username: testUsers[0].username
                }
            ]
        }});
    });

    test("throws unauthorized if anonymous", async () => {
        const res = await request(app).get(`/chat/${testGroupChats[0].unique_id}`);

        expect(res.statusCode).toEqual(401)
    });

    test("throws forbidden if not on the guest list", async () => {
        const res = await request(app).get(`/chat/${testGroupChats[0].unique_id}`)
            .set("authorization", `Bearer ${user3Token}`);

        expect(res.statusCode).toEqual(403);
    });
});


describe("DELETE /chat/:unique_id", () => {
    test("works", async () => {
        const userRes = await request(app).post("/auth/token")
            .send({
                username: testUsers[0].username,
                password: "password1"
            });

        const res = await request(app).delete(`/chat/${testGroupChats[0].unique_id}`)
            .set("authorization", `Bearer ${userRes.body.token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({groupChat: {
            id: expect.any(Number),
            unique_id: expect.any(String),
            title: "test",
            description: "test",
            timestamp: expect.any(String),
            creator_id: testUsers[0].id
        }});
    });

    test("throws unauthorized if anonymous", async () => {
        const res = await request(app).delete(`/chat/${testGroupChats[0].unique_id}`);

        expect(res.statusCode).toEqual(401)
    });

    test("throws forbidden if not creator of group chat", async () => {
        const res = await request(app).delete(`/chat/${testGroupChats[0].unique_id}`)
            .set("authorization", `Bearer ${user3Token}`);

        expect(res.statusCode).toEqual(403);
    });
});