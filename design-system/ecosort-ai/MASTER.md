# EcoSort — Phase 1 design

## Product and journeys

An educational waste-sorting assistant for students, households, and communities. Keep each screen focused and sample predictions distinct from real identification.

1. Landing → Proceed → Scan → Scan Result → Continue to Overview.
2. Bottom navigation → History → search / material filter → record details.
3. Bottom navigation → Guide → check preparation tips and special handling.

## Sitemap

```text
Landing (landingpage.php; root redirects here)
  Proceed → Scan (scan.php)
    Scan Result (scan-result.php)
      Continue to Overview (overview.php)
Bottom navigation, all app screens and viewport sizes:
  Scan | Overview | History | Guide
Record details / About (dialogs)
```

## Layout

- Landing: four walkthrough cards: Start, Scan, Result, History. Show one at a time on desktop and phone, advance every five seconds, and loop after the final card. Provide left/right buttons and Pause/Play. Remove step tabs and keyboard-arrow shortcuts. Keep Start scanning available and hide the bottom bar here.
- Scan: step heading, compact demo disclosure, upload / simulated camera, preview, sample material selector, view result, reset / cancel.
- Result: separate page with image, category, illustrative score, guidance, optional save, Continue to Overview, and Scan Again.
- Overview: scan action, latest result, and shortcuts to History and Guide.
- History: material counts sorted from most to least scanned, followed by searchable recent records, details, clear confirmation, and sample restoration. Counts use all saved records, including starter samples and uncertain results; table filters do not change the overall ranking. Do not claim completed recycling.
- Guide: search, material filter, expandable cards, and special-handling guidance.
- Bottom navigation: four labeled icon destinations, a recessed active state, safe-area padding, and at least 44 px touch targets. Reserve scroll space for the last control.
- Screen changes focus the new h1 and open at the top. Browser back/forward and direct PHP URLs stay usable. Guide material links use waste-guide.php?material=plastic. Shared layout and view files keep the six screen entries consistent. analytics.php and legacy #analytics bookmarks redirect to History.

## Visual direction

Use neumorphism throughout: a shared pale sage canvas, paired light and dark shadows for raised panels and buttons, and inset shadows for fields, previews, and selected navigation. Keep forest-green primary actions, readable text, visible input borders, and clear keyboard focus. Use direct instructions and avoid marketing copy or repeated disclosures. Name the product EcoSort. Use only sheet-4 as a static illustration in the walkthrough; keep the interactive helper removed. Native controls handle files, selections, disclosure, and dialogs; no new dependency is needed.

Follow a clear hierarchy: page title, section or card title, instructions, action, then metadata. Keep one filled green next action per workflow state. On a new result, Save to History leads; after saving, Continue to Overview leads. Capture leads in camera mode until a sample is ready. Disabled actions are neutral. Use quiet metadata and secondary controls, align content edges, and reserve the strongest shadows for outer panels. Supporting panels and illustrations use smaller shadows; related details use a soft inset.

| Token | Value / use |
|---|---|
| Canvas / neutral controls | `#e8eeea` |
| Section and card surface | `#93C572` |
| Text | `#202f26` |
| Muted text | `#526458` on canvas; `#354b31` on green sections |
| Primary | `#20613e` on canvas; `#174b2f` in green sections; white button text |
| Forest | `#214a33` |
| Sage | `#dce8de` |
| Border | `#c9d4cc` |
| Neutral raised shadow | `8px 8px 18px #c4cec7, -8px -8px 18px #ffffff` |
| Neutral inset shadow | `inset 5px 5px 11px #c4cec7, inset -5px -5px 11px #ffffff` |
| Green section shadows | Soft forest/white outer shadows; `#7ca75f` / `#ace686` control and inset shading |
| Caution | `#93601f` |
| Error | `#af3430` |
| Type | Local Segoe UI / system sans-serif; 16 px body, 14 px supporting text, 12 px metadata |
| Heading scale | 32–40 px page titles; 28–32 px feature titles; 24 px sections; 18 px card titles |
| Corners | 12–14 px controls; 18–22 px panels |
| Spacing | 12 px within groups; 24 px between related blocks; 32 px between sections |
| Motion | Short color transitions; demo spinner; reduced-motion override |

Use text and material illustrations alongside color. Primary controls target at least 44 px. Inputs are 16 px on small phones. Use visible keyboard focus, labeled fields, live feedback, native dialog focus management, and a skip link. Decorative SVGs are hidden from assistive technology. Material rankings expose exact counts as text.

## State coverage

- Landing: welcome, Proceed, and return through the brand link.
- Scan: no image, valid preview, image decoding, invalid type, empty / oversized / corrupt image, multi-file drop, simulated camera, cancelable demo loading, reset.
- Result: four material presets, uncertain preset, empty direct link, unsaved / saved.
- History: sample records, new sample record, filters, no matches, no records, confirmation, restored samples.
- Guide: all materials, filtered / expanded card, no search matches, special-handling guidance.

The landing page opens first. Scanning, results, and the overview are separate screens. Results require an explicit Continue to Overview action. Repeating a scan replaces its dedicated result without saving automatically. Navigation cancels pending processing; previous hash bookmarks migrate to their named PHP URLs.

The visual review is not backend approval. Phase 2 stays deferred until explicitly authorized.

## Walkthrough motion

Use synchronized 600 ms full-width horizontal slides for the incoming and outgoing cards, with a smoothly resized carousel height. Keep outgoing cards inert and hidden from assistive technology, then hide them visually when their animation finishes. Remove the visible card count/title indicator; retain left/right and Pause/Play controls. Cancel old animations and disconnect size observers on navigation. Stop playback and demo timers when leaving the walkthrough. Pause playback while a card has focus or the document is hidden. Respect reduced-motion preferences and keep all instructions usable without animation. Phone layouts use the same carousel and touch-sized controls as desktop.
