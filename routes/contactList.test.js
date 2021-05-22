"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testUsers,
  user1Token,
  user2Token,
  user3Token
} = require("./testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /contact/", () => {
    test("works, contact will be added to user's contact list", async () => {
        const res = await request(app).post("/contact")
            .set("authorization", `Bearer ${user1Token}`)
            .send({
                username: testUsers[1].username,
                nickname: "testnickname",
                owner_id: testUsers[0].id,
                user_id: testUsers[1].id
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            addedContact: {
                username: testUsers[1].username,
                nickname: "testnickname",
                user_id: testUsers[1].id
            }
        });

        const testRes = await request(app).get(`/users/${testUsers[0].username}`)
            .set("authorization", `Bearer ${user1Token}`);

        expect(testRes.body.user.contactList.length).toEqual(1);
    });

    test("throws unauthorized if anonymous", async () => {
        const res = await request(app).post("/contact");

        expect(res.statusCode).toEqual(401)
    });

    test("throws back request if incorrect or missing data", async () => {
        const res = await request(app).post("/contact")
            .set("authorization", `Bearer ${user2Token}`)
            .send({
                username: {},
                nickname: 1,
                owner_id: "haha",
                user_id: testUsers[1].id
            });

        expect(res.statusCode).toEqual(400)
    });
});


describe("DELETE /contact/:contact_id", () => {
    test("works, users can delete contacts off contact list", async () => {
        const userRes = await request(app).post("/auth/token")
            .send({
                username: testUsers[0].username,
                password: "password1"
            });

        const res = await request(app).post("/contact")
            .set("authorization", `Bearer ${userRes.body.token}`)
            .send({
                username: testUsers[1].username,
                nickname: "testnickname",
                owner_id: testUsers[0].id,
                user_id: testUsers[1].id
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            addedContact: {
                username: testUsers[1].username,
                nickname: "testnickname",
                user_id: testUsers[1].id
            }
        });

        const addedRes = await request(app).get(`/users/${testUsers[0].username}`)
            .set("authorization", `Bearer ${userRes.body.token}`);

        expect(addedRes.body.user.contactList.length).toEqual(1);

        const removeContactRes = await request(app).delete(`/contact/${testUsers[1].id}`)
            .set("authorization", `Bearer ${userRes.body.token}`);

        expect(removeContactRes.body).toEqual({
            deletedContact: {
                user_id: testUsers[1].id
            }
        });

        const removedRes = await request(app).get(`/users/${testUsers[0].username}`)
            .set("authorization", `Bearer ${userRes.body.token}`);

        expect(removedRes.body.user.contactList.length).toEqual(0);
    });

    test("throws unauthorized if anonymous", async () => {
        const res = await request(app).delete(`/contact/${testUsers[1].id}`);

        expect(res.statusCode).toEqual(401)
    });
});