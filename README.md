# anon-chat-backend
Backend for anon-chat-frontend. Feeds the app user and group chat data such as contact list, block list, messages, and guests. The API gets its data from the users, as they are the ones who create the group chats and messages.
Technologies Used:
    - WebSockets with Express we can have multiple web socket connections based on a path like a url.
    - Bcrypt for storing passwords securly
    - Express with Node for fleible error handling and easy interaction with frontend since both use Javascript
    - Postgres (pg) for storing data like user info, group chats, messages, etc. in a database

After all packages have been installed use the command `npm start` to run the app in development mode and on localhost:3001.
## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
http://localhost:3001 to view it in Insomnia.

### `npm test`

Searches for all .test files and runs them

### `npm run dev`
Runs the app using nodemon, also in development mode.<br />
The page will reload if you make edits.