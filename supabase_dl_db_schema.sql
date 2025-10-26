-- ✅ FINAL: Supabase Full Database Snapshot (PostgreSQL 17+ Safe)
-- Covers schemas, tables, columns, relationships, RLS, triggers,
-- functions, views, indexes, and auth users
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
  WHERE constraint_type = 'FOREIGN KEY'
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
  LEFT JOIN pg_attribute a
    ON a.attrelid = t.oid AND a.attnum = ANY(idx.indkey)
  WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname <> 'information_schema'
  GROUP BY n.nspname, t.relname, i.relname, am.amname,
           idx.indisunique, idx.indisprimary, i.oid
),
auth_roles AS (
  SELECT id, email, role,
         raw_app_meta_data, raw_user_meta_data,
         created_at, last_sign_in_at
  FROM auth.users
)
SELECT json_build_object(
  'schemas',       (SELECT json_agg(schemas)       FROM schemas),
  'tables',        (SELECT json_agg(tables)        FROM tables),
  'columns',       (SELECT json_agg(columns)       FROM columns),
  'relationships', (SELECT json_agg(relationships) FROM relationships),
  'rls',           (SELECT json_agg(rls)           FROM rls),
  'triggers',      (SELECT json_agg(triggers)      FROM triggers),
  'functions',     (SELECT json_agg(functions)     FROM functions),
  'views',         (SELECT json_agg(views)         FROM views),
  'indexes',       (SELECT json_agg(indexes)       FROM indexes),
  'auth_users',    (SELECT json_agg(auth_roles)    FROM auth_roles)
) AS full_database_snapshot;
