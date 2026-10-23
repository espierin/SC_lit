# EFI Scientific Committee Journal Club

Public site: https://espierin.github.io/SC_lit/

## Editorial workflow

1. Open the edition and consult each original article.
2. Approve or exclude every item. Editing an item resets it to Pending.
3. Once all items are reviewed and at least one is approved, copy or download the LinkedIn text. Only approved items are exported. Exports must stay below 3,000 UTF-16 code units, a conservative Unicode length check.
4. Download the reusable banner separately.
5. Use Share reviewed edition to hand the reviewed snapshot to another person. The link carries decisions and edited text in its URL fragment. It is not authenticated or centrally stored. Browser storage alone is local to the reviewing device. Changes made after sharing require a new link.

The website and repository are public. An unshared URL is not access control. No login, server credentials, automatic LinkedIn posting or central approval database is used.

## Weekly updates

The ChatGPT Work cloud task runs Fridays at 07:00 Europe/Amsterdam. It uses the connected GitHub plugin to append a draft to data/editions.json and save the LinkedIn TXT in editions/. GitHub Pages publishes main. No local computer or separate OpenAI API key is used. The previous local automation is paused. Cloud-to-GitHub writing was successfully tested on 23 October 2026; only SC_lit is selected in the ChatGPT Codex Connector installation. A scheduled run starts at 07:00; research and publication finish later.

Edition 1 = 2026-10-23, Edition 2 = 2026-10-30. The retrospective simulation is not numbered in the live series. Existing editions are retained. Candidate registers and research notes stay outside this public repository.

Data schema: editions array; each entry has numeric id, ISO date, header and items array. Each item has unique id, text, doi. Header has title, subtitle, edition and display date. Item text includes its topic, reference, online date, findings, limitation and DOI; HLA picks include their rubric heading. Hashtags are added by the exporter.

## Deployment

GitHub Pages serves main at repository root. No build dependencies. index.html, style.css, app.js, data/editions.json and assets/banner.png form the website.

First edition text is imported from the previous chat; it has not been independently re-researched during site implementation.
