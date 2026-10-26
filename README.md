# EFI Scientific Committee Journal Club

[Open the website](https://espierin.github.io/SC_lit/) · [Published year archive](https://espierin.github.io/SC_lit/history.html)

The year archive is public. Working pages require an activated member account; administration additionally requires administrator access. Protected page bodies, workflow downloads, account management, review history and publication credentials are served by the authenticated backend, outside this repository.

The existing cloud literature task writes weekly source editions to data/editions.json. This source file remains public to preserve that workflow. Making it private requires migrating the cloud-to-backend delivery path first. The public banner is retained for LinkedIn/Buffer delivery.

No credentials, account allowlist or activation links belong in this repository. Removing a current file does not erase older Git commits.

Publication is on hold, including the announcement. The series has not started. Internal draft IDs are not published edition numbers. Read the backend /numbering endpoint and verified published history before assigning a public number; never derive it from calendar weeks or draft count. While paused, drafts retain publicationNumber: null and omit the Edition line.

## Preprint screening

The GitHub Actions workflow **Screen preprints for internal review** runs on Fridays at 07:00 Europe/Amsterdam or manually from Actions. It collects recent bioRxiv and medRxiv abstracts, prioritizes relevant articles, then checks the selected full texts (JATS XML first, HTML fallback). It generates `review.md` and `candidates.json` inside the temporary runner; the JSON is delivered to the protected review backend and is not committed or uploaded as a public artifact. The report gives source excerpts and figure captions for editorial assessment; an abstract match is not an approval.

On the radar is **off by default**. To allow one potential candidate to be flagged in future reports, set the repository Actions variable `ON_THE_RADAR_ENABLED` to `true` in **Settings → Secrets and variables → Actions → Variables**. Set it to `false` or remove it to pause the rubric. The manual **Run workflow** form also allows a one-run override. This does not change the publication hold or post to LinkedIn. The existing cloud task remains separate; avoid using both to publish the same edition.

On the main branch, GitHub Actions uses its short-lived OIDC identity to deliver the report to the private review backend. Activated members can see the shortlist and existing edition decisions on the reviewer desk. Only the assigned duty reviewer, Erik Spierings and Pietro can record approval or exclusion; the backend checks that permission on every write. A preprint approval means *consider for an open fourth slot*, never automatic inclusion or publication.
