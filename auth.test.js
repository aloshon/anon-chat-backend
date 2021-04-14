"use strict";

const jwt = require("jsonwebtoken");
const {UnauthorizedError} = require("./expressError");

const {
    authenticateJWT,
    ensureLoggedIn,
    ensureAdmin,
    ensureOnGuestList,
    ensureCreatorOfGroupChat
} = require("./auth");

const { SECRET_KEY } = require("./config");
const testJwt = jwt.sign({ user_id: 1, username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ user_id: 2, username: "test", isAdmin: false }, "no");

describe("authenticateJWT", () => {
    test("works with header", () => {
        expect.assertions(2);
        const req = {headers: {authorization: `Bearer ${testJwt}`}};
        const res = {locals: {}};
        const next = (err) => {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals.user).toEqual({
            user_id: 1,
            username: "test",
            isAdmin: false,
            iat: expect.any(Number)
        })
    });
});