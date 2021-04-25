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

const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);


app.use("/message", messageRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/chat", groupChatRoutes);
app.use("/guests", guestsRoutes);
app.use("/block", blockRoutes);


/** Handle websocket chat */

// allow for app.ws routes for websocket routes
// easy to make websocket routes in express
const expressWs = require('express-ws')(app);

/** Handle a persistent connection to /chat/[roomId]
 *
 * Note that this is only called *once* per client --- not every time
 * a particular websocket chat is sent.
 *
 * `ws` becomes the socket for the client; it is specific to that visitor.
 * The `ws.send` method is how we'll send messages back to that socket.
 */

app.ws('/chat/:roomId', async function(ws, req, next) {
  try {
    
    // register handlers for message-received, connection-opened, connection-closed
    ws.on('open', function() {
      try {
        
        // this is where we would try to seed 
        // the groupchat with older messages
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
        console.log(`MESSAGE FROM THE CLIENT FRONTEND CLIENT.JS ${data}`)
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