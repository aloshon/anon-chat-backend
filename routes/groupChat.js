"use strict";

/** Routes for group chats. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureOnGuestList } = require("../auth");
const GroupChat = require("../models/groupChat");

const newGroupChatSchema = require("../schemas/groupChat.json");

const router = new express.Router();


/** GET
 *
 * Gets group chats that the user is invited to.
 *
 * Returns { [groupChats] }
 * 
 * Authorization required: logged in
 *
 */

router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    // getInvitedGroupChats will take in user_id from res.locals
    // Returns group chats that the user is invited in
    
    const groupChats = await GroupChat.getInvitedGroupChats(req.query.user_id);
    return res.status(200).json({ groupChats });
  } catch (err) {
    return next(err);
  }
});

/** POST
 *
 * Posts group chat to database.
 * 
 * Returns status 201 and message: "success"
 * 
 * Authorization required: logged in
 *
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, newGroupChatSchema)

    if(!validator.valid){
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const result = await GroupChat.createGroupChat(req.body);
  
    return res.status(201).json({groupChat: result});
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]
 *
 * Gets specific group chat details using unique_id from params.
 *
 * Returns { groupChat }
 * 
 * Authorization required: logged in, on guest list
 *
 */

router.get("/:id", ensureLoggedIn, ensureOnGuestList, async function (req, res, next) {
  try {

    const groupChat = await GroupChat.getGroupChat(req.params.id);
    return res.status(200).json({ groupChat });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;