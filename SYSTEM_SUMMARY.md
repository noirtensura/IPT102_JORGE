# EcoSort - System Summary

**Phase:** Interactive front-end prototype. Backend and AI work remain deferred.
**Local address:** http://localhost/IPT_JORGE/

## Purpose and limits

EcoSort helps users preview a waste item, review preparation guidance, and save a scan to History. History ranks material types by saved scans and lists recent items.

- Results and confidence scores are preset examples. Uploaded images are not analyzed.
- Photos remain in the browser as object URLs. No external APIs, database, or authentication.
- Camera mode loads an illustrated sample without accessing camera hardware.
- A session starts with five sample records. Refreshing restores those samples and clears additions.
- Scan counts do not establish that an item was recycled. Confirm acceptance with the local collector.

## Screens and navigation

The landing page provides four walkthrough cards: Start, Scan, Result, and History. Desktop and phone show one card at a time, automatically advancing every five seconds and looping after the last card. Left/right buttons allow manual navigation and restart the interval. Pause/Play controls playback; focus inside a card pauses it during interaction. Playback stops when the document is hidden or the user leaves the walkthrough. Step tabs, keyboard-arrow shortcuts, and scroll hints are removed. The welcome card uses a static illustration from `assets/mascots/sheet-4.png`. Demo previews do not modify saved records.

The bottom navigation contains **Scan, Overview, History, and Guide**. It is hidden on the landing page. The product brand returns to the walkthrough.

1. **Scan** (`scan.php`): upload or drop a photo, or use a sample. Select the preset material and view the sample result. Reset or navigation cancels processing.
2. **Result** (`scan-result.php`): review the material, illustrative score, and preparation tip. Save to History, scan again, or continue to Overview. Duplicate saves are prevented.
3. **Overview** (`overview.php`): reopen the latest result, start another scan, or open History and Guide.
4. **History** (`history.php`): material counts sorted from most to least scanned, followed by searchable and filterable recent records. Counts include all saved records, starter samples, and uncertain items. Search and material filters affect the recent list; the overall ranking stays visible. Record details link to the material guide. Clearing requires confirmation; sample records can be restored.
5. **Guide** (`waste-guide.php`): search or filter materials, expand preparation checklists, and read special-handling precautions. A material query such as `?material=glass` expands the matching card.

Analytics and the interactive helper are removed. Only sheet-4 is used for walkthrough artwork. The old `analytics.php` URL and `#analytics` bookmarks redirect to History.

## Implementation

| File | Responsibility |
|---|---|
| `index.php`, `.htaccess` | Redirect root and legacy HTML entry points to the landing page. |
| Six PHP screen entries | Set a page title and load the shared layout. |
| `includes/layout.php` | Metadata, local assets, brand, navigation, footer, About/record/clear dialogs, toast, and skip link. Direct access returns 404. |
| `includes/icons.php` | Local SVG icons and material illustrations. |
| `assets/css/styles.css` | Shared neumorphic tokens, controls, panels, dialogs, responsive layouts, and reduced-motion styles. |
| `assets/js/data.js` | Five materials and five starter records. |
| `assets/js/pages.js` | Screen templates, escaping, filtering, and material ranking. |
| `assets/js/walkthrough.js` | Five-second playback, synchronized horizontal slides, smooth height changes, manual controls, interactive previews, and timer/animation cancellation. |
| `assets/js/app.js` | In-memory state, client routing, image validation, processing, and record actions. |
| `design-system/ecosort-ai/MASTER.md` | Current layout and style rules. |

Same-origin links use the History API so records and uploaded previews survive screen changes. Direct PHP URLs and browser back/forward remain supported. Legacy `#home` and `#guide/paper` bookmarks migrate to the current URLs.

## Design and accessibility

- Canvas: `#e8eeea`; section/card backgrounds: `#93C572`. Green sections use matching shadows, darker supporting text (`#354b31`), and deeper green actions (`#174b2f`) for readable contrast.
- Raised panels and buttons use paired light/dark shadows. Fields, previews, selected tabs, and active navigation use inset shadows.
- Short instructions replace marketing copy and repeated notices.
- Hierarchy uses 32-40 px page titles, 28-32 px feature titles, 24 px sections, 18 px card titles, 16 px body text, 14 px supporting text, and 12 px metadata. Spacing groups related content at 12/24/32 px intervals.
- One primary action leads each workflow state: Capture before a camera sample is ready, then View sample result; Save to History on a new result, then Continue to Overview once saved. Secondary controls and nested panels have quieter emphasis.
- Visible keyboard focus, labeled fields, native dialogs, heading focus after navigation, and live feedback remain.
- Controls retain at least 44 px touch targets; phone inputs use 16 px text.
- Material names and counts accompany the illustrations. Reduced-motion preferences disable walkthrough transitions.

## Validation and data handling

Uploads accept non-empty JPEG, PNG, or WebP files up to 10 MB and 40 megapixels. The browser must decode the image successfully. Multi-file drops are rejected. Unused object URLs are revoked; images retained by saved records remain available.

User filenames and search strings are escaped before rendering. The Content Security Policy blocks external connections, embedded objects, and external scripts. Disposal guidance retains precautions for pressurized containers, broken glass, batteries, chemicals, electronics, and sharps.

## Checks

Run `node tests/run.mjs` with XAMPP Apache running.

- `tests/prototype.test.html`: routing, walkthrough controls, scan/result flow, duplicate-save prevention, upload errors, safe filenames, material rankings, filtering, details, clear/restore, legacy redirects, and responsive layouts at 375/768/1024/1440 px.
- `tests/walkthrough-motion.test.html`: native step transitions and cancellation on step changes or navigation.
- `tests/mobile-preview.html`: screenshot harness for every screen at desktop and phone sizes.
- `tests/run.mjs`: PHP delivery checks, browser suites, and screenshots in `artifacts/`.
