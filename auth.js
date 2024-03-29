"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("./config");
const { UnauthorizedError, ForbiddenError, NotFoundError } = require("./expressError");
const GroupChat = require("./models/groupChat");
const User = require("./models/user");


/** Middleware: Authenticate user.
 *
 * Check if user is logged in
 * If a token was provided, verify it, and if valid store the payload
 * on res.locals (this will include the username and user_id.)
 * 
 * Not an error if no token was provided or if the token is not valid, just log it
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
 
    if (authHeader) {
      console.log(req.headers.authorization);
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      console.log(token);
      token !== undefined && (res.locals.user = jwt.verify(token, SECRET_KEY));
      console.log(res.locals.user);
    }
    return next();
  } catch (err) {
    console.log(err)
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    console.log(res.locals.user);
    if (!res.locals.user) throw new UnauthorizedError();

    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must provide a valid token, and username must be
 * on the guest list using the unique_id provided as a route param.
 *
 *  If not, raises Unauthorized.
 */

async function ensureOnGuestList(req, res, next) {
  try {
    const groupChat = await GroupChat.getGroupChat(req.params.id);
    const isInvited = groupChat.guests.find(g => g.username === res.locals.user.username);
  
    if(!isInvited){
      throw new ForbiddenError("Not invited in this group chat!")
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must provide a valid token and user_id must
 * be equal to the creator_id of the group chat
 *
 *  If not, raises Forbidden.
 */

async function ensureCreatorOfGroupChat(req, res, next) {
  try {
    const creatorId = await GroupChat.getCreatorId(req.params.id);
    
    if(creatorId !== res.locals.user.user_id){
      throw new ForbiddenError("Not the creator of this group chat!")
    }

    return next();
  } catch (err) {
    return next(err);
  }

}

/** Middleware to use when they must provide a valid token & user must not
 *  be blocked by other user provided by req.body or req.params.
 *
 *  If the 2 usernames are on the list, raises NotFoundError.
 */

async function ensureNotBlocked(req, res, next) {
  try {
    const user = res.locals.user;
    const username = req.params.username || req.body.username;
    const blocked = await User.checkBlockList(user.username, username);

    if (blocked) {
      throw new NotFoundError("Username not found");
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureOnGuestList,
  ensureCreatorOfGroupChat,
  ensureNotBlocked
};
