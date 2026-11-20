/* ============================================================
   Uu Quest — engine: utilities, progress store, glossary, router,
   route map, exit player, generic challenge types, diagram helpers.
   ============================================================ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const round = (v, d = 1) => Math.round(v * 10 ** d) / 10 ** d;
const EXITS = [];
const GAMES = {};
const MOUNTS = {};
let GLOSSARY = {};
function defineExit(e) { EXITS.push(e); }

/* [[KEY]] or [[KEY|label]] -> clickable glossary term */
const TERM_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
function T(html) {
  if (html == null) return '';
  return String(html).replace(TERM_RE, (m, k, l) => `<button type="button" class="term" data-term="${esc(k)}">${l || k}</button>`);
}
function plain(html) { return html == null ? '' : String(html).replace(TERM_RE, (m, k, l) => l || k); }

/* ---------- progress store (per-browser convenience only) ---------- */
const STORE = 'cv2x-uu-quest/v1';
function blankProgress() { return { exits: {}, free: false, name: '' }; }
let P = blankProgress();
try { const raw = localStorage.getItem(STORE); if (raw) P = Object.assign(blankProgress(), JSON.parse(raw)); } catch (e) { /* storage unavailable */ }
function save() { try { localStorage.setItem(STORE, JSON.stringify(P)); } catch (e) { /* ignore */ } }
function rec(id) { if (!P.exits[id]) P.exits[id] = { best: 0, stars: 0, parts: {} }; return P.exits[id]; }
function components(ex) {
  const list = (ex.challenges || []).map((c, i) => ({ key: 'c' + i, label: plain(c.title) }));
  if (ex.quiz && ex.quiz.length) list.push({ key: 'quiz', label: ex.final ? 'Final exam' : 'Checkpoint quiz' });
  return list;
}
function starsFor(s) { return s >= 0.9 ? 3 : s >= 0.75 ? 2 : s >= 0.5 ? 1 : 0; }
function recordPart(ex, key, score) {
  const r = rec(ex.id);
  r.parts[key] = Math.max(r.parts[key] || 0, score);
  const comps = components(ex);
  const total = comps.reduce((a, c) => a + (r.parts[c.key] || 0), 0) / comps.length;
  r.best = Math.max(r.best, total);
  r.stars = starsFor(r.best);
  save();
}
function isUnlocked(ex) {
  const i = EXITS.indexOf(ex);
  if (i <= 0 || P.free) return true;
  const prev = P.exits[EXITS[i - 1].id];
  return !!(prev && prev.stars >= 1);
}
function totals() {
  let stars = 0, xp = 0, done = 0;
  EXITS.forEach((e) => { const r = P.exits[e.id]; if (r) { stars += r.stars; xp += Math.round(r.best * 100); if (r.stars >= 1) done++; } });
  return { stars, xp, done, max: EXITS.length * 3 };
}
const RANKS = [[0, "Learner's permit"], [6, 'Licensed driver'], [15, 'Radio navigator'], [26, 'Uu engineer'], [36, 'Uu master']];
function rank(stars) { let r = RANKS[0][1]; RANKS.forEach(([s, n]) => { if (stars >= s) r = n; }); return r; }
function starsInner(n) { let s = ''; for (let i = 0; i < 3; i++) s += `<span class="${i < n ? 'on' : 'off'}">★</span>`; return s; }
function starsHTML(n) { return `<span class="stars" role="img" aria-label="${n} of 3 stars">${starsInner(n)}</span>`; }

const app = $('#app');
let cur = null;

/* ---------- toast / popover / glossary drawer ---------- */
let toastTimer;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2800); }
function closePop() { const p = $('#pop'); if (p) p.hidden = true; }
function showPop(btn) {
  const key = btn.dataset.term; const g = GLOSSARY[key]; const pop = $('#pop');
  pop.innerHTML = g
    ? `<h4>${esc(key)}</h4>${g[0] ? `<span class="exp">${g[0]}</span>` : ''}<p>${T(g[1])}</p><button type="button" class="linkbtn small" data-act="glossary" data-q="${esc(key)}">Open the glossary</button>`
    : `<h4>${esc(key)}</h4><p class="muted">No glossary entry yet.</p>`;
  pop.hidden = false;
  const r = btn.getBoundingClientRect(); const vw = document.documentElement.clientWidth;
  const pw = pop.offsetWidth;
  let left = r.left + window.scrollX;
  left = Math.min(left, window.scrollX + vw - pw - 16);
  left = Math.max(window.scrollX + 16, left);
  pop.style.left = left + 'px';
  pop.style.top = (r.bottom + window.scrollY + 8) + 'px';
}
function openGlossary(q) {
  closePop();
  $('#drawer').hidden = false; $('#scrim').hidden = false;
  const s = $('#gl-search'); s.value = q || ''; renderGlossary(q || ''); s.focus();
}
function closeGlossary() { $('#drawer').hidden = true; $('#scrim').hidden = true; }
function renderGlossary(q) {
  const ql = q.trim().toLowerCase();
  const keys = Object.keys(GLOSSARY).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  let list = keys.filter((k) => !ql || k.toLowerCase().includes(ql) || GLOSSARY[k][0].toLowerCase().includes(ql) || plain(GLOSSARY[k][1]).toLowerCase().includes(ql));
  list.sort((a, b) => (b.toLowerCase() === ql) - (a.toLowerCase() === ql));
  $('#gl-list').innerHTML = list.length
    ? list.map((k) => `<div class="gl-item${k.toLowerCase() === ql ? ' flash' : ''}"><b>${esc(k)}</b>${GLOSSARY[k][0] ? `<i>${GLOSSARY[k][0]}</i>` : ''}<p>${T(GLOSSARY[k][1])}</p></div>`).join('')
    : '<p class="muted">No matching term. Try a shorter search.</p>';
}

/* ---------- route map ---------- */
function signHTML(ex) {
  const r = P.exits[ex.id]; const open = isUnlocked(ex); const st = r ? r.stars : 0;
  const tab = ex.final ? 'DESTINATION' : 'EXIT ' + ex.num;
  const status = !open ? 'Locked' : (r && r.best > 0 ? Math.round(r.best * 100) + '%' : '≈ ' + ex.mins + ' min');
  const inner = `<span class="xtab">${tab}</span><span class="xsign-in">
      <span class="xtitle">${esc(ex.title)}</span>
      <span class="xstars">${starsHTML(st)}<span>${status}</span></span>
      <span class="xsub">${esc(ex.subtitle)}</span>
      <span class="xtopics">${ex.topics.map(esc).join(' · ')}</span></span>`;
  return `<div class="xrow">${open
    ? `<a class="xsign${ex.final ? ' final' : ''}" href="#exit-${ex.id}">${inner}</a>`
    : `<div class="xsign locked" aria-disabled="true" title="Clear the previous exit, or switch on free roam">${inner}</div>`}</div>`;
}
function renderMap() {
  cur = null; closePop();
  const t = totals();
  const next = EXITS.find((e) => isUnlocked(e) && !((P.exits[e.id] || {}).stars >= 1)) || EXITS[EXITS.length - 1];
  const started = Object.keys(P.exits).length > 0;
  document.title = 'C-V2X Uu Quest';
  app.innerHTML = `
  <section class="hero">
    <div class="bigsign"><div class="bigsign-in">
      <span class="route-pill">C-V2X&nbsp;&nbsp;|&nbsp;&nbsp;LTE-Uu and NR-Uu</span>
      <h1><span>The cellular road</span>Uu Quest</h1>
      <p>Learn the C-V2X Uu interface by driving it: from the car's radio, through the base station and the core network, to the V2X application server and back out to every vehicle that needs the message.</p>
      <div class="arrows"><span>↑ 12 exits</span><span>↗ 1 final destination</span><span>→ about 3 hours</span></div>
    </div></div>
    <div class="tripcomp">
      <div class="gauges">
        <div class="gauge"><b>${t.stars}<small>/${t.max}</small></b><span>Stars</span></div>
        <div class="gauge"><b>${t.done}<small>/${EXITS.length}</small></b><span>Cleared</span></div>
        <div class="gauge"><b>${t.xp}</b><span>Points</span></div>
      </div>
      <div class="rankline"><span class="muted small">Current rank</span><strong>${rank(t.stars)}</strong></div>
      <div class="meter" aria-hidden="true"><i style="width:${Math.round(100 * t.stars / t.max)}%"></i></div>
      <div class="hero-actions">
        <a class="btn" href="#exit-${next.id}">${started ? 'Continue' : 'Start'}: ${next.final ? 'Destination' : 'Exit ' + next.num} →</a>
        <button type="button" class="btn ghost" data-act="glossary">Glossary</button>
      </div>
    </div>
  </section>
  <div class="map-body">
    <section class="route" aria-label="Exits">${EXITS.map(signHTML).join('')}</section>
    <aside class="side">
      <div class="panel"><h3>How to play</h3><ol>
        <li><b>Briefing.</b> Read the cards. Dotted-underlined terms open a definition. "Under the hood" holds the deeper technical detail.</li>
        <li><b>Challenges.</b> Sort, sequence, label, calculate and run the simulators.</li>
        <li><b>Checkpoint.</b> A short quiz that explains every answer.</li>
        <li><b>Stars.</b> 50% opens the next exit, 75% earns two stars, 90% earns three. Replays keep your best.</li>
      </ol></div>
      <div class="panel"><h3>Line styles in diagrams</h3>
        <div class="legend-row"><span class="key-line up"></span>User plane: your packets</div>
        <div class="legend-row"><span class="key-line cp"></span>Control plane: signalling</div>
        <div class="legend-row"><span class="key-line lg"></span>Logical V2X reference point</div>
        <div class="legend-row"><span class="key-line ul"></span>Uplink (car to network)</div>
        <div class="legend-row"><span class="key-line dl"></span>Downlink (network to car)</div>
      </div>
      <div class="panel"><h3>Settings</h3>
        <label class="toggle"><input type="checkbox" id="free-roam" ${P.free ? 'checked' : ''}> Free roam: open every exit</label>
        <div class="confirm-row" id="reset-row"><button type="button" class="btn ghost sm" id="reset-btn">Reset my progress</button></div>
      </div>
      <div class="panel"><h3>Next in the series</h3><p class="small muted">PC5 Quest covers the sidelink itself: Mode 4 sensing and resource selection, PSCCH and PSSCH, SCI, synchronisation and NR sidelink. Exit 11 is the bridge between the two games.</p></div>
    </aside>
  </div>
  <footer class="foot">
    <span>Facts follow 3GPP Releases 14 to 18 (TS 22.185, 23.285, 23.287, the 36- and 38-series). All explanations are original teaching text; the simulators use simplified teaching models. Progress is kept only in this browser.</span>
    <span>Open source: <a href="https://github.com/s-dasgupta/cv2x-uu-quest" target="_blank" rel="noopener">github.com/s-dasgupta/cv2x-uu-quest</a> · code MIT, text CC BY 4.0. Found an error? Open an issue there.</span>
    <span>Not affiliated with or endorsed by 3GPP, ETSI, IEEE or SAE International. LTE is a trademark of ETSI.</span>
  </footer>`;
  $('#free-roam').addEventListener('change', (e) => { P.free = e.target.checked; save(); renderMap(); });
  $('#reset-btn').addEventListener('click', () => {
    $('#reset-row').innerHTML = `<span class="small">Erase all stars and scores?</span><button type="button" class="btn warn sm" id="reset-yes">Erase</button><button type="button" class="btn ghost sm" id="reset-no">Keep</button>`;
    $('#reset-yes').addEventListener('click', () => { P = blankProgress(); save(); renderMap(); toast('Progress erased.'); });
    $('#reset-no').addEventListener('click', renderMap);
  });
}

/* ---------- exit player ---------- */
function buildStages(ex) {
  const s = [];
  (ex.cards || []).forEach((c, i) => s.push({ kind: 'card', i, label: 'Briefing ' + (i + 1) + ': ' + plain(c.title) }));
  (ex.challenges || []).forEach((c, i) => s.push({ kind: 'challenge', i, label: 'Challenge ' + (i + 1) + ': ' + plain(c.title) }));
  if (ex.quiz && ex.quiz.length) s.push({ kind: 'quiz', label: ex.final ? 'Final exam' : 'Checkpoint quiz' });
  s.push({ kind: 'result', label: 'Result' });
  return s;
}
function openExit(id, idx) {
  const ex = EXITS.find((e) => e.id === id);
  if (!ex) { location.hash = ''; return; }
  if (!isUnlocked(ex)) { location.hash = ''; toast('Clear the previous exit first, or switch on free roam.'); return; }
  const stages = buildStages(ex);
  if (idx == null) { const last = (P.exits[ex.id] || {}).last; idx = last != null && last < stages.length - 1 ? last : 0; }
  cur = { ex, stages, idx: clamp(idx, 0, stages.length - 1), visited: new Set() };
  document.title = (ex.final ? '' : 'Exit ' + ex.num + ' · ') + ex.title + ' · Uu Quest';
  renderPlayer();
  window.scrollTo(0, 0);
}
function stageDone(i) {
  const s = cur.stages[i]; const r = P.exits[cur.ex.id];
  if (s.kind === 'card') return cur.visited.has(i);
  if (s.kind === 'challenge') return !!(r && r.parts['c' + s.i] != null);
  if (s.kind === 'quiz') return !!(r && r.parts.quiz != null);
  return false;
}
function nextLabel() {
  const s = cur.stages[cur.idx];
  if ((s.kind === 'challenge' || s.kind === 'quiz') && !stageDone(cur.idx)) return 'Skip →';
  const n = cur.stages[cur.idx + 1];
  return n && n.kind === 'result' ? 'See result →' : 'Next →';
}
function go(i) { if (!cur) return; cur.idx = clamp(i, 0, cur.stages.length - 1); renderPlayer(); window.scrollTo(0, 0); }
function refreshNav() {
  if (!cur) return;
  const b = $('#nextbtn'); if (b) b.textContent = nextLabel();
  $$('.rail-seg').forEach((s, i) => s.classList.toggle('done', stageDone(i)));
  const r = P.exits[cur.ex.id]; const m = $('#rail-best');
  if (m && r) m.innerHTML = 'Best ' + Math.round(r.best * 100) + '% ' + starsHTML(r.stars);
}
function renderPlayer() {
  closePop();
  const { ex, stages, idx } = cur; const st = stages[idx];
  if (st.kind === 'card') cur.visited.add(idx);
  rec(ex.id).last = idx; save();
  const r = P.exits[ex.id];
  app.innerHTML = `
  <div class="player">
    <header class="p-head">
      <div class="p-row">
        <a class="back" href="#">← Route map</a>
        <span class="minisign"><span class="minisign-in"><b>${ex.final ? 'DESTINATION' : 'EXIT ' + ex.num}</b><span>${esc(ex.title)}</span></span></span>
        <span class="spacer"></span>
        <button type="button" class="btn ghost sm glossbtn" data-act="glossary">Glossary</button>
      </div>
      <ol class="rail" aria-label="Stages">${stages.map((s, i) => `<li><button type="button" class="rail-seg k-${s.kind}${i === idx ? ' cur' : ''}${stageDone(i) ? ' done' : ''}" data-go="${i}" title="${esc(s.label)}" aria-label="${esc(s.label)}${i === idx ? ' (current)' : ''}"></button></li>`).join('')}</ol>
      <div class="rail-meta"><span>${esc(st.label)}</span><span id="rail-best">${r && r.best > 0 ? 'Best ' + Math.round(r.best * 100) + '% ' + starsHTML(r.stars) : 'Not scored yet'}</span></div>
    </header>
    <main class="stage" id="stage"></main>
    <nav class="p-nav" aria-label="Stage navigation">
      <button type="button" class="btn ghost" data-act="prev" ${idx === 0 ? 'disabled' : ''}>← Back</button>
      <span class="count">${idx + 1} / ${stages.length}</span>
      ${idx < stages.length - 1 ? `<button type="button" class="btn" data-act="next" id="nextbtn">${nextLabel()}</button>` : `<a class="btn" href="#">Route map</a>`}
    </nav>
  </div>`;
  const el = $('#stage');
  if (st.kind === 'card') renderCard(el, ex.cards[st.i], st.i, ex.cards.length);
  else if (st.kind === 'challenge') renderChallenge(el, ex.challenges[st.i], st.i, ex.challenges.length);
  else if (st.kind === 'quiz') renderQuiz(el);
  else renderResult(el);
}
function renderCard(el, c, k, n) {
  const hasFig = c.fig || c.mount;
  el.innerHTML = `<article class="card${c.wide ? ' wide' : ''}">
    <div class="card-head"><p class="eyebrow">Briefing · ${k + 1} of ${n}</p><h2>${T(c.title)}</h2></div>
    <div class="card-grid">
      <div class="prose">${T(c.body)}${c.takeaway ? `<aside class="takeaway"><span class="diamond" aria-hidden="true"></span><div><strong>Remember</strong><p>${T(c.takeaway)}</p></div></aside>` : ''}</div>
      ${hasFig ? `<figure class="fig">${c.fig ? T(c.fig) : ''}${c.mount ? '<div class="mount"></div>' : ''}${c.cap ? `<figcaption>${T(c.cap)}</figcaption>` : ''}</figure>` : ''}
    </div>
    ${c.detail ? `<details class="deep"><summary>Under the hood: the technical detail</summary><div class="deep-body">${T(c.detail)}</div></details>` : ''}
    ${c.specs ? `<p class="specs"><span>Spec trail</span>${c.specs.map((s) => `<span class="spec">${esc(s)}</span>`).join('')}</p>` : ''}
  </article>`;
  if (c.mount && MOUNTS[c.mount]) MOUNTS[c.mount]($('.mount', el), c.mountOpts || {});
}
function makeApi(key) { const ex = cur.ex; return { done(score) { recordPart(ex, key, clamp(score, 0, 1)); refreshNav(); } }; }
function renderChallenge(el, ch, k, n) {
  el.innerHTML = `<section class="challenge"><div class="head"><p class="eyebrow">Challenge · ${k + 1} of ${n}</p><h2>${T(ch.title)}</h2></div><div class="game"></div></section>`;
  const host = $('.game', el); const g = GAMES[ch.type];
  if (!g) { host.textContent = 'Unknown challenge type: ' + ch.type; return; }
  g(host, ch, makeApi('c' + k));
}
function renderQuiz(el) {
  const ex = cur.ex;
  el.innerHTML = `<section class="challenge"><div class="head"><p class="eyebrow">${ex.final ? 'Final exam' : 'Checkpoint'}</p><h2>${ex.final ? 'The grand tour' : 'Checkpoint: ' + esc(ex.title)}</h2>${ex.quizIntro ? `<p class="g-intro">${T(ex.quizIntro)}</p>` : ''}</div><div class="game"></div></section>`;
  GAMES.quiz($('.game', el), { items: ex.quiz }, makeApi('quiz'));
}
function doneBanner(score, msg) {
  return `<div class="done-banner"><b>${Math.round(score * 100)}%</b><div style="flex:1;min-width:200px">${msg || ''}</div><div class="g-actions"><button type="button" class="btn ghost sm" data-act="replay">Replay</button><button type="button" class="btn sm" data-act="next">Continue →</button></div></div>`;
}
function certHTML(r) {
  const t = totals();
  const d = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  return `<div class="cert"><div class="cert-in">
    <p class="eyebrow" style="color:var(--on-sign)">C-V2X Uu Quest · Destination reached</p>
    <label for="cert-name" class="small">Name on the certificate</label>
    <input id="cert-name" type="text" maxlength="60" placeholder="Type your name" value="${esc(P.name || '')}">
    <div class="certname" id="cert-show">${esc(P.name || 'Uu traveller')}</div>
    <p>has driven the full cellular road of C-V2X: architecture, protocol stack, LTE and NR physical layer, access procedures, bearers and QoS, scheduling and latency, broadcast delivery, mobility, security, and Uu control of the sidelink.</p>
    <h3>${t.stars} of ${t.max} stars · ${rank(t.stars)}</h3>
    <p class="small">${d}</p>
  </div></div>`;
}
function renderResult(el) {
  const ex = cur.ex; const r = P.exits[ex.id] || { best: 0, stars: 0, parts: {} };
  const comps = components(ex); const i = EXITS.indexOf(ex); const nx = EXITS[i + 1];
  const pct = Math.round(r.best * 100);
  const firstCh = cur.stages.findIndex((s) => s.kind === 'challenge' || s.kind === 'quiz');
  const msg = r.stars >= 3 ? 'Three stars. You can teach this exit to someone else now.'
    : r.stars === 2 ? 'Solid result. Replay a weaker part to chase the third star.'
      : r.stars === 1 ? 'Exit cleared and the next one is open. A replay will lock the ideas in.'
        : 'Not cleared yet. You need 50% overall: replay the challenges or the checkpoint.';
  el.innerHTML = `<section class="result card">
    <div class="result-top"><div class="bigstars" role="img" aria-label="${r.stars} of 3 stars">${starsInner(r.stars)}</div>
      <div class="card-head"><p class="eyebrow">${ex.final ? 'Destination' : 'Exit ' + ex.num + ' result'}</p><h2>${pct}% · ${esc(ex.title)}</h2><p class="muted">${msg}</p></div></div>
    <div class="tbl-wrap"><table class="tbl score-tbl"><thead><tr><th>Part</th><th>Best score</th></tr></thead><tbody>${comps.map((c) => `<tr><td>${esc(c.label)}</td><td class="n">${r.parts[c.key] != null ? Math.round(r.parts[c.key] * 100) + '%' : 'not played'}</td></tr>`).join('')}</tbody></table></div>
    ${ex.recap ? `<aside class="takeaway"><span class="diamond" aria-hidden="true"></span><div class="prose"><strong>What you can now explain</strong>${T(ex.recap)}</div></aside>` : ''}
    ${ex.final && r.stars >= 1 ? certHTML(r) : ''}
    <div class="g-actions">
      ${firstCh >= 0 ? `<button type="button" class="btn ghost" data-go="${firstCh}">Replay the challenges</button>` : ''}
      ${nx && isUnlocked(nx) ? `<a class="btn" href="#exit-${nx.id}">Next: ${nx.final ? 'Destination' : 'Exit ' + nx.num + ' · ' + esc(nx.title)} →</a>` : ''}
      <a class="btn ghost" href="#">Route map</a>
    </div>
  </section>`;
  const inp = $('#cert-name');
  if (inp) inp.addEventListener('input', () => { P.name = inp.value; save(); $('#cert-show').textContent = inp.value || 'Uu traveller'; });
}

/* ---------- router & global events ---------- */
let pendingIdx = null;
function route() {
  const h = location.hash.replace(/^#/, '');
  const m = /^exit-(\d+)$/.exec(h);
  if (m) { const idx = pendingIdx; pendingIdx = null; openExit(+m[1], idx); }
  else { renderMap(); window.scrollTo(0, 0); }
}
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act],[data-go],.term');
  if (!t) { if (!e.target.closest('#pop')) closePop(); return; }
  if (t.classList.contains('term')) { e.preventDefault(); e.stopPropagation(); showPop(t); return; }
  if (t.dataset.go != null) { go(+t.dataset.go); return; }
  const a = t.dataset.act;
  if (a === 'next') go(cur.idx + 1);
  else if (a === 'prev') go(cur.idx - 1);
  else if (a === 'replay') renderPlayer();
  else if (a === 'glossary') openGlossary(t.dataset.q || '');
  else if (a === 'close-glossary') closeGlossary();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closePop(); closeGlossary(); return; }
  const tag = (e.target.tagName || '').toLowerCase();
  if (['input', 'textarea', 'select'].includes(tag) || e.target.isContentEditable) return;
  if (!cur || e.altKey || e.ctrlKey || e.metaKey) return;
  const st = cur.stages[cur.idx];
  if (st.kind !== 'card') return;
  if (e.key === 'ArrowRight') go(cur.idx + 1);
  if (e.key === 'ArrowLeft' && cur.idx > 0) go(cur.idx - 1);
});
$('#scrim').addEventListener('click', closeGlossary);
$('#gl-search').addEventListener('input', (e) => renderGlossary(e.target.value));
window.addEventListener('hashchange', route);
window.addEventListener('resize', closePop);

/* ============================================================
   Generic challenge types
   ============================================================ */

/* Sort items into bins, one at a time, with an explanation after each. */
GAMES.classify = function (host, cfg, api) {
  const items = shuffle(cfg.items.slice()); const n = items.length; let i = 0, right = 0; const log = [];
  const binLabel = (id) => plain((cfg.bins.find((b) => b.id === id) || {}).label || id);
  function show() {
    const it = items[i];
    host.innerHTML = `${cfg.intro ? `<p class="g-intro">${T(cfg.intro)}</p>` : ''}
      <div class="g-progress"><span>Item ${i + 1} of ${n}</span><span id="cl-right">${right} correct</span></div>
      <div class="cl-item">${T(it.text)}</div>
      <div class="cl-bins">${cfg.bins.map((b) => `<button type="button" class="bin" data-bin="${esc(b.id)}"><b>${plain(b.label)}</b>${b.hint ? `<span>${plain(b.hint)}</span>` : ''}</button>`).join('')}</div>
      <div class="g-feedback" aria-live="polite"></div>`;
    $$('.bin', host).forEach((b) => b.addEventListener('click', () => pick(b.dataset.bin)));
  }
  function pick(id) {
    const it = items[i]; const okIds = [].concat(it.bin); const ok = okIds.includes(id);
    if (ok) right++;
    log.push({ it, ok });
    $$('.bin', host).forEach((b) => { b.disabled = true; if (okIds.includes(b.dataset.bin)) b.classList.add('ok'); else if (b.dataset.bin === id) b.classList.add('no'); });
    const fb = $('.g-feedback', host); fb.className = 'g-feedback ' + (ok ? 'ok' : 'no');
    fb.innerHTML = `<span class="verdict">${ok ? 'Correct' : 'Not quite. Answer: ' + okIds.map(binLabel).join(' or ')}</span><p>${T(it.why)}</p><div class="g-actions"><button type="button" class="btn sm" id="cl-go">${i + 1 < n ? 'Next item →' : 'Finish'}</button></div>`;
    $('#cl-right').textContent = right + ' correct';
    const go2 = $('#cl-go'); go2.addEventListener('click', () => { i++; if (i < n) show(); else finish(); }); go2.focus({ preventScroll: true });
  }
  function finish() {
    const score = right / n; api.done(score);
    host.innerHTML = `${doneBanner(score, `You placed ${right} of ${n} correctly.`)}
      <div class="recap">${log.map((l) => `<div><span class="mk ${l.ok ? 'ok' : 'no'}">${l.ok ? '✓' : '✗'}</span><span>${T(l.it.text)} → <b>${[].concat(l.it.bin).map(binLabel).join(' / ')}</b></span></div>`).join('')}</div>`;
  }
  show();
};

/* Build an ordered procedure by picking the next step each time. */
GAMES.sequence = function (host, cfg, api) {
  const steps = cfg.steps.map((s, k) => Object.assign({ k }, s)); const n = steps.length;
  const pool = shuffle(steps.slice()); let pos = 0, mistakes = 0, missHere = 0;
  function render(msg, cls, bad) {
    const placed = steps.slice(0, pos);
    host.innerHTML = `${cfg.intro ? `<p class="g-intro">${T(cfg.intro)}</p>` : ''}
      <div class="g-progress"><span>${pos < n ? 'Step ' + (pos + 1) + ' of ' + n : 'All ' + n + ' steps placed'}</span><span>${mistakes} wrong pick${mistakes === 1 ? '' : 's'}</span></div>
      ${cfg.lanes ? `<div class="fig"><div class="scroll-x">${seqSVG(cfg.lanes, placed.map((s) => ({ from: s.from, to: s.to, label: s.short || plain(s.text), kind: s.kind })), { minRows: n, colW: cfg.colW })}</div></div>` : ''}
      <div class="g-feedback ${cls || ''}" aria-live="polite">${msg || ''}</div>
      <div class="seq-wrap">
        <div class="seq-col"><h4>Pick the next step</h4><div class="seq-pool">${pool.filter((s) => s.k >= pos).map((s) => `<button type="button" class="seq-card${missHere >= 2 && s.k === pos ? ' hint' : ''}${bad === s.k ? ' no shake' : ''}" data-k="${s.k}">${plain(s.text)}</button>`).join('') || '<p class="seq-empty">Every step is placed.</p>'}</div></div>
        <div class="seq-col"><h4>Your sequence</h4>${placed.length ? `<ol class="seq-built">${placed.map((s) => `<li><div><b>${T(s.text)}</b><span>${T(s.why || '')}</span></div></li>`).join('')}</ol>` : '<p class="seq-empty">Nothing yet. Choose what happens first.</p>'}</div>
      </div>`;
    $$('.seq-card', host).forEach((b) => b.addEventListener('click', () => pick(+b.dataset.k)));
  }
  function pick(k) {
    if (k === pos) {
      pos++; missHere = 0;
      if (pos === n) return finish();
      render(`<span class="verdict">Correct.</span><p>${T(steps[k].why || '')}</p>`, 'ok');
    } else {
      mistakes++; missHere++;
      const s = steps[k];
      render(`<span class="verdict">Not yet.</span><p>${T(s.early || 'Something else has to happen before this step.')}${missHere >= 2 ? ' The highlighted card comes next.' : ''}</p>`, 'no', k);
    }
  }
  function finish() {
    const score = Math.max(0, 1 - mistakes / n); api.done(score);
    render(doneBanner(score, `Sequence complete with ${mistakes} wrong pick${mistakes === 1 ? '' : 's'}. Read the finished sequence below; it is the procedure you need to remember.`), 'info');
  }
  render();
};

/* Pair items from two columns. */
GAMES.match = function (host, cfg, api) {
  const pairs = cfg.pairs.map((p, k) => Object.assign({ k }, p)); const n = pairs.length;
  const L = shuffle(pairs.slice()), R = shuffle(pairs.slice());
  let sel = null, mistakes = 0, done = 0; const paired = {}; const log = [];
  function btn(side, p, bad) {
    const pn = paired[p.k];
    return `<button type="button" class="m-item${pn ? ' paired' : ''}${sel && sel.side === side && sel.k === p.k ? ' sel' : ''}${bad ? ' no shake' : ''}" data-side="${side}" data-k="${p.k}" ${pn ? 'disabled' : ''}>${pn ? `<span class="pn">${pn}</span>` : ''}<span>${plain(side === 'a' ? p.a : p.b)}</span></button>`;
  }
  function render(msg, cls, badA, badB) {
    host.innerHTML = `${cfg.intro ? `<p class="g-intro">${T(cfg.intro)}</p>` : ''}
      <div class="g-progress"><span>${done} of ${n} pairs</span><span>${mistakes} miss${mistakes === 1 ? '' : 'es'}</span></div>
      <div class="match"><div class="m-col"><h4>${esc(cfg.left || 'Item')}</h4>${L.map((p) => btn('a', p, badA === p.k)).join('')}</div>
        <div class="m-col"><h4>${esc(cfg.right || 'Match')}</h4>${R.map((p) => btn('b', p, badB === p.k)).join('')}</div></div>
      <div class="g-feedback ${cls || ''}" aria-live="polite">${msg || ''}</div>
      ${log.length ? `<div class="m-log">${log.map((l) => `<p>${l}</p>`).join('')}</div>` : ''}`;
    $$('.m-item', host).forEach((b) => b.addEventListener('click', () => click(b.dataset.side, +b.dataset.k)));
  }
  function click(side, k) {
    if (!sel || sel.side === side) { sel = { side, k }; return render(); }
    const a = side === 'a' ? k : sel.k, b = side === 'b' ? k : sel.k; sel = null;
    if (a === b) {
      done++; paired[a] = done; const p = pairs[a];
      log.unshift(`<b>${done}. ${plain(p.a)} ↔ ${plain(p.b)}.</b> ${T(p.why || '')}`);
      if (done === n) {
        const score = n / (n + mistakes); api.done(score);
        return render(doneBanner(score, `All ${n} pairs matched with ${mistakes} miss${mistakes === 1 ? '' : 'es'}.`), 'info');
      }
      render(`<span class="verdict">Matched.</span>`, 'ok');
    } else { mistakes++; render(`<span class="verdict">Those two don't belong together.</span><p>Try another pairing.</p>`, 'no', a, b); }
  }
  render();
};

/* Label the reference points on an architecture diagram. */
GAMES.label = function (host, cfg, api) {
  const spec = cfg.diagram; const qIdx = spec.links.map((l, i) => (l.label && !l.given ? i : -1)).filter((i) => i >= 0);
  const pool = [...new Set(spec.links.filter((l) => l.label).map((l) => l.label))];
  const state = {}; let active = null, first = 0, answered = 0;
  qIdx.forEach((i) => { const l = spec.links[i]; state[i] = { ok: false, tries: 0, opts: shuffle([l.label, ...shuffle(pool.filter((p) => p !== l.label)).slice(0, 3)]) }; });
  const N = {}; spec.nodes.forEach((n) => { N[n.id] = n; });
  function render(msg, cls) {
    host.innerHTML = `${cfg.intro ? `<p class="g-intro">${T(cfg.intro)}</p>` : ''}
      <div class="g-progress"><span>${answered} of ${qIdx.length} links labelled</span><span>${first} right first time</span></div>
      <div class="fig"><div class="scroll-x">${archSVG(spec, { quiz: true, state, active })}</div>${archKey(spec)}</div>
      <div class="lab-panel" aria-live="polite">${panel(msg, cls)}</div>`;
    $$('.badge.q', host).forEach((g) => {
      const act = () => { active = +g.dataset.li; render(); };
      g.addEventListener('click', act);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
    });
    $$('.lab-opt', host).forEach((b) => b.addEventListener('click', () => answer(b.dataset.v)));
  }
  function panel(msg, cls) {
    if (active == null || !state[active]) return msg || `<p><b>Click a yellow number</b> on the diagram, then choose the name of that reference point.</p>`;
    const l = spec.links[active]; const s = state[active];
    if (s.ok) return `<div class="g-feedback ok"><span class="verdict">${esc(l.label)}: ${esc(N[l.a].label)} ↔ ${esc(N[l.b].label)}</span><p>${T(l.why || '')}</p></div>${msg || ''}`;
    return `<p><b>Link ${qIdx.indexOf(active) + 1}:</b> ${esc(N[l.a].label)} ↔ ${esc(N[l.b].label)}. Which reference point is this?</p>
      <div class="lab-opts">${s.opts.map((o) => `<button type="button" class="lab-opt${s.wrong && s.wrong.includes(o) ? ' no' : ''}" data-v="${esc(o)}" ${s.wrong && s.wrong.includes(o) ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>${msg || ''}`;
  }
  function answer(v) {
    const l = spec.links[active]; const s = state[active];
    if (v === l.label) {
      s.ok = true; answered++; if (!s.tries) first++;
      if (answered === qIdx.length) {
        const score = first / qIdx.length; api.done(score);
        active = null;
        return render(doneBanner(score, `All ${qIdx.length} reference points labelled; ${first} right on the first try.`));
      }
      render();
    } else {
      s.tries++; s.wrong = (s.wrong || []).concat(v);
      render(`<div class="g-feedback no"><span class="verdict">Not that one.</span><p>${esc(v)} connects other boxes. Look at which two functions this link joins.</p></div>`);
    }
  }
  render();
};

/* Numeric questions with tolerance and worked solutions. */
GAMES.calc = function (host, cfg, api) {
  const items = cfg.items.map((it) => (typeof it === 'function' ? it() : it));
  const st = items.map(() => ({ tries: 0, done: false, pts: 0 }));
  host.innerHTML = `${cfg.intro ? `<p class="g-intro">${T(cfg.intro)}</p>` : ''}
    <div class="calc-list">${items.map((it, i) => `<div class="calc-item" id="ci-${i}">
      <p><b>${i + 1}.</b> ${T(it.q)}</p>
      <div class="calc-row"><label class="sr" for="cin-${i}" hidden>Answer ${i + 1}</label><input id="cin-${i}" inputmode="decimal" autocomplete="off" aria-label="Answer ${i + 1}">
        ${it.unit ? `<span class="unit">${esc(it.unit)}</span>` : ''}<button type="button" class="btn sm" data-c="${i}">Check</button><button type="button" class="btn ghost sm" data-r="${i}" hidden>Show answer</button></div>
      <p class="calc-msg" id="cm-${i}" aria-live="polite"></p><div class="solution" id="cs-${i}" hidden>${T(it.solution)}</div></div>`).join('')}</div>
    <div id="calc-end"></div>`;
  const check = (i) => {
    if (st[i].done) return;
    const it = items[i]; const raw = $('#cin-' + i, host).value.replace(/,/g, '').trim(); const v = parseFloat(raw);
    const msg = $('#cm-' + i, host);
    if (!raw || Number.isNaN(v)) { msg.className = 'calc-msg no'; msg.textContent = 'Type a number first.'; return; }
    const tol = it.tol != null ? it.tol : Math.abs(it.answer) * 0.02 + 1e-9;
    if (Math.abs(v - it.answer) <= tol) {
      st[i].done = true; st[i].pts = st[i].tries === 0 ? 1 : st[i].tries === 1 ? 0.6 : 0.3;
      $('#ci-' + i, host).classList.add('solved'); msg.className = 'calc-msg ok'; msg.textContent = st[i].tries === 0 ? 'Correct on the first try.' : 'Correct.';
      $('#cs-' + i, host).hidden = false; $('[data-r="' + i + '"]', host).hidden = true;
    } else {
      st[i].tries++; msg.className = 'calc-msg no'; msg.innerHTML = 'Not quite. ' + T(it.hint || 'Check your units and try again.');
      if (st[i].tries >= 2) $('[data-r="' + i + '"]', host).hidden = false;
    }
    end();
  };
  const reveal = (i) => {
    st[i].done = true; st[i].pts = 0; $('#ci-' + i, host).classList.add('revealed');
    const m = $('#cm-' + i, host); m.className = 'calc-msg'; m.textContent = 'Answer: ' + items[i].answer + (items[i].unit ? ' ' + items[i].unit : '');
    $('#cs-' + i, host).hidden = false; $('[data-r="' + i + '"]', host).hidden = true; end();
  };
  function end() {
    if (!st.every((s) => s.done)) return;
    const score = st.reduce((a, s) => a + s.pts, 0) / st.length; api.done(score);
    $('#calc-end', host).innerHTML = doneBanner(score, 'All questions answered. Read each worked solution: the method matters more than the number.');
  }
  $$('[data-c]', host).forEach((b) => b.addEventListener('click', () => check(+b.dataset.c)));
  $$('[data-r]', host).forEach((b) => b.addEventListener('click', () => reveal(+b.dataset.r)));
  $$('.calc-row input', host).forEach((inp, i) => inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(i); }));
};

/* Multiple choice with an explanation after every answer. */
GAMES.quiz = function (host, cfg, api) {
  const items = cfg.items; const n = items.length; let i = 0, right = 0; const log = [];
  function show() {
    const it = items[i]; const order = it.keep ? it.options.map((_, j) => j) : shuffle(it.options.map((_, j) => j));
    host.innerHTML = `<div class="quiz">
      <div class="g-progress"><span>Question ${i + 1} of ${n}</span><span>${right} correct</span></div>
      ${it.scene ? `<p class="scene">${T(it.scene)}</p>` : ''}
      <p class="q">${T(it.q)}</p>
      <div class="opts">${order.map((j, x) => `<button type="button" class="opt" data-j="${j}"><span class="k">${'ABCDEF'[x]}</span><span>${plain(it.options[j])}</span></button>`).join('')}</div>
      <div class="g-feedback" aria-live="polite"></div></div>`;
    $$('.opt', host).forEach((b) => b.addEventListener('click', () => pick(+b.dataset.j)));
  }
  function pick(j) {
    const it = items[i]; const ok = j === it.answer; if (ok) right++;
    log.push({ it, ok });
    $$('.opt', host).forEach((b) => { b.disabled = true; const bj = +b.dataset.j; if (bj === it.answer) b.classList.add('ok'); else if (bj === j) b.classList.add('no'); });
    const fb = $('.g-feedback', host); fb.className = 'g-feedback ' + (ok ? 'ok' : 'no');
    fb.innerHTML = `<span class="verdict">${ok ? 'Correct' : 'Not quite. The answer is: ' + plain(it.options[it.answer])}</span><p>${T(it.why)}</p><div class="g-actions"><button type="button" class="btn sm" id="q-go">${i + 1 < n ? 'Next question →' : 'Finish'}</button></div>`;
    const b = $('#q-go'); b.addEventListener('click', () => { i++; if (i < n) show(); else finish(); }); b.focus({ preventScroll: true });
  }
  function finish() {
    const score = right / n; api.done(score);
    host.innerHTML = `${doneBanner(score, `${right} of ${n} correct.`)}
      <div class="recap">${log.map((l) => `<div><span class="mk ${l.ok ? 'ok' : 'no'}">${l.ok ? '✓' : '✗'}</span><span>${plain(l.it.q)} <b>${plain(l.it.options[l.it.answer])}</b></span></div>`).join('')}</div>`;
  }
  show();
};

/* ============================================================
   Diagram helpers (inline SVG, themed through CSS classes)
   ============================================================ */
function arrowHead(x, y, dir, cls) {
  // dir: 'r','l','u','d'
  const s = 8, w = 4.5;
  const pts = { r: [[x, y], [x - s, y - w], [x - s, y + w]], l: [[x, y], [x + s, y - w], [x + s, y + w]], d: [[x, y], [x - w, y - s], [x + w, y - s]], u: [[x, y], [x - w, y + s], [x + w, y + s]] }[dir];
  return `<polygon class="ah ${cls || ''}" points="${pts.map((p) => p.join(',')).join(' ')}"/>`;
}

/* Message sequence chart. lanes: [{id,name,kind}], msgs: [{from,to,label,kind}] */
function seqSVG(lanes, msgs, opt = {}) {
  const colW = opt.colW || 126, padX = 8, top = 50, rowH = opt.rowH || 32;
  const rows = Math.max(msgs.length, opt.minRows || 0);
  const W = padX * 2 + colW * lanes.length, H = top + rowH * rows + 12;
  const cx = (i) => padX + colW * i + colW / 2;
  let s = `<svg class="dg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.aria || 'Message sequence chart')}">`;
  lanes.forEach((l, i) => {
    const x = cx(i);
    s += `<line class="life" x1="${x}" y1="${top - 10}" x2="${x}" y2="${H - 4}"/>`;
    s += `<rect class="box ${l.kind || 'core'}" x="${x - colW / 2 + 7}" y="6" width="${colW - 14}" height="30" rx="6"/>`;
    s += `<text class="t-md" x="${x}" y="26" text-anchor="middle">${esc(l.name)}</text>`;
  });
  msgs.forEach((m, k) => {
    const y = top + rowH * k + rowH * 0.66;
    const a = lanes.findIndex((l) => l.id === m.from), b = lanes.findIndex((l) => l.id === m.to);
    const kind = m.kind || 'cp';
    if (a < 0) return;
    if (b < 0 || a === b) {
      const x = cx(a); const w = Math.min(colW * 1.6, Math.max(60, m.label.length * 6.1 + 16));
      s += `<rect class="box ${lanes[a].kind || 'core'}" x="${x - w / 2}" y="${y - 15}" width="${w}" height="21" rx="4"/><text class="t-sm" x="${x}" y="${y - 0.5}" text-anchor="middle">${esc(m.label)}</text>`;
    } else {
      const x1 = cx(a), x2 = cx(b), dir = x2 > x1 ? 1 : -1;
      s += `<line class="ln ${kind}" x1="${x1}" y1="${y}" x2="${x2 - dir * 7}" y2="${y}"/>`;
      s += arrowHead(x2, y, dir > 0 ? 'r' : 'l', kind);
      s += `<text class="t-sm halo" x="${(x1 + x2) / 2}" y="${y - 6}" text-anchor="middle">${esc(m.label)}</text>`;
    }
  });
  return s + '</svg>';
}

/* Architecture diagram with labelled links. */
function archSVG(spec, opt = {}) {
  const N = {}; spec.nodes.forEach((n) => { N[n.id] = n; });
  let s = `<svg class="dg" width="${spec.w}" height="${spec.h}" viewBox="0 0 ${spec.w} ${spec.h}" role="img" aria-label="${esc(spec.aria || 'Architecture diagram')}">`;
  spec.links.forEach((l) => {
    const A = N[l.a], B = N[l.b];
    const d = l.path || `M${A.x},${A.y} L${B.x},${B.y}`;
    s += `<path class="ln ${l.kind || ''}" d="${d}"/>`;
  });
  spec.nodes.forEach((n) => {
    const w = n.w || 96, h = n.h || 38;
    s += `<rect class="box ${n.kind || 'core'}" x="${n.x - w / 2}" y="${n.y - h / 2}" width="${w}" height="${h}" rx="7"/>`;
    s += `<text class="t-md" x="${n.x}" y="${n.y + (n.sub ? -2 : 4.5)}" text-anchor="middle">${esc(n.label)}</text>`;
    if (n.sub) s += `<text class="t-sm t-mute" x="${n.x}" y="${n.y + 12}" text-anchor="middle">${esc(n.sub)}</text>`;
  });
  let q = 0;
  spec.links.forEach((l, i) => {
    if (!l.label) return;
    const A = N[l.a], B = N[l.b];
    const bx = l.bx != null ? l.bx : (A.x + B.x) / 2, by = l.by != null ? l.by : (A.y + B.y) / 2;
    let txt = l.label, cls = '', extra = '';
    if (opt.quiz && !l.given) {
      q++;
      const st = (opt.state || {})[i];
      if (st && st.ok) cls = 'ok';
      else { txt = String(q); cls = 'q' + (opt.active === i ? ' sel' : ''); extra = ` tabindex="0" role="button" aria-label="Link ${q}: ${esc(A.label)} to ${esc(B.label)}"`; }
    }
    const w = Math.max(24, txt.length * 7 + 12);
    s += `<g class="badge ${cls}" data-li="${i}"${extra}><rect x="${bx - w / 2}" y="${by - 10}" width="${w}" height="20" rx="5"/><text x="${bx}" y="${by + 4}" text-anchor="middle">${esc(txt)}</text></g>`;
  });
  return s + '</svg>';
}
function archKey(spec) {
  const kinds = new Set(spec.links.map((l) => l.kind || 'plain'));
  const names = { up: 'User plane', cp: 'Control plane', lg: 'Logical V2X reference point', plain: 'Other interface', ul: 'Uplink', dl: 'Downlink' };
  return `<div class="key-row">${[...kinds].map((k) => `<span><i class="key-line ${k}"></i>${names[k] || k}</span>`).join('')}</div>`;
}

/* Rows of boxes with connecting lines (channel maps, key trees). */
function layeredSVG(spec) {
  const W = spec.w || 700, rowGap = spec.rowGap || 76, top = spec.top || 26, labelW = spec.labelW || 92, bh = 30;
  const H = top + rowGap * (spec.rows.length - 1) + bh + 16;
  const pos = {};
  let s = `<svg class="dg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(spec.aria || 'Diagram')}">`;
  spec.rows.forEach((r, ri) => {
    const y = top + ri * rowGap; const n = r.items.length; const span = W - labelW - 10;
    r.items.forEach((it, k) => {
      const w = it.w || Math.max(54, it.t.length * 7.4 + 18);
      const x = it.x != null ? it.x : labelW + span * (k + 0.5) / n;
      pos[it.id] = { x, y, w };
    });
    if (r.label) s += `<text class="t-sm t-mute" x="6" y="${y + bh / 2 + 4}">${esc(r.label)}</text>`;
  });
  (spec.links || []).forEach((l) => {
    const A = pos[l.a], B = pos[l.b]; if (!A || !B) return;
    const y1 = A.y + bh, y2 = B.y;
    s += `<path class="ln thin ${l.kind || ''}" d="M${A.x},${y1} C${A.x},${(y1 + y2) / 2} ${B.x},${(y1 + y2) / 2} ${B.x},${y2 - 6}"/>`;
    s += arrowHead(B.x, y2, 'd', l.kind || '');
  });
  spec.rows.forEach((r) => r.items.forEach((it) => {
    const p = pos[it.id];
    s += `<rect class="box ${it.kind || 'core'}" x="${p.x - p.w / 2}" y="${p.y}" width="${p.w}" height="${bh}" rx="6"/><text class="t-sm" x="${p.x}" y="${p.y + 19}" text-anchor="middle">${esc(it.t)}</text>`;
  }));
  return s + '</svg>';
}

/* Protocol stacks side by side. cols: [{name, kind, layers:[{t,kind}|null] (top -> bottom)}] */
function stackSVG(cols, opt = {}) {
  const colW = opt.colW || 116, gap = opt.gap || 30, rowH = 27, top = 40;
  const rows = Math.max(...cols.map((c) => c.layers.length));
  const W = cols.length * colW + (cols.length - 1) * gap + 16, H = top + rows * rowH + 44;
  let s = `<svg class="dg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.aria || 'Protocol stacks')}">`;
  const colX = (i) => 8 + i * (colW + gap);
  cols.forEach((c, i) => {
    const x = colX(i);
    s += `<text class="t-md" x="${x + colW / 2}" y="24" text-anchor="middle">${esc(c.name)}</text>`;
    const off = rows - c.layers.length;
    c.layers.forEach((L, j) => {
      if (!L) return;
      const y = top + (off + j) * rowH;
      s += `<rect class="box ${L.kind || 'core'}" x="${x}" y="${y}" width="${colW}" height="${rowH - 3}" rx="4"/><text class="t-sm" x="${x + colW / 2}" y="${y + 16}" text-anchor="middle">${esc(L.t)}</text>`;
    });
  });
  (opt.links || []).forEach((l) => {
    const x1 = colX(l.from) + colW, x2 = colX(l.to); const y = top + rows * rowH + 10;
    s += `<line class="ln ${l.kind || ''}" x1="${x1 - colW / 2}" y1="${top + rows * rowH - 3}" x2="${x1 - colW / 2}" y2="${y}"/><line class="ln ${l.kind || ''}" x1="${x1 - colW / 2}" y1="${y}" x2="${x2 + colW / 2}" y2="${y}"/><line class="ln ${l.kind || ''}" x1="${x2 + colW / 2}" y1="${y}" x2="${x2 + colW / 2}" y2="${top + rows * rowH - 3}"/>`;
    s += `<text class="t-sm t-mute halo" x="${(x1 + x2) / 2}" y="${y + 16}" text-anchor="middle">${esc(l.label)}</text>`;
  });
  return s + '</svg>';
}
