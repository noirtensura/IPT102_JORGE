"use strict";

const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const art = category => `<svg class="material-art" aria-hidden="true"><use href="#art-${category}"/></svg>`;
const sampleLabel = (text = "Sample Data") => `<span class="sample-label">${text}</span>`;
const tag = category => `<span class="material-tag material-${category}">${materials[category].name}</span>`;
const media = record => record.image ? `<img src="${escapeHTML(record.image)}" alt="Local preview of ${escapeHTML(record.name)}">` : art(record.category);
const thumbnail = record => `<span class="thumb material-${record.category}">${media(record)}</span>`;
const mascotArt = () => '<span class="mascot-portrait mascot-context" data-mascot-slot="scene" aria-hidden="true"><img src="assets/mascots/sheet-1.png" alt="" width="1536" height="1024" loading="lazy"></span>';
const pageHeading = (title, description, eyebrow = "YOUR SORTING SPACE") => `<div class="page-heading"><div><span class="eyebrow">${eyebrow}</span><h1 tabindex="-1">${title}</h1><p>${description}</p></div>${mascotArt()}</div>`;
const demoNotice = (analytics = false) => `<div class="notice">${icon("info")}<div><strong>${analytics ? "Sample Data" : "Sample classification"}</strong><p>${analytics ? "Charts reflect sample records in this session, not measured waste volume or environmental impact." : "Explore preset material examples. Images stay in your browser and are not analyzed by an AI model."}</p></div></div>`;
const categoryOptions = (selected, includeAll = false) => `${includeAll ? `<option value="all"${selected === "all" ? " selected" : ""}>All materials</option>` : ""}${Object.entries(materials).map(([key, material]) => `<option value="${key}"${selected === key ? " selected" : ""}>${material.name}${includeAll ? "" : ` · ${material.score}% illustrative`}</option>`).join("")}`;

function summary() {
  const counts = Object.fromEntries(Object.keys(materials).map(key => [key, 0]));
  state.records.forEach(record => counts[record.category]++);
  const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  return { counts, total: state.records.length, top: state.records.length ? materials[top].name : "—" };
}

function stats() {
  const { total, top } = summary();
  return `<div class="stats">
    <div class="stat-card">${statIcon("scan")}<div class="stat-content"><span class="stat-label">Classifications</span><div class="stat-value" data-stat="total">${total.toLocaleString()}</div><span class="stat-note">Sample Data · This session</span></div></div>
    <div class="stat-card">${statIcon("grid")}<div class="stat-content"><span class="stat-label">Material categories</span><div class="stat-value">4</div><span class="stat-note">Plus an uncertain result</span></div></div>
    <div class="stat-card">${statIcon("leaf")}<div class="stat-content"><span class="stat-label">Most common material</span><div class="stat-value">${top}</div><span class="stat-note">From current records</span></div></div>
  </div>`;
}
function statIcon(name) { return `<span class="stat-icon">${icon(name)}</span>`; }

const walkthroughFeatures = {
  scan: "Scan: choose a local photo or an illustrated sample to begin a new result.",
  overview: "Overview: see your session counts and reopen your latest result.",
  history: "History: search saved records, filter materials, and inspect details.",
  analytics: "Analytics: explore your sample records with charts and an accessible data table.",
  guide: "Guide: look up materials, preparation tips, and special-handling reminders."
};

const walkthroughSampleKeys = ["plastic", "paper", "metal", "glass"];
const walkthroughStepsMeta = [
  { label: "Meet Eco", short: "Meet Eco" },
  { label: "Scan an item", short: "Scan" },
  { label: "Read your result", short: "Result" },
  { label: "Explore your space", short: "Explore" }
];

function landingPage() {
  const defaultMaterial = materials.plastic;
  return `<section id="landing-screen" class="landing-page" aria-labelledby="landing-title">
    <header class="walkthrough-header">
      <div><span class="eyebrow">A LITTLE HELP GETTING STARTED</span><h1 id="landing-title" tabindex="-1">Your first sort starts here.</h1></div>
      <a class="text-link" id="proceed" href="scan.php">Skip demo &amp; proceed${icon("arrow")}</a>
    </header>
    <div id="walkthrough">
      <div class="walkthrough-topbar">
        <ol class="tour-stepper" aria-label="Walkthrough steps">${walkthroughStepsMeta.map((item, index) => `<li><button type="button" class="tour-step-pill" data-tour-jump="${index}"><span>0${index + 1}</span>${item.short}</button></li>`).join("")}</ol>
        <div class="tour-status-row">
          <p id="walkthrough-status" role="status" aria-live="polite" aria-atomic="true"></p>
          <span class="tour-scroll-hint" id="tour-scroll-hint">${icon("chevron")}<span>Scroll down for steps</span></span>
          <span class="tour-key-hint">Use ← → keys or arrows</span>
        </div>
        <div class="tour-progress" aria-hidden="true"><span id="tour-progress-fill"></span></div>
      </div>
      <div class="walkthrough-stage">
        <button type="button" class="button secondary tour-arrow tour-arrow-prev" data-tour-prev aria-label="Previous walkthrough step">${icon("arrow")}<span>Prev</span></button>
        <div class="walkthrough-track" role="region" aria-label="Getting started with EcoSort">
          <section class="walkthrough-step" data-tour-step="0" data-tour-mood="welcome" data-tour-title="${walkthroughStepsMeta[0].label}" role="group" aria-labelledby="tour-welcome-title">
            <div class="landing-copy"><span class="eyebrow">MEET YOUR SORTING SIDEKICK</span><h2 id="tour-welcome-title" tabindex="-1">A little scan. <span>A smarter sort.</span></h2><p>Hi, I’m Eco! Let’s walk through a sample together. You’ll see how to scan an item, read a sample result, and find your way around.</p><ol class="landing-steps" aria-label="Your sorting journey"><li><span>01</span>Scan</li><li><span>02</span>Review</li><li><span>03</span>Explore</li></ol><button type="button" class="button primary" data-tour-next>Show me how${icon("arrow")}</button><p class="landing-note">A short, hands-on demo. No sign-up or camera needed.</p></div>
            <div class="landing-mascot">${mascotArt()}<p>I’ll be here at every step.</p></div>
          </section>
          <section class="walkthrough-step" data-tour-step="1" data-tour-mood="camera" data-tour-title="${walkthroughStepsMeta[1].label}" role="group" aria-labelledby="tour-scan-title">
            <div class="tour-copy"><span class="eyebrow">01 / SCAN AN ITEM</span><h2 id="tour-scan-title" tabindex="-1">Give one item the spotlight.</h2><p>Open Scan and choose a clear JPEG, PNG, or WebP photo—or try the simulated camera. Keep one item centered in good lighting.</p><p>Pick a sample item in this preview and run a quick practice scan.</p><div class="walkthrough-mentor">${mascotArt()}<p>Your photo stays in this browser. This demo doesn’t open your camera or upload a file.</p></div></div>
            <div class="tour-demo" aria-label="Interactive sample scanner preview">
              <div class="tour-demo-heading">${icon("scan")}Scan<span>DEMO</span></div>
              <div class="tour-material-picker" role="group" aria-label="Choose a sample item">${walkthroughSampleKeys.map(key => `<button type="button" class="tour-material-chip" data-tour-material="${key}" aria-pressed="${key === "plastic"}">${materials[key].name}</button>`).join("")}</div>
              <div class="tour-upload" id="tour-upload-box">
                <div id="tour-upload-placeholder"><span class="upload-emblem">${icon("upload")}</span><h3>One item is all you need.</h3><p id="tour-placeholder-caption">Ready to preview: ${defaultMaterial.example}.</p></div>
                <div id="tour-upload-scanning" class="tour-scanning" hidden><span class="spinner" aria-hidden="true"></span><p>Preparing sample preview…</p></div>
                <div id="tour-upload-art" class="tour-item" hidden><svg class="material-art" id="tour-sample-svg" aria-hidden="true"><use href="#art-plastic"/></svg><p id="tour-sample-caption">${defaultMaterial.example} · Illustrated sample</p></div>
              </div>
              <div class="tour-demo-actions">
                <button type="button" class="button primary full-width" data-tour-sample>${icon("upload")}<span>Try this sample</span></button>
                <button type="button" class="button secondary full-width" data-tour-next id="tour-see-result" hidden>See sample result${icon("arrow")}</button>
              </div>
              <p id="tour-sample-feedback" class="tour-demo-note" role="status">This is a practice preview. Your scan history stays as it is.</p>
            </div>
          </section>
          <section class="walkthrough-step" data-tour-step="2" data-tour-mood="success" data-tour-title="${walkthroughStepsMeta[2].label}" role="group" aria-labelledby="tour-result-title">
            <div class="tour-copy"><span class="eyebrow">02 / REVIEW YOUR RESULT</span><h2 id="tour-result-title" tabindex="-1">Know the material. Check the next step.</h2><p>Your result brings the material, an illustrative confidence score, and sorting guidance into one place.</p><p>Use Save to History when you want to keep a result in this session, then Continue to Overview. If an item is uncertain, pause and check before sorting.</p><div class="walkthrough-mentor">${mascotArt()}<p>Sample scores are examples, not live AI predictions. Your local collector decides what is accepted.</p></div></div>
            <div class="tour-demo" aria-label="Sample result preview">
              <div class="tour-demo-heading">${icon("check")}Scan result<span>DEMO</span></div>
              <div class="tour-result-label"><span class="thumb material-plastic" id="tour-result-thumb"><svg class="material-art" id="tour-result-svg" aria-hidden="true"><use href="#art-plastic"/></svg></span><div><span class="eyebrow">ILLUSTRATED SAMPLE</span><h3 id="tour-result-item">${defaultMaterial.example}</h3><span class="material-tag material-plastic" id="tour-result-tag">${defaultMaterial.name}</span></div></div>
              <div class="tour-score-label"><span>Illustrative confidence</span><strong id="tour-result-score">${defaultMaterial.score}%</strong></div>
              <div class="tour-score" id="tour-result-meter" role="meter" aria-label="Illustrative sample confidence, not model accuracy" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${defaultMaterial.score}"><span id="tour-result-fill" style="width:${defaultMaterial.score}%"></span></div>
              <details class="tour-tip"><summary>How should I prepare it?${icon("chevron")}</summary><p id="tour-result-advice">${defaultMaterial.advice}</p></details>
              <div class="tour-result-actions"><button type="button" class="button secondary full-width" data-tour-demo-save aria-pressed="false">${icon("save")}<span>Save to History (demo)</span></button></div>
              <p id="tour-result-feedback" class="tour-demo-note" role="status">Open the tip or test saving in this preview. Saving a real sample result is optional.</p>
            </div>
          </section>
          <section class="walkthrough-step walkthrough-step-final" data-tour-step="3" data-tour-mood="overview" data-tour-title="${walkthroughStepsMeta[3].label}" role="group" aria-labelledby="tour-overview-title">
            <div class="tour-copy"><span class="eyebrow">03 / FIND YOUR WAY AROUND</span><h2 id="tour-overview-title" tabindex="-1">A little perspective. Everything in reach.</h2><p>Overview gives you a quick look at your activity. The bottom navigation takes you to Scan, Overview, History, Analytics, and Guide.</p><p>Tap the destinations in this preview to see what each one does.</p><div class="walkthrough-mentor">${mascotArt()}<p>Start with five sample records. Your saved examples last until you refresh.</p></div></div>
            <div class="tour-demo" aria-label="Overview and bottom navigation preview"><div class="tour-demo-heading">${icon("grid")}Your overview<span>DEMO</span></div><div class="tour-metrics"><div><strong>5</strong><span>Sample records</span></div><div><strong>4</strong><span>Material categories</span></div></div><p id="tour-feature-description" class="tour-feature-description" role="status">${walkthroughFeatures.overview}</p><div class="tour-feature-nav" role="group" aria-label="Try the bottom navigation">${[["scan","scan","Scan"],["overview","grid","Overview"],["history","history","History"],["analytics","chart","Analytics"],["guide","book","Guide"]].map(([key,symbol,label]) => `<button type="button" data-tour-feature="${key}" aria-pressed="${key === "overview"}">${icon(symbol)}<span>${label}</span></button>`).join("")}</div><p class="tour-demo-note">Practice preview · Choose Proceed to Scan when you’re ready.</p></div>
            <div class="tour-final-actions"><a class="button primary" id="tour-proceed" href="scan.php">Proceed to Scan${icon("arrow")}</a><button type="button" class="button secondary" data-tour-restart>Replay walkthrough</button></div>
          </section>
        </div>
        <button type="button" class="button secondary tour-arrow tour-arrow-next" data-tour-next aria-label="Next walkthrough step"><span>Next</span>${icon("arrow")}</button>
      </div>
    </div>
  </section>`;
}

function overviewPage() {
  const result = state.result;
  return `<section id="overview-screen" class="overview-page">${pageHeading("Your sorting at a glance.", "A simple view of your sample activity this session.", "STEP 3 OF 3 · OVERVIEW")}
    <section aria-label="Sample overview statistics">${stats()}</section>
    <section class="panel overview-summary" aria-label="Latest scan">${result ? `${thumbnail(result)}<div><h2>Latest result: ${materials[result.category].name}</h2><p>${escapeHTML(result.name)} · ${result.score}% illustrative confidence</p></div><a class="text-link" href="scan-result.php">View result${icon("arrow")}</a>` : `${icon("leaf")}<div><h2>Your next little step starts here.</h2><p>Scan an item to see your latest result.</p></div>`}</section>
    <button class="button primary" data-action="scan-another">${icon("scan")}Scan Another Item</button><p class="overview-note">Sample activity only. Check your local collection rules before sorting.</p>
  </section>`;
}

function scanPreview() {
  if (state.candidate) return `<span class="preview-label">${state.candidate.image ? "Local image preview" : "Illustrated sample"}</span>${state.candidate.image ? `<img class="preview-image" src="${escapeHTML(state.candidate.image)}" alt="Selected image: ${escapeHTML(state.candidate.name)}">` : `<div class="sample-art">${art(state.scenario)}</div>`}<button class="icon-button preview-remove" data-action="reset" aria-label="Remove selected image"${state.processing ? " disabled" : ""}>${icon("close")}</button>`;
  if (state.reading) return `<span class="spinner" aria-hidden="true"></span><p>Opening your local image…</p>`;
  if (state.mode === "camera") return `<span class="upload-emblem">${icon("camera")}</span><h2>Preview your item</h2><p>Capture loads a sample, not a live photo.</p><p>No camera access is requested.</p>`;
  return `<span class="upload-emblem">${icon("upload")}</span><h2>Drop your image here</h2><p>JPEG, PNG, or WebP · Up to 10 MB</p><button class="button primary" data-action="choose-file">${icon("upload")}Choose an image</button><button class="text-button" data-action="use-sample">Or try a sample image${icon("arrow")}</button>`;
}

function scanPage() {
  return `<section id="scan-screen" class="scan-page" aria-labelledby="scan-title"><div class="page-heading scan-heading"><div><span class="eyebrow">STEP 1 OF 3 · SCAN</span><h1 id="scan-title" tabindex="-1">One item. One scan.</h1><p>Choose a clear photo of a single item, or try a sample.</p></div>${mascotArt()}</div>${demoNotice()}
    <section class="panel scan-panel" aria-label="Waste scanner"><div class="mode-tabs" role="tablist" aria-label="Image source"><button class="mode-tab" id="upload-tab" role="tab" aria-selected="${state.mode === "upload"}" aria-controls="scan-preview-panel" tabindex="${state.mode === "upload" ? "0" : "-1"}" data-mode="upload">${icon("upload")}Upload Image</button><button class="mode-tab" id="camera-tab" role="tab" aria-selected="${state.mode === "camera"}" aria-controls="scan-preview-panel" tabindex="${state.mode === "camera" ? "0" : "-1"}" data-mode="camera">${icon("camera")}Use Camera</button></div>
    <div id="scan-preview-panel" role="tabpanel" aria-labelledby="${state.mode}-tab"><input id="image-file" class="sr-only" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose an image" tabindex="-1"><div id="dropzone" class="preview${state.candidate ? " has-image" : ""}${state.mode === "camera" ? " camera-frame" : ""}" aria-busy="${state.processing || state.reading}" aria-describedby="upload-error">${scanPreview()}${state.processing ? `<div class="processing-overlay" role="status"><span class="spinner" aria-hidden="true"></span><strong>Preparing your sample result…</strong><span>Sample data · No image analysis</span></div>` : ""}</div>
    ${state.mode === "camera" ? `<p class="camera-note">Sample capture uses an illustrated item. No camera connection is needed.</p><button class="button secondary capture-button" data-action="capture"${state.processing ? " disabled" : ""}>${icon("camera")}${state.candidate ? "Retake sample" : "Capture sample"}</button>` : ""}
    ${state.candidate ? `<p class="file-info">${icon("check")}<span>${escapeHTML(state.candidate.name)} · ${state.candidate.image ? "Available only in this browser" : "Built-in sample"}</span></p>` : ""}<p class="upload-error" id="upload-error" role="alert"${!state.uploadError ? " hidden" : ""}>${escapeHTML(state.uploadError)}</p>
    <div class="scanner-controls"><div class="field"><label for="sample-scenario">Sample material</label><select id="sample-scenario" aria-describedby="scenario-help"${state.processing || state.reading ? " disabled" : ""}>${categoryOptions(state.scenario)}</select><small id="scenario-help">Choose a preset sample result. Your image is not analyzed.</small></div><div class="scan-actions"><button class="button primary" data-action="classify"${!state.candidate || state.processing || state.reading ? " disabled" : ""}>${icon("scan")}${state.processing ? "Preparing your result…" : "View Sample Result"}${icon("arrow")}</button><button class="button secondary" data-action="reset">${state.processing ? "Cancel" : "Reset"}</button></div></div></div></section>
    <p class="scan-privacy">${icon("check")}Your photo stays in this browser. Use good lighting and a plain background.</p></section>`;
}

function resultPage() {
  const result = state.result;
  const heading = pageHeading("Your scan result.", "Review the material and its sorting guidance before continuing.", "STEP 2 OF 3 · RESULT");
  if (!result) return `${heading}${emptyState("scan", "Your first result starts with a scan.", "No result is available yet. Choose an image or try an illustrated sample.", `<a class="button primary" href="scan.php">Start Scanning${icon("arrow")}</a>`)}`;
  const material = materials[result.category];
  const uncertain = result.category === "uncertain";
  return `${heading}<section class="panel latest-result" aria-labelledby="result-title"><div class="result-layout">
    <div><div class="result-image material-${result.category}">${media(result)}</div><p class="result-file">${escapeHTML(result.name)} · ${result.image ? "Local image" : "Illustrated sample"}</p></div>
    <div class="result-content">
      ${sampleLabel("Latest Sample Result")}
      <h2 id="result-title" class="result-category">${uncertain ? "Unable to classify confidently" : material.name}</h2>
      ${uncertain ? '<p class="fine-print">Uncertain · This is a scripted low-confidence scenario.</p>' : tag(result.category)}
      <div class="confidence-label"><span>Sample confidence <span class="muted">(illustrative)</span></span><strong>${result.score}%</strong></div>
      <div class="confidence-track" role="meter" aria-label="Sample confidence, not model accuracy" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${result.score}"><div class="confidence-fill${uncertain ? " uncertain" : ""}" style="width:${result.score}%"></div></div>
      <p class="fine-print">This is an illustrative sample score. No AI prediction was made.</p>
      <div class="result-advice"><h3>${icon(uncertain ? "warning" : "leaf")}${uncertain ? "Pause and check before sorting" : "A thoughtful next step"}</h3><p>${material.advice}</p></div>
      <div class="button-row"><a class="button primary" href="overview.php">Continue to Overview${icon("arrow")}</a><button class="button secondary" data-action="scan-another">${icon("scan")}Scan Again</button></div>
      <div class="result-save"><button class="text-button" data-action="save-result"${result.saved ? " disabled" : ""}>${icon(result.saved ? "check" : "save")}${result.saved ? "Saved to history" : "Save to History"}</button></div>
      <p class="fine-print">Saved records last until refresh. Check your local collection rules before disposal.</p>
    </div>
  </div></section>`;
}

function emptyState(symbol, title, description, actions = "") {
  return `<div class="empty-state">${icon(symbol)}<h2>${title}</h2><p>${description}</p>${actions}</div>`;
}

function filteredRecords() {
  const query = state.historySearch.trim().toLowerCase();
  return state.records.filter(record => (state.historyFilter === "all" || record.category === state.historyFilter) && `${record.name} ${materials[record.category].name} ${record.date} ${record.id}`.toLowerCase().includes(query));
}

function historyRows() {
  const records = filteredRecords();
  if (!records.length) return state.records.length ? emptyState("search", "No matching scans.", "Try a different material or search term.", '<button class="button secondary" data-action="reset-history-filters">Reset filters</button>') : emptyState("history", "No scans yet. Start your first scan.", "A new item is a good place to begin. Records stay only in this tab.", '<div class="button-row"><a class="button primary" href="scan.php">Start Scanning</a><button class="button secondary" data-action="restore-samples">Restore sample records</button></div>');
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="Sample history table; scroll horizontally on small screens"><table><caption class="sr-only">Sample classification history. Confidence scores are illustrative.</caption><thead><tr><th scope="col">Item</th><th scope="col">Material</th><th scope="col">Sample confidence</th><th scope="col">Date</th><th scope="col"><span class="sr-only">Details</span></th></tr></thead><tbody>${records.map(record => `<tr><td><div class="item-cell">${thumbnail(record)}<div><strong>${escapeHTML(record.name)}</strong><small>${record.id.startsWith("sample-") ? "Sample record" : "Saved sample result"}</small></div></div></td><td>${tag(record.category)}</td><td>${record.score}% <span class="muted">sample</span></td><td class="date-cell">${escapeHTML(record.date)}<small>${escapeHTML(record.time)}</small></td><td><button class="icon-button" data-action="record" data-id="${record.id}" aria-label="View ${escapeHTML(record.name)} details">${icon("arrow")}</button></td></tr>`).join("")}</tbody></table></div>`;
}

function historyPage() {
  return `${pageHeading("Your sorting story.", "Review your recent items and sorting guidance.", "CLASSIFICATION HISTORY")}<div class="notice">${icon("history")}<div><strong>Your session history</strong><p>Start with five sample records. New examples stay in this tab until you refresh.</p></div></div><div class="toolbar"><div class="filter-controls"><div class="field search-field"><label for="history-search">Search records</label><div class="input-with-icon">${icon("search")}<input id="history-search" type="search" placeholder="Search items or materials…" value="${escapeHTML(state.historySearch)}"></div></div><div class="field filter-field"><label for="history-filter">Material</label><select id="history-filter">${categoryOptions(state.historyFilter, true)}</select></div></div><button class="button secondary" data-action="clear-history"${!state.records.length ? " disabled" : ""}>${icon("trash")}Clear history</button></div><section class="panel table-panel" aria-labelledby="history-title"><div class="table-panel-heading"><h2 id="history-title">Classification records <span class="muted" id="history-count" role="status">(${filteredRecords().length})</span></h2>${sampleLabel("Sample Records")}</div><div id="history-list">${historyRows()}</div><p class="table-footnote">All scores are illustrative. This is not a measured accuracy report.</p></section>`;
}

function analyticsPage() {
  const { counts, total } = summary();
  const sorted = Object.entries(materials).sort(([a], [b]) => counts[b] - counts[a]);
  const max = Math.max(1, ...Object.values(counts));
  let angle = 0;
  const segments = sorted.map(([key, material]) => {
    const start = angle;
    angle += total ? counts[key] / total * 360 : 0;
    return `${material.color} ${start}deg ${angle}deg`;
  }).join(", ");
  return `${pageHeading("See the bigger picture.", "An at-a-glance look at your sample classification activity.", "YOUR SORTING ACTIVITY")}${demoNotice(true)}${stats()}${!total ? `<div class="notice" style="margin-top:24px">${icon("info")}<div><strong>No records to chart yet.</strong><p>Save a sample result or <button class="text-button" data-action="restore-samples">restore sample records</button> to populate these charts.</p></div></div>` : ""}<div class="charts-grid"><section class="panel" aria-labelledby="bar-title"><div class="panel-heading"><h2 id="bar-title">Classifications by material</h2>${sampleLabel()}</div><p class="chart-subtitle">Number of sample records · Includes uncertain results</p><ul class="bars">${sorted.map(([key, material]) => `<li><div class="bar-heading"><span>${material.name}</span><span>${counts[key]} sample scan${counts[key] === 1 ? "" : "s"}</span></div><div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${counts[key] / max * 100}%;--bar-color:${material.color}"></div></div></li>`).join("")}</ul></section><section class="panel" aria-labelledby="distribution-title"><div class="panel-heading"><h2 id="distribution-title">Material distribution</h2>${sampleLabel()}</div><p class="chart-subtitle">Share of sample records in this tab</p><div class="distribution"><div class="donut" role="img" aria-label="${total} sample scans. Distribution is listed in the adjacent data table." style="background:${total ? `conic-gradient(${segments})` : "var(--border)"}"><div class="donut-center"><strong>${total}</strong><span>sample scans</span></div></div><table class="legend-table"><caption class="sr-only">Accessible sample distribution data</caption><thead><tr><th scope="col">Material</th><th scope="col">Scans</th><th scope="col">Share</th></tr></thead><tbody>${sorted.map(([key, material]) => `<tr><td><span class="legend-key" aria-hidden="true" style="--bar-color:${material.color}"></span>${material.name}</td><td>${counts[key]}</td><td>${total ? (counts[key] / total * 100).toFixed(1) : "0"}%</td></tr>`).join("")}</tbody></table></div></section></div><aside class="analytics-note"><div><h2>Your sorting habits, at a glance.</h2><p>Explore which materials appear in your sample history. These counts are for learning; local collection rules still determine where an item should go.</p></div><a class="button secondary" href="scan.php">Start Scanning${icon("arrow")}</a></aside>`;
}

function guideCards() {
  const query = state.guideSearch.trim().toLowerCase();
  const entries = Object.entries(materials).filter(([key, material]) => (state.guideFilter === "all" || key === state.guideFilter) && `${material.name} ${material.short} ${material.examples} ${material.advice} ${material.caution} ${material.tips.join(" ")}`.toLowerCase().includes(query));
  if (!entries.length) return emptyState("search", "Let’s try another search.", "Search by material or common item, such as bottle, carton, or can.", '<button class="button secondary" data-action="reset-guide-filters">Show all materials</button>');
  return `<div class="guide-list">${entries.map(([key, material]) => `<details class="guide-card material-${key}"${state.guideFilter === key || entries.length === 1 ? " open" : ""}><summary><span class="material-card-art">${art(key)}</span><div><h2>${material.name}</h2><p>${material.short}</p></div>${icon("chevron")}</summary><div class="guide-details"><p><strong>Common examples:</strong> ${material.examples}.</p><h3>Before you sort</h3><ul class="check-list">${material.tips.map(tip => `<li>${tip}</li>`).join("")}</ul><div class="guide-caution">${icon("info")}<span>${material.caution}</span></div></div></details>`).join("")}</div>`;
}

function guidePage() {
  return `${pageHeading("A little knowledge goes a long way.", "Get familiar with everyday materials and more thoughtful sorting.", "YOUR EVERYDAY WASTE GUIDE")}<div class="notice">${icon("leaf")}<div><strong>Start here. Check locally.</strong><p>This is general educational guidance. Your barangay / LGU and local collector determine what they accept and how to prepare it.</p></div></div><div class="toolbar"><div class="filter-controls"><div class="field search-field"><label for="guide-search">Find an item or material</label><div class="input-with-icon">${icon("search")}<input id="guide-search" type="search" placeholder="Try bottles, cardboard, cans…" value="${escapeHTML(state.guideSearch)}"></div></div><div class="field filter-field"><label for="guide-filter">Material</label><select id="guide-filter">${categoryOptions(state.guideFilter, true)}</select></div></div><p class="fine-print">Select a card to explore its guidance.</p></div><div id="guide-results">${guideCards()}</div><aside class="special-handling"><h2>${icon("warning")}Some items need a different kind of care.</h2><p>Batteries, sharps, chemicals, and electronics do not become safe for an ordinary bin just because a material looks familiar. Ask your local collector about a dedicated collection route.</p><div class="special-grid"><div><h3>Batteries & electronics</h3><p>Keep them out of ordinary recycling and find an appropriate local collection point.</p></div><div><h3>Sharps & broken items</h3><p>Avoid direct contact. Follow local instructions for safe containment and labeling.</p></div><div><h3>Chemicals & containers</h3><p>Keep product labels intact. Ask your LGU or collector about hazardous household waste.</p></div></div></aside>`;
}
