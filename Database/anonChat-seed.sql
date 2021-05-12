INSERT INTO users(username, password, is_admin)
VALUES ('testuser1', 'testpassword', TRUE),
    ('testuser2', 'testpassword2', FALSE),
    ('aloshon', '$2b$12$fCYw0dz8QBR2dgEYNHzr/u288FzE8l0Hhw3QmpunetucHYQ7.LrE6', TRUE);

INSERT INTO group_chats(title, description, timestamp, creator_id)
VALUES ('test1', 'testing description', '2021-04-08T19:03:24.317Z', 1),
    ('test2', 'This is also a test description', '2021-04-08T19:04:04.317Z', 2),
    ('Fun Chat', 'HELL YEAHHH!!!', '2021-04-09T14:02:24.317Z', 1);

INSERT INTO guests(username, user_id, group_chat_id)
VALUES('testuser1', 1, 1),
    ('testuser2', 2, 1),
    ('testuser1', 1, 2),
    ('testuser2', 2, 2);

INSERT INTO chat_messages(message, user_id, group_chat_id, timestamp)
VALUES('this is chat 1', 1, 1, '2021-04-08T21:03:24.317Z'),
    ('this is chat 2!!!!!!!', 2, 2, '2021-04-09T20:03:24.317Z'),
    ('this is chat 3!!!!!!!!!!!!!', 1, 3, '2021-04-09T20:43:24.317Z');

INSERT INTO block_list(blocked_username, username)
VALUES('aloshon', 'testuser2');