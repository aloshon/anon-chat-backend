const request = require("supertest");

const app = require("./app");
const db = require("./db");

test("not found 404", async () => {
    const resp = await request(app).get("/shoot/idk");
    expect(resp.statusCode).toEqual(404);
    done();
});

afterAll(() => {
    db.end();
    done();
});