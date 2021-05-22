# anon-chat-backend
Backend for anon-chat-frontend. Feeds the app user and group chat data such as contact list, block list, messages, and guests. The API gets its data from the users, as they are the ones who create the group chats and messages.
WebSockets are used for live chatting in the group chats.
Passwords are stored using bcrypt


After all packages have been installed use the command `npm start` to run the app in development mode and on localhost:3000.
## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
http://localhost:3001 to view it in Insomnia.

### `npm run dev`
Runs the app using nodemon, also in development mode.<br />
The page will reload if you make edits.