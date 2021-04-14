INSERT INTO users(username, password, is_admin)
VALUES ('testuser1', 'testpassword', TRUE),
    ('testuser2', 'testpassword2', FALSE),
    ('aloshon', '$2b$12$fCYw0dz8QBR2dgEYNHzr/u288FzE8l0Hhw3QmpunetucHYQ7.LrE6', TRUE);

INSERT INTO group_chats(title, description, timestamp, creator_id)
VALUES ('test1', 'testing description', 'Thu, 18 Mar 2021 13:41:33 GMT', 1),
    ('test2', 'This is also a test description', 'Fri, 19 Mar 2021 17:49:15 GMT', 2),
    ('Fun Chat', 'HELL YEAHHH!!!', 'Sun, 21 Mar 2021 19:19:52 GMT', 1);

INSERT INTO guests(username, user_id, group_chat_id)
VALUES('testuser1', 1, 1),
    ('testuser2', 2, 1),
    ('testuser1', 1, 2),
    ('testuser2', 2, 2);

INSERT INTO chat_messages(message, user_id, group_chat_id, timestamp)
VALUES('this is chat 1', 1, 1, '2021-03-12 11:02:53.522807'),
    ('this is chat 2!!!!!!!', 2, 2, '2021-03-14 11:02:53.522807'),
    ('this is chat 3!!!!!!!!!!!!!', 1, 3, '2021-03-20 5:38:38.782807');

INSERT INTO block_list(blocked_username, username)
VALUES('aloshon', 'testuser2');