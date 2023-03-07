"use strict";

/** Express app for anonChat. */

const express = require("express");
const cors = require("cors");

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

// app.options('*', cors({
//   methods: "GET,POST,DELETE",
// }));
app.use(cors({
  methods: ['GET','POST','DELETE'],
  origin: "*"
}));
//Cors Configuration - Start
app.use(express.json());
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

// allow for app.ws routes for websocket routes
// easy to make websocket routes in express
const expressWs = require('express-ws')(app);

/** Handle a persistent connection to /chat/[roomId]
 *
 * Only called once per client, not every time
 * a particular websocket chat is sent.
 */

app.ws('/chat/:roomId', async function(ws, req, next) {
  try {
    
    // register handlers for message-received, connection-opened, connection-closed
    ws.on('open', function() {
      try {

        console.log("OPENED FROM THE SERVER BACKEND APP.JS");

      } catch (err) {
        console.error(err);
      }
    });

    ws.on('message', function(data) {
      try {
        // Gather all clients that are on this specific web socket
        expressWs.getWss().clients.forEach(client => {
          if(client.readyState === 1){
            client.send(data)
          }
        })
        console.log("MESSAGE SENT")
      } catch (err) {
        console.error(err);
      }
    });

    ws.on('close', function() {
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


module.exports = app;