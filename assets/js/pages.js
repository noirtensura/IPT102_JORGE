"use strict";

const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const art = category => `<svg class="material-art" aria-hidden="true"><use href="#art-${category}"/></svg>`;
const sampleLabel = (text = "Sample Data") => `<span class="sample-label">${text}</span>`;
const tag = category => `<span class="material-tag material-${category}">${materials[category].name}</span>`;
const media = record => record.image ? `<img src="${escapeHTML(record.image)}" alt="Local preview of ${escapeHTML(record.name)}">` : art(record.category);
const thumbnail = record => `<span class="thumb material-${record.category}">${media(record)}</span>`;
const pageHeading = (title, description = "", eyebrow = "") => `<div class="page-heading"><div>${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ""}<h1 tabindex="-1">${title}</h1>${description ? `<p>${description}</p>` : ""}</div></div>`;
const demoNotice = () => `<div class="notice">${icon("info")}<div><strong>Demo</strong><p>Preset results. Photos stay in your browser and aren’t analyzed.</p></div></div>`;
const categoryOptions = (selected, includeAll = false) => `${includeAll ? `<option value="all"${selected === "all" ? " selected" : ""}>All materials</option>` : ""}${Object.entries(materials).map(([key, material]) => `<option value="${key}"${selected === key ? " selected" : ""}>${material.name}</option>`).join("")}`;

function summary() {
  const counts = Object.fromEntries(Object.keys(materials).map(key => [key, 0]));
  state.records.forEach(record => counts[record.category]++);
  return { counts, total: state.records.length };
}

const walkthroughFeatures = {
  scan: "Scan: choose a photo or try a sample.",
  overview: "Overview: reopen your latest result or start a scan.",
  history: "History: see your most scanned materials and saved items.",
  guide: "Guide: check how to prepare each material."
};

const walkthroughSampleKeys = ["plastic", "paper", "metal", "glass"];
const walkthroughStepsMeta = [
  { label: "Get started" },
  { label: "Choose an item" },
  { label: "Check the result" },
  { label: "Review your history" }
];

function landingPage() {
  const defaultMaterial = materials.plastic;
  return `<section id="landing-screen" class="landing-page" aria-labelledby="landing-title">
    <header class="walkthrough-header">
      <div><h1 id="landing-title" tabindex="-1">How to use EcoSort</h1></div>
      <a class="text-link" id="proceed" href="scan.php">Start scanning${icon("arrow")}</a>
    </header>
    <div id="walkthrough" role="region" aria-roledescription="carousel" aria-label="Getting started with EcoSort">
        <div class="walkthrough-track" aria-live="off">
          <section class="walkthrough-step" data-tour-step="0" data-tour-title="${walkthroughStepsMeta[0].label}" role="group" aria-labelledby="tour-welcome-title">
            <div class="landing-copy"><span class="eyebrow">QUICK GUIDE</span><h2 id="tour-welcome-title" tabindex="-1">Scan. Sort. <span>Save.</span></h2><p>Choose an item, check its material, and save the result.</p><ol class="landing-steps" aria-label="Your sorting journey"><li><span>01</span>Scan</li><li><span>02</span>Sort</li><li><span>03</span>Save</li></ol><button type="button" class="button primary" data-tour-next>Try the demo${icon("arrow")}</button><p class="landing-note">Demo uses preset results.</p></div>
            <div class="walkthrough-illustration" aria-hidden="true"><img src="assets/mascots/sheet-4.png" alt="" width="1536" height="1024"></div>
          </section>
          <section class="walkthrough-step" data-tour-step="1" data-tour-title="${walkthroughStepsMeta[1].label}" role="group" aria-labelledby="tour-scan-title">
            <div class="tour-copy"><span class="eyebrow">01 / SCAN</span><h2 id="tour-scan-title" tabindex="-1">Choose one item.</h2><p>Upload a clear photo or try a sample. Pick a material below to practice.</p><p class="fine-print">Photos stay in your browser. Camera mode is simulated.</p></div>
            <div class="tour-demo" aria-label="Interactive sample scanner preview">
              <div class="tour-demo-heading">${icon("scan")}Scan<span>DEMO</span></div>
              <div class="tour-material-picker" role="group" aria-label="Choose a sample item">${walkthroughSampleKeys.map(key => `<button type="button" class="tour-material-chip" data-tour-material="${key}" aria-pressed="${key === "plastic"}">${materials[key].name}</button>`).join("")}</div>
              <div class="tour-upload" id="tour-upload-box">
                <div id="tour-upload-placeholder"><span class="upload-emblem">${icon("upload")}</span><h3>Try a sample</h3><p id="tour-placeholder-caption">${defaultMaterial.example}</p></div>
                <div id="tour-upload-scanning" class="tour-scanning" hidden><span class="spinner" aria-hidden="true"></span><p>Preparing sample preview…</p></div>
                <div id="tour-upload-art" class="tour-item" hidden><svg class="material-art" id="tour-sample-svg" aria-hidden="true"><use href="#art-plastic"/></svg><p id="tour-sample-caption">${defaultMaterial.example} · Illustrated sample</p></div>
              </div>
              <div class="tour-demo-actions">
                <button type="button" class="button primary full-width" data-tour-sample>${icon("upload")}<span>Try this sample</span></button>
                <button type="button" class="button primary full-width" data-tour-next id="tour-see-result" hidden>See sample result${icon("arrow")}</button>
              </div>
              <p id="tour-sample-feedback" class="tour-demo-note" role="status">Practice only · nothing saved.</p>
            </div>
          </section>
          <section class="walkthrough-step" data-tour-step="2" data-tour-title="${walkthroughStepsMeta[2].label}" role="group" aria-labelledby="tour-result-title">
            <div class="tour-copy"><span class="eyebrow">02 / SORT</span><h2 id="tour-result-title" tabindex="-1">Check the material.</h2><p>Read the preparation tip, then save the result to History. Unsure? Check before sorting.</p><p class="fine-print">Scores are examples. Check what your local collector accepts.</p></div>
            <div class="tour-demo" aria-label="Sample result preview">
              <div class="tour-demo-heading">${icon("check")}Scan result<span>DEMO</span></div>
              <div class="tour-result-label"><span class="thumb material-plastic" id="tour-result-thumb"><svg class="material-art" id="tour-result-svg" aria-hidden="true"><use href="#art-plastic"/></svg></span><div><span class="eyebrow">ILLUSTRATED SAMPLE</span><h3 id="tour-result-item">${defaultMaterial.example}</h3><span class="material-tag material-plastic" id="tour-result-tag">${defaultMaterial.name}</span></div></div>
              <div class="tour-score-label"><span>Illustrative confidence</span><strong id="tour-result-score">${defaultMaterial.score}%</strong></div>
              <div class="tour-score" id="tour-result-meter" role="meter" aria-label="Illustrative sample confidence, not model accuracy" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${defaultMaterial.score}"><span id="tour-result-fill" style="width:${defaultMaterial.score}%"></span></div>
              <details class="tour-tip"><summary>How should I prepare it?${icon("chevron")}</summary><p id="tour-result-advice">${defaultMaterial.advice}</p></details>
              <div class="tour-result-actions"><button type="button" class="button secondary full-width" data-tour-demo-save aria-pressed="false">${icon("save")}<span>Save to History (demo)</span></button></div>
              <p id="tour-result-feedback" class="tour-demo-note" role="status">Try the tip or save button.</p>
            </div>
          </section>
          <section class="walkthrough-step walkthrough-step-final" data-tour-step="3" data-tour-title="${walkthroughStepsMeta[3].label}" role="group" aria-labelledby="tour-overview-title">
            <div class="tour-copy"><span class="eyebrow">03 / SAVE</span><h2 id="tour-overview-title" tabindex="-1">Find your most scanned materials.</h2><p>History groups saved scans by material and keeps your recent items.</p><p class="fine-print">Sample session · saved scans clear on refresh.</p></div>
            <div class="tour-demo" aria-label="History and bottom navigation preview"><div class="tour-demo-heading">${icon("history")}Most scanned<span>DEMO</span></div><div class="tour-history-example">${thumbnail(sampleRecords[0])}<div><h3>Plastic</h3><p>2 saved scans</p></div></div><p id="tour-feature-description" class="tour-feature-description" role="status">${walkthroughFeatures.history}</p><div class="tour-feature-nav" role="group" aria-label="Try the bottom navigation">${[["scan","scan","Scan"],["overview","grid","Overview"],["history","history","History"],["guide","book","Guide"]].map(([key,symbol,label]) => `<button type="button" data-tour-feature="${key}" aria-pressed="${key === "history"}">${icon(symbol)}<span>${label}</span></button>`).join("")}</div></div>
            <div class="tour-final-actions"><a class="button primary" id="tour-proceed" href="scan.php">Start scanning${icon("arrow")}</a><button type="button" class="text-button" data-tour-restart>Replay guide</button></div>
          </section>
        </div>
      <div class="tour-controls">
        <button type="button" class="button secondary tour-arrow tour-arrow-prev" data-tour-prev aria-label="Previous card">${icon("arrow")}</button>
        <button type="button" class="text-button" data-tour-toggle aria-label="Pause slideshow">Pause</button>
        <button type="button" class="button secondary tour-arrow tour-arrow-next" data-tour-next aria-label="Next card">${icon("arrow")}</button>
      </div>
    </div>
  </section>`;
}

function overviewPage() {
  const result = state.result;
  return `<section id="overview-screen" class="overview-page">${pageHeading("Ready to sort?", "Scan an item or review your saved results.")}
    <button class="button primary" data-action="scan-another">${icon("scan")}Scan an item${icon("arrow")}</button>
    <section class="panel overview-summary" aria-label="Latest scan">${result ? `${thumbnail(result)}<div><h2>Latest result: ${materials[result.category].name}</h2><p>${escapeHTML(result.name)}</p></div><a class="text-link" href="scan-result.php">View result${icon("arrow")}</a>` : `${icon("leaf")}<div><h2>No recent result</h2><p>Choose a photo or try a sample.</p></div>`}</section>
    <div class="overview-links"><a class="panel overview-shortcut" href="history.php">${icon("history")}<div><h2>History</h2><p><span data-stat="total">${state.records.length}</span> saved scans · sample session</p></div>${icon("arrow")}</a><a class="panel overview-shortcut" href="waste-guide.php">${icon("book")}<div><h2>Waste guide</h2><p>Preparation tips by material</p></div>${icon("arrow")}</a></div>
  </section>`;
}

function scanPreview() {
  if (state.candidate) return `<span class="preview-label">${state.candidate.image ? "Local image preview" : "Illustrated sample"}</span>${state.candidate.image ? `<img class="preview-image" src="${escapeHTML(state.candidate.image)}" alt="Selected image: ${escapeHTML(state.candidate.name)}">` : `<div class="sample-art">${art(state.scenario)}</div>`}<button class="icon-button preview-remove" data-action="reset" aria-label="Remove selected image"${state.processing ? " disabled" : ""}>${icon("close")}</button>`;
  if (state.reading) return `<span class="spinner" aria-hidden="true"></span><p>Opening your local image…</p>`;
  if (state.mode === "camera") return `<span class="upload-emblem">${icon("camera")}</span><h2>Try sample capture</h2><p>Illustrated sample · No camera access</p>`;
  return `<span class="upload-emblem">${icon("upload")}</span><h2>Drop your image here</h2><p>JPEG, PNG, or WebP · Up to 10 MB</p><button class="button primary" data-action="choose-file">${icon("upload")}Choose an image</button><button class="text-button" data-action="use-sample">Or try a sample image${icon("arrow")}</button>`;
}

function scanPage() {
  return `<section id="scan-screen" class="scan-page" aria-labelledby="scan-title"><div class="page-heading scan-heading"><div><span class="eyebrow">01 / SCAN</span><h1 id="scan-title" tabindex="-1">Scan an item</h1><p>Choose a photo or try a sample.</p></div></div>${demoNotice()}
    <section class="panel scan-panel" aria-label="Waste scanner"><div class="mode-tabs" role="tablist" aria-label="Image source"><button class="mode-tab" id="upload-tab" role="tab" aria-selected="${state.mode === "upload"}" aria-controls="scan-preview-panel" tabindex="${state.mode === "upload" ? "0" : "-1"}" data-mode="upload">${icon("upload")}Upload Image</button><button class="mode-tab" id="camera-tab" role="tab" aria-selected="${state.mode === "camera"}" aria-controls="scan-preview-panel" tabindex="${state.mode === "camera" ? "0" : "-1"}" data-mode="camera">${icon("camera")}Use Camera</button></div>
    <div id="scan-preview-panel" role="tabpanel" aria-labelledby="${state.mode}-tab"><input id="image-file" class="sr-only" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose an image" tabindex="-1"><div id="dropzone" class="preview${state.candidate ? " has-image" : ""}${state.mode === "camera" ? " camera-frame" : ""}" aria-busy="${state.processing || state.reading}" aria-describedby="upload-error">${scanPreview()}${state.processing ? `<div class="processing-overlay" role="status"><span class="spinner" aria-hidden="true"></span><strong>Preparing your sample result…</strong><span>Sample data · No image analysis</span></div>` : ""}</div>
    ${state.mode === "camera" ? `<button class="button ${state.candidate ? "secondary" : "primary"} capture-button" data-action="capture"${state.processing ? " disabled" : ""}>${icon("camera")}${state.candidate ? "Retake sample" : "Capture sample"}</button>` : ""}
    ${state.candidate ? `<p class="file-info">${icon("check")}<span>${escapeHTML(state.candidate.name)} · ${state.candidate.image ? "Available only in this browser" : "Built-in sample"}</span></p>` : ""}<p class="upload-error" id="upload-error" role="alert"${!state.uploadError ? " hidden" : ""}>${escapeHTML(state.uploadError)}</p>
    <div class="scanner-controls"><div class="field"><label for="sample-scenario">Sample material</label><select id="sample-scenario"${state.processing || state.reading ? " disabled" : ""}>${categoryOptions(state.scenario)}</select></div><div class="scan-actions"><button class="button primary" data-action="classify"${!state.candidate || state.processing || state.reading ? " disabled" : ""}>${icon("scan")}${state.processing ? "Preparing…" : "View sample result"}${icon("arrow")}</button><button class="button secondary" data-action="reset">${state.processing ? "Cancel" : "Reset"}</button></div></div></div></section></section>`;
}

function resultPage() {
  const result = state.result;
  const heading = pageHeading("Scan result", "", "02 / SORT");
  if (!result) return `${heading}${emptyState("scan", "Your first result starts with a scan.", "No result is available yet. Choose an image or try an illustrated sample.", `<a class="button primary" href="scan.php">Start Scanning${icon("arrow")}</a>`)}`;
  const material = materials[result.category];
  const uncertain = result.category === "uncertain";
  return `${heading}<section class="panel latest-result" aria-labelledby="result-title"><div class="result-layout">
    <div><div class="result-image material-${result.category}">${media(result)}</div><p class="result-file">${escapeHTML(result.name)} · ${result.image ? "Local image" : "Illustrated sample"}</p></div>
    <div class="result-content">
      ${sampleLabel("Sample result")}
      <h2 id="result-title" class="result-category">${uncertain ? "Unable to classify confidently" : material.name}</h2>
      ${uncertain ? '<p class="fine-print">Uncertain · This is a scripted low-confidence scenario.</p>' : tag(result.category)}
      <div class="confidence-label"><span>Sample confidence <span class="muted">(illustrative)</span></span><strong>${result.score}%</strong></div>
      <div class="confidence-track" role="meter" aria-label="Sample confidence, not model accuracy" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${result.score}"><div class="confidence-fill${uncertain ? " uncertain" : ""}" style="width:${result.score}%"></div></div>
      <p class="fine-print">Preset result. Photo not analyzed.</p>
      <div class="result-advice"><h3>${icon(uncertain ? "warning" : "leaf")}${uncertain ? "Check before sorting" : "How to prepare it"}</h3><p>${material.advice}</p></div>
      <div class="button-row"><button class="button ${result.saved ? "secondary" : "primary"}" data-action="save-result"${result.saved ? " disabled" : ""}>${icon(result.saved ? "check" : "save")}${result.saved ? "Saved to history" : "Save to History"}</button><a class="button ${result.saved ? "primary" : "secondary"}" href="overview.php">Continue to Overview${icon("arrow")}</a></div>
      <div class="result-secondary"><button class="text-button" data-action="scan-another">${icon("scan")}Scan Again</button></div>
      <p class="fine-print">Saved until refresh · Check local collection rules.</p>
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
  if (!records.length) return state.records.length ? emptyState("search", "No matching scans.", "Try another material or search.", '<button class="button secondary" data-action="reset-history-filters">Reset filters</button>') : emptyState("history", "No scans yet.", "Save a result to build your history.", '<div class="button-row"><a class="button primary" href="scan.php">Start Scanning</a><button class="button secondary" data-action="restore-samples">Restore sample records</button></div>');
  return `<div class="table-wrap" tabindex="0" role="region" aria-label="Saved scans; scroll horizontally on small screens"><table><caption class="sr-only">Saved sample scans, newest first.</caption><thead><tr><th scope="col">Item</th><th scope="col">Material</th><th scope="col">Date</th><th scope="col"><span class="sr-only">Details</span></th></tr></thead><tbody>${records.map(record => `<tr><td><div class="item-cell">${thumbnail(record)}<div><strong>${escapeHTML(record.name)}</strong></div></div></td><td>${tag(record.category)}</td><td class="date-cell">${escapeHTML(record.date)}<small>${escapeHTML(record.time)}</small></td><td><button class="icon-button" data-action="record" data-id="${record.id}" aria-label="View ${escapeHTML(record.name)} details">${icon("arrow")}</button></td></tr>`).join("")}</tbody></table></div>`;
}

function historyPage() {
  const { counts, total } = summary();
  const ranked = Object.entries(counts).filter(([, count]) => count > 0).sort(([, a], [, b]) => b - a);
  return `${pageHeading("History", "Sample session · clears on refresh.")}
    <section class="panel history-summary" aria-labelledby="most-scanned-title"><div class="panel-heading"><h2 id="most-scanned-title">Most scanned materials</h2><span class="fine-print"><span data-stat="total">${total}</span> saved scans</span></div>${total ? `<ol class="material-ranking">${ranked.map(([key, count]) => `<li data-material="${key}"><span class="material-card-art material-${key}">${art(key)}</span><div><h3>${materials[key].name}</h3><p><strong data-material-count>${count}</strong> saved scan${count === 1 ? "" : "s"}</p></div></li>`).join("")}</ol>` : `<p class="fine-print">Save a result to see your most scanned materials.</p>`}</section>
    <div class="toolbar"><div class="filter-controls"><div class="field search-field"><label for="history-search">Search items</label><div class="input-with-icon">${icon("search")}<input id="history-search" type="search" placeholder="Item or material…" value="${escapeHTML(state.historySearch)}"></div></div><div class="field filter-field"><label for="history-filter">Material</label><select id="history-filter">${categoryOptions(state.historyFilter, true)}</select></div></div><button class="button secondary" data-action="clear-history"${!state.records.length ? " disabled" : ""}>${icon("trash")}Clear history</button></div><section class="panel table-panel" aria-labelledby="history-title"><div class="table-panel-heading"><h2 id="history-title">Recent scans <span class="muted" id="history-count" role="status">(${filteredRecords().length})</span></h2>${sampleLabel("Sample session")}</div><div id="history-list">${historyRows()}</div></section>`;
}

function guideCards() {
  const query = state.guideSearch.trim().toLowerCase();
  const entries = Object.entries(materials).filter(([key, material]) => (state.guideFilter === "all" || key === state.guideFilter) && `${material.name} ${material.short} ${material.examples} ${material.advice} ${material.caution} ${material.tips.join(" ")}`.toLowerCase().includes(query));
  if (!entries.length) return emptyState("search", "Let’s try another search.", "Search by material or common item, such as bottle, carton, or can.", '<button class="button secondary" data-action="reset-guide-filters">Show all materials</button>');
  return `<div class="guide-list">${entries.map(([key, material]) => `<details class="guide-card material-${key}"${state.guideFilter === key || entries.length === 1 ? " open" : ""}><summary><span class="material-card-art">${art(key)}</span><div><h2>${material.name}</h2><p>${material.short}</p></div>${icon("chevron")}</summary><div class="guide-details"><ul class="check-list">${material.tips.map(tip => `<li>${tip}</li>`).join("")}</ul><div class="guide-caution">${icon("info")}<span>${material.caution}</span></div></div></details>`).join("")}</div>`;
}

function guidePage() {
  return `${pageHeading("Waste guide", "Choose a material for preparation tips.")}<div class="notice">${icon("leaf")}<div><p>Check what your barangay / LGU or local collector accepts.</p></div></div><div class="toolbar"><div class="filter-controls"><div class="field search-field"><label for="guide-search">Find an item</label><div class="input-with-icon">${icon("search")}<input id="guide-search" type="search" placeholder="Bottles, cardboard, cans…" value="${escapeHTML(state.guideSearch)}"></div></div><div class="field filter-field"><label for="guide-filter">Material</label><select id="guide-filter">${categoryOptions(state.guideFilter, true)}</select></div></div></div><div id="guide-results">${guideCards()}</div><aside class="special-handling"><h2>${icon("warning")}Special handling</h2><div class="special-grid"><div><h3>Batteries & electronics</h3><p>Keep out of ordinary recycling. Use a dedicated collection point.</p></div><div><h3>Sharps & broken glass</h3><p>Avoid direct contact. Follow local containment and labeling rules.</p></div><div><h3>Chemicals & containers</h3><p>Keep labels intact. Ask your LGU about hazardous waste collection.</p></div></div></aside>`;
}
