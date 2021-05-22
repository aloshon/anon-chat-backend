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
    description TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    creator_id INTEGER
      REFERENCES users ON DELETE CASCADE
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

CREATE TABLE block_list (
    id SERIAL PRIMARY KEY,
    blocked_username TEXT,
    username TEXT
);

CREATE TABLE contact_list (
    id SERIAL PRIMARY KEY,
    username TEXT,
    nickname TEXT,
    owner_id INTEGER
      REFERENCES users ON DELETE CASCADE,
    user_id INTEGER
      REFERENCES users ON DELETE CASCADE
);