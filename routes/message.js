"use strict";

/** Routes for messages. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ForbiddenError } = require("../expressError");
const { ensureLoggedIn, ensureOnGuestList } = require("../auth");
const GroupChat = require("../models/groupChat");

const addMessageSchema = require("../schemas/message.json");

const router = new express.Router();


/** GET /[id]
 *
 * Gets messages from Group Chat.
 *  getMessages will take in the unique_id
 * Returns { [messages] }
 * 
 * Authorization: logged in, on guest list
 *
 */

router.get("/:id", ensureLoggedIn, ensureOnGuestList, async function (req, res, next) {
  try {
    
    const messages = await GroupChat.getMessages(req.params.id);
    return res.json({ messages });
  } catch (err) {
    return next(err);
  }
});

/** POST /[id] 
 *
 * Sends chat message to database for future members to see.
 *
 * fields must be: { unique_id, message, user_id, group_chat_id, timestamp }
 * Gets unique_id from params, gets group chat from database, 
 * checks guest list to find the logged in user's username.
 * If not in guest list throw error.
 *
 * Returns status code 201 and {message: "success"}
 * 
 * Authorization: logged in, on guest list
 *
 */

router.post("/:id", ensureLoggedIn, ensureOnGuestList, async function (req, res, next) {
  try {

    const validator = jsonschema.validate(req.body, addMessageSchema)

    if(!validator.valid){
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const message = await GroupChat.sendMessage(req.body);
    return res.status(201).json({ message });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
