CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE group_chats (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    timestamp TEXT NOT NULL
);

CREATE TABLE guests (
    username TEXT NOT NULL,
    user_id INTEGER
      REFERENCES users ON DELETE CASCADE,
    group_chat_id INTEGER
      REFERENCES group_chats ON DELETE CASCADE,
    PRIMARY KEY (user_id, group_chat_id)
);

CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    message TEXT,
    user_id INTEGER
      REFERENCES users ON DELETE CASCADE,
    group_chat_id INTEGER
      REFERENCES group_chats ON DELETE CASCADE,
    timestamp TEXT NOT NULL
);