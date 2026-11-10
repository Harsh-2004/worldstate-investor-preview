const $ = (id) => document.getElementById(id);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = $("primary-navigation");
menuToggle?.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  menuToggle.textContent = expanded ? "Menu" : "Close";
  primaryNavigation?.classList.toggle("is-open", !expanded);
});
primaryNavigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  menuToggle?.setAttribute("aria-expanded", "false");
  if (menuToggle) menuToggle.textContent = "Menu";
  primaryNavigation.classList.remove("is-open");
}));
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  menuToggle?.setAttribute("aria-expanded", "false");
  if (menuToggle) menuToggle.textContent = "Menu";
  primaryNavigation?.classList.remove("is-open");
  menuToggle?.focus();
});

const heroDetails = [
  ["TOOL RESPONSE", '{ status: "succeeded", refund_id: "ref_01" }', "The API response describes one call. It does not prove the final economic outcome."],
  ["AUTHORITATIVE PROVIDER STATE", "ref_01: $20.00  +  ref_02: $20.00", "An ambiguous response was retried under a different idempotency key. Two distinct effects settled."],
  ["INDEPENDENT VERDICT", "FIN-IDEMPOTENCY-EFFECT → FAIL", "WorldState compares successful economic effects with authorization and retained-key identity - not with the agent's claim."],
];
document.querySelectorAll("[data-step]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-step]").forEach((item) => { item.classList.toggle("active", item === button); item.setAttribute("aria-pressed", String(item === button)); });
  const detail = heroDetails[Number(button.dataset.step)];
  $("hero-trace-detail").innerHTML = `<span>${esc(detail[0])}</span><code>${esc(detail[1])}</code><p>${esc(detail[2])}</p>`;
}));

const caseSteps = [
  { label: "STEP 01 / AGENT ACTION", title: "Issue the authorized refund", text: "The controlled fixture authorizes a $10.00 refund using a retained idempotency key. The reply times out, so completion is unknown.", code: 'create_refund({ amountMinor: 1000, key: retainedKey })\n→ { status: "timeout", effect: "unknown" }', effect: "$0.00", claim: "PENDING", invariant: "PENDING" },
  { label: "STEP 02 / PROVIDER AMBIGUITY", title: "The effect happened before timeout", text: "The synthetic mutation incorrectly evicts the retained idempotency result after execution begins. The first refund remains pending settlement.", code: 'provider effect: pending\nidempotency result: incorrectly evicted', effect: "$0.00", claim: "UNKNOWN", invariant: "UNKNOWN" },
  { label: "STEP 03 / GENERATED RETRY", title: "The same key executes again", text: "The bounded Explorer reaches a same-key retry within its explicit finite WorldSpec domain. This public narrative simplifies the underlying trace.", code: 'create_refund({ amountMinor: 1000, key: retainedKey })\n→ { status: "accepted" }', effect: "$0.00", claim: "SUCCESS", invariant: "AT RISK", danger: true },
  { label: "STEP 04 / ECONOMIC SETTLEMENT", title: "Both operations settle", text: "The provider executes two distinct refund effects. Delivery order is irrelevant to their economic total.", code: 'refund effect A → succeeded ($10.00)\nrefund effect B → succeeded ($10.00)', effect: "$20.00", claim: "SUCCESS", invariant: "CHECKING", danger: true },
  { label: "STEP 05 / INDEPENDENT VERDICT", title: "Retained-key uniqueness is violated", text: "The state-based oracle detects the duplicate effect and records a deterministic counterexample.", code: 'FIN-AUTHORIZED-SAFETY → FAIL\nFIN-IDEMPOTENCY-EFFECT → FAIL', effect: "$40.00", claim: "SUCCESS", invariant: "VIOLATION", danger: true },
];
let activeCaseStep = -1;
function renderCaseStep(index) {
  if (index === activeCaseStep) return;
  activeCaseStep = index; const step = caseSteps[index];
  document.querySelectorAll("[data-case-step]").forEach((button) => { const active = Number(button.dataset.caseStep) === index; button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active)); });
  document.querySelectorAll("[data-story-chapter]").forEach((chapter) => chapter.classList.toggle("active", Number(chapter.dataset.storyChapter) === index));
  $("case-step-label").textContent = step.label;
  $("case-step-label").style.setProperty("--trace-progress", `${index / (caseSteps.length - 1) * 100}%`);
  $("case-view").innerHTML = `<article class="event-card ${step.danger ? "danger" : ""}"><span>SIMULATED / PRESENTATION VIEW</span><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p><code>${esc(step.code)}</code></article>`;
  $("claim-value").textContent = step.claim; $("effect-value").textContent = step.effect; $("invariant-value").textContent = step.invariant;
  $("invariant-value").className = step.invariant === "VIOLATION" ? "violation" : "pending";
}
document.querySelectorAll("[data-case-step]").forEach((button) => button.addEventListener("click", () => renderCaseStep(Number(button.dataset.caseStep))));
renderCaseStep(0);

const storyChapters = document.querySelectorAll("[data-story-chapter]");
if (storyChapters.length && "IntersectionObserver" in window) {
  const chapterObserver = new IntersectionObserver((entries) => {
    const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (current) renderCaseStep(Number(current.target.dataset.storyChapter));
  }, { rootMargin: "-38% 0px -42% 0px", threshold: [0, 0.2, 0.5, 0.8] });
  storyChapters.forEach((chapter) => chapterObserver.observe(chapter));
}

let replayTimer;
$("replay-button")?.addEventListener("click", () => {
  clearInterval(replayTimer); renderCaseStep(0); let index = 0; $("replay-button").textContent = "REPLAYING…";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  replayTimer = setInterval(() => { index += 1; renderCaseStep(index); if (index === caseSteps.length - 1) { clearInterval(replayTimer); $("replay-button").textContent = "▶ Replay synthetic presentation"; } }, reduced ? 80 : 650);
});

function drawGraph(failures = 3) {
  const canvas = $("state-canvas"); const ctx = canvas.getContext("2d"); const ratio = window.devicePixelRatio || 1; const width = canvas.clientWidth || 900; const height = width * 0.58;
  canvas.width = width * ratio; canvas.height = height * ratio; ctx.scale(ratio, ratio); ctx.clearRect(0, 0, width, height);
  const levels = [1, 3, 6, 9, 11, 8, 4]; const nodes = []; let seed = 41;
  levels.forEach((count, x) => { for (let y = 0; y < count; y++) { seed = (seed * 1664525 + 1013904223) >>> 0; nodes.push({ x: 45 + x * ((width - 90) / 6), y: height / 2 + (y - (count - 1) / 2) * Math.min(38, (height - 90) / Math.max(count, 1)) + (seed % 13 - 6), level: x }); } });
  ctx.strokeStyle = "#283034"; ctx.lineWidth = 1; nodes.forEach((node, index) => { if (!node.level) return; const previous = nodes.filter((item) => item.level === node.level - 1); const parent = previous[index % previous.length]; ctx.beginPath(); ctx.moveTo(parent.x, parent.y); ctx.lineTo(node.x, node.y); ctx.stroke(); });
  nodes.forEach((node, index) => { const failed = index >= nodes.length - failures; ctx.fillStyle = failed ? "#ff6d61" : index % 5 === 0 ? "#c7ef4c" : "#7b8588"; ctx.beginPath(); ctx.arc(node.x, node.y, failed ? 4 : 2.5, 0, Math.PI * 2); ctx.fill(); if (failed) { ctx.strokeStyle = "rgba(255,109,97,.25)"; ctx.beginPath(); ctx.arc(node.x, node.y, 10, 0, Math.PI * 2); ctx.stroke(); } });
}
window.addEventListener("resize", () => drawGraph(Number($("failures-found")?.textContent) || 3));

let explorationEvidence;
async function loadEvidence() {
  try {
    const response = await fetch("evidence-summary.json"); if (!response.ok) throw new Error(`HTTP ${response.status}`); explorationEvidence = await response.json();
    const benchmark = explorationEvidence.benchmarks.small;
    const metrics = benchmark.metrics;
    const classification = explorationEvidence.metadata.benchmarkClassification;
    $("load-status").textContent = `${classification.replaceAll("_", " ")} · v0.2 · static snapshot`;
    $("states-visited").textContent = metrics.uniqueEconomicStates.toLocaleString(); $("transitions-covered").textContent = metrics.transitionsExercised.length; $("pairs-covered").textContent = metrics.candidatesGenerated.toLocaleString(); $("failures-found").textContent = metrics.failuresFound;
    $("bounded-complete").textContent = metrics.boundedComplete ? "BOUNDED COMPLETE" : "NOT CLAIMED"; $("bounded-reason").textContent = metrics.boundedCompleteReason; drawGraph(metrics.failuresFound);
  } catch (error) { $("load-status").textContent = `Evidence unavailable · ${error.message}`; drawGraph(); }
}
loadEvidence();

const dialog = $("counterexample-dialog");
$("counterexample-button")?.addEventListener("click", () => {
  const counterexamples = explorationEvidence?.benchmarks?.syntheticHeldOutMutation?.counterexamples ?? explorationEvidence?.result?.counterexamples ?? [];
  const item = counterexamples.find((entry) => entry.invariantId === "FIN-IDEMPOTENCY-EFFECT") ?? counterexamples[0];
  if (!item) return;
  $("counterexample-title").textContent = item.invariantId; $("counterexample-meta").textContent = `Cause: ${item.cause} · deterministic replay ${item.replayMatched ? "matched" : "did not match"} · ${item.minimizedTrace.length} minimized steps · independent authorship not established`;
  $("counterexample-trace").innerHTML = item.minimizedTrace.map((step) => `<li><b>T+${step.at}</b> ${esc(step.transition)}<br><span>${esc(JSON.stringify(step.response))}</span></li>`).join(""); dialog.showModal();
});
dialog?.querySelector(".dialog-close")?.addEventListener("click", () => dialog.close());
dialog?.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
