import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const base = new URL(process.argv[2] || "http://localhost/IPT_JORGE/");
if (!base.pathname.endsWith("/")) base.pathname += "/";
assert(["localhost", "127.0.0.1", "[::1]"].includes(base.hostname), "Run these checks against a local PHP server.");
const browser = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  join(process.env.LOCALAPPDATA || "", "Google/Chrome/Application/chrome.exe"),
  "/usr/bin/chromium", "/usr/bin/google-chrome"
].find(path => existsSync(path));
assert(browser, "Install Chrome / Edge, or open tests/prototype.test.html manually in a browser.");
const entry = await fetch(base);
assert(entry.ok && new URL(entry.url).pathname.endsWith("/landingpage.php"), `Start XAMPP Apache at ${base}`);
for (const [file, title] of [["landingpage.php", "Welcome"], ["scan.php", "Scan Waste"], ["scan-result.php", "Scan Result"], ["overview.php", "Overview"], ["history.php", "History"], ["analytics.php", "Analytics"], ["waste-guide.php", "Waste Guide"]]) {
  const response = await fetch(new URL(file, base));
  assert.equal(response.status, 200, `PHP page did not load: ${file}`);
  assert(response.headers.get("content-type")?.includes("text/html"), `PHP page was not served as HTML: ${file}`);
  const html = await response.text();
  assert(html.includes(`<title>${title} · EcoSort AI</title>`) && !html.includes("<?php"), `PHP template did not render: ${file}`);
}
const legacy = await fetch(new URL("index.html", base));
assert(legacy.ok && new URL(legacy.url).pathname.endsWith("/landingpage.php"), "Legacy index.html redirect failed.");
assert.equal((await fetch(new URL("includes/layout.php", base))).status, 404, "The layout should not be a standalone page.");
console.log("PHP pages, server-rendered titles, root redirect, and legacy entry passed.");
const execute = promisify(execFile);

async function headless(args) {
  const profile = mkdtempSync(join(tmpdir(), "ecosort-check-"));
  try {
    return await execute(browser, ["--headless=new", "--no-first-run", "--no-default-browser-check", "--disable-extensions", "--disable-background-networking", "--disable-component-update", "--disable-sync", `--user-data-dir=${profile}`, ...args], { windowsHide: true, timeout: 45000, maxBuffer: 4 * 1024 * 1024 });
  } finally {
    assert(dirname(resolve(profile)) === resolve(tmpdir()) && profile.split(/[\\/]/).at(-1).startsWith("ecosort-check-"), "Refusing to remove an unexpected browser profile path.");
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
    catch { console.warn(`Temporary headless profile is still in use: ${profile}`); }
  }
}

const result = await headless(["--dump-dom", "--virtual-time-budget=60000", "--force-prefers-reduced-motion=reduce", new URL("tests/prototype.test.html", base).href]);
const report = (result.stdout.match(/<pre id="results">([\s\S]*?)<\/pre>/)?.[1] || "No browser check report returned.").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
console.log(report);
assert(/<body[^>]*data-test-status="passed"/.test(result.stdout), "Browser checks failed or did not finish. See the report above.");

const motionResult = await headless(["--dump-dom", "--virtual-time-budget=5000", new URL("tests/mascot-motion.test.html", base).href]);
console.log(motionResult.stdout.match(/<pre id="results">([\s\S]*?)<\/pre>/)?.[1] || "No mascot motion report returned.");
assert(/<body[^>]*data-test-status="passed"/.test(motionResult.stdout), "Mascot motion checks failed.");

const artifacts = join(root, "artifacts");
mkdirSync(artifacts, { recursive: true });
for (const [name, width, height, page] of [["landing-desktop", 1440, 1050, "landing"], ["landing-mobile", 390, 1200, "landing"], ["overview-desktop", 1440, 1120, "overview"], ["overview-mobile", 390, 1200, "overview"], ["scan-desktop", 1440, 1050, "scan"], ["scan-mobile", 390, 1200, "scan"], ["result-desktop", 1440, 1150, "result"], ["result-mobile", 390, 1200, "result"], ["helper-mobile", 390, 900, "scan"]]) {
  const screenshot = join(artifacts, `${name}.png`);
  const previewParams = new URLSearchParams();
  if (!name.endsWith("mobile")) previewParams.set("desktop", "");
  if (name === "helper-mobile") previewParams.set("help", "");
  previewParams.set("page", page);
  const target = new URL(`tests/mobile-preview.html?${previewParams}`, base).href;
  await headless([`--screenshot=${screenshot}`, `--window-size=${width},${height}`, "--hide-scrollbars", "--force-prefers-reduced-motion=reduce", `--virtual-time-budget=${page === "result" ? 3000 : 1200}`, target]);
  assert(existsSync(screenshot), `Screenshot not created: ${name}`);
}
console.log("Desktop, mobile, scan, and mascot-helper screenshots saved to artifacts/.");
