"use strict";

const routeFiles = {
  landing: "landingpage.php",
  scan: "scan.php",
  result: "scan-result.php",
  overview: "overview.php",
  history: "history.php",
  guide: "waste-guide.php",
};

const state = {
  records: sampleRecords.map(record => ({ ...record })),
  mode: "upload", scenario: "plastic", candidate: null, result: null,
  processing: false, reading: false, uploadError: "",
  historySearch: "", historyFilter: "all", guideSearch: "", guideFilter: "all"
};
const main = document.querySelector("#main");
const bottomNav = document.querySelector("#bottom-nav");
const objectUrls = new Set();
let processingTimer;
let toastTimer;
let previewVersion = 0;
let route = "landing";

function routeURL(page, material = "all") {
  return routeFiles[page] + (page === "guide" && Object.hasOwn(materials, material) ? `?material=${encodeURIComponent(material)}` : "");
}

function navigate(page, material) {
  const url = new URL(routeURL(page, material), location.href);
  if (url.href !== location.href) history.pushState(null, "", url);
  cancelProcessing();
  document.querySelectorAll("dialog[open]").forEach(dialog => dialog.close());
  render(true);
}

function normalizeLegacyRoute() {
  const [legacyPage, material] = location.hash.slice(1).split("/");
  const page = legacyPage === "home" ? "overview" : legacyPage === "analytics" ? "history" : legacyPage;
  if (!Object.hasOwn(routeFiles, page)) return false;
  history.replaceState(null, "", routeURL(page, material));
  return true;
}

function render(focus = false) {
  route = Object.keys(routeFiles).find(page => location.pathname.endsWith("/" + routeFiles[page])) || "landing";
  const material = new URLSearchParams(location.search).get("material");
  if (route === "guide") state.guideFilter = Object.hasOwn(materials, material) ? material : "all";
  const pages = { landing: landingPage, overview: overviewPage, scan: scanPage, result: resultPage, history: historyPage, guide: guidePage };
  const titles = { landing: "Welcome", overview: "Overview", scan: "Scan Waste", result: "Scan Result", history: "History", guide: "Waste Guide" };
  document.title = `${titles[route]} · EcoSort`;
  document.body.dataset.route = route;
  bottomNav.hidden = route === "landing";
  document.querySelector("#page-label").textContent = titles[route];
  const activeRoute = route === "result" ? "scan" : route;
  document.querySelectorAll(".nav-link").forEach(link => {
    if (link.pathname === new URL(routeURL(activeRoute), location.href).pathname) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  stopWalkthrough();
  main.innerHTML = pages[route]();
  if (route === "landing") setupWalkthrough();
  if (focus) {
    main.querySelector("h1")?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
}

function releaseUnusedImages() {
  const used = new Set([state.candidate?.image, state.result?.image, ...state.records.map(record => record.image)]);
  objectUrls.forEach(url => { if (!used.has(url)) { URL.revokeObjectURL(url); objectUrls.delete(url); } });
}

function cancelProcessing() {
  clearTimeout(processingTimer);
  state.processing = false;
}

function resetScan() {
  previewVersion++;
  cancelProcessing();
  state.candidate = null;
  state.result = null;
  state.reading = false;
  state.uploadError = "";
  releaseUnusedImages();
}

function useSample() {
  resetScan();
  state.candidate = { name: `${materials[state.scenario].example} (sample)`, category: state.scenario };
  render();
  main.querySelector('[data-action="classify"]')?.focus();
}

async function selectFile(file) {
  if (state.processing || !file) return;
  resetScan();
  const version = previewVersion;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    state.uploadError = "Choose a JPEG, PNG, or WebP image. Other file types aren’t supported.";
  } else if (file.size > 10 * 1024 * 1024) {
    state.uploadError = "This image is too large. Choose an image smaller than 10 MB.";
  } else if (!file.size) {
    state.uploadError = "This file is empty. Choose another image.";
  } else {
    state.reading = true;
    render();
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (version !== previewVersion) { URL.revokeObjectURL(url); return; }
      if (image.naturalWidth * image.naturalHeight > 40000000) throw new Error("large-dimensions");
      objectUrls.add(url);
      state.candidate = { image: url, name: file.name, category: state.scenario };
    } catch (error) {
      URL.revokeObjectURL(url);
      if (version !== previewVersion) return;
      state.uploadError = error.message === "large-dimensions" ? "This image has very large dimensions. Choose an image below 40 megapixels." : "We couldn’t open this image. Try another JPEG, PNG, or WebP file.";
    }
    state.reading = false;
  }
  if (route === "scan") {
    render();
    main.querySelector(state.candidate ? '[data-action="classify"]' : '[data-action="choose-file"]')?.focus();
  }
}

function classify() {
  if (!state.candidate || state.processing || state.reading) return;
  state.processing = true;
  render();
  main.querySelector('.scan-actions [data-action="reset"]')?.focus();
  processingTimer = setTimeout(() => {
    state.processing = false;
    state.result = { ...state.candidate, category: state.scenario, score: materials[state.scenario].score, saved: false };
    navigate("result");
  }, 950);
}

function saveResult() {
  if (!state.result || state.result.saved) return;
  const now = new Date();
  state.records.unshift({ ...state.result, id: `saved-${crypto.randomUUID()}`, date: new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila" }).format(now), time: `${new Intl.DateTimeFormat("en-PH", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" }).format(now)} PHT` });
  state.result.saved = true;
  render();
  main.querySelector('a[href="overview.php"]')?.focus();
  showToast("Saved to History · until refresh.");
}

function showRecord(id) {
  const record = state.records.find(item => item.id === id);
  if (!record) return;
  const material = materials[record.category];
  const dialog = document.querySelector("#record-dialog");
  dialog.innerHTML = `<div class="dialog-heading">${sampleLabel("Sample record")}<button class="icon-button" data-action="close-dialog" aria-label="Close record details">${icon("close")}</button></div><div class="record-detail-image material-${record.category}">${media(record)}</div><h2 id="record-title">${escapeHTML(record.name)}</h2>${tag(record.category)}<div class="record-metadata"><span><strong>${record.score}%</strong> sample confidence</span><span>${escapeHTML(record.date)} · ${escapeHTML(record.time)}</span></div><p>${material.advice}</p><a class="button secondary full-width" href="waste-guide.php?material=${record.category}">${material.name} guide${icon("arrow")}</a>`;
  dialog.showModal();
}

function updateHistory() {
  document.querySelector("#history-list").innerHTML = historyRows();
  document.querySelector("#history-count").textContent = `(${filteredRecords().length})`;
}

document.addEventListener("click", event => {
  if (event.target.closest(".skip-link")) { event.preventDefault(); main.focus(); main.scrollIntoView(); return; }
  const modeButton = event.target.closest("[data-mode]");
  if (modeButton) {
    if (state.mode !== modeButton.dataset.mode) { resetScan(); state.mode = modeButton.dataset.mode; render(); }
    document.querySelector(`#${state.mode}-tab`).focus();
    return;
  }
  const button = event.target.closest("[data-action]");
  if (!button || button.disabled) return;
  switch (button.dataset.action) {
    case "about": document.querySelector("#about-dialog").showModal(); break;
    case "close-dialog": button.closest("dialog").close(); break;
    case "choose-file": document.querySelector("#image-file").click(); break;
    case "use-sample": case "capture": useSample(); break;
    case "reset": resetScan(); render(); main.querySelector(state.mode === "upload" ? '[data-action="choose-file"]' : '[data-action="capture"]')?.focus(); break;
    case "classify": classify(); break;
    case "scan-another": resetScan(); navigate("scan"); break;
    case "save-result": saveResult(); break;
    case "record": showRecord(button.dataset.id); break;
    case "clear-history": document.querySelector("#clear-dialog").showModal(); break;
    case "confirm-clear": document.querySelector("#clear-dialog").close(); document.querySelector("#record-dialog").innerHTML = ""; state.records = []; if (state.result) state.result.saved = false; state.historyFilter = "all"; state.historySearch = ""; releaseUnusedImages(); render(); main.querySelector("h1")?.focus(); showToast("History cleared. You can restore the five sample records."); break;
    case "restore-samples": state.records = sampleRecords.map(record => ({ ...record })); if (state.result) state.result.saved = false; state.historyFilter = "all"; state.historySearch = ""; render(); showToast("The five sample records are back."); break;
    case "reset-history-filters": state.historyFilter = "all"; state.historySearch = ""; render(); document.querySelector("#history-search").focus(); break;
    case "reset-guide-filters": state.guideFilter = "all"; state.guideSearch = ""; navigate("guide"); break;
  }
});

document.addEventListener("input", event => {
  if (event.target.id === "history-search") { state.historySearch = event.target.value; updateHistory(); }
  if (event.target.id === "guide-search") { state.guideSearch = event.target.value; document.querySelector("#guide-results").innerHTML = guideCards(); }
});

document.addEventListener("change", event => {
  switch (event.target.id) {
    case "image-file": selectFile(event.target.files[0]); break;
    case "sample-scenario": state.scenario = event.target.value; if (state.candidate && !state.candidate.image) { state.candidate.name = `${materials[state.scenario].example} (sample)`; state.candidate.category = state.scenario; const focused = event.target.id; render(); document.getElementById(focused).focus(); } break;
    case "history-filter": state.historyFilter = event.target.value; updateHistory(); break;
    case "guide-filter": state.guideFilter = event.target.value; history.replaceState(null, "", routeURL("guide", state.guideFilter)); document.querySelector("#guide-results").innerHTML = guideCards(); break;
  }
});

document.addEventListener("keydown", event => {
  if (event.target instanceof Element && event.target.matches(".mode-tab") && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
    event.preventDefault();
    const next = event.key === "Home" ? "upload" : event.key === "End" ? "camera" : state.mode === "upload" ? "camera" : "upload";
    document.querySelector(`[data-mode="${next}"]`).click();
  }
});

document.addEventListener("dragover", event => {
  const zone = event.target.closest("#dropzone");
  if (zone && state.mode === "upload") { event.preventDefault(); if (!state.processing) zone.classList.add("dragover"); }
});
document.addEventListener("dragleave", event => {
  const zone = event.target.closest("#dropzone");
  if (zone && !zone.contains(event.relatedTarget)) zone.classList.remove("dragover");
});
document.addEventListener("drop", event => {
  event.preventDefault();
  const zone = event.target.closest("#dropzone");
  if (!zone || state.mode !== "upload" || state.processing) return;
  zone.classList.remove("dragover");
  if (event.dataTransfer.files.length !== 1) { resetScan(); state.uploadError = "Choose one image at a time, then try again."; render(); return; }
  selectFile(event.dataTransfer.files[0]);
});
document.addEventListener("dragover", event => { if (event.dataTransfer.types.includes("Files")) event.preventDefault(); });

document.querySelectorAll("dialog").forEach(dialog => dialog.addEventListener("click", event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
}));
document.addEventListener("click", event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest("a[href]");
  if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
  const url = new URL(link.href);
  const page = Object.keys(routeFiles).find(key => new URL(routeURL(key), location.href).pathname === url.pathname);
  if (url.origin !== location.origin || url.hash || !page) return;
  event.preventDefault();
  navigate(page, url.searchParams.get("material"));
});
window.addEventListener("popstate", () => { cancelProcessing(); render(true); });
window.addEventListener("hashchange", () => { if (normalizeLegacyRoute()) { cancelProcessing(); render(true); } });
normalizeLegacyRoute();
render(true);
