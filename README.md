# Nafahat Foundation

Bilingual foundation website using Next.js App Router, React, TypeScript, Supabase Auth, and Supabase PostgreSQL. Prepared for Vercel; the current ChatGPT Sites deployment remains a separate, unchanged installation.

## Local development

Use Node.js 22.13 or newer (Node 24 LTS recommended).

```sh
npm ci
cp .env.example .env.local
# Fill environment values privately in .env.local.
npm run dev
```

Open http://localhost:4173. Without DATABASE_URL, public introductory pages still render, but database-backed submissions and health checks correctly report unavailable. There is no fallback local database in production. Do not commit .env.local or data exports.

## Database setup

Open the supplied Supabase project → SQL Editor and run [001_foundation.sql](supabase/migrations/001_foundation.sql). Alternatively, after configuring .env.local, run `npm run db:migrate`.

The migration creates a dedicated `foundation` schema and preserves the IDs, integer-paisa amounts, text JSON payloads, statuses, token hashes, timestamps and ownership formats used by the old database. It does not change Supabase Auth or delete existing records. Row Level Security is enabled, with no direct browser policies; PUBLIC, anon and authenticated have no access to the application tables. Keep this schema out of Supabase's exposed schemas. The Data API can remain disabled.

The Next.js backend connects using server-only DATABASE_URL. Get the URI from Supabase → Connect → Transaction pooler. Replace the database-password placeholder privately; percent-encode special characters in the password. Never use NEXT_PUBLIC_DATABASE_URL. The connection uses SSL, one connection per warm function, disabled prepared statements, and serialized operations to avoid transaction-pooler pipelining. Credentials belong in .env.local and Vercel's environment settings, never GitHub or chat.

## Vercel setup

1. Import this repository into the selected Vercel team. Framework: Next.js; root directory: repository root. Leave output directory at the Next.js default. Build: `npm run build`. Choose Node 24 LTS in Vercel settings.
2. Configure these environment variables for the environments being tested:

| Variable | Value |
| --- | --- |
| DATABASE_URL | Private transaction-pooler Postgres URI from Supabase |
| SUPABASE_URL | The existing Supabase project URL |
| SUPABASE_PUBLISHABLE_KEY | The project's publishable key, not a service-role key |
| ADMIN_EMAILS | Comma-separated verified administrator email addresses |
| SITE_URL | Final production origin, e.g. https://your-project.vercel.app |

3. Run the schema migration and complete the source-data import before switching production traffic. The build itself does not connect to or migrate the database.
4. Deploy, then check `/api/health`: it must return HTTP 200 and `{"ok":true,"database":true}`. A configured but unreachable database is not reported healthy.
5. In Supabase → Authentication → URL Configuration, set Site URL to the new production origin and add its `/bn/account/` and `/en/account/` redirect URLs. Keep email confirmation enabled. Configure custom SMTP for public registration and password-reset delivery. Phone login remains unavailable unless the project's phone/SMS provider is enabled.
6. Register/verify the administrator on the website using an address in ADMIN_EMAILS. The Supabase dashboard account and the foundation website account are separate. Never assign admin rights by trusting client metadata or an unverified email.

## Migrating live data

The old D1 database is not the local preview SQLite file. Never import local QA records into production.

Use a complete export of these live tables: profiles, user_roles, content, donations, submissions, audit and rate_events. Preserve full field values. The Sites inspection tool can truncate long JSON/text fields; such output is not a valid full backup. At preparation time, live inspection showed three profiles, one campaign content edit and one audit row, and no donations or requests. The content payload and audit details were truncated by inspection, so they must be re-exported in full from the old hosting database viewer before import. Do not rebuild or guess the audit record from the public website.

Private migration exports stay under ignored `backups/` or `.local/`, outside GitHub. Snapshot format:

```json
{
  "format": "nafahat-d1-v1",
  "complete": true,
  "sourceCounts": {"profiles": 0, "user_roles": 0, "content": 0, "donations": 0, "submissions": 0, "audit": 0, "rate_events": 0},
  "tables": {"profiles": [], "user_roles": [], "content": [], "donations": [], "submissions": [], "audit": [], "rate_events": []}
}
```

Only mark complete after the full source export and its counts have been verified. Every row must contain every original column, including nullable columns. This is a format example, not an export of the live site.

```sh
npm run db:import -- backups/full-snapshot.json
# Validate the summary, then explicitly apply:
npm run db:import -- backups/full-snapshot.json --apply
npm run db:verify
```

Import defaults to validation only. Applying imports requires an empty destination (or the same already-imported checksum), locks the application tables, inserts all rows in one transaction, verifies row counts and verified donation totals, and records the import checksum. A failed import rolls back. No existing target records are overwritten. Validating a snapshot does not establish that the source export was complete; that must be checked at export time.

Before final export, pause writes to the old site or arrange a controlled maintenance window; a stale snapshot must not replace newer submissions. Keep the old deployment/database available for rollback. Do not enable both backends to accept donations independently during cutover. After a verified import and production smoke test, retire writes on the old site and redirect/replace the published links. Private tracking tokens remain valid in the new database, but old-host URLs need redirecting or their origin updated; the claim form accepts tracking links from the known old host.

Accounts retain existing ownership IDs. Historical ChatGPT-linked accounts are not automatically merged into Supabase accounts by matching email/phone. Existing Supabase `sb:` IDs, roles and donation ownership are preserved exactly. Review any legacy profile-linking needs separately.

## Architecture and editing

| Path | Responsibility |
| --- | --- |
| app/api/[...path]/route.ts | Node.js API entry point on Vercel |
| app/api/health/route.ts | Database connectivity/schema readiness |
| server/api.js | Authentication, donation rules, admin permissions, content and request workflows |
| server/postgres.js | Parameterized PostgreSQL adapter and bounded connection pool |
| server/migration.js | Snapshot validation, transactional import and summaries |
| lib/initial-content.js | Public introductory projects, events and learning content |
| components/ | Bilingual pages, forms, dashboard and staff editor |
| proxy.ts | Fresh CSP nonces for dynamically rendered pages |
| supabase/migrations/ | New PostgreSQL schema migrations |
| drizzle/ | Immutable historical SQLite migrations used only by regression tests |

Content written through admin overrides introductory seed content without a rebuild. Projects, Events and Learning are the main content sections. Google membership form responses remain separate. Donations are campaign-specific and verified manually; only verified records contribute to totals. Images currently use public HTTPS URLs; direct uploads are not part of this migration. The dashboard and exports currently show up to 500 records.

## Validation

`npm test` runs the existing SQLite regression suite and actual PostgreSQL-compatible PGlite tests for donation accounting, duplicate detection, roles, ownership, long Unicode content and transactional import rollback. PGlite runs real PostgreSQL in WASM, not the live Supabase service. `npm run build` checks the deployable Next.js server. Live database connectivity, data import, SMTP and real email confirmation remain deployment checks after the private credentials and provider configuration are available.
