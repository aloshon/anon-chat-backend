CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE group_chats (
    id SERIAL PRIMARY KEY,
    unique_id uuid UNIQUE DEFAULT UUID_GENERATE_V4(),
    title TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    creator_id INTEGER
      REFERENCES users
);

CREATE TABLE guests (
    username TEXT NOT NULL,
    user_id INTEGER
      REFERENCES users,
    group_chat_id INTEGER
      REFERENCES group_chats ON DELETE CASCADE,
    PRIMARY KEY (user_id, group_chat_id)
);

CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    message TEXT,
    user_id INTEGER
      REFERENCES users,
    group_chat_id INTEGER
      REFERENCES group_chats ON DELETE CASCADE,
    timestamp TEXT NOT NULL
);