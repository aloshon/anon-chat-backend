\echo 'Delete and recreate anon_chat db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS anon_chat;
CREATE DATABASE anon_chat;
\connect anon_chat

\i anonChat-schema.sql
-- \i anonChat-seed.sql

\echo 'Delete and recreate anon_chat_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS anon_chat_test;
CREATE DATABASE anon_chat_test;
\connect anon_chat_test

\i anonChat-schema.sql