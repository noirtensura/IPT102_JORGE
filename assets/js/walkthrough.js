"use strict";

const walkthroughMobile = matchMedia("(max-width: 767px)");
let walkthroughStep = 0;
let walkthroughDemoMaterial = "plastic";
let walkthroughSampleReady = false;
let walkthroughSampleSaved = false;
let walkthroughTimer = null;
let walkthroughScrollTimer = null;
let lastWalkthroughScrollAt = 0;
let programmaticScrollUntil = 0;

function stopWalkthrough() {
  clearTimeout(walkthroughTimer);
  walkthroughTimer = null;
  clearTimeout(walkthroughScrollTimer);
  walkthroughScrollTimer = null;
  window.removeEventListener("scroll", scheduleWalkthroughScrollSync);
  window.removeEventListener("resize", scheduleWalkthroughScrollSync);
}

function animateWalkthroughStep(step, direction) {
  step.getAnimations().forEach(animation => animation.cancel());
  if (!reducedMascotMotion.matches && !walkthroughMobile.matches && direction) {
    step.animate(
      [{ opacity: 0, transform: `translateX(${direction * 22}px)` }, { opacity: 1, transform: "translateX(0)" }],
      { duration: 240, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
    );
  }
}

function syncWalkthroughScrollStep() {
  if (!walkthroughMobile.matches || !document.querySelector("#walkthrough")) return;
  if (performance.now() < programmaticScrollUntil) return;
  const steps = [...document.querySelectorAll(".walkthrough-step")];
  if (!steps.length) return;
  const topbar = document.querySelector(".walkthrough-topbar");
  const threshold = (topbar ? topbar.getBoundingClientRect().bottom : 72) + Math.min(120, window.innerHeight * 0.18);
  let active = 0;
  if (window.scrollY <= 24) {
    active = 0;
  } else if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24) {
    active = steps.length - 1;
  } else {
    steps.forEach((step, index) => {
      if (step.getBoundingClientRect().top <= threshold) active = index;
    });
  }
  setWalkthroughStep(active, false);
}

function scheduleWalkthroughScrollSync() {
  const now = performance.now();
  if (now - lastWalkthroughScrollAt >= 32) {
    lastWalkthroughScrollAt = now;
    syncWalkthroughScrollStep();
  }
  clearTimeout(walkthroughScrollTimer);
  walkthroughScrollTimer = setTimeout(() => {
    walkthroughScrollTimer = null;
    lastWalkthroughScrollAt = performance.now();
    syncWalkthroughScrollStep();
  }, 40);
}

function setWalkthroughStep(index, scroll = false) {
  const steps = [...document.querySelectorAll(".walkthrough-step")];
  if (!steps.length || !Number.isInteger(index)) return;
  const previousStep = walkthroughStep;
  const nextStep = Math.max(0, Math.min(steps.length - 1, index));
  const changed = previousStep !== nextStep;
  walkthroughStep = nextStep;
  const focused = document.activeElement;
  steps.forEach((step, number) => {
    step.hidden = !walkthroughMobile.matches && number !== walkthroughStep;
    step.toggleAttribute("data-tour-active", number === walkthroughStep);
    step.setAttribute("aria-roledescription", walkthroughMobile.matches ? "step" : "slide");
    if (number !== walkthroughStep) {
      step.getAnimations().forEach(animation => animation.cancel());
      step.querySelectorAll(".mascot-portrait").forEach(portrait => portrait.getAnimations().forEach(animation => animation.cancel()));
    }
  });
  document.querySelectorAll(".tour-step-pill[data-tour-jump]").forEach((pill, number) => {
    if (number === walkthroughStep) pill.setAttribute("aria-current", "step");
    else pill.removeAttribute("aria-current");
    pill.toggleAttribute("data-tour-done", number < walkthroughStep);
  });
  const fill = document.querySelector("#tour-progress-fill");
  if (fill) fill.style.width = `${((walkthroughStep + 1) / steps.length) * 100}%`;
  const scrollHintLabel = document.querySelector("#tour-scroll-hint span");
  if (scrollHintLabel) scrollHintLabel.textContent = walkthroughStep === steps.length - 1 ? "Ready to scan" : "Scroll down for steps";
  const prevButton = document.querySelector(".tour-arrow[data-tour-prev]");
  const nextButton = document.querySelector(".tour-arrow[data-tour-next]");
  if (prevButton) prevButton.disabled = walkthroughStep === 0;
  if (nextButton) nextButton.disabled = walkthroughStep === steps.length - 1;
  const status = document.querySelector("#walkthrough-status");
  if (status) {
    status.setAttribute("aria-live", walkthroughMobile.matches ? "off" : "polite");
    status.textContent = `${walkthroughStep + 1} / ${steps.length} · ${steps[walkthroughStep].dataset.tourTitle}`;
  }
  if (!helpDialog.open) updateMascots(pageMascotState());
  if (changed) {
    const portrait = steps[walkthroughStep].querySelector(".mascot-portrait");
    if (portrait) animateMascot(portrait, mascotStates[steps[walkthroughStep].dataset.tourMood].motion);
    animateWalkthroughStep(steps[walkthroughStep], Math.sign(nextStep - previousStep));
  }
  if (focused && (focused.closest(".walkthrough-step")?.hidden || focused.disabled)) {
    steps[walkthroughStep].querySelector("h2")?.focus({ preventScroll: true });
  }
  if (scroll && walkthroughMobile.matches) {
    programmaticScrollUntil = reducedMascotMotion.matches ? 0 : performance.now() + 650;
    steps[walkthroughStep].scrollIntoView({ behavior: reducedMascotMotion.matches ? "auto" : "smooth", block: "start" });
  }
}

function updateWalkthroughSampleUI(ready) {
  walkthroughSampleReady = ready;
  const material = materials[walkthroughDemoMaterial];
  const placeholder = document.querySelector("#tour-upload-placeholder");
  const scanning = document.querySelector("#tour-upload-scanning");
  const artBox = document.querySelector("#tour-upload-art");
  const seeResult = document.querySelector("#tour-see-result");
  const sampleButton = document.querySelector("[data-tour-sample]");
  const feedback = document.querySelector("#tour-sample-feedback");
  if (!placeholder || !scanning || !artBox || !sampleButton) return;
  scanning.hidden = true;
  placeholder.hidden = ready;
  artBox.hidden = !ready;
  if (seeResult) seeResult.hidden = !ready;
  sampleButton.disabled = ready;
  sampleButton.innerHTML = ready ? `${icon("check")}<span>Sample ready</span>` : `${icon("upload")}<span>Try this sample</span>`;
  if (feedback) {
    feedback.textContent = ready
      ? `Nice! ${material.example} is ready. Explore what the result looks like next.`
      : "This is a practice preview. Your scan history stays as it is.";
  }
}

function setWalkthroughSaveDemo(saved) {
  walkthroughSampleSaved = saved;
  const saveButton = document.querySelector("[data-tour-demo-save]");
  const feedback = document.querySelector("#tour-result-feedback");
  if (!saveButton || !feedback) return;
  saveButton.setAttribute("aria-pressed", String(saved));
  saveButton.innerHTML = saved
    ? `${icon("check")}<span>Saved in preview</span>`
    : `${icon("save")}<span>Save to History (demo)</span>`;
  feedback.textContent = saved
    ? "Preview saved! Real scans add entries to your in-session History until you refresh."
    : "Open the tip or test saving in this preview. Saving a real sample result is optional.";
}

function selectWalkthroughMaterial(key) {
  if (!Object.hasOwn(materials, key) || key === "uncertain") return;
  clearTimeout(walkthroughTimer);
  walkthroughTimer = null;
  walkthroughDemoMaterial = key;
  const material = materials[key];
  document.querySelectorAll("[data-tour-material]").forEach(chip => {
    chip.setAttribute("aria-pressed", String(chip.dataset.tourMaterial === key));
  });
  const placeholderCaption = document.querySelector("#tour-placeholder-caption");
  const sampleSvgUse = document.querySelector("#tour-sample-svg use");
  const sampleCaption = document.querySelector("#tour-sample-caption");
  if (placeholderCaption) placeholderCaption.textContent = `Ready to preview: ${material.example}.`;
  if (sampleSvgUse) sampleSvgUse.setAttribute("href", `#art-${key}`);
  if (sampleCaption) sampleCaption.textContent = `${material.example} · Illustrated sample`;
  updateWalkthroughSampleUI(false);

  const thumb = document.querySelector("#tour-result-thumb");
  const resultSvgUse = document.querySelector("#tour-result-svg use");
  const resultItem = document.querySelector("#tour-result-item");
  const resultTag = document.querySelector("#tour-result-tag");
  const resultScore = document.querySelector("#tour-result-score");
  const resultMeter = document.querySelector("#tour-result-meter");
  const resultFill = document.querySelector("#tour-result-fill");
  const resultAdvice = document.querySelector("#tour-result-advice");
  if (thumb) thumb.className = `thumb material-${key}`;
  if (resultSvgUse) resultSvgUse.setAttribute("href", `#art-${key}`);
  if (resultItem) resultItem.textContent = material.example;
  if (resultTag) {
    resultTag.className = `material-tag material-${key}`;
    resultTag.textContent = material.name;
  }
  if (resultScore) resultScore.textContent = `${material.score}%`;
  if (resultMeter) resultMeter.setAttribute("aria-valuenow", String(material.score));
  if (resultFill) resultFill.style.width = `${material.score}%`;
  if (resultAdvice) resultAdvice.textContent = material.advice;
  setWalkthroughSaveDemo(false);
}

function setupWalkthrough(preserveStep = false) {
  stopWalkthrough();
  const steps = [...document.querySelectorAll(".walkthrough-step")];
  if (!steps.length) return;
  if (!preserveStep) {
    walkthroughStep = 0;
    walkthroughDemoMaterial = "plastic";
    walkthroughSampleReady = false;
    walkthroughSampleSaved = false;
  }
  const focusedStep = document.activeElement?.closest(".walkthrough-step");
  if (focusedStep) walkthroughStep = Number(focusedStep.dataset.tourStep);
  document.querySelector(".walkthrough-track")?.setAttribute("aria-roledescription", walkthroughMobile.matches ? "walkthrough" : "carousel");
  setWalkthroughStep(walkthroughStep);
  if (walkthroughMobile.matches) {
    window.addEventListener("scroll", scheduleWalkthroughScrollSync, { passive: true });
    window.addEventListener("resize", scheduleWalkthroughScrollSync, { passive: true });
  }
}

walkthroughMobile.addEventListener("change", () => {
  if (!document.querySelector("#walkthrough")) return;
  setupWalkthrough(true);
  if (walkthroughMobile.matches) {
    programmaticScrollUntil = performance.now() + 200;
    document.querySelector(".walkthrough-step[data-tour-active]")?.scrollIntoView({ block: "start", behavior: "auto" });
  } else {
    window.scrollTo(0, 0);
  }
});

document.addEventListener("click", event => {
  const button = event.target.closest("[data-tour-next], [data-tour-prev], [data-tour-jump], [data-tour-restart], [data-tour-material], [data-tour-sample], [data-tour-demo-save], [data-tour-feature]");
  if (!button || button.disabled || !button.closest("#walkthrough")) return;
  if (button.hasAttribute("data-tour-next")) setWalkthroughStep(walkthroughStep + 1, true);
  if (button.hasAttribute("data-tour-prev")) setWalkthroughStep(walkthroughStep - 1, true);
  if (button.hasAttribute("data-tour-jump")) setWalkthroughStep(Number(button.dataset.tourJump), true);
  if (button.hasAttribute("data-tour-restart")) setWalkthroughStep(0, true);
  if (button.hasAttribute("data-tour-material")) selectWalkthroughMaterial(button.dataset.tourMaterial);
  if (button.hasAttribute("data-tour-sample")) {
    clearTimeout(walkthroughTimer);
    if (reducedMascotMotion.matches) {
      updateWalkthroughSampleUI(true);
    } else {
      const placeholder = document.querySelector("#tour-upload-placeholder");
      const scanning = document.querySelector("#tour-upload-scanning");
      const feedback = document.querySelector("#tour-sample-feedback");
      if (placeholder) placeholder.hidden = true;
      if (scanning) scanning.hidden = false;
      button.disabled = true;
      if (feedback) feedback.textContent = "Preparing illustrated sample…";
      walkthroughTimer = setTimeout(() => {
        walkthroughTimer = null;
        if (!document.querySelector("#walkthrough")) return;
        updateWalkthroughSampleUI(true);
      }, 320);
    }
  }
  if (button.hasAttribute("data-tour-demo-save")) {
    setWalkthroughSaveDemo(!walkthroughSampleSaved);
  }
  if (Object.hasOwn(walkthroughFeatures, button.dataset.tourFeature)) {
    document.querySelectorAll("[data-tour-feature]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    const description = document.querySelector("#tour-feature-description");
    if (description) description.textContent = walkthroughFeatures[button.dataset.tourFeature];
  }
});

document.addEventListener("keydown", event => {
  if (route !== "landing" || walkthroughMobile.matches || !document.querySelector("#walkthrough")) return;
  if (event.altKey || event.ctrlKey || event.metaKey || document.querySelector("dialog[open]")) return;
  if (event.target instanceof Element && event.target.closest("input, textarea, select, summary, [contenteditable]")) return;
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  const steps = document.querySelectorAll(".walkthrough-step");
  if (!steps.length) return;
  event.preventDefault();
  const index = event.key === "Home"
    ? 0
    : event.key === "End"
      ? steps.length - 1
      : walkthroughStep + (event.key === "ArrowRight" ? 1 : -1);
  setWalkthroughStep(index);
});

reducedMascotMotion.addEventListener("change", () => {
  if (reducedMascotMotion.matches) {
    document.querySelectorAll(".walkthrough-step").forEach(step => step.getAnimations().forEach(animation => animation.cancel()));
  }
});
