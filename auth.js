"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("./config");
const { UnauthorizedError, ForbiddenError, NotFoundError } = require("./expressError");
const GroupChat = require("./models/groupChat");
const User = require("./models/user");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 * 
 * authHeader is declared as the following: is req.headers is not definded or falsy,
 * then authHeader is not defined or falsy. However if there is a req.headers,
 * then it will be req.headers.authorization. Which is s string `Bearer ${token}`
 *
 * Not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }

    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    console.log(req.params.user_id)
    return next();
  } catch (err) {
    return next(err);
  }
}


/** Middleware to use when they be logged in as an admin user.
 *
 *  If not, raises Unauthorized.
 */

function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user || !res.locals.user.isAdmin) {
      throw new UnauthorizedError();
    }
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
 *  be blocked by other user provided by req.body.
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
  ensureAdmin,
  ensureOnGuestList,
  ensureCreatorOfGroupChat,
  ensureNotBlocked
};
