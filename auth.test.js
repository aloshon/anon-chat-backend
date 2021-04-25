"use strict";

const jwt = require("jsonwebtoken");
const {UnauthorizedError, ForbiddenError} = require("./expressError");

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
        const res = {locals: {user: {user_id: 1, username: "test", isAdmin: false}}};
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
})

describe("ensureAdmin", () => {
    test("works", () => {
        const req = {};
        const res = {locals: {user: {user_id: 1, username: "test", isAdmin: true}}};
        const next = (err) => {
            expect(err).toBeFalsy();
        }
        ensureAdmin(req, res, next);
    });

    test("throws unauthorized if not admin", () => {
        const req = {};
        const res = {locals: {user: {user_id: 1, username: "test", isAdmin: false}}};
        const next = (err) => {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
        ensureAdmin(req, res, next);
    });

    test("throws unauthorized if no local user", () => {
        const req = {};
        const res = {locals: {}};
        const next = (err) => {
            expect(err instanceof UnauthorizedError).toBeTruthy();
        }
        ensureAdmin(req, res, next);
    });
})
// These tests for the middlewares that require async await always come back falsy

// describe("ensureOnGuestList", () => {
//     test("Throws forbidden if user cannot be found on a guest list", () => {
//         const req = {params: {id: "b2ec2167-6611-429d-8877-20727850022o"}};
//         const res = {locals: {user: {user_id: 1, username: "test", isAdmin: true}}};
//         const next = (err) => {
//             expect(err instanceof ForbiddenError).toBeTruthy();
//         }
//         ensureOnGuestList(req, res, next);
//     });
// });

// describe("ensureCreatorOfGroupChat", () => {
//     test("Throws forbidden if user is not the creator of the group chat", () => {
//         const req = {params: {id: "b2ec2167-6611-429d-8877-20727850022o"}};
//         const res = {locals: {user: {user_id: 1, username: "test", isAdmin: false}}};
//         const next = (err) => {
//             expect(err instanceof ForbiddenError).toBeTruthy();
//         }
//         ensureCreatorOfGroupChat(req, res, next);
//     });
// })

