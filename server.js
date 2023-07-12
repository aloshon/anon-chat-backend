"use strict";

const {server} = require("./app");
const { PORT } = require("./config");

server.listen(PORT, function () {
  console.log(`Started on http://localhost:${PORT}`);
});
