"use strict";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let walkthroughStep = 0;
let walkthroughDemoMaterial = "plastic";
let walkthroughSampleReady = false;
let walkthroughSampleSaved = false;
let walkthroughTimer = null;
let walkthroughAutoTimer = null;
let walkthroughPlaying = true;
let walkthroughResizeObserver;

function stopWalkthrough() {
  document.querySelectorAll(".walkthrough-step").forEach(step => step.getAnimations().forEach(animation => animation.cancel()));
  clearTimeout(walkthroughTimer);
  walkthroughTimer = null;
  clearTimeout(walkthroughAutoTimer);
  walkthroughAutoTimer = null;
  walkthroughResizeObserver?.disconnect();
  walkthroughResizeObserver = null;
}

function scheduleWalkthrough() {
  clearTimeout(walkthroughAutoTimer);
  walkthroughAutoTimer = null;
  if (!document.querySelector("#walkthrough") || !walkthroughPlaying || document.hidden || document.querySelector(".walkthrough-step:focus-within")) return;
  walkthroughAutoTimer = setTimeout(() => setWalkthroughStep(walkthroughStep + 1, true), 5000);
}

function resizeWalkthrough() {
  const active = document.querySelector(".walkthrough-step[data-tour-active]");
  if (active) document.querySelector(".walkthrough-track").style.height = `${active.offsetHeight}px`;
}

function animateWalkthroughStep(step, previous, direction) {
  if (!reducedMotion.matches && direction) {
    const options = { duration: 600, easing: "cubic-bezier(.4, 0, .2, 1)" };
    const outgoing = previous.animate(
      [{ transform: "translateX(0)" }, { transform: `translateX(${-direction * 100}%)` }],
      { ...options, fill: "forwards" }
    );
    // Canceled slides are cleaned up by the next card change.
    outgoing.finished.then(() => { if (!previous.hasAttribute("data-tour-active")) previous.hidden = true; }, () => {});
    step.animate(
      [{ transform: `translateX(${direction * 100}%)` }, { transform: "translateX(0)" }],
      options
    );
  }
}

function setWalkthroughStep(index, automatic = false) {
  const steps = [...document.querySelectorAll(".walkthrough-step")];
  if (!steps.length || !Number.isInteger(index)) return;
  const previousStep = walkthroughStep;
  walkthroughStep = (index % steps.length + steps.length) % steps.length;
  const focused = document.activeElement;
  steps.forEach((step, number) => {
    step.getAnimations().forEach(animation => animation.cancel());
    step.hidden = number !== walkthroughStep && (number !== previousStep || previousStep === walkthroughStep || reducedMotion.matches);
    step.toggleAttribute("data-tour-active", number === walkthroughStep);
    step.inert = number !== walkthroughStep;
    step.setAttribute("aria-hidden", String(number !== walkthroughStep));
    step.setAttribute("aria-roledescription", "slide");
    step.removeAttribute("aria-labelledby");
    step.setAttribute("aria-label", `${number + 1} of ${steps.length}: ${step.dataset.tourTitle}`);
  });
  document.querySelector(".walkthrough-track").setAttribute("aria-live", automatic ? "off" : "polite");
  resizeWalkthrough();
  if (previousStep !== walkthroughStep) animateWalkthroughStep(steps[walkthroughStep], steps[previousStep], Math.sign(index - previousStep));
  const focusedStep = focused?.closest(".walkthrough-step");
  if (focusedStep && !focusedStep.hasAttribute("data-tour-active")) steps[walkthroughStep].querySelector("h2")?.focus({ preventScroll: true });
  scheduleWalkthrough();
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
      ? `${material.example} ready. View the result next.`
      : "Practice only · nothing saved.";
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
    ? "Demo saved. Scan records last until refresh."
    : "Try the tip or save button.";
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
  if (placeholderCaption) placeholderCaption.textContent = material.example;
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

function setupWalkthrough() {
  stopWalkthrough();
  walkthroughStep = 0;
  walkthroughDemoMaterial = "plastic";
  walkthroughSampleReady = false;
  walkthroughSampleSaved = false;
  walkthroughPlaying = true;
  setWalkthroughStep(0);
  const track = document.querySelector(".walkthrough-track");
  walkthroughResizeObserver = new ResizeObserver(resizeWalkthrough);
  track.querySelectorAll(".walkthrough-step").forEach(step => walkthroughResizeObserver.observe(step));
  track.addEventListener("focusin", scheduleWalkthrough);
  track.addEventListener("focusout", () => queueMicrotask(scheduleWalkthrough));
}

document.addEventListener("visibilitychange", scheduleWalkthrough);

document.addEventListener("click", event => {
  const button = event.target.closest("[data-tour-next], [data-tour-prev], [data-tour-toggle], [data-tour-restart], [data-tour-material], [data-tour-sample], [data-tour-demo-save], [data-tour-feature]");
  if (!button || button.disabled || !button.closest("#walkthrough")) return;
  if (button.hasAttribute("data-tour-next")) setWalkthroughStep(walkthroughStep + 1);
  if (button.hasAttribute("data-tour-prev")) setWalkthroughStep(walkthroughStep - 1);
  if (button.hasAttribute("data-tour-restart")) setWalkthroughStep(0);
  if (button.hasAttribute("data-tour-toggle")) {
    walkthroughPlaying = !walkthroughPlaying;
    button.textContent = walkthroughPlaying ? "Pause" : "Play";
    button.setAttribute("aria-label", walkthroughPlaying ? "Pause slideshow" : "Play slideshow");
    scheduleWalkthrough();
  }
  if (button.hasAttribute("data-tour-material")) selectWalkthroughMaterial(button.dataset.tourMaterial);
  if (button.hasAttribute("data-tour-sample")) {
    clearTimeout(walkthroughTimer);
    if (reducedMotion.matches) {
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

reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) {
    document.querySelectorAll(".walkthrough-step").forEach(step => {
      step.getAnimations().forEach(animation => animation.cancel());
      step.hidden = !step.hasAttribute("data-tour-active");
    });
  }
});
