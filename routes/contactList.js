"user strict";

const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const {ensureLoggedIn, ensureNotBlocked} = require("../auth");
const jsonschema = require("jsonschema");
const addContactSchema = require("../schemas/contact.json");
const { BadRequestError } = require("../expressError");

/** POST 
 *
 * Add user to contact list using data from req.body
 * body should look like: { username, nickname, owner_id, user_id }
 *
 * Returns { addedContact }
 * 
 * Authorization required: logged in
 */

router.post("/", ensureLoggedIn, ensureNotBlocked, async function (req, res, next) {
  try {
        const validator = jsonschema.validate(req.body, addContactSchema);
        
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const addedContact = await User.addContact(req.body);

        return res.json({ addedContact });
    } catch (err) {
        return next(err);
    }
});


/** DELETE [contact_id]
 *
 * Remove user from contact list using data from req.params
 * params should look like: { contact_id }
 *
 * Returns { deletedContact }
 * 
 * Authorization required: logged in
 */

router.delete("/:contact_id", ensureLoggedIn, async function (req, res, next) {
    try {
        const deletedContact = await User.deleteContact(res.locals.user.user_id, req.params.contact_id);
        
        return res.json({ deletedContact });
      } catch (err) {
            return next(err);
      }
  });
  


module.exports = router;