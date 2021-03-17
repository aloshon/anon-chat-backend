INSERT INTO users(id, username, password)
VALUES (1, 'testuser1', 'testpassword'),
    (2, 'testuser2', 'testpassword2');

INSERT INTO group_chats(id, title, timestamp)
VALUES (1, 'test1', '2021-03-11 11:04:53.522807'),
    (2, 'test2', '2021-03-14 11:04:53.522807');

INSERT INTO guests(username, user_id, group_chat_id)
VALUES('testuser', 1, 1);

INSERT INTO chat_messages(id, message, user_id, group_chat_id, timestamp)
VALUES(1, 'this is chat 1', 1, 1, '2021-03-12 11:02:53.522807'),
    (2, 'this is chat 2!!!!!!!', 2, 2, '2021-03-14 11:02:53.522807');