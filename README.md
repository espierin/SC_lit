# EFI Scientific Committee Journal Club

Public site: https://espierin.github.io/SC_lit/

## Editorial workflow

1. Open an edition. The central review is loaded automatically; no login or handover link is required.
2. Approve or exclude each item and edit text as needed. Changes save automatically after a short pause. Editing text resets the item to Pending.
3. Export is enabled only after all items are reviewed, at least one is approved, the text fits LinkedIn, and central saving succeeds.
4. Download the reusable banner separately.
5. Other visitors see saved changes on opening the page. Open pages check for updates every 15 seconds when no local edit is pending.
6. An optimistic revision check prevents overwriting another review. A conflict retains a local draft and blocks export. Reload the central version, then reconcile changes.
7. Earlier versions & local import provides restoration of the last 30 versions. A previous browser-local review can be imported only when no central review has been saved yet.

## Shared storage

The GitHub website uses a public Sites Worker with R2 storage at https://efi-journal-club-review-store.espierin.chatgpt.site. Source is maintained separately in the adjacent review-store directory and the Site source repository. No GitHub or service credential is shipped in the frontend. The browser sends whole-edition reviews with a revision precondition; the server validates fields against the edition and performs a conditional R2 write. Prior snapshots are retained inside the same atomic record.

This is deliberately anonymous editing: anyone who knows the URL can read and change reviews. Reviewer names are self-reported. Origin checks and revision control protect against accidental cross-origin writes and simultaneous overwrites; they do not authenticate visitors. Do not put confidential material in the reviews.

The GitHub edition data remains the immutable source draft. Central reviewer corrections do not rewrite the draft or cloud research history. The existing Friday cloud task continues to add new editions normally. Central records use edition IDs; do not reuse or change existing IDs.

## Weekly updates

The ChatGPT Work cloud task runs Fridays at 07:00 Europe/Amsterdam. It uses the connected GitHub plugin to append a draft to data/editions.json and save the LinkedIn TXT in editions/. GitHub Pages publishes main. No local computer or separate OpenAI API key is used. The previous local automation is paused. Cloud-to-GitHub writing was successfully tested on 23 October 2026; only SC_lit is selected in the ChatGPT Codex Connector installation. A scheduled run starts at 07:00; research and publication finish later.

Edition 1 = 2026-10-23, Edition 2 = 2026-10-30. The retrospective simulation is not numbered in the live series. Existing editions are retained. Candidate registers and research notes stay outside this public repository.

Data schema: editions array; each entry has numeric id, ISO date, header and items array. Each item has unique id, text, doi. Header has title, subtitle, edition and display date. Item text includes its topic, reference, online date, findings, limitation and DOI; HLA picks include their rubric heading. Hashtags are added by the exporter.

## Deployment

GitHub Pages serves main at repository root. No build dependencies. index.html, style.css, app.js, data/editions.json and assets/banner.png form the website.

First edition text is imported from the previous chat; it has not been independently re-researched during site implementation.
