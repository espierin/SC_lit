# EFI Scientific Committee Journal Club

[Open the website](https://espierin.github.io/SC_lit/) · [Published year archive](https://espierin.github.io/SC_lit/history.html)

The year archive is public. Working pages require an activated member account; administration additionally requires administrator access. Protected page bodies, workflow downloads, account management, review history and publication credentials are served by the authenticated backend, outside this repository.

The existing cloud literature task writes weekly source editions to data/editions.json. This source file remains public to preserve that workflow. Making it private requires migrating the cloud-to-backend delivery path first. The public banner is retained for LinkedIn/Buffer delivery.

No credentials, account allowlist or activation links belong in this repository. Removing a current file does not erase older Git commits.

Weekly preparation starts Friday 04:00 Central European local time, targeting shortlist readiness by 07:00. Weekly publication is enabled for the following Tuesday at 06:00 Europe/Amsterdam (CET in winter, CEST in summer), after complete reviewer approval. A later completed review is submitted immediately. Newsletter automation remains disabled.

The announcement has independent administrator date/time controls and includes the existing banner. Its authorized launch time is Wednesday 28 October 2026 at 06:00 CET. Check its saved scheduling status and Buffer for confirmation.

The unpublished 23 October draft was withdrawn. Preserve retiredDraftIds and nextInternalId; never reuse retired internal ID 1. Fresh preparation starts Friday 30 October 2026. The first published edition will be number 1, intended for Tuesday 3 November after review. Read /numbering and verified published history before assigning a number. Drafts, announcements, skipped weeks and calendar time consume no edition numbers. While paused, drafts retain publicationNumber:null and omit the Edition line.

All activated members can inspect the shortlist. Weekly article decisions require the duty reviewer, Eric or Pietro. General administration and the restricted newsletter pilot have separate server-enforced permissions.

EFI and reviewers provide neutral information without clinical, medical or scientific advice or endorsement. Post bodies contain article DOI links only and #Scientific #Committee, stay below 3,000 UTF-16 code units and avoid em/en dashes. Attribution uses the verified saved reviewer name. Clickable mentions require a separately resolved and verified Buffer profile identifier; a typed @name or profile URL is insufficient.

Saving research timing on the website does not update the ChatGPT cloud trigger. Apply and verify that schedule separately. The help page and private backend OPERATIONS.md document the current workflow. Older screenshots and exported files are historical records, not current instructions.


## Reviewer evidence metadata

Each selected item may include an `evidence` object alongside `id`, `text` and `doi`: `firstOnline` (verified YYYY-MM-DD or null), `fullTextStatus` (`read`, `partial`, `abstract_only`, `unavailable`, `not_recorded`), `finding`, `limitation`, `selectionReason`, `checkedAt` and `sources` (`[{url,label}]`). Keep unknown fields null; never infer full-text review from metadata. Evidence cards do not enter LinkedIn text or TXT and do not change selection criteria. Existing editions without evidence are explicitly labelled Not recorded.

Administration displays desired next times and a dated scheduler verification, never claims a live scheduler connection. A separate daily 06:15 Amsterdam delivery observer reads Buffer status only. It cannot publish, retry or reschedule. Confirmed sent posts gain a validated LinkedIn link in the archive. The newsletter remains off; search and posting times are unchanged.
