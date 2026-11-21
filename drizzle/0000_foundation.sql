CREATE TABLE donations (id TEXT PRIMARY KEY NOT NULL, project_id TEXT NOT NULL, amount_minor INTEGER NOT NULL CHECK(amount_minor > 0), method TEXT NOT NULL, receiver TEXT NOT NULL, transaction_id TEXT NOT NULL, sender TEXT NOT NULL, paid_at TEXT NOT NULL, name TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','verified','clarification','rejected')), token_hash TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL, public_note TEXT NOT NULL DEFAULT '', internal_note TEXT NOT NULL DEFAULT '', reviewed_by TEXT, reviewed_at TEXT, UNIQUE(method,receiver,transaction_id));
--> statement-breakpoint
CREATE INDEX donations_project_status ON donations(project_id,status);
--> statement-breakpoint
CREATE TABLE submissions (id TEXT PRIMARY KEY NOT NULL, kind TEXT NOT NULL, name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', area TEXT NOT NULL DEFAULT '', interest TEXT NOT NULL DEFAULT '', message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'submitted', created_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE content (id TEXT PRIMARY KEY NOT NULL, kind TEXT NOT NULL, payload TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE audit (id TEXT PRIMARY KEY NOT NULL, actor TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL, details TEXT NOT NULL, created_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE rate_events (id TEXT PRIMARY KEY NOT NULL, client_hash TEXT NOT NULL, created_at TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX rate_events_client_time ON rate_events(client_hash,created_at);
