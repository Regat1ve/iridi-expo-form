-- Idempotent: safe to re-run on an existing database.
CREATE SCHEMA IF NOT EXISTS expo;

CREATE TABLE IF NOT EXISTS expo.leads (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  filled_at timestamptz NOT NULL,
  name text NOT NULL,
  company text NOT NULL DEFAULT '',
  roles text[] NOT NULL DEFAULT '{}',
  role_other text NOT NULL DEFAULT '',
  interests text[] NOT NULL DEFAULT '{}',
  directions text[] NOT NULL DEFAULT '{}',
  intents text[] NOT NULL DEFAULT '{}',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  followup text NOT NULL DEFAULT ''
);

ALTER TABLE expo.leads ADD COLUMN IF NOT EXISTS lang text NOT NULL DEFAULT 'ru';
