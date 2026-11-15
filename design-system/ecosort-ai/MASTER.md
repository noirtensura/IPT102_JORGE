# EcoSort AI — Phase 1 design

## Product and journeys

An educational waste-sorting assistant for students, households, and communities. Keep each screen focused and sample predictions distinct from real identification.

1. Landing → Proceed → Scan → Scan Result → Continue to Overview.
2. Bottom navigation → History → search / material filter → record details.
3. Bottom navigation → Analytics or Guide → explore sample counts or material guidance.

## Sitemap

```text
Landing (landingpage.php; root redirects here)
  Proceed → Scan (scan.php)
    Scan Result (scan-result.php)
      Continue to Overview (overview.php)
Bottom navigation, all app screens and viewport sizes:
  Scan | Overview | History | Analytics | Guide
Record details / About / Ask Eco (dialogs)
```

## Layout

- Landing: headline, large greeting mascot, one Proceed action, three short flow steps. Hide the bottom bar here.
- Scan: step heading and mascot, sample disclosure, upload / simulated camera, large preview, sample material selector, view result, reset / cancel. No overview, history, charts, or guide cards.
- Result: separate page with image, category, illustrative score, guidance, optional save, Continue to Overview, and Scan Again.
- Overview: three session metrics, a compact latest-result summary, and Scan Another Item. No embedded feature lists.
- History: search, filter, records, details, clear confirmation, and sample restoration.
- Analytics: sample metrics, category bars, donut, and equivalent data table.
- Guide: search, material filter, expandable cards, and special-handling guidance.
- Bottom navigation: five labeled icon destinations, a visible active state, safe-area padding, and at least 44 px touch targets. Keep Eco's launcher above it and reserve scroll space for the last control.
- Screen changes focus the new h1 and open at the top. Browser back/forward and direct PHP URLs stay usable. Guide material links use waste-guide.php?material=plastic. Shared layout and view files keep the seven page entries consistent.

## Visual direction

UI/UX Pro Max’s minimal, functional dashboard direction was adapted to the supplied EcoSort palette: forest-green actions, warm sage surfaces, restrained material accents, and generous spacing. Native browser controls handle files, selections, disclosure, and dialogs. No animation library or chart dependency is needed.

| Token | Value / use |
|---|---|
| Background | `#f7f9f5` |
| Surface | `#ffffff` |
| Text | `#202f26` |
| Muted text | `#647065` |
| Primary | `#20613e`, white text |
| Forest | `#214a33` |
| Sage | `#eaf0e3` |
| Border | `#e2e7de` |
| Caution | `#93601f` |
| Error | `#af3430` |
| Type | Local Segoe UI / system sans-serif; 16 px base |
| Corners | 8 px controls; 12–18 px panels |
| Spacing | Primarily 4 / 8 px increments |
| Motion | Short color transitions; demo spinner; reduced-motion override |

Use text and material illustrations alongside color. Primary controls target at least 44 px. Inputs are 16 px on small phones. Use visible keyboard focus, labeled fields, live feedback, native dialog focus management, and a skip link. Decorative SVGs are hidden from assistive technology. Charts expose exact counts and shares as text.

## State coverage

- Landing: welcome, Proceed, and return through the brand link.
- Scan: no image, valid preview, image decoding, invalid type, empty / oversized / corrupt image, multi-file drop, simulated camera, cancelable demo loading, reset.
- Result: four material presets, uncertain preset, empty direct link, unsaved / saved.
- History: sample records, new sample record, filters, no matches, no records, confirmation, restored samples.
- Analytics: populated sample counts and no records; no environmental impact claims.
- Guide: all materials, filtered / expanded card, no search matches, special-handling guidance.

The landing page opens first. Scanning, results, and the overview are separate screens. Results require an explicit Continue to Overview action. Repeating a scan replaces its dedicated result without saving automatically. Navigation cancels pending processing; previous hash bookmarks migrate to their named PHP URLs.

The visual review is not backend approval. Phase 2 stays deferred until explicitly authorized.

## Mascot helper

Use all six user-supplied sheets unchanged. Their 36 poses are assigned to real UX states through `mascotStates` in `assets/js/app.js`: a larger scene portrait and a complementary launcher pose. The landing hero, scanner, and page headings provide room for Eco’s expressions; its name and action caption accompany the artwork.

| User context | Expression / action |
|---|---|
| First visit / reset | Welcome wave / presenting the next item |
| Local image opening / camera / sample processing | Focused scanning and inspection |
| Selected Plastic, Paper, Metal, Glass | Detective pose with the matching material |
| Uncertain result / bad file / unanswered question | Thoughtful or confused, with recovery guidance |
| Result ready / saved / samples restored | Thumbs-up, bounce, or celebration |
| History / empty history | Presenting bins / thoughtful fresh start |
| Analytics | Tablet and charts |
| Waste Guide / help / typing | Reading, greeting, and thinking |
| Multiple materials / local rules | Sorting demonstration / recycling guidance |

Wave, levitation, inspection, nodding, thinking, and celebration animations use the Web Animations API for short, finite reactions. Cancel previous motion before a new state; state correctness never depends on animation completion. Reduced-motion users see the contextual poses without movement, including when their preference changes while an animation is running.

The native help dialog contains a labeled conversation log, suggested questions, a 500-character text field, and links to relevant screens. Questions remain in memory and answers use built-in guidance. Reserve footer space for the launcher and place phone toasts above it.
