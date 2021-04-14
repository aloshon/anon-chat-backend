"user strict";

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../tokens");
const {ensureLoggedIn, ensureNotBlocked, ensureAdmin} = require("../auth");
const userNewSchema = require("../schemas/userNew.json");

/** GET [username]:  { username } => { user}
 *
 * With the username in the parameter, get the user
 * from the database using that username.
 *
 * Returns { username, isAdmin }
 * 
 * Authorization required: logged in
 */

router.get("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
      const user = await User.get(req.params.username);
      return res.json({ user });
    } catch (err) {
        return next(err);
    }
});

/** GET [username]/check:  { username } => { username }
 *
 * With the username in the parameter, get the user
 * from the database and return username.
 *
 * Returns { username }
 * 
 * Authorization required: logged in
 */

router.get("/:username/check", ensureLoggedIn, ensureNotBlocked, async function (req, res, next) {
  try {
      const user = await User.check(req.params.username);
      return res.json({ user });
    } catch (err) {
        return next(err);
    }
});

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint, rather this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;