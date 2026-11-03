# EFI - style guide for web and communications

Version 1.1 · 3 November 2026 · Shared working standard for EFI projects · English canonical edition

## 1. Status, purpose and source hierarchy

This guide consolidates the earlier Scientific Committee and BITCom projects, the current EFI website and examined newsletter communications. It is a practical project standard, not a formally issued EFI brand manual. The HTML edition includes the same guidelines and visual examples.

**Evidence labels:** **[LIVE]** = found directly in current website code; **[PROJECT]** = documented existing project agreement; **[NEWSLETTER]** = observed in newsletter 100; **[ADVICE]** = additional design guidance for new applications.

Where sources differ, use current official assets for the logo; live CSS for the production website's appearance; the committee guide dated 6 October 2026 for earlier project decisions; and this guide for explicitly identified recommendations. Older demo CSS and developer proposals do not establish that a feature exists in Craft.

These guidelines may be used for new EFI projects. They do not change production pages, CMS templates or shared headers/footers. TEST limitations are taken from the 6 October guide and were not retested in the CMS editor during this review.


## Shared link and navigation policy · v1.1 · 3 November 2026

This is the shared interaction policy for the EFI Accreditation, EPT and Scientific Committee Journal Club projects. It supersedes older project advice about link colours and active menus. This is a project implementation guide, not a new official EFI brand manual.

| State | Shared project rule |
| --- | --- |
| Text link / visited link | EFI blue `#064A89`, underlined |
| Text link hover / keyboard focus | Dark coral `#A83E3E`, underline retained |
| Active navigation | Dark coral `#A83E3E`, underline, `aria-current="page"` |
| Keyboard focus | Visible 2px outline, 4px offset; white/current colour on blue banners |
| Underline / transition | 1px, 4px offset; 150ms; respect reduced motion |

**Official evidence.** The current [EFI website stylesheet](https://efi-web.org/dist/assets/app-LaxFMXV4.css) uses blue `#064A89` for `.wysiwyg` links and coral `#DE5757` on hover and focus-visible, with a 1px underline, 4px offset and 150ms transition. Retrieved 3 November 2026.

**Explicit accessibility adaptation.** The shared projects use the existing Journal Club dark coral `#A83E3E` for small-text interaction states. Official coral `#DE5757` has approximately 3.75:1 contrast on white; dark coral exceeds 4.5:1 on white and the light project surfaces. Keep official coral for graphical accents and the established secondary button treatment. Never substitute browser-default blue or purple.

Load `efi-links.css` after the product styles. Buttons, white banner links, branded cards and cycle cards keep their component treatment. Product fonts, geometry, responsive rules and assets remain unchanged: EPT retains its Montserrat profile; Journal Club and Accreditation retain their existing Segoe UI profile. Do not merge their global stylesheets. Frozen source copies and manifest checksums remain historical evidence.

## 2. Brand character

**[PROJECT]** Calm, European, academic and collegial. Scientific credibility, diagnostic quality, education and collaboration are central. Use clear hierarchy, generous whitespace and purposeful imagery. Avoid commercial campaign styling, excessive effects and visual clutter.

**[ADVICE]** Make content scannable: subject, relevance to the reader, available action and practical details. Choose one dominant action per content section. Committees may have distinctive subject matter, but should not acquire separate logos, fonts or palettes.

## 3. Colours and application

| Token | HEX | RGB | Status | Application |
| --- | --- | --- | --- | --- |
| `--efi-blue` | `#064A89` | 6, 74, 137 | LIVE / PROJECT | Primary buttons, title bands, navigation accents and content links |
| `--efi-coral` | `#DE5757` | 222, 87, 87 | LIVE / PROJECT | Secondary button, small accent, existing iconography |
| `--efi-ink` | `#232424` | 35, 36, 36 | LIVE | Body text |
| `--efi-white` | `#FFFFFF` | 255, 255, 255 | LIVE | Main background; text on blue |
| `--efi-surface` | `#F4F6F9` | 244, 246, 249 | LIVE | Gray section background; light-button hover |
| `--efi-light` | `#EAEAEA` | 234, 234, 234 | LIVE | Light button; not the Gray section colour |
| `--efi-muted` | `#5E6568` | 94, 101, 104 | PROJECT demo / ADVICE | Secondary metadata; not a universal live token |
| `--efi-line` | `#DFE4E8` | 223, 228, 232 | PROJECT demo / ADVICE | Subtle dividers; insufficient as the sole interactive boundary |

**[LIVE]** Primary button: blue with white text. Secondary: coral with black text. Light: light grey with black text. Live blue/coral hover and focus use approximately 75% opacity (`#064A89BF`, `#DE5757BF`), so the rendered colour depends on the background.

**[ADVICE]** White and light grey form most surfaces. Blue anchors recognition; coral is a restrained accent. No mandatory percentages: colour follows content. Do not introduce gradients as a general EFI characteristic.

### Contrast and status colours

**[ADVICE]** Target at least 4.5:1 for ordinary text and 3:1 for large text. The HTML includes calculated ratios for key combinations. Small white text on coral does not meet 4.5:1; retain the existing black button text. Coral on white is unsuitable as the default for small body text. Test transparent hover colours composited on the actual background.

Success, warning, error and information need distinct semantic meanings in an EPT platform. EFI coral is a brand accent, not automatically an error or failure indicator. Define additional status colours per product, together with labels and icons; do not describe them as existing EFI brand colours. Charts also require labels, patterns or symbols alongside colour.

## 4. Typography

### Website

**[LIVE]** Montserrat variable, weights 100–900 available, with separate normal and italic font files. The website hosts these fonts; do not add Google Fonts imports to Craft content blocks. Fallback: `ui-sans-serif, system-ui, sans-serif`.

| Element | Base / smaller screen | From 1024 px | Weight / status |
| --- | --- | --- | --- |
| Body | 18 px / 28 px line height | 20 px / 32 px | 300, LIVE |
| H1 | 32 px / 48 px | 56 px / 72 px | 700, LIVE |
| H2 | 24 px / 32 px | 40 px / 48 px | 700, LIVE |
| H3 | 18 px / 30 px | 32 px / 40 px | Check component cascade; dimensions LIVE |
| Metadata / labels | 14–16 px / 1.5 | 14–16 px / 1.5 | 500–600, ADVICE |
| Data table / form | 16 px / 1.5 | 16–18 px / 1.5 | 400, ADVICE for new tools |

Pixel values convert rem using a 16 px root size. Component classes may override general headings. A compact platform need not copy the marketing website's generous sizes throughout; retain Montserrat and hierarchy, using readable 16–18 px text at weight 400 for intensive data use **[ADVICE]**.

**[PROJECT]** One H1 per page, H2 for sections, H3 for subdivisions. Bold paragraphs do not replace headings. Use genuine italic styling for quotes. Avoid arbitrary inline fonts and colours.

**[ADVICE]** Reading columns around 60–75 characters. Underline links within prose and provide clear focus. Use tabular numerals for tables; monospace only for code, technical identifiers and paths. Preserve HLA notation, allele names and versions exactly. Do not force breaks inside identifiers.

### Newsletter and email

**[NEWSLETTER]** Issue 100 (March 2023, 40 pages) contains Open Sans variants for much editorial text and Noto Serif Bold for some editorial accents. Other fonts also occur, including in advertisements; not every embedded font is an EFI font. The examined cover, editor's page and constitution table use a recognisable dark blue, black, white and light blue combination.

**[ADVICE]** For new digital newsletters, use Montserrat where supported with Arial/Helvetica as email fallback. Retain Open Sans/Noto Serif when continuing an existing newsletter production template. Do not silently replace newsletter editorial styling with website typography. One issue cannot establish a universal newsletter palette or exact print-font specification.

## 5. Logo, icons and brand elements

**[LIVE]** The website provides colour and white SVG logos: `https://efi-web.org/dist/images/logos/logo-color.svg` and `https://efi-web.org/dist/images/logos/logo-white.svg`.

**[ADVICE]** Use the original colour logo on white/light grey and the white logo on dark blue. Preserve proportions and internal design. Do not redraw, stretch, rotate, recolour or add shadow. Do not generate a new EFI logo. A decorative logo can have empty alt text when the organisation name is adjacent; a standalone home-link logo needs a descriptive accessible name.

No official minimum size or clear-space rule was located. Provisional practical guidance **[ADVICE]**: at least 24 px surrounding clear space and an on-screen width of at least 80 px, followed by a legibility check; the brand owner may establish different values.

**[PROJECT]** Use Craft's existing EFI icon selector. Icons support meaning rather than filling empty cards. An icon never replaces a clear title. ORCID requires a correctly labelled link and, where possible, its official icon. The historic LinkedIn-field workaround is not a recommended pattern for new software.

## 6. Imagery: direction, cropping and files

### Image categories

| Category | Direction | Avoid |
| --- | --- | --- |
| Laboratory and science | Realistic European academic setting, hands, equipment and research; soft natural light | Impossible laboratory procedures, invented results, readable patient data |
| Data and bioinformatics | Credible workplace, distant analysis screens, calm server/workstation setting | Holograms, floating DNA symbols, decorative code implying fictitious claims |
| Education and collaboration | Collegial workshops and discussion; inclusive, credible groups | Commercial stock poses, exaggerated handshakes, flags as default decoration |
| Society reporting | Genuine conference, award or group photograph with date, occasion and credit | Generated imagery presented as documentation of a real event |
| Member portrait | Original portrait, consistent crop and facial focus | Replacing, beautifying, altering or inventing identity |

**[PROJECT]** Generated illustrations use restrained blue/grey/white, optionally a small muted coral accent. Where appropriate, people remain anonymous: hands, rear views or unrecognisable faces. No text, watermarks, logos, fictitious scientific labels or readable screens. Generated imagery is illustrative, not evidence of EFI activities.

### Formats and composition

| Use | Earlier project direction | Additional delivery specification (ADVICE) |
| --- | --- | --- |
| Committee key visual | Main page only; panoramic, subject in central band | Approximately 2400 × 800 px source, 3:1; keep key subject in central 60% |
| Supporting Text image | Square works well; check focal point | Approximately 1200 × 1200 px; subject away from outer edge |
| Team portrait in current Craft | Rectangular 370 × 400 transform | Source at least 740 × 800 px; consistent head size and eye line |
| News card | Follow existing component | For a new component, 1600 × 900 px starting point; test crop |
| Social communication | Channel-dependent | 1200 × 630 px link preview; 1080 × 1080 px square; not official EFI specifications |

A wide source does not automatically reduce the existing Craft banner height. The earlier desktop Text image template was approximately 480 px high; this is a project observation, not a universal fixed height.

**[ADVICE]** WebP/AVIF photos with JPEG fallback where supported; PNG for transparency/screenshots; SVG logos/icons from trusted sources. Use sRGB. Suggested budgets: cards/small images up to 200 kB, supporting images up to 350 kB, hero up to 600 kB; check quality rather than enforcing blindly. Specify dimensions, use responsive variants and lazy-load below-the-fold imagery.

Use descriptive names such as `efi-ept-laboratory-training-2026.webp`. Record source, author, licence/permission, date, crop, alt text and AI status in an asset register. Alt text explains content and function, not keywords. Decorative images use `alt=""`. Scientific figures need captions and, where necessary, text explanations.

### Reusable image brief

**[PROJECT + ADVICE]** “Realistic editorial photography in a European academic immunogenetics environment. Restrained EFI blue, cool white and soft grey; subtle muted coral where appropriate. Soft daylight, matte appearance, credible equipment. Subject: [subject]. Format: [3:1 banner or 1:1 supporting image]. Keep the subject within a safe central crop. No text, logo, watermark, readable patient information, fictitious scientific labels or recognisable actual committee members. Illustrative image.”

## 7. Page structure, rhythm and responsiveness

**[PROJECT]** Committee page: existing title band/breadcrumbs → key visual on main page only → short italic Quote → separate Gray Text block with native menu buttons → White introduction → individual content sections → relevant onward links. Do not repeat the entire menu at the bottom.

Alternate White and Gray by editorial section. Text image and its Text continuation may share a background when forming one section. No empty spacer blocks. An eyebrow belongs with its following H2 in the same block.

**[ADVICE for new components]** Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 and 96 px. Card padding 24–32 px; card gaps 24 px; section padding 48–80 px desktop and 32–48 px mobile. Square or minimally rounded corners (0–4 px), fine lines and little shadow. These are not measured global Craft values.

**[ADVICE]** New-tool content around 1200 px maximum, reading columns 70ch maximum. One column on small screens, two on tablets where readable, at most three ordinary content cards on desktop. Scroll wide tables within their containers rather than the page. Check 390, 768, 1024 and 1440 px and 200% text enlargement.

## 8. Components and interaction

| Component | Rule |
| --- | --- |
| Primary action | Blue/white; active wording such as “Download results”; one dominant action per section |
| Secondary action | Light or existing coral variant according to context; never communicate meaning through colour alone |
| Focus | ADVICE: clear 3 px blue outline with white separation, including on blue buttons |
| Form | Visible label, explanation before input, field errors and summary, preserve entered values |
| Disabled / loading | Expose text and status; `aria-live` where appropriate; colour alone is insufficient |
| Quote | Short italic subtitle; no extra H1; no image in introduction quote |
| Card | Title, short explanation, date/status where applicable, descriptive action; consistent structure |
| Resources | Owner, type, version/date, access requirement and source link; identify member login |
| Event | Title, date, time zone, location/online, organiser, registration and source; archive afterwards |
| Team | Portrait → name → role → affiliation → about two expertise areas; no duplicated biographies |

**[PROJECT]** Earlier committee pages use eight native blue menu buttons per page. Active blue/inactive grey was requested but not implemented by the template. All-blue buttons describe a technical project status, not ideal general navigation guidance.

**[ADVICE for new software]** Mark the current page with `aria-current="page"`, provide a visible active state and controlled wrapping or scrolling. Prefer 44 × 44 px touch targets; hover must not be the only access method. Respect `prefers-reduced-motion`.

### EPT tables and charts

**[ADVICE]** Separate fields for file type, vendor, assay class, lot, measurement/export date and data status. Explicitly distinguish raw instrument data, vendor software export, normalised data and HAML. Align numbers consistently, put units in headers and visibly mark missing values. Missing is not zero. Sort numerically, retain original identifiers and document import locale/decimal separator. Chart series need names or patterns as well as colour; do not silently assign brand colours to positive/negative results.

## 9. Newsletters, announcements and email

**[NEWSLETTER]** Examined editorial pages in issue 100 show a large Newsletter masthead, date/issue number, genuine society photography, dark-blue highlight panels, light-blue sidebars, contents references and compact columns. A subtle repeated line motif appears. Supplier advertisements have separate visual systems and are excluded from EFI brand evidence.

**[ADVICE]** Newsletter structure: consistent masthead, issue/date, short introduction, one lead story, committee updates and practical announcements; image captions and credits. Keep editorial, sponsor and conference identities distinguishable. Do not derive official CMYK/Pantone values from a screen PDF; obtain production specifications for print.

**[ADVICE]** HTML email: approximately 600–640 px central column, mobile readability, body at least 16 px, one main action, real text alongside any banner, Arial/Helvetica fallback. Use inline CSS and email-compatible layout as needed; CSS variables and webfonts lack universal support. Include a text alternative, valid sender/contact information and relevant preference/unsubscribe link. No original EFI HTML-email template was examined; this is practical guidance, not reconstruction of an official template.

**[ADVICE]** Announcement: subject → audience → activity/call → date/deadline/time zone → explanation → one clear action → contact. A committee vacancy needs committee, number of positions, profile, term and application route, using confirmed facts only. This content structure aligns with the examined current BITCom vacancy page; its exact campaign layout is not adopted as a universal model.

## 10. Language and editorial style

**[PROJECT]** Public EFI text uses clear, collegial English and a scientific, professional tone. Avoid exaggerated promotional claims. Expand abbreviations at first use. Distinguish EFI, committees, external initiatives and formal partners. A source link is not endorsement.

**[ADVICE]** Use consistent British English unless an established proper name differs. Dates such as `15 October 2026`; times such as `14:00 CEST (UTC+2)`. Include time zones for deadlines. Use descriptive links such as “Download programme (PDF)” instead of repeated “Click here”. Keep internal management instructions outside public content.

## 11. Craft: available and requiring development

| Existing content fields (PROJECT) | Template/schema work according to 6 October project status |
| --- | --- |
| Text, headings, italic, links, block order | Custom global typography or component CSS |
| White / Gray / Primary backgrounds | Reduced fixed padding; genuine text wrapping around imagery |
| Native Quote, Text, Text image, Columns, Team | Different key-visual height and Text image layout |
| Native buttons, labels, destinations | Active/inactive styles, wrapping and `aria-current` |
| Image selection and focal point | Circular portrait component and consistent head scaling |
| Short profile details in Job title | Separate role/affiliation/biography/ORCID fields and icons |

These limitations do not inherently apply to new standalone HTML. Do not import an entire demo stylesheet into Craft: scope extensions to the intended committee/component. Content changes must preserve shared headers, footers and navigation.

## 12. CSS foundation for new applications

These tokens combine verified brand colours with explicit recommendations. They are a starting point for new applications, not a drop-in replacement for live CSS or newsletter production.

```css
:root {
  --efi-blue: #064a89;
  --efi-coral: #de5757;
  --efi-ink: #232424;
  --efi-white: #ffffff;
  --efi-surface: #f4f6f9;
  --efi-light: #eaeaea;
  /* Project advice, not formally adopted global EFI tokens */
  --efi-muted: #5e6568;
  --efi-line: #dfe4e8;
  --efi-font: Montserrat, Arial, sans-serif;
  --efi-radius: 4px;
  --efi-space: 8px;
  --efi-reading-width: 70ch;
}
.efi-content { color: var(--efi-ink); font-family: var(--efi-font); }
.efi-content a { color: var(--efi-blue); text-underline-offset: .18em; }
.efi-content :focus-visible {
  outline: 3px solid var(--efi-blue);
  outline-offset: 3px;
  box-shadow: 0 0 0 3px white;
}
.efi-primary { background: var(--efi-blue); color: white; }
.efi-secondary { background: var(--efi-coral); color: black; }
.efi-light { background: var(--efi-light); color: black; }
@media (prefers-reduced-motion: reduce) {
  .efi-content * { scroll-behavior: auto; transition: none; }
}
```

## 13. Delivery checks

- Source labels distinguish established facts from recommendations.
- Original logo, sufficient contrast and visible keyboard focus.
- One H1, logical headings, descriptive links and visible input labels.
- No page overflow; check mobile, desktop and 200% text enlargement.
- Record crop, alt text, provenance, permission and AI status.
- No invented portraits, patient information, scientific labels or partnerships.
- Explicit dates, time zones, access requirements and technical versions.
- Public content contains no internal instructions or TEST links when published to production.
- Distinguish implemented behaviour from desired design when CMS limitations apply.

## 14. Source register and limitations

| Source | Examination / evidence | Use |
| --- | --- | --- |
| [EFI live homepage](https://efi-web.org/) | 15 October 2026; HTML retained | Font files, logo assets, communications structure |
| [Live stylesheet app-CuN1gcb3.css](https://efi-web.org/dist/assets/app-CuN1gcb3.css) | 15 October 2026; local snapshot | Exact colours, body/heading scales, breakpoint and buttons |
| [EFI newsletter archive](https://efi-web.org/about-efi/efi-newsletters) | 15 October 2026 | Source location for newsletter 100 |
| [EFI Newsletter 100](https://efi-web.org/uploads/files/EFI_nr_100r1.pdf) | March 2023; cover, editor's page 3 and table page 8 visually examined; font resources extracted | Editorial styling, Open Sans/Noto Serif; advertising fonts excluded |
| [BITCom vacancy notice](https://efi-web.org/news/two-vacancies-on-the-bioinformatics-it-committee) | 15 October 2026 | Current official communication as content reference |
| [Earlier Science preview](https://espierin.github.io/efi-science-pages-preview/01-science-at-efi.html) | Local project files examined | Historical design context, not current live CSS |
| `sources/EFI_COMMITTEE_STYLE_GUIDE_2026-10-06.md` | Local copy from earlier EFI project | Existing committee agreements and technical limitations |

Additional local sources: `bitcom/CRAFT_LAYOUT_HANDOFF.md`, `bitcom/efi-craft-prototype.css`, `PHOTO_SOURCES.md`, `assets/science-craft/image-prompts.txt` and `bitcom/assets/key-visuals/GENERATION_NOTES.md` in the earlier EFI Scientific Committee project. Older handoff passages describe text menus; the later guide reports native buttons on all sixteen committee pages and takes precedence.

The former newsletter 104 URL returned homepage HTML on direct download, although indexed PDF text remained available. No fonts or image measurements were derived from that issue. The misleading `.pdf` download was not retained as a PDF source. Private emails, authenticated newsletter archives and official print/brand manuals were not examined. Pantone, CMYK, official logo clear space and an exact current newsletter production template remain unverified.

Keep this guide with its source snapshot. Recheck current CSS, newsletter production template and CMS capabilities for the next version. Access dates are not source publication dates.


## Module convention: logarithmic MFI axes by default

Every MFI axis in the EFI EPT module defaults to a logarithmic scale (log10). This applies to all current and future chart types, both vendors, Merge and Separate, IgG SAB, C1q and C3d, every locus selection and report exports. New charts start with Log active; any linear view requires an explicit user choice. Changing filters, assay or Merge / Separate does not automatically switch the scale to linear.

Show original MFI units with an explicit logarithmic-scale label and decade ticks, for example 10, 100, 1,000 and 10,000. The range follows valid positive data; positive values below 10 remain visible when present. Use matching axis limits for directly comparable panels. Tooltips and tables retain original measurements.

Zero and negative values cannot be placed on a pure logarithmic axis. Preserve these source values unchanged, explicitly exclude them from log-density estimation and report their counts separately; no silent replacement with 1, clipping or pseudocount. Missing values remain distinct from zeros. Estimate violin density on log10 of valid positive selected peer values, labelling the axis in original MFI units. Merge uses pooled vendor data; Separate uses data per vendor. Record this method in report metadata.

## EPT report controls

Use the label **Technique** before SAB/C1q/C3d and **Locus** before the locus buttons; Dutch uses **Techniek** for Technique. Both rows share a 120px label column, 12px column gap and minimum 44px button height; SAB and A align. Stack labels above their groups on narrow screens. Active Technique controls use EFI navy and active Locus controls coral. Available deselected controls use grey backgrounds with the group activation colour as outline; disabled controls remain distinct. Shape identifies vendor and colour identifies own versus peer data. See the [build specification](../docs/BUILD_DESIGN_EN.md) for complete behaviour.

### Technique and Locus button colour states

| Group | Active | Available, deselected | Disabled |
| --- | --- | --- | --- |
| Technique | Navy #064A89 background, white text | Grey #F4F6F9 background, 2px navy #064A89 border and navy text | Grey background, muted grey border/text, disabled state |
| Locus | Coral #DE5757 background, dark #232424 text | Grey #F4F6F9 background, 2px coral #DE5757 border and dark #232424 text | Grey background, muted grey border/text, disabled state |

Use the existing EFI coral token for locus controls; no new brand colour is introduced. The control group label distinguishes this use from own-result markers. Keep button border width constant between states to prevent layout shifts. Hover/focus must preserve group identity and a visible focus outline. The existing navy/coral chart-point convention remains unchanged.

## Mandatory build conditions: vector and banner

Visualisations use native vector/SVG wherever practicable; all icons and pictograms are SVG. A raster image wrapped in SVG is not a vector deliverable. PNG is a preview or explicit fallback. Keep original editable assets and vector chart exports. Decorative molecular antibody/HLA art may remain raster.

Blue EPT banners use the official white EFI logo from `assets/logo-white.svg` directly on navy, without a white tile, retaining original proportions and breathing room. Desktop report target: 64–80px high. Molecular art stays restrained on the right with a calm readable text zone. The build places original logo SVGs directly; generative mockups do not define new logo geometry.

## Persistent top navigation

The navigation above the banner stays visible while scrolling using `position: sticky; top: 0` and an appropriate z-index. Use an opaque white background and subtle separator. When responsive rows wrap, measure the actual navigation height for `scroll-padding-top` and section offsets so anchors are not hidden. Keyboard focus remains visible; print layouts may hide the menu.

## Public visual edition

The [general visual EFI foundation guide](https://espierin.github.io/ept/efi-style_EN.html) is on GitHub with swatches, Montserrat weights, original logos and button examples. The [EPT guide](https://espierin.github.io/ept/style_EN.html) links to it and defines module-specific interactions. The Dutch label is Techniek; English uses Technique.

## Language and dashboard navigation

Use a friendly, direct voice. Dutch interface copy uses je, jij and jouw. Participating laboratories and EPT providers each have a separate dashboard. Keep dashboard selection and language switching available in the sticky top navigation. Do not use em dashes in authored documentation or website copy; use a full stop, comma or ordinary hyphen.

## Logarithmic axis subdivisions

The MFI axis defaults to log10. Major ticks mark powers of ten. Each decade contains short axis ticks for multiples 2 through 9, positioned logarithmically. These subdivisions do not extend as gridlines into the chart. Linear mode has no logarithmic minor ticks. SVG export preserves the subdivisions.

## MFI display

Display MFI values as rounded integers with no dot, comma or space as a thousands separator. Apply this to tables, axis labels and tooltips in both languages. Example: 8001.5 is displayed as 8002. Calculations, point positions and CSV/JSON data exports retain original precision; SVG export follows the visual integer display.

## Both demo classes and a fixed MFI axis

The public demo includes class I (four HLA beads) and class II (five HLA beads), each with its own CSV and EDS lot file. Admin and provider receive both demo classes after sign-in. A participant first confirms a public demo import; the other demo class is then added automatically. This applies only to the public demo. User-selected files do not automatically mix with demo data. Use buttons I and II to switch. Data, lot, loci, measurement section and consensus remain separate by class; signing out clears both imports.

All MFI charts use a fixed visible range from 1 through 30000 in both logarithmic and linear modes. The log axis has major ticks at 1, 10, 100, 1000, 10000 and the upper limit 30000, with short logarithmic subdivisions on the axis only. Values outside the visible range receive dashed boundary markers and are counted in the chart explanation. Source data, calculations and numeric exports retain their original values. Ticks at 10, 100, 1000 and 10000 are longer than minor ticks. Values above 30000 are plotted at exactly 30000. Fixing the axis does not change measurements.

Five additional browser checks in `app/tests/classes.cjs` cover default class II import, paired DQ/DP specificities, switching back to class I, both fixed axes, values below 1 and above 30000, export precision and clearing both classes on sign-out.
