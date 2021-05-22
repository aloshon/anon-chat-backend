"user strict";

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const {ensureLoggedIn, ensureNotBlocked} = require("../auth");

/** GET [username]:  { username } => { user }
 *
 * With the username in the parameter, get the user
 * from the database using that username.
 *
 * Returns { username }
 * 
 * Authorization required: logged in, not blocked
 */

router.get("/:username", ensureLoggedIn, ensureNotBlocked, async function (req, res, next) {
  try {
      const user = await User.get(req.params.username);
      return res.json({ user });
    } catch (err) {
        return next(err);
    }
});

/** GET [username]/check:  { username } => { user }
 *
 * With the username in the parameter, get the user
 * from the database and return username.
 *
 * Returns { id, username }
 * 
 * Authorization required: logged in, not blocked
 */

router.get("/:username/check", ensureLoggedIn, ensureNotBlocked, async function (req, res, next) {
  try {
      const user = await User.check(req.params.username);
      return res.json({ user });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /  => { deleted: username }
 *
 * Deletes User
 *
 * Authorization required: logged in
 **/

router.delete("/", ensureLoggedIn, async function (req, res, next) {
  try {
    await User.remove(res.locals.user.username);
    return res.json({ deleted: res.locals.user.username });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;