# EcoSort

An educational waste-sorting prototype built with PHP and local JavaScript.

Open **http://localhost/IPT_JORGE/** with XAMPP Apache running. No install, build command, database, or API key is required. Serve the project through XAMPP Apache so PHP is executed.

## What you can try

- **Landing:** four walkthrough cards with a static illustration from sheet-4. Cards slide smoothly every five seconds on desktop and phone, with matching height transitions. Use the left/right buttons or Pause/Play; step indicators and keyboard-arrow shortcuts are removed. Start scanning is always available.
- **Scan:** preview a local JPEG, PNG, or WebP (up to 10 MB / 40 megapixels), drag and drop an image, or capture an illustrated sample in the simulated camera. This screen only contains the scanner.
- **Scan Result:** choose a scripted Plastic, Paper, Metal, Glass, or Uncertain scenario. Completing a scan opens a separate result screen with illustrative confidence, educational guidance, and an optional Save to History action.
- **Overview:** reopen the latest result, start a scan, or open History and Guide.
- **History:** see your most-scanned materials, search and filter saved records, open details, clear records after confirmation, and restore samples.
- **Waste Guide:** search common items, filter materials, and expand preparation tips and special-handling reminders.

The flow is **Landing → Scan → Scan Result → Overview**. The bottom navigation provides Scan, Overview, History, and Guide on desktop and mobile. It stays hidden on the landing page. About remains in the footer. Analytics and the interactive helper are removed.

Each screen has a named PHP URL. The root redirects to the landing page:

| Screen | URL |
|---|---|
| Landing | [/landingpage.php](http://localhost/IPT_JORGE/landingpage.php) |
| Scan | [/scan.php](http://localhost/IPT_JORGE/scan.php) |
| Scan Result | [/scan-result.php](http://localhost/IPT_JORGE/scan-result.php) |
| Overview | [/overview.php](http://localhost/IPT_JORGE/overview.php) |
| History | [/history.php](http://localhost/IPT_JORGE/history.php) |
| Waste Guide | [/waste-guide.php](http://localhost/IPT_JORGE/waste-guide.php) |

Guide deep links use `waste-guide.php?material=plastic`. Shared JavaScript uses the History API to preserve results, selected images, and records across navigation. Screen changes focus the heading and cancel pending processing. Direct PHP URLs, browser back/forward, and legacy bookmarks remain supported. The old `analytics.php` URL and `#analytics` bookmark redirect to History.

Try the **Uncertain** scenario on Scan to see the low-confidence state. Refreshing restores the five original sample records and discards selected images and saved results.

## Scope and implementation

Six PHP screen entries share the layout, navigation, dialogs, and neumorphic stylesheet. Screen templates stay in one presentation file. A future classifier API remains separate work.

The design uses a shared heading scale, readable instructions, smaller metadata, and consistent spacing. Section and card backgrounds use `#93C572` with matching shadows and dark text. Each workflow state has one primary action: new results emphasize Save to History, then Continue to Overview after saving. Supporting controls, illustrations, and nested cards use quieter shadows.

## File organization

```text
IPT_JORGE/
  index.php                 Root redirect
  landingpage.php           Welcome page entry
  scan.php                  Scanner entry
  scan-result.php           Result entry
  overview.php              Overview entry
  history.php               History entry
  analytics.php             Legacy redirect to History
  waste-guide.php           Guide entry
  includes/
    layout.php              Shared HTML, navigation, dialogs, and script loading
    icons.php               Shared SVG symbols
  assets/
    css/styles.css          Responsive styles
    js/data.js              Material definitions and five starter records
    js/pages.js             Screen markup and presentation helpers
    js/walkthrough.js       Landing walkthrough step navigation and demo controls
    js/app.js               Routing, scan flow, state, and interaction handlers
    mascots/sheet-4.png      Static walkthrough illustration
    favicon.svg
  tests/                    Browser checks and preview fixtures
  artifacts/                Generated screenshots and check report
  design-system/            Design notes
  .htaccess                 Legacy index.html route
  README.md
```

Assets are local SVGs and the unchanged `assets/mascots/sheet-4.png`, cropped with CSS for the welcome illustration. No other mascot sheets or interactive helper are used. Uploaded images stay in browser blob URLs; unused URLs are released. File type, size, successful decoding, and dimensions are checked, and filenames are escaped before display.

Results and scores are preset examples; photos are not analyzed. History ranks saved scans, including the five starter samples. Counts do not confirm completed recycling. Disposal tips depend on local barangay / LGU and collector acceptance. The prototype has no external requests, dependencies, authentication, database, or persistent browser storage.

The [design notes](design-system/ecosort-ai/MASTER.md) contain the sitemap, layout sketches, and visual rules. Named PHP files work directly in Apache; browser back/forward preserves the current in-memory session. Only the legacy HTML entry uses a rewrite rule.

## Verification

With XAMPP Apache running and Node.js 22+ plus Chrome or Edge installed:

```powershell
node --check assets/js/data.js
node --check assets/js/pages.js
node --check assets/js/walkthrough.js
node --check assets/js/app.js
node tests/run.mjs
```

The runner verifies all six PHP screens, titles, redirects, navigation, walkthrough controls and artwork, scan results, uploads, safe filenames, saved history and material rankings, filters, details, clear/restore, and responsive layouts at 375, 768, 1024, and 1440 px. `tests/walkthrough-motion.test.html` checks transition cancellation; the main suite covers reduced motion. Checks use disposable browser profiles and save desktop/mobile screenshots to `artifacts/`.

The default test URL is `http://localhost/IPT_JORGE/`. To use the same Apache/PHP site through another local host address:

```powershell
node tests/run.mjs http://127.0.0.1/IPT_JORGE/
```

Screenshots are written to `artifacts/`. Open `tests/prototype.test.html` through the same server to see the checks run visibly. Physical-device and screen-reader testing and confirmation of a particular municipality’s disposal rules remain manual review items.

## UI review status

Phase 1 interface: polished product wording with five clearly labeled starter sample records; ready for review. **User UI/UX approval: pending.**

Backend classification, training, persistent storage, authentication, and cloud integration remain deferred.
