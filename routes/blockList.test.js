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

describe("POST /block/:username", () => {
    test("works, users who are blocked cannot access said user", async () => {
        const res = await request(app).post("/block/user2")
            .set("authorization", `Bearer ${user1Token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            blocked: {
                id: expect.any(Number),
                blocked_username: "user2"
            }
        });

        const testRes = await request(app).get("/users/user1")
            .set("authorization", `Bearer ${user2Token}`);

        expect(testRes.statusCode).toEqual(404);
    });

    test("throws unauthorized if anonymous", async () => {
        const res = await request(app).post("/block/user1");

        expect(res.statusCode).toEqual(401)
    });

    test("throws not found if user doesn't exist", async () => {
        const res = await request(app).post("/block/dude-no")
            .set("authorization", `Bearer ${user3Token}`)

        expect(res.statusCode).toEqual(404)
    });
});


describe("DELETE /block/:username", () => {
    test("works, users who used to be blocked can now access said user", async () => {
        const blockedRes = await request(app).get("/users/user3/check")
            .set("authorization", `Bearer ${user1Token}`);

        expect(blockedRes.statusCode).toEqual(404);

        const unblockedRes = await request(app).delete("/block/user1")
            .set("authorization", `Bearer ${user3Token}`);

        expect(unblockedRes.body).toEqual({
            unblocked: {
                id: expect.any(Number),
                blocked_username: "user1"
            }
        });

        const res = await request(app).get("/users/user3/check")
            .set("authorization", `Bearer ${user1Token}`);

        expect(res.body).toEqual({
            user: {
                id: expect.any(Number),
                username: "user3"
            }
        })
    });

    test("throws unauthorized if anonymous", async () => {
        const res = await request(app).delete("/block/user1");

        expect(res.statusCode).toEqual(401)
    });

    test("throws not found if user doesn't exist", async () => {
        const res = await request(app).delete("/block/dude-no")
            .set("authorization", `Bearer ${user3Token}`)

        expect(res.statusCode).toEqual(404)
    });
});