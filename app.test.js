const request = require("supertest");

const app = require("./app");
const db = require("./db");

beforeAll(done => {
    done()
})

test("not found 404", async () => {
    const resp = await request(app).get("/shoot/idk");
    expect(resp.statusCode).toEqual(404);
});

afterAll(done => {
    db.end();
    done();
});