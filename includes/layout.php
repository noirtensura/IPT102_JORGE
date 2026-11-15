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
  <meta name="description" content="EcoSort AI helps you understand everyday waste materials and build better sorting habits.">
  <meta name="theme-color" content="#f7f9f5">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'none'; object-src 'none'; base-uri 'self'">
  <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?> · EcoSort AI</title>
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

  <a class="brand site-brand" href="landingpage.php" aria-label="EcoSort AI welcome page"><span class="brand-mark"><svg class="icon" aria-hidden="true"><use href="#i-leaf"/></svg></span><span>EcoSort<span class="brand-ai"> AI</span><small>A little more mindful.</small></span></a>
  <span id="page-label" class="sr-only" aria-live="polite">Welcome</span>

  <div class="app-shell">
    <main id="main" tabindex="-1"><noscript><div class="empty-state"><h1>EcoSort AI needs JavaScript</h1><p>Enable JavaScript to explore EcoSort AI. Your images stay in your browser.</p></div></noscript></main>
    <footer class="app-footer"><span><svg class="icon" aria-hidden="true"><use href="#i-leaf"/></svg>Made for a more mindful tomorrow.</span><button class="text-button" data-action="about">About EcoSort</button></footer>
  </div>

  <nav id="bottom-nav" class="bottom-nav" aria-label="Main navigation" hidden>
      <a class="nav-link" href="scan.php"><svg class="icon" aria-hidden="true"><use href="#i-scan"/></svg>Scan</a>
      <a class="nav-link" href="overview.php"><svg class="icon" aria-hidden="true"><use href="#i-grid"/></svg>Overview</a>
      <a class="nav-link" href="history.php"><svg class="icon" aria-hidden="true"><use href="#i-history"/></svg>History</a>
      <a class="nav-link" href="analytics.php"><svg class="icon" aria-hidden="true"><use href="#i-chart"/></svg>Analytics</a>
      <a class="nav-link" href="waste-guide.php"><svg class="icon" aria-hidden="true"><use href="#i-book"/></svg>Guide</a>
  </nav>
  <dialog id="about-dialog" class="modal" aria-labelledby="about-title"><div class="dialog-heading"><span class="eyebrow">MEET ECOSORT AI</span><button class="icon-button" data-action="close-dialog" aria-label="Close about EcoSort"><svg class="icon"><use href="#i-close"/></svg></button></div><span class="modal-emblem"><svg class="icon"><use href="#i-leaf"/></svg></span><h2 id="about-title">A little knowledge.<br>A more thoughtful sort.</h2><p>EcoSort AI helps you understand everyday materials and make more thoughtful sorting choices.</p><ul class="check-list"><li>Start with five sample records and preset classification examples.</li><li>Your image stays in this browser; it is never uploaded.</li><li>Sample scores are illustrative. Saved records last until you refresh.</li><li>The camera is simulated. No camera permission is requested.</li></ul><p class="fine-print">Material identification doesn’t prove an item is recyclable. Always check your barangay / LGU and local collector’s rules.</p><button class="button primary full-width" data-action="close-dialog">Got it, let’s explore <svg class="icon"><use href="#i-arrow"/></svg></button></dialog>
  <dialog id="record-dialog" class="modal" aria-labelledby="record-title"></dialog>
  <dialog id="clear-dialog" class="modal small-modal" aria-labelledby="clear-title"><div class="dialog-heading"><h2 id="clear-title">Clear history?</h2><button class="icon-button" data-action="close-dialog" aria-label="Cancel clearing history"><svg class="icon"><use href="#i-close"/></svg></button></div><p>This removes sample and saved records in this tab. Refreshing the page restores the original sample records.</p><div class="button-row"><button class="button secondary" data-action="close-dialog" autofocus>Keep records</button><button class="button danger" data-action="confirm-clear">Clear history</button></div></dialog>
  <button id="help-launcher" class="help-launcher" data-action="help" aria-label="Ask Eco, your sorting helper" aria-haspopup="dialog" aria-controls="help-dialog" aria-expanded="false">
    <span class="mascot-portrait" data-mascot-slot="companion" aria-hidden="true"><img src="assets/mascots/sheet-1.png" alt="" width="1536" height="1024"></span>
    <span class="help-launcher-copy"><strong>Ask Eco</strong><small data-mascot-caption>Your sorting sidekick</small></span>
    <svg class="icon" aria-hidden="true"><use href="#i-spark"/></svg>
  </button>
  <dialog id="help-dialog" class="help-dialog" aria-labelledby="help-title" aria-describedby="help-description">
    <header class="help-header">
      <span class="mascot-portrait" data-mascot-slot="scene" aria-hidden="true"><img src="assets/mascots/sheet-1.png" alt="" width="1536" height="1024" loading="lazy"></span>
      <div><span class="eyebrow">A LITTLE HELP FROM ECO</span><h2 id="help-title">Your sorting sidekick.</h2><p id="help-description">Built-in waste &amp; app guidance</p></div>
      <button class="icon-button" data-action="close-dialog" aria-label="Close Eco helper"><svg class="icon" aria-hidden="true"><use href="#i-close"/></svg></button>
    </header>
    <div id="help-messages" class="help-messages" role="log" aria-label="Conversation with Eco" aria-live="polite" aria-relevant="additions text">
      <article class="help-message"><span class="help-speaker">Eco</span><p>Hi, I’m Eco! Let’s make sorting a little simpler. Ask me about a material, or I can show you around EcoSort.</p></article>
    </div>
    <div class="help-shortcuts" aria-label="Suggested questions">
      <button data-action="help-question" data-question="How do I scan an item?">How do I scan?</button>
      <button data-action="help-question" data-question="How do I sort a plastic bottle?">Plastic bottles</button>
      <button data-action="help-question" data-question="How do I sort paper and cardboard?">Paper &amp; cardboard</button>
      <button data-action="help-question" data-question="What do the confidence scores mean?">About the scores</button>
    </div>
    <form id="help-form" class="help-form">
      <label class="sr-only" for="help-question">Your question for Eco</label>
      <input id="help-question" name="question" type="text" placeholder="Ask about waste or EcoSort…" maxlength="500" autocomplete="off" enterkeyhint="send" required>
      <button class="button primary" type="submit" aria-label="Send question to Eco"><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></button>
    </form>
    <p class="help-footnote">Built-in answers · Check your local collection rules.</p>
  </dialog>
  <span id="mascot-announcement" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></span>
  <div id="toast" class="toast" role="status" aria-live="polite" aria-atomic="true" hidden></div>
</body>
</html>
