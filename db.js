"use strict";

/** Database setup for jobly. */

const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

const db = new Client(getDatabaseUri());

db.connect();

module.exports = db;