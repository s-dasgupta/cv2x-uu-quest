/* ============================================================
   Interactive figures (MOUNTS) and simulator challenges (GAMES)
   ============================================================ */
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(r) { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function segButtons(name, opts, val, disabledFn) {
  return `<div class="segs" role="group" aria-label="${esc(name)}">${opts.map((o) => `<button type="button" class="segbtn" data-g="${esc(name)}" data-v="${esc(o.id)}" aria-pressed="${o.id === val}" ${disabledFn && disabledFn(o) ? 'disabled' : ''}>${o.t}</button>`).join('')}</div>`;
}

/* ---------- LTE resource grid at resource-block level ---------- */
MOUNTS.gridExplorer = function (el) {
  const BW = [[1.4, 6], [3, 15], [5, 25], [10, 50], [15, 75], [20, 100]];
  let sel = 3;
  function draw() {
    const [bw, nrb] = BW[sel];
    const gx = 44, gy = 8, gw = 280, gh = 220, cw = gw / 14, rh = gh / nrb;
    const cfi = nrb <= 10 ? 3 : 2;
    const c0 = Math.floor((nrb - 6) / 2);
    let s = `<svg class="dg${rh > 4 ? ' re-grid' : ''}" viewBox="0 0 340 ${gh + 48}" role="img" aria-label="Downlink subframe 0 for ${bw} MHz: ${nrb} resource blocks by 14 OFDM symbols">`;
    for (let r = 0; r < nrb; r++) for (let l = 0; l < 14; l++) {
      let c = 'pdsch';
      if (l < cfi) c = 'pdcch';
      else if (r >= c0 && r < c0 + 6 && l === 5) c = 'sss';
      else if (r >= c0 && r < c0 + 6 && l === 6) c = 'pss';
      else if (r >= c0 && r < c0 + 6 && l >= 7 && l <= 10) c = 'pbch';
      s += `<rect class="re-${c}" x="${gx + l * cw}" y="${gy + (nrb - 1 - r) * rh}" width="${cw + 0.2}" height="${rh + 0.2}"/>`;
    }
    s += `<line class="stroke-ink" x1="${gx + 7 * cw}" y1="${gy}" x2="${gx + 7 * cw}" y2="${gy + gh}" stroke-width="2"/>`;
    s += `<rect class="stroke-ink" x="${gx}" y="${gy}" width="${gw}" height="${gh}" stroke-width="1.2"/>`;
    for (let l = 0; l < 14; l += 1) s += `<text class="t-mono t-mute" x="${gx + l * cw + cw / 2}" y="${gy + gh + 13}" text-anchor="middle">${l}</text>`;
    s += `<text class="t-sm t-mute" x="${gx + gw / 4}" y="${gy + gh + 30}" text-anchor="middle">slot 0 (0.5 ms)</text><text class="t-sm t-mute" x="${gx + 3 * gw / 4}" y="${gy + gh + 30}" text-anchor="middle">slot 1 (0.5 ms)</text>`;
    s += `<text class="t-mono t-mute" x="${gx - 6}" y="${gy + gh}" text-anchor="end">RB 0</text><text class="t-mono t-mute" x="${gx - 6}" y="${gy + 10}" text-anchor="end">RB ${nrb - 1}</text>`;
    s += `<text class="t-sm t-mute" transform="translate(12 ${gy + gh / 2}) rotate(-90)" text-anchor="middle">frequency →</text></svg>`;
    const occ = nrb * 0.18;
    el.innerHTML = `<div class="ctl"><span class="lbl">Channel bandwidth</span>${segButtons('bw', BW.map((b, i) => ({ id: String(i), t: b[0] + ' MHz' })), String(sel))}</div>
      ${s}
      <div class="key-row"><span><i class="sw re-pdcch"></i>Control region (PDCCH, PCFICH, PHICH)</span><span><i class="sw re-pss"></i>PSS</span><span><i class="sw re-sss"></i>SSS</span><span><i class="sw re-pbch"></i>PBCH</span><span><i class="sw re-pdsch"></i>PDSCH (data)</span></div>
      <p class="readout">N<sub>RB</sub> = ${nrb} · ${nrb * 12} subcarriers · ${round(occ, 2)} MHz occupied of ${bw} MHz · ${(nrb * 12 * 14).toLocaleString()} resource elements per 1 ms subframe</p>`;
    $$('.segbtn', el).forEach((b) => b.addEventListener('click', () => { sel = +b.dataset.v; draw(); }));
  }
  draw();
};
// make swatches usable as svg-class colours in HTML
(function () { const st = document.createElement('style'); st.textContent = '.sw.re-pdcch{background:#7c5cc4}.sw.re-crs{background:#d14b3a}.sw.re-pss{background:#e0a100}.sw.re-sss{background:#c57c00}.sw.re-pbch{background:#2f7d6d}.sw.re-pdsch{background:#bcd3c6}.sw.re-rsv{background:#8b948f}'; document.head.appendChild(st); })();

/* ---------- LTE resource grid at resource-element level (1.4 MHz, subframe 0) ---------- */
const RE_INFO = {
  pdcch: ['Control region', 'First 3 OFDM symbols here (1.4 MHz uses 2 to 4). Carries PDCCH (DCI: grants and assignments), PCFICH (how many control symbols) and PHICH (uplink HARQ ACK/NACK).'],
  crs: ['Cell-specific reference signal', 'Known pilot symbols on antenna ports 0 and 1, every third subcarrier in symbols 0, 4, 7 and 11. UEs use them for channel estimation and RSRP measurement.'],
  pss: ['Primary synchronisation signal', 'In FDD, the last symbol of slot 0 in subframes 0 and 5, central 62 subcarriers. Gives 5 ms timing and N_ID(2).'],
  sss: ['Secondary synchronisation signal', 'Symbol just before the PSS (FDD). Gives 10 ms frame timing and N_ID(1).'],
  pbch: ['Physical broadcast channel', 'First four symbols of slot 1 in subframe 0, central 72 subcarriers. Carries the MIB.'],
  pdsch: ['PDSCH', 'Everything left over carries user data and SIBs, scheduled by the PDCCH.'],
  rsv: ['Reserved / unused', 'Guard subcarriers beside PSS/SSS, and positions the PBCH leaves free for antenna ports 2 and 3.'],
};
function reModel() {
  const g = [];
  for (let k = 0; k < 72; k++) {
    g[k] = [];
    for (let l = 0; l < 14; l++) {
      const crs = (l === 0 || l === 4 || l === 7 || l === 11) && k % 3 === 0;
      let c = 'pdsch';
      if (l < 3) c = crs ? 'crs' : 'pdcch';
      else if (l === 5 || l === 6) c = k >= 5 && k <= 66 ? (l === 5 ? 'sss' : 'pss') : 'rsv';
      else if (l >= 7 && l <= 10) c = crs ? 'crs' : (l === 8 && k % 3 === 0 ? 'rsv' : 'pbch');
      else if (crs) c = 'crs';
      g[k][l] = c;
    }
  }
  return g;
}
function reGridSVG(g, show, picks) {
  const cw = 22, rh = 6, gx = 40, gy = 6, W = gx + 14 * cw + 6, H = gy + 72 * rh + 32;
  let s = `<svg class="dg re-grid" viewBox="0 0 ${W} ${H}" style="max-width:${W}px" role="img" aria-label="Resource elements of one LTE subframe, 72 subcarriers by 14 symbols">`;
  for (let k = 0; k < 72; k++) for (let l = 0; l < 14; l++) {
    const c = g[k][l]; const vis = show(c);
    const pk = picks && picks.some((p) => p[0] === k && p[1] === l);
    s += `<rect class="re-${vis ? c : 'hide'}${pk ? ' pick' : ''}" x="${gx + l * cw}" y="${gy + (71 - k) * rh}" width="${cw}" height="${rh}" data-k="${k}" data-l="${l}"/>`;
  }
  for (let r = 0; r <= 6; r++) s += `<line class="stroke-ink" x1="${gx}" x2="${gx + 14 * cw}" y1="${gy + r * 12 * rh}" y2="${gy + r * 12 * rh}" stroke-width="${r % 6 === 0 ? 1.4 : 0.8}" pointer-events="none"/>`;
  s += `<line class="stroke-ink" x1="${gx + 7 * cw}" x2="${gx + 7 * cw}" y1="${gy}" y2="${gy + 72 * rh}" stroke-width="2" pointer-events="none"/>`;
  for (let r = 0; r < 6; r++) s += `<text class="t-mono t-mute" x="${gx - 5}" y="${gy + (6 - r) * 12 * rh - 32}" text-anchor="end">RB${r}</text>`;
  for (let l = 0; l < 14; l++) s += `<text class="t-mono t-mute" x="${gx + l * cw + cw / 2}" y="${gy + 72 * rh + 13}" text-anchor="middle">${l}</text>`;
  s += `<text class="t-sm t-mute" x="${gx + 7 * cw}" y="${gy + 72 * rh + 28}" text-anchor="middle">OFDM symbol in subframe 0 (slot 0 | slot 1)</text></svg>`;
  return s;
}
function reDescribe(g, k, l) {
  const c = g[k][l];
  return `<b>Symbol ${l}</b> (slot ${l < 7 ? 0 : 1}, symbol ${l % 7}) · <b>subcarrier ${k}</b> (RB ${Math.floor(k / 12)}) → <b>${RE_INFO[c][0]}</b>. ${RE_INFO[c][1]}`;
}
MOUNTS.reGrid = function (el) {
  const g = reModel(); const on = new Set(Object.keys(RE_INFO)); let pick = null;
  function draw() {
    el.innerHTML = `<div class="segs" role="group" aria-label="Show channels">${Object.keys(RE_INFO).map((c) => `<button type="button" class="segbtn" data-c="${c}" aria-pressed="${on.has(c)}"><i class="sw re-${c}" style="display:inline-block;vertical-align:-2px;margin-right:6px"></i>${RE_INFO[c][0]}</button>`).join('')}</div>
      <div class="re-host">${reGridSVG(g, (c) => on.has(c), pick ? [pick] : null)}</div>
      <p class="small" aria-live="polite">${pick ? reDescribe(g, pick[0], pick[1]) : 'Click any resource element to see what it carries. Toggle the buttons to isolate one channel.'}</p>`;
    $$('.segbtn', el).forEach((b) => b.addEventListener('click', () => { const c = b.dataset.c; if (on.has(c)) on.delete(c); else on.add(c); draw(); }));
    $('.re-host svg', el).addEventListener('click', (e) => { const r = e.target.closest('rect[data-k]'); if (!r) return; pick = [+r.dataset.k, +r.dataset.l]; draw(); });
  }
  draw();
};

GAMES.gridfind = function (host, cfg, api) {
  const g = reModel(); const prompts = cfg.prompts; let i = 0, first = 0, tries = 0; const found = new Set(); const picks = [];
  function render(msg, cls) {
    const p = prompts[i];
    host.innerHTML = `${cfg.intro ? `<p class="g-intro">${T(cfg.intro)}</p>` : ''}
      <div class="g-progress"><span>${i < prompts.length ? 'Target ' + (i + 1) + ' of ' + prompts.length : 'All targets found'}</span><span>${first} right first time</span></div>
      <div class="sim"><div class="sim-ctrl">
        ${i < prompts.length ? `<div class="mission"><span class="eyebrow">Find</span><p><b>${T(p.ask)}</b></p><p class="small">${T(p.hint)}</p></div>` : ''}
        <div class="g-feedback ${cls || ''}" aria-live="polite">${msg || ''}</div>
        <div class="key-row">${[...found].map((c) => `<span><i class="sw re-${c}"></i>${RE_INFO[c][0]}</span>`).join('')}</div>
      </div><div class="sim-view"><div class="re-host">${reGridSVG(g, (c) => i >= prompts.length || found.has(c), picks)}</div></div></div>`;
    const svg = $('.re-host svg', host);
    if (i < prompts.length) svg.addEventListener('click', (e) => { const r = e.target.closest('rect[data-k]'); if (r) click(+r.dataset.k, +r.dataset.l); });
  }
  function hit(k, l, want) {
    if (g[k][l] === want) return true;
    if (want === 'crs') return [k - 1, k + 1].some((kk) => kk >= 0 && kk < 72 && g[kk][l] === 'crs');
    return false;
  }
  function click(k, l) {
    const p = prompts[i];
    picks.length = 0; picks.push([k, l]);
    if (hit(k, l, p.want)) {
      if (tries === 0) first++;
      found.add(p.want); i++; tries = 0;
      if (i === prompts.length) {
        const score = first / prompts.length; api.done(score);
        return render(doneBanner(score, 'Every channel located. The full map of subframe 0 is now shown; click around it in the briefing to revise.'), 'info');
      }
      render(`<span class="verdict">Found it.</span><p>${T(p.why)}</p>`, 'ok');
    } else {
      tries++;
      render(`<span class="verdict">That element is ${RE_INFO[g[k][l]][0]}.</span><p>${T(p.hint)}</p>`, 'no');
    }
  }
  render();
};

/* ---------- modulation constellations ---------- */
MOUNTS.modulation = function (el) {
  const M = [{ id: 'qpsk', t: 'QPSK', b: 2, snr: 'about 0 dB and up' }, { id: '16qam', t: '16QAM', b: 4, snr: 'about 8 dB and up' }, { id: '64qam', t: '64QAM', b: 6, snr: 'about 15 dB and up' }, { id: '256qam', t: '256QAM', b: 8, snr: 'about 22 dB and up' }];
  let sel = 1;
  function draw() {
    const m = M[sel]; const side = Math.sqrt(2 ** m.b); const S = 220, pad = 16, step = (S - 2 * pad) / (side - 1 || 1);
    let s = `<svg class="dg" viewBox="0 0 ${S} ${S}" style="max-width:260px;margin:auto" role="img" aria-label="${m.t} constellation with ${2 ** m.b} points">`;
    s += `<line class="stroke-mute" x1="${S / 2}" y1="4" x2="${S / 2}" y2="${S - 4}"/><line class="stroke-mute" x1="4" y1="${S / 2}" x2="${S - 4}" y2="${S / 2}"/>`;
    const r = side >= 16 ? 2.6 : side >= 8 ? 4 : 6;
    for (let a = 0; a < side; a++) for (let b = 0; b < side; b++) s += `<circle class="fill-sign" cx="${pad + a * step}" cy="${pad + b * step}" r="${r}"/>`;
    s += `<text class="t-sm t-mute" x="${S - 6}" y="${S / 2 - 6}" text-anchor="end">I</text><text class="t-sm t-mute" x="${S / 2 + 6}" y="14">Q</text></svg>`;
    el.innerHTML = `<div class="ctl"><span class="lbl">Modulation</span>${segButtons('mod', M, m.id)}</div>${s}
      <p class="readout">${m.t}: ${2 ** m.b} points → ${m.b} bits per resource element. Typical SINR needed: ${m.snr}.</p>`;
    $$('.segbtn', el).forEach((b) => b.addEventListener('click', () => { sel = M.findIndex((x) => x.id === b.dataset.v); draw(); }));
  }
  draw();
};

/* ---------- encapsulation stepper ---------- */
GAMES.encap = function (host, cfg, api) {
  let segs = cfg.start.map((s) => Object.assign({}, s)); let i = 0, right = 0, answered = false;
  cfg.steps.forEach((st) => { delete st._order; });
  function bar() {
    const tot = segs.reduce((a, s) => a + s.b, 0);
    return `<div class="lbar" role="img" aria-label="Packet of ${tot} bytes">${segs.map((s) => `<i class="${s.c}" style="width:${(100 * s.b / tot).toFixed(2)}%" title="${esc(s.t)} ${s.b} B"></i>`).join('')}</div>
      <div class="seg-legend">${segs.map((s) => `<span><i class="sw ${s.c}"></i>${esc(s.t)}</span><b>${s.b} B</b>`).join('')}<span><b style="text-align:left">Total</b></span><b>${tot} B</b></div>`;
  }
  function render(fb, cls) {
    const st = cfg.steps[i];
    host.innerHTML = `${cfg.intro ? `<p class="g-intro">${T(cfg.intro)}</p>` : ''}
      <div class="g-progress"><span>${st ? 'Layer ' + (i + 1) + ' of ' + cfg.steps.length + ': ' + st.layer : 'At the antenna'}</span><span>${right} correct</span></div>
      <div class="sim"><div class="sim-ctrl">
        ${st ? `<p class="q">${T(st.q)}</p><div class="opts">${(st._order || (st._order = shuffle(st.options.map((_, j) => j)))).map((j, x) => `<button type="button" class="opt" data-j="${j}" ${answered ? 'disabled' : ''}><span class="k">${'ABCD'[x]}</span><span>${plain(st.options[j])}</span></button>`).join('')}</div>` : ''}
        <div class="g-feedback ${cls || ''}" aria-live="polite">${fb || ''}</div>
      </div><div class="sim-view"><h4>The packet so far</h4>${bar()}</div></div>`;
    $$('.opt', host).forEach((b) => b.addEventListener('click', () => pick(+b.dataset.j)));
  }
  function apply(st) {
    if (st.replace) { const keep = segs.filter((s) => !st.replace.from.includes(s.t)); const at = segs.findIndex((s) => st.replace.from.includes(s.t)); keep.splice(at < 0 ? 0 : at, 0, Object.assign({}, st.replace.to)); segs = keep; }
    (st.push || []).forEach((p) => { if (p.front) segs.unshift(Object.assign({}, p)); else segs.push(Object.assign({}, p)); });
  }
  function pick(j) {
    const st = cfg.steps[i]; const ok = j === st.answer; if (ok) right++;
    answered = true; apply(st);
    render(`<span class="verdict">${ok ? 'Correct' : 'Not quite. Answer: ' + plain(st.options[st.answer])}</span><p>${T(st.why)}</p><div class="g-actions"><button type="button" class="btn sm" id="en-go">${i + 1 < cfg.steps.length ? 'Down to the next layer →' : 'Transmit'}</button></div>`, ok ? 'ok' : 'no');
    $$('.opt', host).forEach((b) => { b.disabled = true; if (+b.dataset.j === st.answer) b.classList.add('ok'); else if (+b.dataset.j === j) b.classList.add('no'); });
    $('#en-go').addEventListener('click', () => { i++; answered = false; if (i < cfg.steps.length) render(); else finish(); });
  }
  function finish() {
    const score = right / cfg.steps.length; api.done(score);
    render(doneBanner(score, `${right} of ${cfg.steps.length} layers right.`) + `<div class="prose">${T(cfg.finale)}</div>`, 'info');
  }
  render();
};

/* ---------- latency lab ---------- */
const LAT = {
  ul: [
    { id: 'dyn10', t: 'Dynamic, SR every 10 ms', sps: false },
    { id: 'dyn1', t: 'Dynamic, SR every 1 ms', sps: false },
    { id: 'spsU', t: 'SPS 100 ms, not aligned', sps: true },
    { id: 'spsA', t: 'SPS 100 ms, aligned with UE assistance info', sps: true },
  ],
  srv: [{ id: 'cloud', t: 'Central cloud', ow: 20 }, { id: 'region', t: 'Regional data centre', ow: 8 }, { id: 'edge', t: 'Edge server (MEC, local breakout)', ow: 1 }],
  dl: [{ id: 'uni', t: 'Unicast to each vehicle' }, { id: 'scptm', t: 'SC-PTM in each cell' }, { id: 'mb80', t: 'MBSFN, MCH period 80 ms (pre-Rel-14 minimum)' }, { id: 'mb10', t: 'MBSFN, MCH period 10 ms (Rel-14)' }],
};
function latModel(c, m) {
  const harq = (m.bler / (1 - m.bler)) * 8; const segs = [];
  if (c.ul === 'dyn10' || c.ul === 'dyn1') {
    const per = c.ul === 'dyn10' ? 10 : 1;
    segs.push(['Wait for a scheduling-request opportunity', per / 2, 'c1'], ['SR → uplink grant on PDCCH', 4, 'c2'], ['Grant → PUSCH (n+4 rule)', 4, 'c3']);
  } else segs.push(['Wait for the next SPS occasion', c.ul === 'spsU' ? 50 : 1, 'c1']);
  segs.push(['PUSCH subframe + eNB decoding', 3, 'c4'], ['Uplink HARQ retransmissions (average)', harq, 'c5']);
  const srv = LAT.srv.find((s) => s.id === c.srv); const mb = c.dl === 'mb80' || c.dl === 'mb10';
  segs.push(['eNB → V2X AS (S1-U, gateways, SGi)', srv.ow, 'c6'], ['V2X AS processing', 3, 'c7']);
  segs.push([mb ? 'V2X AS → BM-SC → MBMS-GW → eNBs (incl. SYNC buffer)' : 'V2X AS → eNB', srv.ow + (mb ? 10 : 0), 'c6']);
  const wait = c.dl === 'uni' ? m.n / 16 : c.dl === 'scptm' ? 2 : c.dl === 'mb80' ? 40 : 5;
  segs.push([c.dl === 'uni' ? 'Downlink queue: one PDSCH per vehicle' : mb ? 'Wait for the MCH scheduling period' : 'Wait for SC-PTM scheduling (G-RNTI)', wait, 'c8']);
  segs.push(['Downlink subframe + UE decoding', 2, 'c9']);
  if (c.dl === 'uni') segs.push(['Downlink HARQ retransmissions (average)', harq, 'c5']);
  const total = segs.reduce((a, s) => a + s[1], 0);
  const cost = c.dl === 'uni' ? 2 * m.n : c.dl === 'scptm' ? 5 * m.cells : 3 * m.cells + 6;
  return { segs, total, cost };
}
GAMES.latency = function (host, cfg, api) {
  const ms = cfg.missions; let mi = 0;
  const S = ms.map((m) => ({ c: Object.assign({}, m.startCfg || { ul: 'dyn10', srv: 'cloud', dl: 'uni' }), tries: 0, passed: false, pts: null, fb: '', cls: '' }));
  function render() {
    const m = ms[mi], s = S[mi], c = s.c; const r = latModel(c, m);
    const scale = Math.max(m.budget * 1.25, r.total);
    const allDone = S.every((x) => x.pts != null);
    host.innerHTML = `${cfg.intro ? `<p class="g-intro">${T(cfg.intro)}</p>` : ''}
      <div class="mission-tabs" role="group" aria-label="Missions">${ms.map((x, k) => `<button type="button" class="mtab${S[k].passed ? ' passed' : ''}" data-m="${k}" aria-pressed="${k === mi}">Mission ${k + 1}</button>`).join('')}</div>
      <div class="sim"><div class="sim-ctrl">
        <div class="mission"><span class="eyebrow">Mission ${mi + 1}: ${esc(m.name)}</span><p>${T(m.story)}</p>
          <p class="small"><b>Conditions:</b> ${m.periodic ? 'periodic' : 'event-triggered'} message · ${m.n} vehicles in ${m.cells} cell${m.cells > 1 ? 's' : ''} · BLER ${Math.round(m.bler * 100)}% on the first transmission</p>
          <p class="small"><b>Win:</b> ${T(m.goal)}</p></div>
        <div class="ctl"><span class="lbl">Uplink access</span>${segButtons('ul', LAT.ul, c.ul, (o) => o.sps && !m.periodic)}</div>
        <div class="ctl"><span class="lbl">Where the V2X AS runs</span>${segButtons('srv', LAT.srv, c.srv)}</div>
        <div class="ctl"><span class="lbl">Downlink delivery</span>${segButtons('dl', LAT.dl, c.dl)}</div>
        <div class="g-actions"><button type="button" class="btn" id="lat-sub" ${s.pts != null ? 'disabled' : ''}>Submit configuration</button>${s.tries >= 3 && s.pts == null ? '<button type="button" class="btn ghost sm" id="lat-sol">Show a solution</button>' : ''}</div>
      </div><div class="sim-view">
        <div class="bigread"><b>${round(r.total, 1)} ms</b><span class="muted">end-to-end, car A to the cars in the area</span>
          <span class="pill ${r.total <= m.budget ? 'ok' : 'no'}">budget ${m.budget} ms</span>${m.costCap ? `<span class="pill ${r.cost <= m.costCap ? 'ok' : 'no'}">DL cost ${r.cost} / ${m.costCap} RB-pairs</span>` : `<span class="pill mid">DL cost ${r.cost} RB-pairs</span>`}</div>
        <div class="lbar" role="img" aria-label="Latency breakdown">${r.segs.map((x) => `<i class="${x[2]}" style="width:${(100 * x[1] / scale).toFixed(2)}%" title="${esc(x[0])}: ${round(x[1], 2)} ms"></i>`).join('')}<span class="budget" style="left:${(100 * m.budget / scale).toFixed(2)}%" title="Budget"></span></div>
        <div class="seg-legend">${r.segs.map((x) => `<span><i class="sw ${x[2]}"></i>${esc(x[0])}</span><b>${round(x[1], 2)} ms</b>`).join('')}</div>
        <p class="small muted">The red dashed line is the budget. Downlink cost is the radio resource spent per message: unicast pays per vehicle, broadcast pays per cell.</p>
        <div class="g-feedback ${s.cls}" aria-live="polite">${s.fb}</div>
      </div></div>
      ${allDone ? doneBanner(S.reduce((a, x) => a + x.pts, 0) / S.length, `All missions resolved. ${T(cfg.finale || '')}`) : ''}`;
    $$('.segbtn', host).forEach((b) => b.addEventListener('click', () => { if (S[mi].pts != null) return; S[mi].c[b.dataset.g] = b.dataset.v; S[mi].fb = ''; render(); }));
    $$('.mtab', host).forEach((b) => b.addEventListener('click', () => { mi = +b.dataset.m; render(); }));
    const sub = $('#lat-sub', host); if (sub) sub.addEventListener('click', submit);
    const sol = $('#lat-sol', host); if (sol) sol.addEventListener('click', () => { const x = S[mi]; x.c = Object.assign({}, m.solution); x.pts = 0; x.fb = `<span class="verdict">One working configuration</span><p>${T(m.debrief)}</p>`; x.cls = 'info'; check(); render(); });
  }
  function submit() {
    const m = ms[mi], s = S[mi]; const r = latModel(s.c, m); const fails = [];
    if (r.total > m.budget) fails.push(`Latency ${round(r.total, 1)} ms is over the ${m.budget} ms budget. Look at the biggest bars first.`);
    if (m.costCap && r.cost > m.costCap) fails.push(`Downlink cost ${r.cost} RB-pairs per message exceeds ${m.costCap}. Sending one copy per vehicle does not scale; think broadcast.`);
    if (m.needSPS && !s.c.ul.startsWith('sps')) fails.push('This traffic is periodic. The mission asks you to stop paying for a scheduling request and a grant on every message: use semi-persistent scheduling.');
    s.tries++;
    if (!fails.length) { s.passed = true; s.pts = s.tries === 1 ? 1 : s.tries === 2 ? 0.75 : 0.5; s.fb = `<span class="verdict">Mission passed${s.tries === 1 ? ' on the first submit' : ''}.</span><p>${T(m.debrief)}</p>`; s.cls = 'ok'; }
    else { s.fb = `<span class="verdict">Not yet (attempt ${s.tries}).</span><ul>${fails.map((f) => `<li>${f}</li>`).join('')}</ul>`; s.cls = 'no'; }
    check(); render();
  }
  function check() { if (S.every((x) => x.pts != null)) api.done(S.reduce((a, x) => a + x.pts, 0) / S.length); }
  render();
};

/* ---------- broadcast commander ---------- */
GAMES.broadcast = function (host, cfg, api) {
  const R = 30, HW = Math.sqrt(3) * R, rows = 3, cols = 7;
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ id: r * cols + c, r, c, x: 24 + HW / 2 + c * HW + (r % 2 ? HW / 2 : 0), y: 18 + R + r * 1.5 * R });
  const W = 24 * 2 + HW * cols + HW / 2, H = 36 + 2 * R + 3 * R;
  const ms = cfg.scenarios; let si = 0;
  const S = ms.map(() => ({ method: null, sel: new Set(), tries: 0, pts: null, fb: '', cls: '', table: '' }));
  const methods = [{ id: 'uni', t: 'Unicast' }, { id: 'scptm', t: 'SC-PTM' }, { id: 'mbsfn', t: 'MBSFN area' }];
  const costOf = (id, sc) => id === 'uni' ? 2 * sc.n : id === 'scptm' ? 5 * sc.affected.length : 3 * sc.affected.length + 6;
  function hexPts(x, y) { const p = []; for (let k = 0; k < 6; k++) { const a = Math.PI / 180 * (60 * k - 30); p.push((x + R * Math.cos(a)).toFixed(1) + ',' + (y + R * Math.sin(a)).toFixed(1)); } return p.join(' '); }
  function mapSVG(sc, s) {
    const rng = mulberry32(si * 97 + 13);
    let svg = `<svg class="dg" viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" role="img" aria-label="Map of 21 cells along a highway">`;
    cells.forEach((c) => {
      const aff = sc.affected.includes(c.id), sel = s.sel.has(c.id);
      svg += `<g class="hex${aff ? ' aff' : ''}${sel ? ' sel' : ''}${s.method === 'uni' || s.pts != null ? ' nohover' : ''}" data-c="${c.id}" tabindex="0" role="button" aria-pressed="${sel}" aria-label="Cell ${c.id + 1}${aff ? ', in the hazard area' : ''}"><polygon points="${hexPts(c.x, c.y)}"/></g>`;
    });
    const y0 = cells[cols].y;
    svg += `<rect class="fill-road" x="6" y="${y0 - 7}" width="${W - 12}" height="14" rx="3" pointer-events="none"/><line x1="10" x2="${W - 10}" y1="${y0}" y2="${y0}" style="stroke:var(--lane)" stroke-width="2" stroke-dasharray="10 8" pointer-events="none"/>`;
    cells.forEach((c) => {
      const n = (sc.vehicles[c.id] || 0); const shown = Math.min(n, 14);
      for (let v = 0; v < shown; v++) { const a = rng() * Math.PI * 2, d = rng() * R * 0.62; svg += `<circle class="${sc.affected.includes(c.id) ? 'fill-bad' : 'fill-blue'}" cx="${(c.x + d * Math.cos(a)).toFixed(1)}" cy="${(c.y + d * Math.sin(a)).toFixed(1)}" r="2.6" pointer-events="none"/>`; }
      if (n) svg += `<text class="t-mono" x="${c.x}" y="${c.y - R * 0.55}" text-anchor="middle" pointer-events="none">${n}</text>`;
    });
    return svg + '</svg>';
  }
  function render() {
    const sc = ms[si], s = S[si]; const allDone = S.every((x) => x.pts != null);
    host.innerHTML = `${cfg.intro ? `<p class="g-intro">${T(cfg.intro)}</p>` : ''}
      <div class="mission-tabs" role="group" aria-label="Scenarios">${ms.map((x, k) => `<button type="button" class="mtab${S[k].pts ? ' passed' : ''}" data-m="${k}" aria-pressed="${k === si}">Scenario ${k + 1}</button>`).join('')}</div>
      <div class="sim"><div class="sim-ctrl">
        <div class="mission"><span class="eyebrow">Scenario ${si + 1}: ${esc(sc.name)}</span><p>${T(sc.story)}</p><p class="small"><b>Vehicles that need it:</b> ${sc.n} in ${sc.affected.length} cell${sc.affected.length > 1 ? 's' : ''} (red).</p></div>
        <div class="ctl"><span class="lbl">1 · Delivery method</span>${segButtons('method', methods, s.method)}</div>
        <div class="ctl"><span class="lbl">2 · Cells to transmit in</span><p class="small muted">${s.method === 'uni' ? 'Unicast follows each vehicle through its own bearer, so there is no cell list to pick.' : 'Click cells on the map to add or remove them. Selected: ' + s.sel.size + '.'}</p></div>
        <div class="g-actions"><button type="button" class="btn" id="bc-sub" ${!s.method || s.pts != null ? 'disabled' : ''}>Send the warning</button></div>
        <div class="g-feedback ${s.cls}" aria-live="polite">${s.fb}</div>
      </div><div class="sim-view">${mapSVG(sc, s)}
        <div class="key-row"><span><i class="sw" style="background:var(--bad-soft)"></i>Hazard area</span><span><i class="sw" style="border:3px solid var(--sign)"></i>Selected cell</span><span><i class="sw" style="background:var(--bad);border-radius:99px"></i>Vehicle that needs the warning</span><span>Number = vehicles in cell</span></div>
        ${s.table}</div></div>
      ${allDone ? doneBanner(S.reduce((a, x) => a + x.pts, 0) / S.length, 'All scenarios resolved. The rule of thumb: few receivers → unicast; many receivers in one or two cells → SC-PTM; many receivers over a wide, stable area → MBSFN.') : ''}`;
    $$('.segbtn', host).forEach((b) => b.addEventListener('click', () => { if (s.pts != null) return; s.method = b.dataset.v; s.fb = ''; render(); }));
    $$('.mtab', host).forEach((b) => b.addEventListener('click', () => { si = +b.dataset.m; render(); }));
    $$('.hex', host).forEach((g) => {
      const tog = () => { if (s.method === 'uni' || s.pts != null) return; const id = +g.dataset.c; if (s.sel.has(id)) s.sel.delete(id); else s.sel.add(id); render(); };
      g.addEventListener('click', tog); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } });
    });
    const sub = $('#bc-sub', host); if (sub) sub.addEventListener('click', submit);
  }
  function submit() {
    const sc = ms[si], s = S[si]; s.tries++;
    const missing = s.method === 'uni' ? [] : sc.affected.filter((c) => !s.sel.has(c));
    const extra = s.method === 'uni' ? 0 : [...s.sel].filter((c) => !sc.affected.includes(c)).length;
    const bestOK = s.method === sc.best;
    s.table = `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Method</th><th>Downlink cost per message</th></tr></thead><tbody>
      <tr><td>Unicast</td><td class="n">2 × ${sc.n} vehicles = ${costOf('uni', sc)}</td></tr>
      <tr><td>SC-PTM</td><td class="n">5 × ${sc.affected.length} cells = ${costOf('scptm', sc)}</td></tr>
      <tr><td>MBSFN</td><td class="n">3 × ${sc.affected.length} cells + 6 = ${costOf('mbsfn', sc)}</td></tr></tbody></table></div>
      <p class="small muted">Model: unicast needs about 2 RB-pairs per vehicle plus its own control and HARQ; SC-PTM about 5 per cell (robust MCS, no HARQ); MBSFN about 3 per cell thanks to the single-frequency-network gain (cells send in reserved subframes), plus a fixed overhead per area for the MCCH control channel and session setup.</p>`;
    const probs = [];
    if (missing.length) probs.push(`${missing.length} hazard cell${missing.length > 1 ? 's are' : ' is'} not covered, so vehicles there never get the warning.`);
    if (!bestOK) probs.push(`${methods.find((m) => m.id === s.method).t} works, but it is not the efficient choice here. Compare the costs in the table.`);
    if (!probs.length) {
      const cf = extra === 0 ? 1 : extra === 1 ? 0.85 : 0.6;
      s.pts = (s.tries === 1 ? 1 : 0.6) * cf;
      s.fb = `<span class="verdict">Warning delivered.</span><p>${T(sc.why)}</p>${extra ? `<p>You also lit up ${extra} cell${extra > 1 ? 's' : ''} outside the hazard area, which wastes capacity (score × ${cf}).</p>` : ''}`; s.cls = 'ok';
      if (S.every((x) => x.pts != null)) api.done(S.reduce((a, x) => a + x.pts, 0) / S.length);
    } else { s.fb = `<span class="verdict">Not the best plan yet.</span><ul>${probs.map((p) => `<li>${p}</li>`).join('')}</ul><p class="small">Change your plan and send again.</p>`; s.cls = 'no'; }
    render();
  }
  render();
};

/* ---------- handover highway ---------- */
function hoRun(hys, ttt, kmh) {
  const v = kmh / 3.6, dt = 0.01, off = 35, xB = 1000, x0 = 200, x1 = 960;
  const rng = mulberry32(7 + Math.round(kmh));
  // deterministic shadow fading (dB) per cell; 3GPP macro path loss 128.1 + 37.6 log10(d_km)
  const shA = (x) => 0.85 * (2.4 * Math.sin(2 * Math.PI * x / 83 + 1.3) + 1.4 * Math.sin(2 * Math.PI * x / 31 + 0.4) + 0.7 * Math.sin(2 * Math.PI * x / 12 + 2.2));
  const shB = (x) => 0.85 * (2.4 * Math.sin(2 * Math.PI * x / 77 + 4.1) + 1.4 * Math.sin(2 * Math.PI * x / 29 + 2.9) + 0.7 * Math.sin(2 * Math.PI * x / 13 + 5.0));
  const pl = (d) => 15.2 - (128.1 + 37.6 * Math.log10(Math.max(d, 20) / 1000));
  let t = 0, x = x0, serving = 'A', fA = null, fB = null, a3 = null, pending = null, lastHO = -99, hoCount = 0, ping = 0, low = null, fail = null, nextMeas = 0;
  const ev = [], trace = [], hoX = [];
  while (x < x1 && !fail) {
    const a0 = pl(Math.hypot(x, off)), b0 = pl(Math.hypot(x - xB, off));
    const rA = a0 + shA(x), rB = b0 + shB(x);
    if (t >= nextMeas - 1e-9) {
      const mA = rA + gauss(rng) * 1.3, mB = rB + gauss(rng) * 1.3;
      fA = fA == null ? mA : 0.5 * fA + 0.5 * mA; fB = fB == null ? mB : 0.5 * fB + 0.5 * mB;
      nextMeas += 0.04;
      const s = serving === 'A' ? fA : fB, n = serving === 'A' ? fB : fA;
      if (pending == null) {
        if (n - hys > s) {
          if (a3 == null) { a3 = t; ev.push(['', t, x, `A3 entering condition met (neighbour ${(n - s).toFixed(1)} dB stronger); time-to-trigger running`]); }
          if (t - a3 >= ttt / 1000 - 1e-9) { ev.push(['warn', t, x, 'Measurement report sent; eNB prepares the handover over X2']); pending = t + 0.05; a3 = null; }
        } else if (a3 != null) { ev.push(['', t, x, 'A3 condition dropped before time-to-trigger expired']); a3 = null; }
      }
    }
    const qA = a0 + 0.4 * shA(x), qB = b0 + 0.4 * shB(x); // link quality: interference partly averaged over the band
    const sv = serving === 'A' ? qA : qB, nb = serving === 'A' ? qB : qA;
    const sinr = sv - 10 * Math.log10(10 ** (nb / 10) + 10 ** (-118 / 10));
    if (pending != null && t >= pending) {
      if (sinr < -6.5) { fail = `Too late: the handover command could not be decoded (serving SINR ${sinr.toFixed(1)} dB). Radio link failure.`; ev.push(['bad', t, x, fail]); break; }
      const to = serving === 'A' ? 'B' : 'A'; hoCount++;
      if (hoCount > 1 && t - lastHO < 1) { ping++; ev.push(['bad', t, x, `Ping-pong: handed back to ${to} only ${(t - lastHO).toFixed(2)} s after the previous handover`]); }
      else ev.push(['ok', t, x, `Handover to cell ${to} completed (SINR at command ${sinr.toFixed(1)} dB)`]);
      serving = to; lastHO = t; pending = null; hoX.push([x, to]);
    }
    if (sinr < -8) { if (low == null) low = t; if (t - low >= 1) { fail = 'Radio link failure: serving SINR stayed below −8 dB for 1 s (T310 expired).'; ev.push(['bad', t, x, fail]); } } else low = null;
    if (Math.round(t / dt) % 3 === 0) trace.push([x, rA, rB, serving]);
    t += dt; x += v * dt;
  }
  if (!fail && serving !== 'B') { fail = 'The car reached the end of the road still attached to cell A.'; ev.push(['bad', t, x, fail]); }
  return { ev, trace, fail, ping, hoCount, hoX, v };
}
GAMES.handover = function (host, cfg, api) {
  const TTT = [0, 40, 80, 160, 320, 640, 1280];
  const ms = cfg.missions; let mi = 0; let hys = 1, ttt = 40; let res = null;
  const S = ms.map(() => ({ tries: 0, pts: null, fb: '', cls: '' }));
  function chart(r) {
    const W = 560, H = 230, gx = 44, gy = 10, gw = W - gx - 10, gh = H - gy - 34;
    const xs = (x) => gx + (x - 200) / 760 * gw, ys = (p) => gy + (-75 - p) / 45 * gh;
    let s = `<svg class="dg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Received power of cell A and cell B along the road">`;
    for (let p = -80; p >= -120; p -= 10) s += `<line class="stroke-line" x1="${gx}" x2="${gx + gw}" y1="${ys(p)}" y2="${ys(p)}"/><text class="t-mono t-mute" x="${gx - 4}" y="${ys(p) + 4}" text-anchor="end">${p}</text>`;
    for (let x = 200; x <= 960; x += 100) s += `<text class="t-mono t-mute" x="${xs(x)}" y="${gy + gh + 14}" text-anchor="middle">${x}</text>`;
    s += `<text class="t-sm t-mute" x="${gx + gw / 2}" y="${H - 2}" text-anchor="middle">distance from cell A (m) · cell B is at 1000 m</text>`;
    s += `<text class="t-sm t-mute" transform="translate(10 ${gy + gh / 2}) rotate(-90)" text-anchor="middle">RSRP (dBm)</text>`;
    if (r) {
      const pa = r.trace.map((p, i) => (i ? 'L' : 'M') + xs(p[0]).toFixed(1) + ',' + ys(clamp(p[1], -120, -75)).toFixed(1)).join('');
      const pb = r.trace.map((p, i) => (i ? 'L' : 'M') + xs(p[0]).toFixed(1) + ',' + ys(clamp(p[2], -120, -75)).toFixed(1)).join('');
      s += `<path class="ln dl" d="${pa}"/><path class="ln ul" d="${pb}"/>`;
      r.hoX.forEach((h, k) => { s += `<line class="stroke-ink" x1="${xs(h[0])}" x2="${xs(h[0])}" y1="${gy}" y2="${gy + gh}" stroke-dasharray="4 3"/><text class="t-sm halo" x="${xs(h[0]) + 3}" y="${gy + 12 + (k % 4) * 13}">→${h[1]}</text>`; });
      if (r.fail) { const last = r.ev[r.ev.length - 1]; s += `<circle class="fill-bad" cx="${xs(clamp(last[2], 200, 960))}" cy="${gy + gh - 8}" r="6"/>`; }
    }
    s += `<text class="t-sm" x="${gx + 6}" y="${gy + gh - 6}" style="fill:var(--d-dl)">cell A</text><text class="t-sm" x="${gx + gw - 6}" y="${gy + gh - 6}" text-anchor="end" style="fill:var(--d-ul)">cell B</text>`;
    return s + '</svg>';
  }
  function evaluate(h, t, speeds) {
    const out = speeds.map((k) => ({ k, r: hoRun(h, t, k) }));
    return { out, ok: out.every((o) => !o.r.fail && o.r.ping === 0) };
  }
  function render() {
    const m = ms[mi], s = S[mi]; const allDone = S.every((x) => x.pts != null);
    host.innerHTML = `${cfg.intro ? `<p class="g-intro">${T(cfg.intro)}</p>` : ''}
      <div class="mission-tabs" role="group" aria-label="Missions">${ms.map((x, k) => `<button type="button" class="mtab${S[k].pts ? ' passed' : ''}" data-m="${k}" aria-pressed="${k === mi}">Mission ${k + 1}</button>`).join('')}</div>
      <div class="sim"><div class="sim-ctrl">
        <div class="mission"><span class="eyebrow">Mission ${mi + 1}: ${esc(m.name)}</span><p>${T(m.story)}</p><p class="small"><b>Win:</b> one clean handover A → B (no ping-pong, no failure) at ${m.speeds.join(' and ')} km/h${m.speeds.length > 1 ? ', with the same settings' : ''}.</p></div>
        <div class="ctl"><label for="ho-h">Hysteresis: <span class="readout">${hys.toFixed(1)} dB</span></label><input type="range" id="ho-h" min="0" max="6" step="0.5" value="${hys}"></div>
        <div class="ctl"><label for="ho-t">Time-to-trigger: <span class="readout">${ttt} ms</span></label><input type="range" id="ho-t" min="0" max="${TTT.length - 1}" step="1" value="${TTT.indexOf(ttt)}"></div>
        <div class="g-actions"><button type="button" class="btn" id="ho-run" ${s.pts != null ? 'disabled' : ''}>Drive</button>${s.tries >= 3 && s.pts == null ? '<button type="button" class="btn ghost sm" id="ho-sol">Show a solution</button>' : ''}</div>
        <div class="g-feedback ${s.cls}" aria-live="polite">${s.fb}</div>
      </div><div class="sim-view">
        ${chart(res && res.out[res.out.length - 1].r)}
        <div class="key-row"><span><i class="key-line dl"></i>Cell A RSRP</span><span><i class="key-line ul"></i>Cell B RSRP</span><span><i class="key-line"></i>Handover executed</span></div>
        ${res ? res.out.map((o) => `<div><p class="small"><b>${o.k} km/h:</b> ${o.r.fail ? '<span class="pill no">failure</span>' : o.r.ping ? `<span class="pill no">${o.r.ping} ping-pong</span>` : '<span class="pill ok">clean handover</span>'}</p>
          <div class="evlog">${o.r.ev.map((e) => `<span class="${e[0] ? 'e-' + e[0] : ''}">t=${e[1].toFixed(2)} s · x=${Math.round(e[2])} m · ${esc(e[3])}</span>`).join('')}</div></div>`).join('') : '<p class="small muted">Set hysteresis and time-to-trigger, then press Drive. The chart shows the received power of both cells as the car moves; the log shows every RRC event.</p>'}
      </div></div>
      ${allDone ? doneBanner(S.reduce((a, x) => a + x.pts, 0) / S.length, T(cfg.finale)) : ''}`;
    $('#ho-h', host).addEventListener('input', (e) => { hys = +e.target.value; $('label[for=ho-h] .readout', host).textContent = hys.toFixed(1) + ' dB'; });
    $('#ho-t', host).addEventListener('input', (e) => { ttt = TTT[+e.target.value]; $('label[for=ho-t] .readout', host).textContent = ttt + ' ms'; });
    $$('.mtab', host).forEach((b) => b.addEventListener('click', () => { mi = +b.dataset.m; res = null; preset(); render(); }));
    const run = $('#ho-run', host); if (run) run.addEventListener('click', drive);
    const sol = $('#ho-sol', host); if (sol) sol.addEventListener('click', () => { hys = m.solution[0]; ttt = m.solution[1]; res = evaluate(hys, ttt, m.speeds); s.pts = 0; s.fb = `<span class="verdict">A working setting: ${hys} dB, ${ttt} ms</span><p>${T(m.debrief)}</p>`; s.cls = 'info'; if (S.every((x) => x.pts != null)) api.done(S.reduce((a, x) => a + x.pts, 0) / S.length); render(); });
  }
  function preset() { const m = ms[mi]; if (m.preset && S[mi].tries === 0) { hys = m.preset[0]; ttt = m.preset[1]; } }
  function drive() {
    const m = ms[mi], s = S[mi]; res = evaluate(hys, ttt, m.speeds); s.tries++;
    if (res.ok) {
      s.pts = s.tries === 1 ? 1 : s.tries === 2 ? 0.75 : 0.5;
      s.fb = `<span class="verdict">Clean handover.</span><p>${T(m.debrief)}</p>`; s.cls = 'ok';
      if (S.every((x) => x.pts != null)) api.done(S.reduce((a, x) => a + x.pts, 0) / S.length);
    } else {
      const anyPing = res.out.some((o) => o.r.ping), anyFail = res.out.some((o) => o.r.fail);
      s.fb = `<span class="verdict">Not clean yet (attempt ${s.tries}).</span><p>${anyPing ? 'Ping-pong means the trigger is too eager: shadow fading makes the two cells swap places for a moment. Raise hysteresis or time-to-trigger. ' : ''}${anyFail ? 'A failure means the trigger is too slow: by the time the command is sent, the serving cell is already too weak to deliver it. Lower hysteresis or time-to-trigger, especially at high speed.' : ''}</p>`;
      s.cls = 'no';
    }
    render();
  }
  preset();
  render();
};

/* ---------- Doppler calculator ---------- */
MOUNTS.doppler = function (el) {
  const F = [{ id: '0.7', t: '700 MHz' }, { id: '2', t: '2 GHz' }, { id: '3.5', t: '3.5 GHz' }, { id: '5.9', t: '5.9 GHz' }, { id: '28', t: '28 GHz' }];
  let f = '2', v = 250;
  function draw() {
    const fd = (v / 3.6) * (+f * 1e9) / 3e8; const scs = +f >= 24 ? 120 : +f >= 3 ? 30 : 15;
    const tc = fd > 0 ? 0.423 / fd * 1000 : Infinity;
    el.innerHTML = `<div class="ctl"><label for="dp-v">Vehicle speed: <span class="readout">${v} km/h</span></label><input type="range" id="dp-v" min="0" max="500" step="10" value="${v}"></div>
      <div class="ctl"><span class="lbl">Carrier frequency</span>${segButtons('f', F, f)}</div>
      <div class="formula">f<sub>D</sub> = v · f<sub>c</sub> / c = ${round(v / 3.6, 1)} m/s × ${f} GHz / 3×10⁸ m/s = <b>${Math.round(fd).toLocaleString()} Hz</b></div>
      <p class="readout">That is ${round(100 * fd / (scs * 1000), 2)}% of a ${scs} kHz subcarrier spacing. Coherence time ≈ 0.423 / f<sub>D</sub> = ${Number.isFinite(tc) ? round(tc, 2) + ' ms' : '∞'}: the channel must be re-estimated faster than that.</p>`;
    $('#dp-v', el).addEventListener('input', (e) => { v = +e.target.value; draw(); $('#dp-v', el).focus(); });
    $$('.segbtn', el).forEach((b) => b.addEventListener('click', () => { f = b.dataset.v; draw(); }));
  }
  draw();
};

/* ---------- NR numerology explorer ---------- */
MOUNTS.numerology = function (el) {
  const BWMAX = ['50 MHz (270 RBs), FR1', '100 MHz (273 RBs), FR1', '100 MHz in FR1 (135 RBs) or 200 MHz in FR2 (264 RBs)', '400 MHz (264 RBs), FR2', 'SSB only (not for data in Rel-15/16)'];
  let mu = 1;
  function draw() {
    const scs = 15 * 2 ** mu, sym = 1000 / scs, cp = 4.69 / 2 ** mu, slot = 1 / 2 ** mu, n = 2 ** mu;
    const W = 520, gx = 10, gw = 500, y = 26;
    let s = `<svg class="dg" viewBox="0 0 ${W} 92" role="img" aria-label="One millisecond subframe split into ${n} slots">`;
    s += `<text class="t-sm t-mute" x="${gx}" y="14">1 ms subframe = ${n} slot${n > 1 ? 's' : ''} × 14 OFDM symbols</text>`;
    for (let k = 0; k < n; k++) {
      const x = gx + k * gw / n, w = gw / n;
      s += `<rect class="box ran" x="${x + 1}" y="${y}" width="${w - 2}" height="34" rx="3"/>`;
      if (n <= 8) for (let j = 1; j < 14; j++) s += `<line class="stroke-mute" x1="${x + j * w / 14}" x2="${x + j * w / 14}" y1="${y + 4}" y2="${y + 30}" stroke-width=".7"/>`;
      if (n <= 4) s += `<text class="t-sm" x="${x + w / 2}" y="${y + 52}" text-anchor="middle">slot ${k} · ${slot} ms</text>`;
    }
    if (n > 4) s += `<text class="t-sm" x="${gx + gw / 2}" y="${y + 52}" text-anchor="middle">${n} slots of ${slot * 1000} µs each</text>`;
    s += '</svg>';
    el.innerHTML = `<div class="ctl"><label for="nu">Numerology μ = <span class="readout">${mu}</span></label><input type="range" id="nu" min="0" max="4" step="1" value="${mu}"></div>${s}
      <div class="tbl-wrap"><table class="tbl"><tbody>
        <tr><td>Subcarrier spacing 15·2<sup>μ</sup></td><td class="n">${scs} kHz</td></tr>
        <tr><td>Useful symbol length 1/Δf</td><td class="n">${round(sym, 2)} µs</td></tr>
        <tr><td>Normal cyclic prefix (approx.)</td><td class="n">${round(cp, 2)} µs</td></tr>
        <tr><td>Slot length (14 symbols)</td><td class="n">${slot * 1000} µs</td></tr>
        <tr><td>Slots per 10 ms frame</td><td class="n">${10 * n}</td></tr>
        <tr><td>Widest carrier</td><td>${BWMAX[mu]}</td></tr></tbody></table></div>`;
    $('#nu', el).addEventListener('input', (e) => { mu = +e.target.value; draw(); $('#nu', el).focus(); });
  }
  draw();
};
