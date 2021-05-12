"use strict";

/** Routes for messages. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureCreatorOfGroupChat, ensureNotBlocked } = require("../auth");
const GroupChat = require("../models/groupChat");

const addGuestSchema = require("../schemas/guest.json");

const router = new express.Router();

/** POST /[id]
 *
 * fields must be: { unique_id, username, user_id, group_chat_id, }
 * Add a guest to groupchat using guest's user_id to the group chat's guest list.
 * User can add other users from their contact list
 * The username is also added for convenience
 * 
 * Returns {username, user_id, group_chat_id}.
 * Authorization: loggedin, creator of group chat, not blocked by other user
 *
 */

router.post("/:id", ensureLoggedIn, ensureCreatorOfGroupChat, ensureNotBlocked, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, addGuestSchema);
      
      if(!validator.valid){
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs)
      }
      const checkListLength = await GroupChat.checkListLength(req.body.group_chat_id);
      
      if(checkListLength >= 10) throw new BadRequestError("Guest list cannot exceed 10 users");

      const result = await GroupChat.inviteGuest(req.body);

      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  });
  
module.exports = router;
