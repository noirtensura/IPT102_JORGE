"use strict";

const routeFiles = {
  landing: "landingpage.php",
  scan: "scan.php",
  result: "scan-result.php",
  overview: "overview.php",
  history: "history.php",
  analytics: "analytics.php",
  guide: "waste-guide.php",
};

const state = {
  records: sampleRecords.map(record => ({ ...record })),
  mode: "upload", scenario: "plastic", candidate: null, result: null,
  processing: false, reading: false, uploadError: "", mascotTouched: false,
  historySearch: "", historyFilter: "all", guideSearch: "", guideFilter: "all"
};
const main = document.querySelector("#main");
const bottomNav = document.querySelector("#bottom-nav");
const helpDialog = document.querySelector("#help-dialog");
const helpQuestion = document.querySelector("#help-question");
const objectUrls = new Set();
let processingTimer;
let toastTimer;
let previewVersion = 0;
let route = "landing";

const mascotStates = {
  welcome: { scene: [1, 0], companion: [6, 0], motion: "wave", caption: "Hi! Let’s sort together." },
  ready: { scene: [6, 1], companion: [4, 0], motion: "present", caption: "Ready for your next item." },
  reading: { scene: [4, 1], companion: [6, 2], motion: "inspect", caption: "Opening your local image…" },
  camera: { scene: [5, 2], companion: [3, 0], motion: "inspect", caption: "Let’s frame a sample item." },
  processing: { scene: [5, 2], companion: [4, 1], motion: "inspect", caption: "Preparing your sample result…" },
  plastic: { scene: [3, 0], companion: [2, 2], motion: "nod", caption: "Let’s explore this plastic example." },
  paper: { scene: [3, 4], companion: [1, 3], motion: "nod", caption: "Let’s explore this paper example." },
  metal: { scene: [3, 1], companion: [1, 3], motion: "nod", caption: "Let’s explore this metal example." },
  glass: { scene: [3, 5], companion: [1, 3], motion: "nod", caption: "Let’s explore this glass example." },
  uncertain: { scene: [5, 0], companion: [2, 1], motion: "think", caption: "Let’s pause and double-check." },
  error: { scene: [3, 3], companion: [1, 2], motion: "think", caption: "A little snag. Let’s try again." },
  success: { scene: [5, 4], companion: [1, 5], motion: "celebrate", caption: "Your sample result is ready!" },
  saved: { scene: [4, 2], companion: [2, 4], motion: "celebrate", caption: "Saved! One more learning moment." },
  history: { scene: [5, 5], companion: [2, 3], motion: "present", caption: "Let’s revisit your sorting story." },
  empty: { scene: [1, 4], companion: [1, 2], motion: "think", caption: "A fresh start, one item at a time." },
  analytics: { scene: [4, 5], companion: [2, 5], motion: "present", caption: "Let’s look at the sample patterns." },
  guide: { scene: [4, 4], companion: [5, 3], motion: "nod", caption: "A little sorting wisdom for you." },
  overview: { scene: [4, 3], companion: [6, 5], motion: "present", caption: "Every item is a learning moment." },
  restored: { scene: [5, 1], companion: [3, 2], motion: "celebrate", caption: "Your five sample records are back!" },
  help: { scene: [6, 3], companion: [6, 0], motion: "wave", caption: "Ask away. I’m here to help." },
  thinking: { scene: [2, 1], companion: [1, 2], motion: "think", caption: "I’m listening. What are we sorting?" },
  sorting: { scene: [6, 4], companion: [6, 1], motion: "present", caption: "Let’s check each material carefully." },
  local: { scene: [1, 1], companion: [2, 0], motion: "present", caption: "Local collection rules come first." }
};
const mascotMotions = {
  wave: [{ transform: "rotate(0deg)" }, { transform: "translateY(-4px) rotate(-7deg)" }, { transform: "translateY(-4px) rotate(7deg)" }, { transform: "rotate(0deg)" }],
  present: [{ transform: "translateY(0)" }, { transform: "translateY(-6px)" }, { transform: "translateY(0)" }],
  inspect: [{ transform: "rotate(0deg)" }, { transform: "translateX(-3px) rotate(-3deg)" }, { transform: "translateX(3px) rotate(3deg)" }, { transform: "rotate(0deg)" }],
  think: [{ transform: "rotate(0deg)" }, { transform: "rotate(-5deg)" }, { transform: "rotate(3deg)" }, { transform: "rotate(0deg)" }],
  nod: [{ transform: "scale(1)" }, { transform: "translateY(3px) scale(1.035)" }, { transform: "scale(1)" }],
  celebrate: [{ transform: "translateY(0)" }, { transform: "translateY(-12px) rotate(-5deg)" }, { transform: "translateY(0) rotate(4deg)" }, { transform: "translateY(-5px)" }, { transform: "translateY(0)" }]
};
const reducedMascotMotion = matchMedia("(prefers-reduced-motion: reduce)");
let mascotState = "";

function pageMascotState() {
  if (route === "landing") return "welcome";
  if (route === "overview") return "overview";
  if (route === "history") return filteredRecords().length ? "history" : "empty";
  if (route === "analytics") return state.records.length ? "analytics" : "empty";
  if (route === "guide") return state.guideFilter === "uncertain" || !document.querySelector(".guide-card") ? "uncertain" : "guide";
  if (route === "result") {
    if (!state.result) return "ready";
    if (state.result.saved) return "saved";
    return state.result.category === "uncertain" ? "uncertain" : "success";
  }
  if (state.processing) return "processing";
  if (state.reading) return "reading";
  if (state.uploadError) return "error";
  if (state.candidate) return state.scenario;
  if (state.mode === "camera") return "camera";
  return state.mascotTouched ? "ready" : "welcome";
}

function updateMascots(context = helpDialog.open ? mascotState || "help" : pageMascotState()) {
  const reaction = mascotStates[context];
  document.querySelectorAll("[data-mascot-slot]").forEach(portrait => {
    if (portrait.dataset.mascotState === context) return;
    portrait.getAnimations().forEach(animation => animation.cancel());
    const [sheet, cell] = reaction[portrait.dataset.mascotSlot];
    portrait.dataset.mascotState = context;
    portrait.dataset.sheet = sheet;
    portrait.dataset.cell = cell;
    portrait.style.setProperty("--mascot-x", `${-(cell % 3) * 100}%`);
    portrait.style.setProperty("--mascot-y", `${-Math.floor(cell / 3) * 100}%`);
    portrait.querySelector("img").src = `assets/mascots/sheet-${sheet}.png`;
    if (!reducedMascotMotion.matches) {
      portrait.animate(mascotMotions[reaction.motion], { duration: reaction.motion === "celebrate" ? 1300 : 1000, iterations: reaction.motion === "inspect" ? 2 : 1, easing: "ease-in-out" });
    }
  });
  document.querySelectorAll("[data-mascot-caption]").forEach(caption => { caption.textContent = reaction.caption; });
  document.querySelector("#help-launcher").setAttribute("aria-label", `Ask Eco. ${reaction.caption}`);
  if (mascotState !== context) document.querySelector("#mascot-announcement").textContent = reaction.caption;
  document.body.dataset.mascotState = context;
  mascotState = context;
}

reducedMascotMotion.addEventListener("change", () => {
  if (reducedMascotMotion.matches) document.querySelectorAll("[data-mascot-slot]").forEach(portrait => portrait.getAnimations().forEach(animation => animation.cancel()));
});

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
  const page = legacyPage === "home" ? "overview" : legacyPage;
  if (!Object.hasOwn(routeFiles, page)) return false;
  history.replaceState(null, "", routeURL(page, material));
  return true;
}

function render(focus = false) {
  route = Object.keys(routeFiles).find(page => location.pathname.endsWith("/" + routeFiles[page])) || "landing";
  const material = new URLSearchParams(location.search).get("material");
  if (route === "guide") state.guideFilter = Object.hasOwn(materials, material) ? material : "all";
  const pages = { landing: landingPage, overview: overviewPage, scan: scanPage, result: resultPage, history: historyPage, analytics: analyticsPage, guide: guidePage };
  const titles = { landing: "Welcome", overview: "Overview", scan: "Scan Waste", result: "Scan Result", history: "History", analytics: "Analytics", guide: "Waste Guide" };
  document.title = `${titles[route]} · EcoSort AI`;
  document.body.dataset.route = route;
  bottomNav.hidden = route === "landing";
  document.querySelector("#page-label").textContent = titles[route];
  const activeRoute = route === "result" ? "scan" : route;
  document.querySelectorAll(".nav-link").forEach(link => {
    if (link.pathname === new URL(routeURL(activeRoute), location.href).pathname) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  main.innerHTML = pages[route]();
  updateMascots();
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
  state.mascotTouched = true;
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
  showToast("Saved to history. This record lasts until refresh.");
}

function showRecord(id) {
  const record = state.records.find(item => item.id === id);
  if (!record) return;
  const material = materials[record.category];
  const dialog = document.querySelector("#record-dialog");
  dialog.innerHTML = `<div class="dialog-heading">${sampleLabel("Sample record")}<button class="icon-button" data-action="close-dialog" aria-label="Close record details">${icon("close")}</button></div><div class="record-detail-image material-${record.category}">${media(record)}</div><h2 id="record-title">${escapeHTML(record.name)}</h2>${tag(record.category)}<div class="record-metadata"><span><strong>${record.score}%</strong> illustrative confidence</span><span>${escapeHTML(record.date)} · ${escapeHTML(record.time)}</span></div><p>${material.advice}</p><p class="fine-print">This record uses a preset sample result. Check local collection rules before disposal.</p><a class="button secondary full-width" href="waste-guide.php?material=${record.category}">Explore ${material.name.toLowerCase()} guidance${icon("arrow")}</a>`;
  dialog.showModal();
}

function updateHistory() {
  document.querySelector("#history-list").innerHTML = historyRows();
  document.querySelector("#history-count").textContent = `(${filteredRecords().length})`;
  updateMascots();
}

function helpAnswer(question) {
  const query = question.toLowerCase();
  if (/\b(batter(?:y|ies)|e[- ]?waste|electronics?|chemicals?|paint|solvents?|needles?|syringes?|sharps?|aerosols?|pressuri[sz]ed)\b|\bbroken glass\b/.test(query)) {
    return { mood: "uncertain", text: `Special-handling items need their own collection guidance. ${materials.uncertain.caution} Avoid direct contact with sharps or broken glass, and ask your local collector about safe containment and collection.`, href: "waste-guide.php?material=uncertain", label: "Special-handling guidance" };
  }
  if (/\b(confidence|accuracy|scores?|predictions?|models?)\b|\b(real|live|cloud) ai\b|\bare you (an? )?ai\b/.test(query)) {
    return { mood: "guide", text: "My answers come from EcoSort’s built-in guide. Scan categories and confidence scores are preset examples, not live AI predictions or measured accuracy. Images and questions stay in this browser.", href: "scan.php", label: "Explore sample results" };
  }
  if (/\b(scans?|scanning|uploads?|uploading|camera|photos?|pictures?|images?)\b/.test(query)) {
    return { mood: "camera", text: "Open Scan Waste, choose a JPEG, PNG, or WebP image up to 10 MB, or try a sample image. Pick a sample material, then select “View Sample Result.” A separate result page opens. Choose “Continue to Overview” when you’re ready. The image is a local preview; it isn’t analyzed. Camera mode captures an illustrated sample.", href: "scan.php", label: "Open Scan Waste" };
  }
  if (/\b(history|records?|saved?|saving|refresh|reload)\b/.test(query)) {
    return { mood: "history", text: "Use “Save to History” on a result, then choose History from the bottom navigation to search, filter, and view details. EcoSort starts with five sample records. New records and this conversation stay only in this tab; refreshing restores the samples and clears your additions.", href: "history.php", label: "Open History" };
  }
  if (/\b(analytics|charts?|statistics|stats|counts?)\b/.test(query)) {
    return { mood: "analytics", text: "Analytics counts the sample records in your current history. The bars compare materials, and the donut shows their shares. The table lists the same values in text. These counts don’t measure waste weight, real recycling, or environmental impact.", href: "analytics.php", label: "View Analytics" };
  }
  if (/\b(lgu|barangay|local|collectors?|nearby)\b|\bbin colou?rs?\b|\bwhich bin\b/.test(query)) {
    return { mood: "local", text: "Collection rules, bin colors, and accepted materials vary. Check your barangay / LGU or local collector before sorting. I don’t have a live directory of collection points, so I can offer general material guidance rather than verify local acceptance.", href: "waste-guide.php", label: "Explore the Waste Guide" };
  }
  if (/\bbottles?\b/.test(query) && !/\b(plastics?|pet|hdpe|glass)\b/.test(query)) {
    return { mood: "uncertain", text: "A bottle could be plastic or glass, and each may have a different collection route. Check its material first. Tell me “plastic bottle” or “glass bottle” for the relevant guidance, then confirm local acceptance.", href: "waste-guide.php", label: "Compare material guides" };
  }
  const keywords = {
    plastic: /\b(plastics?|pet|hdpe)\b/,
    paper: /\b(paper|newspapers?|cardboard|cartons?|magazines?|books?)\b/,
    metal: /\b(metals?|alumin(?:um|ium)|steel|tins?|cans)\b|\b(drink|food|soda) can\b|^can[?.!]*$/,
    glass: /\bglass\b/,
    uncertain: /\b(unknown|uncertain|unsure|mixed|wrappers?|sachets?)\b/
  };
  const matches = Object.keys(materials).filter(key => keywords[key].test(query));
  if (matches.length === 1) {
    const key = matches[0];
    return { mood: key, text: `${materials[key].name} guidance: ${materials[key].advice}\n\n${materials[key].caution}`, href: `waste-guide.php?material=${key}`, label: `Read the ${materials[key].name.toLowerCase()} guide` };
  }
  if (matches.length > 1) {
    return { mood: "sorting", text: `You mentioned ${matches.map(key => materials[key].name.toLowerCase()).join(" and ")}. Check each material separately; a mixed-material item may need different handling. The Waste Guide explains the preparation tips and cautions for each.`, href: "waste-guide.php", label: "Compare material guides" };
  }
  if (/\b(hello|hi|hey|thanks|thank you)\b/.test(query)) {
    return { mood: "welcome", text: "Happy to help! I’m Eco, your sorting sidekick. Ask about plastic, paper, metal, glass, or using EcoSort. My answers are built-in guidance, so always check your local collector’s rules.", href: "waste-guide.php", label: "Browse the Waste Guide" };
  }
  return { mood: "uncertain", text: "I don’t have a built-in answer for that yet. I can help with plastic, paper, metal, glass, uncertain items, scanning, history, and analytics. Try naming a material or choose a suggested question below.", href: "waste-guide.php", label: "Find material guidance" };
}

function addHelpMessage(text, sender, answer) {
  const message = document.createElement("article");
  message.className = `help-message${sender === "You" ? " user" : ""}`;
  const speaker = document.createElement("span");
  speaker.className = "help-speaker";
  speaker.textContent = sender;
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  message.append(speaker, paragraph);
  if (answer) {
    const link = document.createElement("a");
    link.className = "text-link";
    link.href = answer.href;
    link.textContent = `${answer.label} →`;
    message.append(link);
  }
  const messages = document.querySelector("#help-messages");
  messages.append(message);
  messages.scrollTop = messages.scrollHeight;
}

function askEco(question) {
  addHelpMessage(question, "You");
  const answer = helpAnswer(question);
  addHelpMessage(answer.text, "Eco", answer);
  updateMascots(answer.mood);
  helpQuestion.value = "";
  helpQuestion.setCustomValidity("");
  helpQuestion.focus();
}

document.querySelector("#help-form").addEventListener("submit", event => {
  event.preventDefault();
  const question = helpQuestion.value.trim();
  if (!question || question.length > 500) {
    updateMascots("error");
    helpQuestion.setCustomValidity(question ? "Keep your question to 500 characters." : "Enter a question for Eco.");
    helpQuestion.reportValidity();
    return;
  }
  askEco(question);
});
helpQuestion.addEventListener("input", () => {
  helpQuestion.setCustomValidity("");
  updateMascots(helpQuestion.value.trim() ? "thinking" : "help");
});

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
    case "help": helpDialog.showModal(); updateMascots("help"); helpQuestion.focus(); break;
    case "help-question": askEco(button.dataset.question); break;
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
    case "restore-samples": state.records = sampleRecords.map(record => ({ ...record })); if (state.result) state.result.saved = false; state.historyFilter = "all"; state.historySearch = ""; render(); updateMascots("restored"); showToast("The five sample records are back."); break;
    case "reset-history-filters": state.historyFilter = "all"; state.historySearch = ""; render(); document.querySelector("#history-search").focus(); break;
    case "reset-guide-filters": state.guideFilter = "all"; state.guideSearch = ""; navigate("guide"); break;
  }
});

document.addEventListener("input", event => {
  if (event.target.id === "history-search") { state.historySearch = event.target.value; updateHistory(); }
  if (event.target.id === "guide-search") { state.guideSearch = event.target.value; document.querySelector("#guide-results").innerHTML = guideCards(); updateMascots(); }
});

document.addEventListener("change", event => {
  switch (event.target.id) {
    case "image-file": selectFile(event.target.files[0]); break;
    case "sample-scenario": state.scenario = event.target.value; if (state.candidate && !state.candidate.image) { state.candidate.name = `${materials[state.scenario].example} (sample)`; state.candidate.category = state.scenario; const focused = event.target.id; render(); document.getElementById(focused).focus(); } updateMascots(state.scenario); break;
    case "history-filter": state.historyFilter = event.target.value; updateHistory(); break;
    case "guide-filter": state.guideFilter = event.target.value; history.replaceState(null, "", routeURL("guide", state.guideFilter)); document.querySelector("#guide-results").innerHTML = guideCards(); updateMascots(pageMascotState()); break;
  }
});

document.addEventListener("keydown", event => {
  if (event.target.matches(".mode-tab") && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
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

new MutationObserver(() => {
  document.querySelector("#help-launcher").setAttribute("aria-expanded", String(helpDialog.open));
  if (!helpDialog.open) updateMascots(pageMascotState());
}).observe(helpDialog, { attributes: true, attributeFilter: ["open"] });
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
