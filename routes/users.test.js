"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  user1Token,
  user2Token,
  adminToken
} = require("./testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("GET /users/:username", () => {
    test("works for logged in user", async () => {
        const res = await request(app).get("/users/user1")
            .set("authorization", `Bearer ${user1Token}`);

        expect(res.body).toEqual({
            user: {
                id: expect.any(Number),
                username: "user1",
                isAdmin: false,
                blockList: []
            }
        });
    });

    test("throws unauthorized for anonymous users", async () => {
        const res = await request(app).get("/users/user1");
        
        expect(res.statusCode).toEqual(401);
    });

    test("throws not found if user is blocked", async () => {
        const res = await request(app).get("/users/user3")
            .set("authorization", `Bearer ${user1Token}`)
        
        expect(res.statusCode).toEqual(404);
    });

    test("throws not found if user does not exist", async () => {
        const res = await request(app).get("/users/bruh")
            .set("authorization", `Bearer ${user1Token}`)
        
        expect(res.statusCode).toEqual(404);
    });
});


describe("GET /users/:username/check", () => {
    test("works for logged in and unblocked user", async () => {
        const res = await request(app).get("/users/user2/check")
            .set("authorization", `Bearer ${user1Token}`);

        expect(res.body).toEqual({
            user: {
                id: expect.any(Number),
                username: "user2"
            }
        });
    });

    test("throws unauthorized for anonymous users", async () => {
        const res = await request(app).get("/users/user2/check");
        
        expect(res.statusCode).toEqual(401);
    });

    test("throws not found if user is blocked", async () => {
        const res = await request(app).get("/users/user3/check")
            .set("authorization", `Bearer ${user1Token}`)
        
        expect(res.statusCode).toEqual(404);
    });

    test("throws not found if user does not exist", async () => {
        const res = await request(app).get("/users/bruh/check")
            .set("authorization", `Bearer ${user1Token}`)
        
        expect(res.statusCode).toEqual(404);
    });
});


describe("POST, /users", () => {
    test("admins can create non-admin users", async () => {
        const res = await request(app).post("/users/")
            .send({
                username: "newNonAdmin",
                password: "thisisnew00",
                isAdmin: false
            })
            .set("authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            user: {
                id: expect.any(Number),
                username: "newNonAdmin",
                isAdmin: false
            }, token: expect.any(String)
        });
    });

    test("admins can create other admins", async () => {
        const res = await request(app).post("/users/")
            .send({
                username: "newAdmin",
                password: "thisisnew99",
                isAdmin: true
            })
            .set("authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            user: {
                id: expect.any(Number),
                username: "newAdmin",
                isAdmin: true
            }, token: expect.any(String)
        });
    });

    test("throws unauthorized is normal user tries use this", async () => {
        const res = await request(app).post("/users/")
            .send({
                username: "newAdmin",
                password: "thisisnew99",
                isAdmin: true
            })
            .set("authorization", `Bearer ${user1Token}`);

        expect(res.statusCode).toEqual(401);
    });

    test("throws bad request if missing data", async () => {
        const res = await request(app).post("/users/")
            .send({
                password: "thisisnew99",
                isAdmin: true
            })
            .set("authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(400);
    });

    test("throws bad request if data is invalid", async () => {
        const res = await request(app).post("/users/")
            .send({
                username: 4040,
                password: "thisisnew99",
                isAdmin: {}
            })
            .set("authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toEqual(400);
    });
});


describe("DELETE /users/", () => {
    test("works for logged in user", async () => {
        const res = await request(app).delete("/users/")
            .set("authorization", `Bearer ${user1Token}`);

        expect(res.body).toEqual({ deleted: "user1" });
    });

    test("deletes the user that was passed in token", async () => {
        const res = await request(app).delete("/users/")
            .set("authorization", `Bearer ${user2Token}`);

        expect(res.body).toEqual({ deleted: "user2" });
    });

    test("throws unauthorized if anonymous", async () => {
        const res = await request(app).delete("/users/");

        expect(res.statusCode).toEqual(401);
    });
});