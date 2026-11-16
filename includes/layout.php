<?php
if (!isset($pageTitle)) {
    http_response_code(404);
    exit;
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="EcoSort helps you understand everyday waste materials and build better sorting habits.">
  <meta name="theme-color" content="#e8eeea">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'none'; object-src 'none'; base-uri 'self'">
  <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?> · EcoSort</title>
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/css/styles.css">
  <script src="assets/js/data.js" defer></script>
  <script src="assets/js/pages.js" defer></script>
  <script src="assets/js/walkthrough.js" defer></script>
  <script src="assets/js/app.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <?php require __DIR__ . '/icons.php'; ?>

  <a class="brand site-brand" href="landingpage.php" aria-label="EcoSort welcome page"><span class="brand-mark"><svg class="icon" aria-hidden="true"><use href="#i-leaf"/></svg></span><span>EcoSort</span></a>
  <span id="page-label" class="sr-only" aria-live="polite">Welcome</span>

  <div class="app-shell">
    <main id="main" tabindex="-1"><noscript><div class="empty-state"><h1>EcoSort needs JavaScript</h1><p>Enable JavaScript to explore EcoSort. Your images stay in your browser.</p></div></noscript></main>
    <footer class="app-footer"><button class="text-button" data-action="about">About EcoSort</button></footer>
  </div>

  <nav id="bottom-nav" class="bottom-nav" aria-label="Main navigation" hidden>
      <a class="nav-link" href="scan.php"><svg class="icon" aria-hidden="true"><use href="#i-scan"/></svg>Scan</a>
      <a class="nav-link" href="overview.php"><svg class="icon" aria-hidden="true"><use href="#i-grid"/></svg>Overview</a>
      <a class="nav-link" href="history.php"><svg class="icon" aria-hidden="true"><use href="#i-history"/></svg>History</a>
      <a class="nav-link" href="waste-guide.php"><svg class="icon" aria-hidden="true"><use href="#i-book"/></svg>Guide</a>
  </nav>
  <dialog id="about-dialog" class="modal" aria-labelledby="about-title"><div class="dialog-heading"><h2 id="about-title">About EcoSort</h2><button class="icon-button" data-action="close-dialog" aria-label="Close about EcoSort"><svg class="icon"><use href="#i-close"/></svg></button></div><p>A demo for sorting everyday materials.</p><ul class="check-list"><li>Preset results and five starter records.</li><li>Photos stay in your browser and aren’t analyzed.</li><li>Saved scans clear on refresh.</li><li>Camera mode is simulated.</li></ul><p class="fine-print">Check your barangay / LGU or collector’s rules before recycling.</p><button class="button primary full-width" data-action="close-dialog">Got it</button></dialog>
  <dialog id="record-dialog" class="modal" aria-labelledby="record-title"></dialog>
  <dialog id="clear-dialog" class="modal small-modal" aria-labelledby="clear-title"><div class="dialog-heading"><h2 id="clear-title">Clear history?</h2><button class="icon-button" data-action="close-dialog" aria-label="Cancel clearing history"><svg class="icon"><use href="#i-close"/></svg></button></div><p>This removes sample and saved records in this tab. Refreshing the page restores the original sample records.</p><div class="button-row"><button class="button secondary" data-action="close-dialog" autofocus>Keep records</button><button class="button danger" data-action="confirm-clear">Clear history</button></div></dialog>
  <div id="toast" class="toast" role="status" aria-live="polite" aria-atomic="true" hidden></div>
</body>
</html>
