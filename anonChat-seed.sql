INSERT INTO users(username, password)
VALUES ('testuser1', 'testpassword'),
    ('testuser2', 'testpassword2'),
    ('aloshon', 'jki2.0');

INSERT INTO group_chats(title, description, timestamp, creator_id)
VALUES ('test1', 'testing description', 'Thu, 18 Mar 2021 13:41:33 GMT', 1),
    ('test2', 'This is also a test description', 'Fri, 19 Mar 2021 17:49:15 GMT', 2),
    ('Fun Chat', 'HELL YEAHHH!!!', 'Sun, 21 Mar 2021 19:19:52 GMT', 3);

INSERT INTO guests(username, user_id, group_chat_id)
VALUES('testuser1', 1, 1),
    ('testuser2', 2, 1),
    ('aloshon', 3, 1),
    ('testuser1', 1, 2),
    ('testuser2', 2, 2),
    ('aloshon', 3, 2),
    ('aloshon', 3, 3);

INSERT INTO chat_messages(message, user_id, group_chat_id, timestamp)
VALUES('this is chat 1', 1, 1, '2021-03-12 11:02:53.522807'),
    ('this is chat 2!!!!!!!', 2, 2, '2021-03-14 11:02:53.522807'),
    ('this is chat 3!!!!!!!!!!!!!', 3, 3, '2021-03-20 5:38:38.782807');