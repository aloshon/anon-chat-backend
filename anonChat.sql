\echo 'Delete and recreate anon_chat db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE anon_chat;
CREATE DATABASE anon_chat;
\connect anon_chat; 

\i anonChat-schema.sql
\i anonChat-seed.sql