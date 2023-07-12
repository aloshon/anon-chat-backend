"use strict";

/** Express app for anonChat. */

const express = require("express");
const cors = require("cors");
const http = require("http");
const {Server}= require("socket.io");

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./auth");

const messageRoutes = require("./routes/message");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const groupChatRoutes = require("./routes/groupChat");
const guestsRoutes = require("./routes/guests");
const blockRoutes = require("./routes/blockList");
const contactRoutes = require("./routes/contactList");

const morgan = require("morgan");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});
app.use(express.json());
// app.options('*', cors({
//   methods: "GET,POST,DELETE",
// }));
app.use(cors({
  methods: ['GET','POST','DELETE'],
  origin: "*",
  "Access-Control-Allow-Credentials": true,
}));
//Cors Configuration - Start 

// app.use(function (req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
//   res.setHeader('Access-Control-Allow-Credentials', true);
//   next();
// });
//Cors Configuration - End
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
// });

app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/message", messageRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/chat", groupChatRoutes);
app.use("/guests", guestsRoutes);
app.use("/block", blockRoutes);
app.use("/contact", contactRoutes);

// app.get('/', function (req, res) {
//   return res.status(200).json("OK");
// });

/** Handle websocket chat */

io.on("connection", room => {
  try {
    room.on("open", (msg) => {
      console.log("socket is open")
    });
    room.on("joinroom", (data) => {
      console.log(data);
      room.join(data.roomId);
    })

    room.on("message", (msg, id) => {
      console.log(msg)
      io.to(id).emit("message", msg);
    });

    room.on("close", (msg) => {
      try {
        console.log("CLOSED FROM THE SERVER BACKEND APP.JS")
      } catch (err) {
        console.error(err);
      }
      });
  } catch (err) {
    console.error(err);
  }
});


/** Handles all 404 errors  */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});


module.exports = {app, server};