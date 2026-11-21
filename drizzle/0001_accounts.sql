CREATE TABLE profiles (user_id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL DEFAULT '', name TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE user_roles (user_id TEXT PRIMARY KEY NOT NULL REFERENCES profiles(user_id), role TEXT NOT NULL CHECK(role IN ('user','editor','finance','admin')), updated_at TEXT NOT NULL, updated_by TEXT NOT NULL);
--> statement-breakpoint
ALTER TABLE donations ADD COLUMN owner_user_id TEXT;
--> statement-breakpoint
CREATE INDEX donations_owner_created ON donations(owner_user_id,created_at);
--> statement-breakpoint
ALTER TABLE submissions ADD COLUMN owner_user_id TEXT;
--> statement-breakpoint
CREATE INDEX submissions_owner_created ON submissions(owner_user_id,created_at);
