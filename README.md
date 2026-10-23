# EFI Scientific Committee Journal Club

Public site: https://espierin.github.io/SC_lit/

## Editorial workflow

1. Sign in with an activated committee account. Only the reviewer assigned to the current Amsterdam ISO-week block, Eric as administrator and Pietro as backup reviewer can access the review desk. Then open an edition.
2. Approve or exclude each item and edit text as needed. Changes save automatically after a short pause. Editing text resets the item to Pending.
3. Export is enabled only after all items are reviewed, at least one is approved, the text fits LinkedIn, and central saving succeeds.
4. Download the reusable banner separately.
5. Other visitors see saved changes on opening the page. Open pages check for updates every 15 seconds when no local edit is pending.
6. An optimistic revision check prevents overwriting another review. A conflict retains a local draft and blocks export. Reload the central version, then reconcile changes.
7. Earlier versions & local import provides restoration of the last 30 versions. A previous browser-local review can be imported only when no central review has been saved yet.

## Shared storage

The GitHub website uses a public Sites Worker with R2 storage at https://efi-journal-club-review-store.espierin.chatgpt.site. Source is maintained separately in the adjacent review-store directory and the Site source repository. No GitHub or service credential is shipped in the frontend. The browser sends whole-edition reviews with a revision precondition; the server validates fields against the edition and performs a conditional R2 write. Prior snapshots are retained inside the same atomic record.

Article drafts and archived read-only review data remain public. Review writes require a server-validated account session, active account and a current duty assignment (or admin/backup role). New reviews use the verified account name. Earlier anonymous history is preserved. No password, session token, email allowlist or invitation link belongs in this public repository.

The GitHub edition data remains the immutable source draft. Central reviewer corrections do not rewrite the draft or cloud research history. The existing Friday cloud task continues to add new editions normally. Central records use edition IDs; do not reuse or change existing IDs.

## Weekly updates

The ChatGPT Work cloud task runs Fridays at 07:00 Europe/Amsterdam. It uses the connected GitHub plugin to append a draft to data/editions.json and save the LinkedIn TXT in editions/. GitHub Pages publishes main. No local computer or separate OpenAI API key is used. The previous local automation is paused. Cloud-to-GitHub writing was successfully tested on 23 October 2026; only SC_lit is selected in the ChatGPT Codex Connector installation. A scheduled run starts at 07:00; research and publication finish later.

Edition 1 = 2026-10-23, Edition 2 = 2026-10-30. The retrospective simulation is not numbered in the live series. Existing editions are retained. Candidate registers and research notes stay outside this public repository.

Data schema: editions array; each entry has numeric id, ISO date, header and items array. Each item has unique id, text, doi. Header has title, subtitle, edition and display date. Item text includes its topic, reference, online date, findings, limitation and DOI; HLA picks include their rubric heading. Hashtags are added by the exporter.

## Deployment

GitHub Pages serves main at repository root. No build dependencies. index.html, style.css, app.js, data/editions.json and assets/banner.png form the website.

First edition text is imported from the previous chat; it has not been independently re-researched during site implementation.

## Announcement and year archive

announcement.html contains the announcement post (data/announcement.txt), clipboard and TXT downloads, and the reusable banner. history.html?year=2026 is the year-specific archive; years are generated from data/editions.json automatically. Editions sort newest first and load current central review status and approved text. Incomplete reviews are labelled, not represented as published. The archive links to index.html?edition=N for review. New annual pages require no manual generation: each year has a stable history.html?year=YYYY URL.

## Automatic publication through Buffer Free

The owner authorized authenticated editorial approval to trigger publication to the EFI organization page only. The cloud review backend sends approved text and assets/banner.png to Buffer channel 6adb1036778b240e2f9a379c. Every item must be approved or excluded, at least one approved, text below 3,000 UTF16 code units and DOI-only links. Before the target, Buffer schedules Monday 08:00 Europe/Amsterdam, with DST. A later completed review uses shareNow. No local computer or separate OpenAI API key is needed for this delivery.

Text editing returns an item to Pending. The backend returns a scheduled post to draft until review is complete again; after actual delivery further edits never create a duplicate. An ambiguous API result is held for manual investigation, not retried automatically. The site displays the submission status; Buffer remains the delivery-status authority. Check Buffer for failed or disconnected-channel posts. The key expires 23 October 2027 and may require renewal; LinkedIn can also require reconnection. Runtime credentials live only in Sites secrets. Backend implementation and operational guidance are in ../review-store/PUBLICATION.md.

The Copy & open EFI on LinkedIn button remains a manual fallback. Check Buffer before publishing manually to avoid duplicates. Do not combine automatic Buffer posting with an independently scheduled copy of the same edition. The older direct LinkedIn API approval-monitoring task is paused because Buffer is now the selected route.

## LinkedIn URL policy

Announcement and weekly post text must never contain GitHub, repository, project website, review-store or banner links. Only canonical article URLs matching https://doi.org/10.… are allowed. The announcement currently has no URLs. url-policy.mjs validates post text before clipboard or TXT export; non-DOI URLs block exports. The scheduled cloud task has the same rule and must validate generated TXT files before writing them. Administrative site navigation and task-report links are outside the LinkedIn post text.

## Confirmed LinkedIn destination

The intended publisher is the European Federation for Immunogenetics (EFI) organization page, organization ID 109535533 (urn:li:organization:109535533). This is a company/organization page, not a LinkedIn Group. The user has administrator access; its dashboard was observed on 23 October 2026 at https://www.linkedin.com/company/109535533/admin/dashboard/. Handoff buttons open that dashboard after copying the post. Other SC members need their own page administration rights to publish there. This destination is administrative metadata and must NEVER be inserted in the post text. Future API publication needs organization-authorized access (w_organization_social); page administration alone does not supply an API token. Automatic delivery uses Buffer's authorized LinkedIn connection.

## Publication timing

Friday research remains Friday 07:00 Europe/Amsterdam. An edition is intended for the following Monday 08:00 Europe/Amsterdam. The website approval triggers Buffer submission; Buffer handles the unattended scheduled delivery. A review completed after its target is submitted immediately, subject to Buffer and LinkedIn processing time. publication-plan.mjs contains the DST-aware time calculation. API checks and mock publication tests live in the backend project.

## Accounts and four-week duties

The owner uses e.spierings@umcutrecht.nl as administrator. Only the ten supplied committee/office addresses plus the owner are allowlisted in secret backend configuration. Pietro has year-round review access, not administration. Other reviewers must be active and assigned to the current four-week ISO-week block. All accounts initially require an administrator-issued, private, single-use activation link; users choose their own passwords. There is no open signup.

Administration lets the owner activate/deactivate users, generate activation/reset links and assign each block of any year. The owner is also selectable as a duty reviewer while retaining administrator access. Existing saved assignments are preserved. Default rotations for unconfigured years follow the supplied list with the owner appended and repeat as needed; the last ISO-year block may contain fewer than four weeks. It is generated for each year until customized. Roster changes and deactivation take effect on the next authenticated request, including existing sessions. All 2026/2027 blocks can be changed by the administrator. No email invitations are sent automatically.

Sessions last up to 12 hours in the current browser tab. Passwords are salted and derived server-side with a separate runtime secret. The backend rejects anonymous PUT requests regardless of the frontend. Friday cloud research and already queued Buffer publications do not need a reviewer login.
