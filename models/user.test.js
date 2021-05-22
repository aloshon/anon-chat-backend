"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testUsers
} = require("./testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("authenticate", () => {
    test("works", async () => {
      const user = await User.authenticate({username: "user1", password: "password1"});
      expect(user).toEqual({
        id: expect.any(Number),
        username: "user1"
      });
    });

    test("throws unauthorized if username not found", async () => {
        try{
            await User.authenticate({username: "no", password: "password1"});
            fail();
        } catch(e){
            expect(e instanceof UnauthorizedError).toBeTruthy();
        }
    });

    test("throws unauthorized if incorrect password", async () => {
        try{
            await User.authenticate({username: "user1", password: "incorrect"});
            fail();
        } catch(e){
            expect(e instanceof UnauthorizedError).toBeTruthy();
        }
    });
});


describe("register", () => {
    test("works", async () => {
        const testUser = await User.register({username: "test", password: "test"});
        expect(testUser).toEqual({
            id: expect.any(Number),
            username: "test"
        });
        const searchDB = await db.query("SELECT * FROM users WHERE username = 'test'");
        expect(searchDB.rows.length).toEqual(1);
        expect(searchDB.rows[0].password.startsWith("$2b$")).toEqual(true);
    });

    test("throws bad request if duplicate user is passed", async () => {
        try {
          await User.register({
            username: "test",
            password: "password"
          });
          await User.register({
            username: "test",
            password: "password"
          });
          fail();
        } catch (e) {
          expect(e instanceof BadRequestError).toBeTruthy();
        }
      });
});


describe("get", () => {
    test("works", async () => {
        const user1 = await User.get("user1");
        expect(user1).toEqual({
            id: expect.any(Number),
            username: "user1",
            blockList: [],
            contactList: [expect.any(Object)]
        });
    });

    test("throws not found if no user is found", async () => {
        try {
          await User.get("none");
          fail();
        } catch (e) {
          expect(e instanceof NotFoundError).toBeTruthy();
        }
      });
});


describe("check", () => {
    test("works", async () => {
        const user1 = await User.check("user1");
        expect(user1).toEqual({
            id: expect.any(Number),
            username: "user1"
        });
    });

    test("throws not found if no user is found", async () => {
        try {
          await User.check("none");
          fail();
        } catch (e) {
          expect(e instanceof NotFoundError).toBeTruthy();
        }
      });
});


describe("remove", () => {
    test("works", async () => {
        await User.remove("user1");
        const checkUser = await db.query("SELECT * FROM users WHERE username='user1'");
        expect(checkUser.rows.length).toEqual(0);
    });

    test("throws not found if no user exists", async () => {
        try {
            await User.remove("uh...");
            fail();
        } catch(e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});


describe("checkBlockList", () => {
    test("true if user is blocked by other user", async () => {
        const blocked = await User.checkBlockList("user1", "user3");
        expect(blocked).toEqual(true);
    });

    test("false if user is not blocked by other user", async () => {
        const blocked = await User.checkBlockList("user1", "user2");
        expect(blocked).toEqual(false);
    });
});


describe("blockUser", () => {
    test("works", async () => {
        await User.blockUser("user2", "user1");
        const checkDB = await db.query("SELECT * FROM block_list WHERE username = 'user1'");
        expect(checkDB.rows.length).toEqual(1);
    });

    test("throws not found if neither user is found", async () => {
        try {
            await User.blockUser("nope", "nada");
            fail();
        } catch(e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});


describe("unblockUser", () => {
    test("works", async () => {
        await User.unblockUser("user1", "user3");
        const checkDB = await db.query("SELECT * FROM block_list WHERE username = 'user1'");
        expect(checkDB.rows.length).toEqual(0);
    });

    test("throws not found if either user is not found", async () => {
        try {
            await User.unblockUser("nope", "nada");
            fail();
        } catch(e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});

describe("addContact", () => {
    test("works", async () => {
        await User.addContact({
                username: testUsers[1].username, 
                nickname: "testing", 
                owner_id: testUsers[0].id, 
                user_id: testUsers[1].id
            });
        const checkDB = await db.query("SELECT * FROM contact_list WHERE nickname = 'testing'");
        expect(checkDB.rows.length).toEqual(1);
    });

    test("throws not found if username is not found", async () => {
        try {
            await User.addContact({
                username: "nope", 
                nickname: "test", 
                owner_id: 66, 
                user_id: 43
            });
            fail();
        } catch(e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});


describe("unblockUser", () => {
    test("works", async () => {
        await User.deleteContact(testUsers[0].id, testUsers[3].id);
        const checkDB = await db.query("SELECT * FROM contact_list WHERE user_id = $1", [testUsers[3].id]);
        expect(checkDB.rows.length).toEqual(0);
    });

    test("throws not found if either user is not found", async () => {
        try {
            await User.unblockUser(1, 2);
            fail();
        } catch(e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});