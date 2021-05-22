"use strict";

const jwt = require("jsonwebtoken");
const {UnauthorizedError} = require("./expressError");

const {
    authenticateJWT,
    ensureLoggedIn
} = require("./auth");

const { SECRET_KEY } = require("./config");
const testJwt = jwt.sign({ user_id: 1, username: "test" }, SECRET_KEY);

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
            iat: expect.any(Number)
        })
    });

    test("works without header", () => {
        const req = {};
        const res = {locals: {}};
        const next = (err) => {
            expect(err).toBeFalsy();
        };
        authenticateJWT(req, res, next);
        expect(res.locals).toEqual({});
    });
});

describe("ensureLoggedIn", () => {
    test("works", () => {
        const req = {};
        const res = {locals: {user: {user_id: 1, username: "test"}}};
        const next = (err) => {
            expect(err).toBeFalsy();
        }
        ensureLoggedIn(req, res, next);
    });

    test("throws unathorized if no local user from token", () => {
        const req = {};
        const res = {locals: {}};
        const next = (err) => {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
        ensureLoggedIn(req, res, next);
    });
});

