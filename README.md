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

Administration displays desired next times and a dated scheduler verification, never claims a live scheduler connection. A separate daily 06:15 Amsterdam delivery observer in `.github/workflows/delivery-check.yml` reads Buffer status only from a GitHub-hosted runner. New issue fingerprints fail the run for GitHub notifications; repeated fingerprints stay in the summary without a repeated failure. Notification delivery follows the account's GitHub Actions preferences. The initial ChatGPT cloud monitor could not resolve the endpoint and has been paused. It cannot publish, retry or reschedule. Confirmed sent posts gain a validated LinkedIn link in the archive. The newsletter remains off; search and posting times are unchanged.


## Reviewer desk layout

The process strip and current duty summary lead into the review selection. Filters and next-pending navigation only affect the view. First-online date and source access are always visible; findings, limitations and sources expand separately. Saving status and Buffer scheduling/delivery are distinct. Manual copying, downloads and opening LinkedIn are collapsed with duplicate-post guidance. An empty desk asks for no decision; read-only accounts have disabled editing and recovery controls. Administration settings, accounts and the disabled newsletter remain separate collapsible sections. Search, posting, eligibility and server authorization are unchanged.


## Automatic search handoff

The ChatGPT search remains at Friday 01:00 Amsterdam time. The separate reviewer-handoff workflow starts at 01:15, waits for a complete current-Friday edition and its matching draft TXT, and prepares pending central reviews exactly once. Source-data and draft pushes also trigger it, so later search completion resumes automatically. Concurrent triggers share one queue and the backend keeps a permanent per-Friday completion record. Existing reviewer decisions are never overwritten; no Buffer or newsletter actions occur. Fresh editions and Friday email eligibility wait for confirmed handoff. A waiting run times out after 5.5 hours with a visible failure; later data/TXT pushes can still complete the handoff.

## Required format for future weekly editions

Apply this editorial format to every new weekly edition from 25 November 2026 onward. Preserve the existing search, selection criteria, schedule, numbering, human approval, Buffer publication and disabled newsletter.

Write for EFI scientists at all career stages, HLA diagnostic laboratory scientists and laboratory directors. Explain relevance concretely and accessibly. Distinguish research relevance from established diagnostic use. Phrase limitations constructively and proportionately without weakening the scientific meaning or implying clinical advice.

Use the existing topic heading, followed by the citation and first-online date in exactly this order. Do not replace the heading with an invented numbered article title.

TOPIC HEADING
FirstAuthor et al. - Full original article title. Journal, year;volume:article-or-pages. (IF=x.x; JIF YYYY).
Online: DD Mon YYYY.

KEY FINDING
One concise statement describing the study and principal result.

WHY IT MATTERS
One concise statement of relevance for the broad EFI audience, including HLA laboratory interpretation where supported.

KEY CONSIDERATION
One concise, mildly worded but scientifically accurate consideration explaining the main interpretative limitation. Preserve uncertainty and evidence boundaries.

https://doi.org/ARTICLE_DOI

Separate articles with a line containing exactly eleven ordinary hyphens:
-----------

Before the house-journal item, retain "From our Journal HLA Immune Response Genetics:".

At composition time, look up the most recent available Journal Impact Factor, using Clarivate Journal Citation Reports or the official journal/publisher website. Record the JIF year, actual source URL and access date in the article evidence metadata. Never invent, extrapolate or substitute CiteScore, a five-year impact factor, or the article publication year. If the current JIF cannot be reliably verified, use exactly "(IF=n.a.)." with no invented JIF year. Do not place these source URLs in the LinkedIn post, which remains DOI-links-only. Impact factor is contextual journal information and never a selection criterion or an article quality score.

Retain the edition header, reviewer attribution and existing EFI hashtags. Ensure the full assembled post, including headings, citations, separators, attribution and hashtags, stays below 3,000 UTF-16 code units. Condense wording while preserving factual nuance. Use no em dashes, en dashes or other long dash punctuation. Provide optional table/figure reading pointers only when full text was actually checked and space permits. Never imply full-text access from an abstract.
