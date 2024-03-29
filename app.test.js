const request = require("supertest");

const {app} = require("./app");
const db = require("./db");

test("not found 404", async (done) => {
    const resp = await request(app).get("/nope");
    expect(resp.statusCode).toEqual(404);
    done();
});

afterAll(done => {
    db.end();
    done();
});