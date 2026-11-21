// Sprain or fracture? A guided self-check built on the Ottawa Ankle, Foot and Knee Rules.
// Order: red flags -> does the rule apply? -> rule questions -> result. Nothing is stored or sent.
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const state = { part: "", red: new Set(), notFor: new Set(), ans: {} };

function yn(id, text, point) {
  const v = state.ans[id];
  return `<div class="q" data-q="${id}">
    <p>${point ? `<span class="pt">${point}</span>` : ""}${esc(text)}</p>
    <div class="yn"><button type="button" class="${v === true ? "on yes" : ""}" data-a="yes">Yes</button><button type="button" class="${v === false ? "on no" : ""}" data-a="no">No</button></div>
  </div>`;
}

function decide() {
  const p = state.part;
  if (!p) return null;
  if (state.red.size) return { kind: "er", title: "Go to emergency care now", body: "One or more warning signs means this needs urgent assessment, whatever the rules below say." };
  if (state.notFor.size) return { kind: "see", title: "See a clinician: this check isn't designed for you", body: "The Ottawa rules were tested on adults seen within days of the injury, without the conditions you ticked. A doctor, nurse or urgent care clinic should examine you." };
  const qs = QUESTIONS[p], a = state.ans;
  if (p === "ankle") {
    const mall = a.malleolar === true, mid = a.midfoot === true;
    if (a.malleolar === undefined || a.midfoot === undefined) return null;
    if (!mall && !mid) return { kind: "see", title: "These rules cover pain around the ankle bones or midfoot", body: "Your pain is somewhere else (for example the heel, toes or Achilles). A clinician can check it." };
    const need = qs.filter((q) => q.zone === "any" || (q.zone === "malleolar" && mall) || (q.zone === "midfoot" && mid));
    if (need.some((q) => a[q.id] === undefined)) return null;
    const ankleX = mall && (a.A || a.B || a.walk), footX = mid && (a.C || a.D || a.walk);
    if (ankleX || footX) return { kind: "xray", title: `An X-ray is recommended${ankleX && footX ? " (ankle and foot)" : ankleX ? " (ankle)" : " (foot)"}`,
      body: reasons(p, need.filter((q) => a[q.id] === true)) };
    return { kind: "home", title: "An X-ray is probably not needed", body: "None of the Ottawa criteria are met, so a fracture is unlikely and this is most likely a sprain." };
  }
  const need = qs;
  if (need.some((q) => a[q.id] === undefined)) return null;
  const hits = need.filter((q) => a[q.id] === true);
  if (hits.length) return { kind: "xray", title: "A knee X-ray is recommended", body: reasons(p, hits) };
  return { kind: "home", title: "An X-ray is probably not needed", body: "None of the Ottawa Knee Rule criteria are met, so a fracture is unlikely." };
}

function reasons(part, hits) {
  const label = { A: "tender outer ankle bone", B: "tender inner ankle bone", C: "tender base of the 5th metatarsal", D: "tender navicular", walk: "couldn't take 4 steps",
    age55: "age 55 or older", patella: "tender kneecap", fibula: "tender head of the fibula", flex: "can't bend to 90 degrees" };
  return `Because of: ${hits.map((q) => label[q.id]).join(", ")}. An urgent care centre or clinic with X-ray is usually quicker and cheaper than an emergency department for this.`;
}

function render() {
  const p = state.part;
  $("#parts").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.part === p));
  $("#steps").hidden = !p;
  if (!p) { $("#result").hidden = true; return; }
  $("#red").innerHTML = RED_FLAGS.map((r, i) => `<label class="opt"><input type="checkbox" data-red="${i}"${state.red.has(i) ? " checked" : ""}><span>${esc(r)}</span></label>`).join("");
  $("#notfor").innerHTML = NOT_FOR[p].map((r, i) => `<label class="opt"><input type="checkbox" data-nf="${i}"${state.notFor.has(i) ? " checked" : ""}><span>${esc(r)}</span></label>`).join("");
  const a = state.ans;
  let qs = QUESTIONS[p];
  if (p === "ankle") qs = qs.filter((q) => q.type === "zone" || q.zone === "any" || (q.zone === "malleolar" && a.malleolar) || (q.zone === "midfoot" && a.midfoot));
  $("#rule-q").innerHTML = qs.map((q) => yn(q.id, q.text, q.point)).join("");
  $("#diagram").innerHTML = p === "ankle" ? ANKLE_SVG : KNEE_SVG;
  $("#rule-block").classList.toggle("muted", state.red.size > 0 || state.notFor.size > 0);

  const r = decide();
  $("#result").hidden = !r;
  if (r) {
    const ev = EVIDENCE[p];
    $("#result").className = `result ${r.kind}`;
    $("#result").innerHTML = `<h2>${esc(r.title)}</h2><p>${esc(r.body)}</p>
      ${r.kind === "home" ? `<h3>Looking after it at home</h3><ul>
        <li><b>Protect and rest</b> it for a day or two, then start gentle movement as pain allows.</li>
        <li><b>Ice</b> for 15–20 minutes every 2–3 hours on the first day or two (wrap the ice; not directly on skin).</li>
        <li><b>Compress</b> with an elastic bandage (not tight) and <b>elevate</b> above heart level when you can.</li>
        <li>Over-the-counter pain relief as directed on the label, if it's safe for you.</li></ul>
        <p class="note"><b>See a clinician</b> if you still can't put weight on it, or it isn't getting better after 5–7 days, or any warning sign appears.</p>` : ""}
      ${r.kind === "xray" || r.kind === "home" ? `<p class="hint">The ${p === "ankle" ? "Ottawa Ankle and Foot Rules" : "Ottawa Knee Rule"} catch about ${ev.sens}% of fractures (<a href="${ev.url}" target="_blank" rel="noopener">${esc(ev.cite)}</a>). They were designed for a clinician's exam, so a self-check is less certain. If in doubt, get checked.</p>` : ""}`;
  }
}

const ANKLE_SVG = `<svg viewBox="0 0 320 150" role="img" aria-label="Where to press on the ankle and foot">
  <text x="80" y="14" class="lbl">Outer side</text><text x="240" y="14" class="lbl">Inner side</text>
  <path class="leg" d="M40 20 h34 v62 q4 14 30 22 l48 10 q10 4 6 14 h-120 q-8 -40 2 -108z"/>
  <circle class="bone" cx="62" cy="86" r="9"/><rect class="zone" x="54" y="50" width="16" height="40" rx="4"/>
  <circle class="pt" cx="62" cy="92" r="9"/><text x="62" y="96" class="ptl">A</text>
  <circle class="pt" cx="118" cy="114" r="9"/><text x="118" y="118" class="ptl">C</text>
  <path class="leg" d="M246 20 h34 v62 q-4 14 -30 22 l-48 10 q-10 4 -6 14 h120 q8 -40 -2 -108z"/>
  <rect class="zone" x="250" y="50" width="16" height="40" rx="4"/>
  <circle class="pt" cx="258" cy="92" r="9"/><text x="258" y="96" class="ptl">B</text>
  <circle class="pt" cx="214" cy="104" r="9"/><text x="214" y="108" class="ptl">D</text>
  <text x="160" y="145" class="cap">Shaded: lowest 6 cm of the ankle bones (back edge and tip)</text></svg>`;
const KNEE_SVG = `<svg viewBox="0 0 220 170" role="img" aria-label="Where to press on the knee">
  <text x="110" y="14" class="lbl">Front of the right knee</text>
  <path class="leg" d="M70 20 h80 v60 q6 20 -6 34 v50 h-68 v-50 q-12 -14 -6 -34z"/>
  <ellipse class="bone" cx="110" cy="84" rx="18" ry="22"/>
  <circle class="pt" cx="110" cy="84" r="9"/><text x="110" y="88" class="ptl">P</text>
  <circle class="pt" cx="150" cy="124" r="9"/><text x="150" y="128" class="ptl">F</text>
  <text x="110" y="165" class="cap">P: kneecap · F: head of the fibula (outer side)</text></svg>`;

function init() {
  $("#parts").onclick = (e) => { const b = e.target.closest("[data-part]"); if (!b) return; state.part = b.dataset.part; state.ans = {}; render(); };
  document.body.addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]"); if (!b) return;
    const id = b.closest("[data-q]").dataset.q;
    state.ans[id] = b.dataset.a === "yes";
    if (id === "malleolar" || id === "midfoot") for (const k of ["A", "B", "C", "D"]) if (!state.ans.malleolar && "AB".includes(k)) delete state.ans[k]; else if (!state.ans.midfoot && "CD".includes(k)) delete state.ans[k];
    render();
  });
  document.body.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.red !== undefined) t.checked ? state.red.add(+t.dataset.red) : state.red.delete(+t.dataset.red);
    if (t.dataset.nf !== undefined) t.checked ? state.notFor.add(+t.dataset.nf) : state.notFor.delete(+t.dataset.nf);
    render();
  });
  $("#reset").onclick = () => { state.part = ""; state.red.clear(); state.notFor.clear(); state.ans = {}; render(); window.scrollTo(0, 0); };
  render();
}
init();
