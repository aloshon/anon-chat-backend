"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

/** Related functions for group chats. */

class GroupChat {
  /** Create a group chat, update the database, and return its values.
   *
   * data should be { title, timestamp, creator_id }
   *
   * Returns { id, unique_id, title, timestamp, creator_id }
   *
   * Throws BadRequestError if an error occurred.
   * */

  static async createGroupChat({ title, description, timestamp, creator_id, creatorToGuestList }) {
    try {
      const result = await db.query(
        `INSERT INTO group_chats
         (title, description, timestamp, creator_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
      [
        title,
        description,
        timestamp,
        creator_id
      ]);

      // add the user who created the group chat to the guest list
      await db.query(
        `INSERT INTO guests
        (username, user_id, group_chat_id)
        VALUES ($1, $2, $3)`,
        [
          creatorToGuestList.username,
          creatorToGuestList.id,
          result.rows[0].id
        ]
      )

    return result.rows[0]
    } catch(e){
      throw new BadRequestError(`Error creating group chat. Please try again later: ${e}`);
    }
  }

  /** Given a user id, return the group chats that have 
   *  this user id in their guest list.
   *
   * Returns { gc.id, gc.title, gc.description, gc.timestamp,
   * gc.creator_id }
   *   where Group Chats is gc 
   *
   * Throws NotFoundError if not found.
   **/

  static async getInvitedGroupChats(user_id) {

    const groupChats = await db.query(
          `SELECT gc.id,
          gc.unique_id,
          gc.title,
          gc.description,
          gc.timestamp,
          gc.creator_id
          FROM group_chats AS "gc"
            RIGHT JOIN guests AS "g" ON gc.id = g.group_chat_id
          WHERE g.user_id = $1
          ORDER BY gc.id ASC`,
        [user_id]);
    if(!groupChats) throw new NotFoundError(`Cannot find group chat with user_id: ${user_id}`)
    return groupChats.rows;
  }

  /** Given a group_chat's unique_id, return the group chat data and guests
   *
   * Returns { gc.id, gc.title, gc.description, gc.timestamp,
   * gc.creator_id, g.username, g.user_id }
   *  Where Group Chats is gc and Guests is g
   *
   * Throws NotFoundError if not found.
   **/

  static async getGroupChat(unique_id) {
    const groupChat = await db.query(
          `SELECT id,
          unique_id,
          title,
          description,
          timestamp,
          creator_id
          FROM group_chats
          WHERE unique_id = $1`,
        [unique_id]);

    
    if(!groupChat) throw new NotFoundError(`Cannot find group chat with unique_id of ${unique_id}`)

    const guestList = await db.query(
      `SELECT username,
      user_id
      FROM guests
      WHERE group_chat_id = $1`,
    [groupChat.rows[0].id]);
    groupChat.rows[0].guests = guestList.rows;
    
    return groupChat.rows[0];
  }

  /** Given a unique_id, get messages from group chat.
   *
   * Returns  [{id, user_id, message, timestamp}...] 
   *
   * Throws NotFoundError if not found.
   **/

  static async getMessages(unique_id) {
    const messages = await db.query(
          `SELECT c.id,
            c.user_id,
            c.message,
            c.timestamp
          FROM chat_messages AS "c"
            LEFT JOIN group_chats AS "gc"
          ON c.group_chat_id = gc.id
          WHERE gc.unique_id = $1
          ORDER BY c.id ASC`,
        [unique_id]);
    if(!messages) throw new NotFoundError(`Cannot find group chat with id: ${unique_id}`)
    return messages.rows;
  }

  /** Post a message to group chat.
   * 
   * Data should be { message, user_id, group_chat_id, timestamp }
   *
   * If no errors occurred
   *  Returns { message: "successs" }
   *   
   * Throws BadRequestError if any issues occurred.
   **/

  static async sendMessage(data) {
    try {
      await db.query(
        `INSERT INTO chat_messages 
            (message,
            user_id,
            group_chat_id,
            timestamp)
         VALUES ($1, $2, $3, $4)`,
      [
        data.message,
        data.user_id,
        data.group_chat_id,
        data.timestamp,
      ]);
      return {message: "success"};
    } catch(e){
      throw new BadRequestError(`Error sending message. Please try again later: ${e}`);
    }
    
  }

  /** inviteGuest
  *
  * data should be { username, user_id, group_chat_id }
  *
  * Returns { username, user_id, group_chat_id }
  *
  * Throws BadRequestError if an error occurred.
  * */

  static async inviteGuest({ username, user_id, group_chat_id }) {
    try {
      const result = await db.query(
        `INSERT INTO guests
         (username, user_id, group_chat_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
      [
        username,
        user_id,
        group_chat_id
      ]);

    return result;
    } catch(e){
      throw new BadRequestError(`Error inviting guest to group chat! Please try again later: ${e}`);
    }
  }

  /** getGuestList
  *
  * data should be group_chat_id
  *
  * Returns [{ username, user_id }...]
  *
  * Throws NotFoundError if no guest list found.
  * */

  static async getGuestList(group_chat_id) {
    const guests = await db.query(
      `SELECT username,
      user_id
      FROM guests
      WHERE group_chat_id = $1`,
    [group_chat_id]);
    if(!guests) throw new NotFoundError(`Cannot find guests with in the group chat id of ${group_chat_id}`)
    return guests.rows;
  }

  /** getCreatorId
  *
  * data should be unique_id
  *
  * Returns { creator_id }
  *
  * Throws NotFoundError if no creator_id found.
  * */

  static async getCreatorId(unique_id) {
    const creator_id = await db.query(
      `SELECT creator_id
      FROM group_chats
      WHERE unique_id = $1`,
    [unique_id]);

    if(!creator_id) throw new NotFoundError(`Cannot find creator of group chat with this id ${unique_id}`);

    return creator_id.rows[0].creator_id;
  }
}


module.exports = GroupChat;
