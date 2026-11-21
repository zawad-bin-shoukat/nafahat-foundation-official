CREATE SCHEMA IF NOT EXISTS foundation;
REVOKE ALL ON SCHEMA foundation FROM PUBLIC;
CREATE TABLE IF NOT EXISTS foundation.donations (id TEXT PRIMARY KEY NOT NULL, project_id TEXT NOT NULL, amount_minor INTEGER NOT NULL CHECK(amount_minor > 0), method TEXT NOT NULL, receiver TEXT NOT NULL, transaction_id TEXT NOT NULL, sender TEXT NOT NULL, paid_at TEXT NOT NULL, name TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','verified','clarification','rejected')), token_hash TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL, public_note TEXT NOT NULL DEFAULT '', internal_note TEXT NOT NULL DEFAULT '', reviewed_by TEXT, reviewed_at TEXT, UNIQUE(method,receiver,transaction_id));

CREATE INDEX IF NOT EXISTS donations_project_status ON foundation.donations(project_id,status);

CREATE TABLE IF NOT EXISTS foundation.submissions (id TEXT PRIMARY KEY NOT NULL, kind TEXT NOT NULL, name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', area TEXT NOT NULL DEFAULT '', interest TEXT NOT NULL DEFAULT '', message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'submitted', created_at TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS foundation.content (id TEXT PRIMARY KEY NOT NULL, kind TEXT NOT NULL, payload TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS foundation.audit (id TEXT PRIMARY KEY NOT NULL, actor TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL, details TEXT NOT NULL, created_at TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS foundation.rate_events (id TEXT PRIMARY KEY NOT NULL, client_hash TEXT NOT NULL, created_at TEXT NOT NULL);

CREATE INDEX IF NOT EXISTS rate_events_client_time ON foundation.rate_events(client_hash,created_at);

CREATE TABLE IF NOT EXISTS foundation.profiles (user_id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL DEFAULT '', name TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS foundation.user_roles (user_id TEXT PRIMARY KEY NOT NULL REFERENCES foundation.profiles(user_id), role TEXT NOT NULL CHECK(role IN ('user','editor','finance','admin')), updated_at TEXT NOT NULL, updated_by TEXT NOT NULL);

ALTER TABLE foundation.donations ADD COLUMN IF NOT EXISTS owner_user_id TEXT;

CREATE INDEX IF NOT EXISTS donations_owner_created ON foundation.donations(owner_user_id,created_at);

ALTER TABLE foundation.submissions ADD COLUMN IF NOT EXISTS owner_user_id TEXT;

CREATE INDEX IF NOT EXISTS submissions_owner_created ON foundation.submissions(owner_user_id,created_at);

ALTER TABLE foundation.donations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON foundation.donations FROM PUBLIC;
ALTER TABLE foundation.submissions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON foundation.submissions FROM PUBLIC;
ALTER TABLE foundation.content ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON foundation.content FROM PUBLIC;
ALTER TABLE foundation.audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON foundation.audit FROM PUBLIC;
ALTER TABLE foundation.rate_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON foundation.rate_events FROM PUBLIC;
ALTER TABLE foundation.profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON foundation.profiles FROM PUBLIC;
ALTER TABLE foundation.user_roles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON foundation.user_roles FROM PUBLIC;
CREATE TABLE IF NOT EXISTS foundation.schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS foundation.migration_runs (checksum TEXT PRIMARY KEY, imported_at TIMESTAMPTZ NOT NULL DEFAULT now(), counts TEXT NOT NULL, verified_total_minor BIGINT NOT NULL);
ALTER TABLE foundation.schema_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE foundation.migration_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA foundation FROM PUBLIC;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN EXECUTE 'REVOKE ALL ON SCHEMA foundation FROM anon'; EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA foundation FROM anon'; END IF;
 IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN EXECUTE 'REVOKE ALL ON SCHEMA foundation FROM authenticated'; EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA foundation FROM authenticated'; END IF;
END $$;
INSERT INTO foundation.schema_migrations(version) VALUES ('001_foundation') ON CONFLICT DO NOTHING;
