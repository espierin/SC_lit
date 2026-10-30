# EFI comment likes

The GitHub workflow `EFI LinkedIn comment likes` polls LinkedIn every four hours (minute 23 UTC; GitHub schedules can be delayed). It uses the official Community Management API, acting only as EFI organization `109535533`. It includes published EFI posts discovered through the author finder, including historical posts, and nested replies when LinkedIn reports replies. Posts and comment pages are scanned progressively, so a large archive or backlog increases latency.

Only comments created at or after **30 October 2026 02:02 UTC** are eligible. EFI's own comments are skipped. Missing timestamps and malformed identifiers never trigger likes. Before each LIKE the script reads EFI's current reaction and preserves any existing reaction type. Uncertain POST outcomes stop the run; the next run checks LinkedIn before retrying. No automated comment text is posted.

## Credentials and operation

Repository Actions secrets: `LINKEDIN_REFRESH_TOKEN`, `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, from the EFI LinkedIn app. Before each run the worker exchanges the refresh token at LinkedIn's official OAuth endpoint for an access token held only in runner memory. It does not store tokens in the polling cache, artifacts or source, and does not need GitHub secret-write privileges. The original `LINKEDIN_ACCESS_TOKEN` secret is no longer used by this workflow.

Required scopes: `r_organization_social`, `r_organization_social_feed`, `w_organization_social_feed`. Never put credentials in source, Actions inputs, logs, issues or comments. The refresh token expires **30 October 2027** (fixed expiry, not extended by refresh). Reauthorize the EFI app and replace the refresh-token secret before then. A warning appears in run annotations within 30 days of expiry, and remaining authorization days appear in the summary. LinkedIn can revoke authorization sooner. Authentication/permission errors stop before social actions and fail the workflow visibly. LinkedIn can return different refresh-token encodings; this worker reuses the original year-long authorization secret, verified across consecutive live runs.

Runs make at most 12 requests, and the cached rolling 24-hour budget stops at 90 calls, below the Development Tier per-member limit of 100. Other integrations sharing the same member/app also consume quota. HTTP errors, including 429, stop without retrying. Development Tier is for integration/testing; LinkedIn's Standard Tier approval is required for production use under the program's access guidance.

Actions cache retains scan cursors, pending comment URNs, successful-reaction hashes and request timestamps, never comment bodies, names or credentials. Cache eviction restarts discovery with the same fixed cutoff and checks existing reactions again. Cache eviction also resets the local request counter; LinkedIn remains the authoritative quota. The workflow is serialized. Manual runs default to read-only; scheduled runs write likes. Run summaries show counts only. Disable this workflow in GitHub Actions to stop it.

## Validation

`node --test scripts/linkedin-comment-likes.test.mjs scripts/linkedin-refresh.test.mjs`

Before activation, verify a manual read-only run with the real secret, then a manual write run. A successful run with zero eligible comments validates access/scanning, but does not demonstrate an actual LIKE. Preserve that distinction in release notes.

Sources: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/reactions-api and https://learn.microsoft.com/en-us/linkedin/marketing/increasing-access
