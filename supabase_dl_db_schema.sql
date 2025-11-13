-- ================================================================
-- SUPABASE FULL DATABASE SNAPSHOT (PostgreSQL 17+)
-- Includes: schemas, tables, columns, relationships, constraints,
-- rls, triggers, functions, views, materialized views, indexes,
-- sequences, extensions, enums, privileges, storage, auth users.
-- ================================================================

WITH
schemas AS (
  SELECT n.nspname AS schema_name,
         pg_get_userbyid(n.nspowner) AS owner
  FROM pg_namespace n
  WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname <> 'information_schema'
),

tables AS (
  SELECT n.nspname AS schema_name,
         c.relname  AS table_name,
         obj_description(c.oid) AS table_description,
         pg_size_pretty(pg_total_relation_size(c.oid)) AS table_size,
         c.relkind AS kind,
         c.relrowsecurity AS row_security_enabled,
         c.relforcerowsecurity AS row_security_forced
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname <> 'information_schema'
),

columns AS (
  SELECT table_schema, table_name, column_name, data_type,
         is_nullable, column_default, character_maximum_length
  FROM information_schema.columns
  WHERE table_schema NOT LIKE 'pg_%' AND table_schema <> 'information_schema'
),

relationships AS (
  SELECT tc.table_schema, tc.table_name, kcu.column_name,
         ccu.table_schema AS foreign_table_schema,
         ccu.table_name   AS foreign_table_name,
         ccu.column_name  AS foreign_column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage ccu
       ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
),

constraints AS (
  SELECT
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    json_agg(kcu.column_name) AS columns
  FROM information_schema.table_constraints tc
  LEFT JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_schema NOT LIKE 'pg_%' AND tc.table_schema <> 'information_schema'
  GROUP BY tc.table_schema, tc.table_name, tc.constraint_name, tc.constraint_type
),

rls AS (
  SELECT
    pol.schemaname AS schema_name,
    pol.tablename  AS table_name,
    pol.policyname AS policy_name,
    pol.cmd        AS command,
    pol.roles      AS roles,
    pol.qual       AS using_expression_raw,
    pol.with_check AS check_expression_raw,
    pol.permissive AS is_permissive
  FROM pg_policies pol
),

triggers AS (
  SELECT event_object_schema AS schema_name,
         event_object_table  AS table_name,
         trigger_name,
         action_timing,
         event_manipulation,
         action_statement
  FROM information_schema.triggers
),

functions AS (
  SELECT n.nspname AS schema_name,
         p.proname AS function_name,
         pg_get_functiondef(p.oid) AS definition,
         l.lanname AS language,
         p.prokind AS type
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_language l  ON l.oid = p.prolang
  WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname <> 'information_schema'
),

views AS (
  SELECT table_schema, table_name, view_definition
  FROM information_schema.views
  WHERE table_schema NOT LIKE 'pg_%' AND table_schema <> 'information_schema'
),

materialized_views AS (
  SELECT schemaname, matviewname, definition
  FROM pg_matviews
),

indexes AS (
  SELECT
    n.nspname AS schema_name,
    t.relname AS table_name,
    i.relname AS index_name,
    am.amname AS index_type,
    pg_size_pretty(pg_relation_size(i.oid)) AS index_size,
    idx.indisunique AS is_unique,
    idx.indisprimary AS is_primary,
    array_to_string(array_agg(a.attname ORDER BY a.attnum), ', ') AS indexed_columns
  FROM pg_index idx
  JOIN pg_class i  ON i.oid = idx.indexrelid
  JOIN pg_class t  ON t.oid = idx.indrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  JOIN pg_am am ON i.relam = am.oid
  LEFT JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(idx.indkey)
  WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname <> 'information_schema'
  GROUP BY n.nspname, t.relname, i.relname, am.amname,
           idx.indisunique, idx.indisprimary, i.oid
),

sequences AS (
  SELECT sequence_schema, sequence_name, data_type, start_value, minimum_value, maximum_value
  FROM information_schema.sequences
),

extensions AS (
  SELECT extname, extversion, extnamespace::regnamespace::text AS schema_name
  FROM pg_extension
),

enums AS (
  SELECT
    n.nspname AS schema_name,
    t.typname AS enum_name,
    json_agg(e.enumlabel ORDER BY e.enumsortorder) AS values
  FROM pg_type t
  JOIN pg_enum e ON t.oid = e.enumtypid
  JOIN pg_namespace n ON n.oid = t.typnamespace
  GROUP BY n.nspname, t.typname
),

privileges AS (
  SELECT table_schema, table_name, grantee, privilege_type
  FROM information_schema.table_privileges
),

column_privileges AS (
  SELECT table_schema, table_name, column_name, grantee, privilege_type
  FROM information_schema.column_privileges
),

storage_buckets AS (
  SELECT * FROM storage.buckets
),

storage_objects AS (
  SELECT * FROM storage.objects
  LIMIT 500
),

auth_roles AS (
  SELECT id, email, role,
         raw_app_meta_data, raw_user_meta_data,
         created_at, last_sign_in_at
  FROM auth.users
)

SELECT json_build_object(
  'schemas',             (SELECT json_agg(schemas)             FROM schemas),
  'tables',              (SELECT json_agg(tables)              FROM tables),
  'columns',             (SELECT json_agg(columns)             FROM columns),
  'relationships',       (SELECT json_agg(relationships)       FROM relationships),
  'constraints',         (SELECT json_agg(constraints)         FROM constraints),
  'rls',                 (SELECT json_agg(rls)                 FROM rls),
  'triggers',            (SELECT json_agg(triggers)            FROM triggers),
  'functions',           (SELECT json_agg(functions)           FROM functions),
  'views',               (SELECT json_agg(views)               FROM views),
  'materialized_views',  (SELECT json_agg(materialized_views)  FROM materialized_views),
  'indexes',             (SELECT json_agg(indexes)             FROM indexes),
  'sequences',           (SELECT json_agg(sequences)           FROM sequences),
  'extensions',          (SELECT json_agg(extensions)          FROM extensions),
  'enums',               (SELECT json_agg(enums)               FROM enums),
  'table_privileges',    (SELECT json_agg(privileges)          FROM privileges),
  'column_privileges',   (SELECT json_agg(column_privileges)   FROM column_privileges),
  'storage_buckets',     (SELECT json_agg(storage_buckets)     FROM storage_buckets),
  'storage_objects',     (SELECT json_agg(storage_objects)     FROM storage_objects),
  'auth_users',          (SELECT json_agg(auth_roles)          FROM auth_roles)
) AS full_supabase_snapshot;
