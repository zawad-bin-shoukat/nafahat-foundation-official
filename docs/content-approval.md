# Project details, accounting and publishing

## Daily team workflow

An Editor opens Administration → Content & campaigns, selects a content type, then edits an existing item or creates a new URL name. **Save draft** stores work without changing the public website. **Preview** renders the current draft locally in the editor. **Submit for review** places it in the review queue. An Administrator opens the same item and selects **Approve & publish**, or writes a review note and selects **Request changes**. Admins can also publish their own work directly.

The sidebar marks each item's state (`draft`, `review`, `changes`, `published`). **Reload latest draft** fetches the latest saved work; **Load published version** loads the currently public copy into the editor. Revision history shows the latest 20 saved snapshots, including legacy publication records. Loading a historical version only fills the draft form: it still needs approval to become public. Conflicting saves return HTTP 409; reload and merge instead of overwriting another person's changes.

Previously published records stay public during this transition. Existing Editors no longer publish directly; they submit changes for an Admin's approval. Revocation and publication authorization are enforced by the API, not just hidden buttons.

## Project facts and FAQs

Objectives, intended beneficiaries, project areas and items provided are entered in Bangla and English, one item per line. Empty sections are hidden publicly. Add up to 12 bilingual FAQ entries; readers expand them directly on the project page. Draft questions may be incomplete, but publication requires complete questions and answers.

## Financial progress

Only Admins can change fundraising targets and offline collection figures. A zero target hides the target bar. Verified website donations always come from the donation ledger; pending/rejected donations do not count. Offline collections are a separate confirmed total: record a source/accounting-date note in both languages and explicitly confirm they exclude website payments. Public pages display the two sources separately and combine them only for target progress. Do not invent targets or enter the same payment in both totals.

## Completion reports

Choose Report, link the published project, and enable Completion accounts (Admin only). Enter the accounting date, expense categories and amounts, and distribution results in both languages. Publishing takes an immutable snapshot of the project's website-verified donations and approved offline total. Subsequent donation verification does not rewrite an older report; publishing a revised report deliberately captures new figures. Negative balances are displayed as deficits.

Public reports appear under Transparency & reports and on the related project page. The downloadable HTML report includes receipts, expenses, results and the publication timestamp. Open it in a browser and use Print → Save as PDF when a PDF is needed. Draft previews do not offer report downloads. Photos remain separately uploaded through Supabase Storage; published photo URLs are public even while their content draft is under review.

## Persistence and rollout

No new database migration or external service is required. Drafts use the existing private `foundation.content` table with kind `draft` and reserved `draft:` IDs. The public content reader ignores this kind. Published rows remain unchanged until approval. The existing private audit table records revisions and review notes. Draft updates use version-checked writes inside the existing transaction-backed batch; stale saves cannot overwrite newer drafts or publish an unreviewed version. Never expose these tables directly through anonymous Supabase policies.

New project facts, FAQ and accounting fields are optional JSON fields. Historical records require no fabricated data or conversion. The Google membership form, donation-number restrictions, SMTP configuration and Supabase keys are unchanged.

## Verification

The test suite covers editorial permissions, public/draft isolation, stale-version rejection, review notes, revision history, financial field protection, target arithmetic and completion-report snapshots. A local browser run using an isolated in-memory PostgreSQL database confirmed Editor save/submit → Admin approve → public update, FAQ expansion, and report publication/download. The downloaded HTML was checked for the expected sample expense and remaining balance. The screenshot in `docs/qa/completion-report-preview.jpg` uses clearly marked local sample data; none of those sample amounts or reports were published to the real site.
