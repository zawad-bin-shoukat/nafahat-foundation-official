# Team accounts and content access

## Email delivery (required before inviting the team)

Configure Supabase Authentication → Emails → SMTP settings with a sender you control. Keep email confirmation enabled. The website uses Supabase Auth directly; SMTP credentials belong only in Supabase, never in the frontend, GitHub or public environment variables.

For initial low-volume onboarding through an eligible Gmail account:

1. Enable Google 2-Step Verification and privately generate an App Password labelled `Nafahat Supabase`.
2. Use host `smtp.gmail.com`, port `465` (implicit TLS), the full Gmail address as username and sender address, and the App Password as password. Sender name: `Nafahat Foundation`.
3. Save in Supabase's custom SMTP settings. If App Passwords is unavailable, use another supported SMTP provider instead; never use the ordinary Google account password or disable email confirmation.
4. Retain a conservative authentication email rate limit. Gmail applies its own quotas and sending restrictions; upgrade the email delivery setup as usage grows.

Production Site URL: `https://nafahat-foundation-official.vercel.app`.
Allowed redirect URLs must include `/bn/account/` and `/en/account/` under that origin.

## Onboard an Editor

1. Share `/bn/account/?mode=signup` (or `/en/account/?mode=signup`).
2. The person registers with their own email and password, confirms their email and opens their account dashboard. Only authenticated, verified identities can create a website profile.
3. An Admin opens Administration → Users & roles → Refresh list, searches for their email and saves the `editor` role.
4. The person selects Refresh role & account on their dashboard, then opens Staff panel.
5. They can publish Projects, Learning and Events. They cannot review donations, change campaign payment instructions or assign roles.

There is no automatic promotion based on signup fields or Google Form membership. `finance` is for donation review; reserve `admin` for people who need full control. Configured bootstrap administrators and the acting administrator's own role cannot be changed through this screen.

## Acceptance checks before declaring onboarding complete

Use a consenting team member's inbox; do not manufacture live accounts or send unsolicited emails.

- Receive a confirmation email at an address outside the Supabase organization team.
- Open it and sign in. Unconfirmed accounts must be rejected.
- Test resend confirmation, observing provider cooldowns.
- Assign Editor and verify access to all three content categories.
- Confirm the Editor cannot access donation data or user management.
- Publish an approved real entry, reopen it publicly and check persistence.
- Revoke Editor access and verify subsequent writes are rejected.
- Complete a password reset through the email link and sign in using the new password.

Automated tests cover verified identity, role assignment, publishing all three types, permission boundaries and immediate revocation using an isolated PostgreSQL-compatible database and mocked Supabase identity responses. They do not prove live SMTP delivery. Live SMTP, confirmation links and password recovery remain unverified until the inbox checks above pass.
