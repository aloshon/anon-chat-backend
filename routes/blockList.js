"user strict";

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const {ensureLoggedIn} = require("../auth");

/** POST [id] 
 *
 * Add user to block list using data from params and locals.user
 * params is the username of the user to be blocked
 *
 * Returns { blockedUser }
 * 
 * Authorization required: logged in
 */

router.post("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
        const blocked = await User.blockUser(req.params.username, res.locals.user.username);

        return res.json({ blocked });
    } catch (err) {
        return next(err);
    }
});


/** DELETE [id]
 *
 * Remove user from block list using data from req.params and res.locals.user.
 * Username is provided in params as the person being unblocked
 * res.locals.user is the current user
 *
 * Returns { unblockedUser }
 * 
 * Authorization required: logged in
 */

router.delete("/:username", ensureLoggedIn, async function (req, res, next) {
    try {
        const unblocked = await User.unblockUser(req.params.username, res.locals.user.username);
        
        return res.json({ unblocked });
      } catch (err) {
            return next(err);
      }
  });
  


module.exports = router;