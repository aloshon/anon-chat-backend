"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { id, username }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate({username, password}) {
    // try to find the user first
    const result = await db.query(
          `SELECT id,
                  username,
                  password
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { id, username }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register({ username, password }) {

    const duplicateCheck = await db.query(
          `SELECT username
           FROM users
           WHERE username = $1`,
        [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Username taken: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
          `INSERT INTO users
           (username,
            password)
           VALUES ($1, $2)
           RETURNING id, username`,
        [
          username,
          hashedPassword
        ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Given a username, return user.
   *
   * Returns { id, username, blockList: [{id, blocked_username, blockList}...] }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const userRes = await db.query(
          `SELECT id, 
            username
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = userRes.rows[0];
    if (!user) throw new NotFoundError(`No user: ${username}`);

    const blockList = await db.query(
      `SELECT id,
      blocked_username
      FROM block_list
      WHERE username = $1`,
      [user.username]
    )

    const contactList = await db.query(
      `SELECT username,
      nickname,
      user_id
      FROM contact_list
      WHERE owner_id = $1`,
      [user.id]
    )
    // set the user's block list and contact list to the one recevied from db or an empty array
    user.blockList = blockList.rows.length > 0 ? blockList.rows : [];
    user.contactList = contactList.rows.length > 0 ? contactList.rows : [];

    return user;
  }

  /** Given a username, return user's username.
   * Just to check if user exists, no need to request
   * for the block list
   *
   * Returns { username }
   *
   * Throws NotFoundError if user not found.
   **/

  static async check(username) {
    const res = await db.query(
          `SELECT id, username
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = res.rows[0];
    if (!user) throw new NotFoundError(`No user found with username: ${username}`);

    return user;
  }

  /** Delete given user from database; returns username. */

  static async remove(username) {
    const result = await db.query(
          `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
        [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  /** Check if user is blocked
   *  It checks the database for a row that matches
   *  the user_id and username provided 
   *  Returns boolean if there is a result or not.
   */

   static async checkBlockList(blocked_username, username) {
     const checkIfBlocked = await db.query(
       `SELECT blocked_username,
       username
       FROM block_list
       WHERE blocked_username = $1
       AND username = $2`,
       [blocked_username, username]);
      
      if(checkIfBlocked.rows[0]){
        return true;
      }
      return false;
   }

  /** Block user by username */

  static async blockUser(blocked_username, username) {
    const checkUsernameExists = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1`,
      [username]
    );

    const checkUsernameToBlockExists = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1`,
      [blocked_username]
    );

    if (!checkUsernameExists.rows[0] || !checkUsernameToBlockExists.rows[0]) {
      throw new NotFoundError(`No user found with username: ${blocked_username}`);
    }

    const result = await db.query(
          `INSERT INTO block_list
            (blocked_username, username)
            VALUES ($1, $2)
           RETURNING id, 
           blocked_username`,
        [blocked_username, username],
    );
    return result.rows[0];
  }

  /** Unblock user by username */

  static async unblockUser(blocked_username, username) {
    const result = await db.query(
          `DELETE
          FROM block_list
          WHERE blocked_username = $1
          AND username = $2
          RETURNING id, 
          blocked_username`,
        [blocked_username, username],
    );

    if (!result.rows[0]) throw new NotFoundError(`User not found: ${blocked_username}`);

    return result.rows[0];
  }

  /** Add contact to contact list */

  static async addContact({username, nickname, owner_id, user_id}) {
    const checkUsernameExists = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1`,
      [username]
    );

    if (!checkUsernameExists.rows[0]) throw new NotFoundError(`Username not found ${username}`);

    const result = await db.query(
          `INSERT INTO contact_list
            (username, nickname, owner_id, user_id)
            VALUES ($1, $2, $3, $4)
           RETURNING username,
           nickname,
           user_id`,
        [username, nickname, owner_id, user_id],
    );


    return result.rows[0];
  }

  /** Remove contact from contact list */

  static async deleteContact(owner_id, user_id) {

    const result = await db.query(
          `DELETE FROM contact_list
            WHERE owner_id = $1
            AND user_id = $2
           RETURNING user_id`,
        [owner_id, user_id],
    );

    if (!result.rows[0]) throw new NotFoundError(`Contact not found`);

    return result.rows[0];
  }
}


module.exports = User;
