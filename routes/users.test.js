"use strict";

const request = require("supertest");

const {app} = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  user1Token,
  user2Token,
  user3Token
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
                blockList: [],
                contactList: []
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
            .set("authorization", `Bearer ${user3Token}`)
        
        expect(res.statusCode).toEqual(404);
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