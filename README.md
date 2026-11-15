# EcoSort AI

An educational waste-sorting interface implemented from `EcoSort_AI_Plan.md` (Phase 1).

Open **http://localhost/IPT_JORGE/** with XAMPP Apache running. No install, build command, database, or API key is required. Serve the project through XAMPP Apache so PHP is executed.

## What you can try

- **Landing:** interactive 4-step walkthrough with Eco—scroll down step by step on mobile, or step left and right with arrow controls and keyboard arrow keys on desktop—plus a Skip demo & proceed link.
- **Scan:** preview a local JPEG, PNG, or WebP (up to 10 MB / 40 megapixels), drag and drop an image, or capture an illustrated sample in the simulated camera. This screen only contains the scanner.
- **Scan Result:** choose a scripted Plastic, Paper, Metal, Glass, or Uncertain scenario. Completing a scan opens a separate result screen with illustrative confidence, educational guidance, and an optional Save to History action.
- **Overview:** choose Continue to Overview to see session counts and a compact latest-result summary. Reopen that result or start another scan.
- **History:** search and filter sample / saved records, open details, clear records after confirmation, and restore samples.
- **Analytics:** accessible category bars and a distribution donut with a text/data-table equivalent. Counts reflect the current in-memory history.
- **Waste Guide:** search common items, filter materials, and expand preparation tips and special-handling reminders.
- **Ask Eco:** the floating mascot answers material and app questions with built-in guidance. All six sheets and 36 poses react to the current action or question.

The flow is **Landing → Proceed → Scan → Scan Result → Overview**. The bottom navigation provides Scan, Overview, History, Analytics, and Guide on desktop and mobile. It stays hidden on the landing page. No feature screen is embedded in another; the hamburger menu is removed. About remains in the footer.

Each screen has a named PHP URL. The root redirects to the landing page:

| Screen | URL |
|---|---|
| Landing | [/landingpage.php](http://localhost/IPT_JORGE/landingpage.php) |
| Scan | [/scan.php](http://localhost/IPT_JORGE/scan.php) |
| Scan Result | [/scan-result.php](http://localhost/IPT_JORGE/scan-result.php) |
| Overview | [/overview.php](http://localhost/IPT_JORGE/overview.php) |
| History | [/history.php](http://localhost/IPT_JORGE/history.php) |
| Analytics | [/analytics.php](http://localhost/IPT_JORGE/analytics.php) |
| Waste Guide | [/waste-guide.php](http://localhost/IPT_JORGE/waste-guide.php) |

Guide deep links use `waste-guide.php?material=plastic`. Shared JavaScript changes the URL with the browser History API, preserving the current result, selected image, conversation, and records while you navigate. Direct URLs and refreshes load the same shared layout through PHP. Transitions focus the new heading, open at the top, and cancel pending processing. Older hash bookmarks, including `#home`, migrate to the named URLs; `.htaccess` keeps the old `index.html` entry working on Apache.

Try the **Uncertain** scenario on Scan to see the low-confidence state. Refreshing restores the five original sample records and discards selected images and saved results.

## Scope and implementation

Use PHP consistently for page entry points because this project runs in XAMPP. Each entry sets its title and includes the common layout; screen markup stays in one shared presentation file. This avoids copying navigation, dialogs, or styling into seven pages. Python is not needed for page routing; a future classifier API remains separate work.

## File organization

```text
IPT_JORGE/
  index.php                 Root redirect
  landingpage.php           Welcome page entry
  scan.php                  Scanner entry
  scan-result.php           Result entry
  overview.php              Overview entry
  history.php               History entry
  analytics.php             Analytics entry
  waste-guide.php           Guide entry
  includes/
    layout.php              Shared HTML, navigation, dialogs, and script loading
    icons.php               Shared SVG symbols
  assets/
    css/styles.css          Responsive styles
    js/data.js              Material definitions and five starter records
    js/pages.js             Screen markup and presentation helpers
    js/walkthrough.js       Landing walkthrough step navigation and demo controls
    js/app.js               Routing, scan flow, state, Eco, and interaction handlers
    mascots/sheet-1.png ... sheet-6.png
    favicon.svg
  tests/                    Browser checks and preview fixtures
  artifacts/                Generated screenshots and check report
  design-system/            Design notes
  .htaccess                 Legacy index.html route
  README.md
```

Assets are local SVGs and all six original robot mascot PNG sheets, copied unchanged to `assets/mascots/sheet-1.png` through `sheet-6.png`. All 36 poses have contextual roles, displayed with CSS sprite coordinates. The app has no external fonts, requests, dependencies, analytics, authentication, database, or persistent browser storage. Uploaded images use browser blob URLs and are never transmitted; unused image URLs are released when previews / records stop referencing them. File type, size, successful image decoding, and dimensions are checked before a preview is accepted. Filenames are escaped before display.

Eco greets new users, inspects material examples, focuses while an image or sample result is loading, celebrates results and saves, looks thoughtful for uncertainty or errors, presents history and analytics, and reads along in the guide. A large welcoming mascot appears on the landing page, with contextual portraits in the scanner and page headings. The launcher and coach use complementary poses. Short native browser animations are canceled on state changes; reduced-motion preferences keep the artwork still. The six sheets load as needed and are reused from the browser cache.

Eco uses built-in topic matching and the existing Waste Guide; no live language model is connected. Ambiguous materials prompt checking, hazardous items receive special-handling guidance, and unsupported questions receive a fallback. Questions are rendered as text and stay in memory until the page is refreshed. The helper does not classify images or verify a municipality’s current collection rules.

All classifications and scores are explicitly scripted. Selecting a different scenario changes the example result; the image itself is not analyzed. Analytics describe demo record counts, not measured waste, real recycling, diversion, or AI accuracy. General disposal tips are conditional on local barangay / LGU and collector acceptance.

The [design notes](design-system/ecosort-ai/MASTER.md) contain the sitemap, layout sketches, and visual rules. Named PHP files work directly in Apache; browser back/forward preserves the current in-memory session. Only the legacy HTML entry uses a rewrite rule.

## Verification

With XAMPP Apache running and Node.js 22+ plus Chrome or Edge installed:

```powershell
node --check assets/js/data.js
node --check assets/js/pages.js
node --check assets/js/app.js
node tests/run.mjs
```

The runner first verifies all seven PHP pages, rendered titles, the root redirect, and the legacy entry. The dependency-free browser checks cover navigation, demo results, duplicate-save prevention, local image previews, invalid / corrupt / oversized files, sample processing cancellation, safe filename rendering, in-memory history, filter/search, record details, guide controls, charts, empty states, bottom navigation, isolated screens, direct PHP URLs, legacy bookmarks, keyboard tab switching, all 36 contextual mascot poses, and horizontal overflow at 375, 768, 1024, and 1440 px. A separate fixture emulates the JavaScript motion preference to check native browser animation creation and cancellation; the main suite verifies reduced motion. They use a disposable headless browser profile and do not touch your normal browser profile.

The default test URL is `http://localhost/IPT_JORGE/`. To use the same Apache/PHP site through another local host address:

```powershell
node tests/run.mjs http://127.0.0.1/IPT_JORGE/
```

Screenshots are written to `artifacts/`. Open `tests/prototype.test.html` through the same server to see the checks run visibly. Physical-device and screen-reader testing and confirmation of a particular municipality’s disposal rules remain manual review items.

## UI review status

Phase 1 interface: polished product wording with five clearly labeled starter sample records; ready for review. **User UI/UX approval: pending.**

Phase 2 is deferred. No AI model, training pipeline, Python endpoint, database, authentication, or cloud integration has been added. Proceed only when the user explicitly finalizes the UI/UX and authorizes backend development.
