# Campaign galleries and homepage countdowns

## Enable uploads once

In Vercel's project Environment Variables, add `SUPABASE_SERVICE_ROLE_KEY` for Production. Use this Supabase project's server secret key (`sb_secret_...`) or legacy `service_role` key. Never use a publishable/anon key, never prefix it with `NEXT_PUBLIC_`, and never commit it. Redeploy after adding it. Local development can use the same name in the ignored `.env.local`.

The first authorized upload creates the public `campaign-media` bucket if missing, restricted to WebP images up to 2 MiB. Existing private buckets are not made public automatically. No anonymous write policies are needed: only Admins and Editors can request a short-lived signed upload token through the server. Original files are uploaded directly to Supabase Storage, avoiding Vercel request body limits. No database migration is needed; gallery references and schedule fields live in the existing content JSON.

## Publish photos

Open Content & campaigns, choose an existing item or enter a new URL name. Use Main thumbnail for one lead image, and Other photos for the separate gallery. Choose multiple JPEG, PNG or WebP gallery photos together, up to 20 images including the thumbnail. Replacing the thumbnail does not replace the gallery. Original files must be under 20 MB and 40 megapixels. The browser resizes to at most 1800 pixels on the longest edge and converts to WebP; the upload must fit below 2 MiB. HEIC and animated formats are not supported.

Successful photos remain in the draft if another upload fails. Retry only the failed files. Choose or replace thumbnail to change the lead image. Older galleries that included the cover are displayed without duplicating it; saving them normalizes the separate fields. Remove from gallery removes its reference, not the stored original. Select Save & publish after editing. Uploaded but unpublished originals may remain in storage; review storage usage before bulk publishing or cleanup.

Published images are public. The gallery supports opening a full image, previous/next controls, keyboard arrows and Escape. Galleries are available for Projects, Learning, Events and Reports. Project cards use the cover photo.

## Show an ongoing campaign

Choose Scheduled or Ongoing and enter the deadline in Bangladesh time (UTC+06:00). Scheduled campaigns require a start date; for campaigns already ongoing, the start date is optional. When both are supplied, the end must be after the start. Save & publish. Between these times, the homepage shows the campaign with days, hours, minutes and seconds remaining. Scheduled campaigns appear automatically when the start time arrives. Completed or expired campaigns do not appear in the countdown section; their project pages remain available. The announced winter-relief deadline is 15 December 2026, 23:59:59 Bangladesh time. Legacy winter records saved before scheduling existed receive this deadline when read, preserving their content and photos. Explicit saved schedules and Completed status take precedence. Saving No schedule sets a marker so the legacy fallback never re-enables it. Other campaigns receive no default dates.

The same timer is displayed on the homepage and project detail page. The schedule controls the homepage countdown. Donation collection is controlled separately by administrators in Payment settings; close collection there when required.

## Verification

Automated checks cover ten-photo persistence and removal, oversized/unsafe galleries, authorization, secret isolation, image metadata limits, bucket creation, timezone conversions and countdown boundary conditions. The browser workflow was tested with ten local fixture images, mocked storage upload endpoints and local campaign data; no test images or fabricated deadlines were published to production. Real storage uploads still require the Vercel server key and a live upload check.

## Campaign detail redesign

Project pages display one uncropped, expandable lead thumbnail above the overview, a separate other-photo gallery, linked project updates, share action, and a support sidebar with the deadline, verified website donations, campaign-specific donation link, clothing contribution link where relevant, and reports. No fundraising targets or beneficiary statistics are invented. Mobile users can jump directly to support.
