"use strict";

const request = require("supertest");

const {app} = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /auth/token", () => {
    test("works", async () => {
        const res = await request(app).post("/auth/token")
            .send({
                username: "user1",
                password: "password1"
            });

        expect(res.body).toEqual({
            "token": expect.any(String)
        });
    });

    test("throws unauthorized with incorrect password", async () => {
        const res = await request(app).post("/auth/token")
            .send({
                username: "user1",
                password: "bfudijwefhubdjowk"
            });

        expect(res.statusCode).toEqual(401);
    });

    test("throws unauthorized if user doesn't exist", async () => {
        const resp = await request(app).post("/auth/token")
            .send({
              username: "no-no-no",
              password: "password1",
            });

        expect(resp.statusCode).toEqual(401);
      });

      test("throws bad request if data is missing", async () => {
        const resp = await request(app).post("/auth/token")
            .send({
              username: "user1",
            });

        expect(resp.statusCode).toEqual(400);
      });

      test("throws bad request if data is invalid", async () => {
        const resp = await request(app).post("/auth/token")
            .send({
              username: {},
              password: 25
            });

        expect(resp.statusCode).toEqual(400);
      });
});


describe("POST, /auth/register", () => {
    test("works for anon users so they can no longer be anon", async () => {
        const res = await request(app).post("/auth/register")
            .send({
                username: "newUser",
                password: "whyhellothere22"
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            "token": expect.any(String)
        });
    });

    test("throws bad request if missing data", async () => {
        const res = await request(app).post("/auth/register")
            .send({
                username: "newUser"
            });

        expect(res.statusCode).toEqual(400);
    });

    test("throws bad request if data is invalid", async () => {
        const res = await request(app).post("/auth/register")
            .send({
                username: 999,
                password: []
            });

        expect(res.statusCode).toEqual(400);
    });
});