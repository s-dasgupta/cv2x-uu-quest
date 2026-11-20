/* ============================================================
   Content: Exits 5–8
   ============================================================ */

/* Subframe timeline: two lanes (downlink above, uplink below) */
function tlSVG(n, marks, opt = {}) {
  const cw = opt.cw || 30, gx = 54, W = gx + n * cw + 10, H = 112;
  const yD = 22, yU = 66, h = 26;
  let s = `<svg class="dg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.aria || 'Subframe timeline')}">`;
  s += `<text class="t-sm t-mute" x="4" y="${yD + 17}">DL</text><text class="t-sm t-mute" x="4" y="${yU + 17}">UL</text>`;
  for (let i = 0; i < n; i++) {
    s += `<rect class="box core" x="${gx + i * cw + 1}" y="${yD}" width="${cw - 2}" height="${h}" rx="3"/><rect class="box core" x="${gx + i * cw + 1}" y="${yU}" width="${cw - 2}" height="${h}" rx="3"/>`;
    s += `<text class="t-mono t-mute" x="${gx + i * cw + cw / 2}" y="${H - 6}" text-anchor="middle">${i}</text>`;
  }
  marks.forEach((m) => {
    const y = m.lane === 'dl' ? yD : yU;
    s += `<rect class="fill-${m.lane}" x="${gx + m.sf * cw + 1}" y="${y}" width="${cw - 2}" height="${h}" rx="3"/>`;
    s += `<text style="fill:var(--surface);font-size:${m.t.length > 4 ? 8.5 : 10}px;font-weight:700" x="${gx + m.sf * cw + cw / 2}" y="${y + 17}" text-anchor="middle">${esc(m.t)}</text>`;
  });
  (opt.arrows || []).forEach((a) => {
    const x1 = gx + a[0] * cw + cw / 2, x2 = gx + a[1] * cw + cw / 2; const up = a[2] === 'up';
    const y1 = up ? yU : yD + h, y2 = up ? yD + h : yU;
    s += `<line class="ln thin dash" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2 + (up ? 6 : -6)}"/>` + arrowHead(x2, y2, up ? 'u' : 'd', '');
  });
  return s + `<text class="t-sm t-mute" x="${gx}" y="${H - 18}"> </text></svg>`;
}

const CHMAP_DL = layeredSVG({
  w: 760, rowGap: 80, aria: 'Downlink mapping of logical to transport to physical channels',
  rows: [
    { label: 'Logical', items: [{ id: 'bcch', t: 'BCCH', x: 150 }, { id: 'pcch', t: 'PCCH', x: 250 }, { id: 'ccch', t: 'CCCH', x: 340 }, { id: 'dcch', t: 'DCCH', x: 430 }, { id: 'dtch', t: 'DTCH', x: 520 }, { id: 'mcch', t: 'MCCH', x: 620, kind: 'mbms' }, { id: 'mtch', t: 'MTCH', x: 705, kind: 'mbms' }] },
    { label: 'Transport', items: [{ id: 'bch', t: 'BCH', x: 130 }, { id: 'pch', t: 'PCH', x: 250 }, { id: 'dlsch', t: 'DL-SCH', x: 430 }, { id: 'mch', t: 'MCH', x: 660, kind: 'mbms' }] },
    { label: 'Physical', items: [{ id: 'pbch', t: 'PBCH', x: 130, kind: 'ran' }, { id: 'pdsch', t: 'PDSCH', x: 340, kind: 'ran' }, { id: 'pdcch', t: 'PDCCH (DCI only)', x: 525, kind: 'ue' }, { id: 'pmch', t: 'PMCH', x: 680, kind: 'ran' }] },
  ],
  links: [['bcch', 'bch'], ['bcch', 'dlsch'], ['pcch', 'pch'], ['ccch', 'dlsch'], ['dcch', 'dlsch'], ['dtch', 'dlsch'], ['mcch', 'mch'], ['mtch', 'mch'], ['bch', 'pbch'], ['pch', 'pdsch'], ['dlsch', 'pdsch'], ['mch', 'pmch']].map(([a, b]) => ({ a, b })),
});
const CHMAP_UL = layeredSVG({
  w: 560, rowGap: 80, aria: 'Uplink mapping of logical to transport to physical channels',
  rows: [
    { label: 'Logical', items: [{ id: 'ccch', t: 'CCCH', x: 150 }, { id: 'dcch', t: 'DCCH', x: 240 }, { id: 'dtch', t: 'DTCH', x: 330 }] },
    { label: 'Transport', items: [{ id: 'ulsch', t: 'UL-SCH', x: 240 }, { id: 'rach', t: 'RACH', x: 420 }] },
    { label: 'Physical', items: [{ id: 'pusch', t: 'PUSCH', x: 240, kind: 'ran' }, { id: 'prach', t: 'PRACH', x: 420, kind: 'ran' }, { id: 'pucch', t: 'PUCCH (UCI only)', x: 120, kind: 'ue' }] },
  ],
  links: [['ccch', 'ulsch'], ['dcch', 'ulsch'], ['dtch', 'ulsch'], ['ulsch', 'pusch'], ['rach', 'prach']].map(([a, b]) => ({ a, b })),
});

const MBMS_DIAGRAM = {
  w: 760, h: 300, aria: 'MBMS architecture for V2X broadcast',
  nodes: [
    { id: 'as', label: 'V2X AS', x: 650, y: 46, w: 110, kind: 'v2x' },
    { id: 'bmsc', label: 'BM-SC', x: 650, y: 150, w: 100, kind: 'mbms' },
    { id: 'gw', label: 'MBMS-GW', x: 430, y: 150, w: 110, kind: 'mbms' },
    { id: 'mme', label: 'MME', x: 300, y: 46 },
    { id: 'mce', label: 'MCE', x: 90, y: 150, kind: 'mbms' },
    { id: 'e1', label: 'eNB', x: 150, y: 262, kind: 'ran' },
    { id: 'e2', label: 'eNB', x: 350, y: 262, kind: 'ran' },
    { id: 'e3', label: 'eNB', x: 550, y: 262, kind: 'ran' },
  ],
  links: [
    { a: 'as', b: 'bmsc', label: 'MB2' },
    { a: 'bmsc', b: 'gw', label: 'SGmb/SGi-mb' },
    { a: 'mme', b: 'gw', label: 'Sm', kind: 'cp' },
    { a: 'mce', b: 'mme', label: 'M3', kind: 'cp' },
    { a: 'mce', b: 'e1', label: 'M2', kind: 'cp' }, { a: 'mce', b: 'e2', kind: 'cp' }, { a: 'mce', b: 'e3', kind: 'cp' },
    { a: 'gw', b: 'e1', kind: 'up' }, { a: 'gw', b: 'e2', label: 'M1', kind: 'up', bx: 395, by: 205 }, { a: 'gw', b: 'e3', kind: 'up' },
  ],
};

defineExit({
  id: 5, num: '5', title: 'Join the Network', subtitle: 'Cell search, random access, attach and V2X provisioning', mins: 20,
  topics: ['PSS · SSS · PCI', 'MIB · SIB1 · SIB2', '4-step RACH', 'Attach · AKA', 'V3 provisioning'],
  cards: [
    {
      title: 'Find a cell',
      body: `<p class="lead">A car that powers up knows nothing about the cells around it. It learns everything from signals the eNB broadcasts.</p>
        <ol><li><b>[[PSS]]</b>: the car scans for this known pattern. Finding it gives the 5 ms timing and N<sub>ID</sub><sup>(2)</sup> ∈ {0, 1, 2}.</li>
        <li><b>[[SSS]]</b>: gives the 10 ms frame boundary and N<sub>ID</sub><sup>(1)</sup> ∈ {0 … 167}. Now the car knows the [[PCI]]: <code>PCI = 3·N_ID(1) + N_ID(2)</code>, one of 504 values. The PCI tells it where the [[CRS]] are.</li>
        <li><b>[[PBCH]] → [[MIB]]</b>: downlink bandwidth, PHICH configuration and the frame number.</li>
        <li><b>[[SIB]]1</b> on the PDSCH: which operator ([[PLMN]]), tracking area, whether the cell is barred, and when the other SIBs are sent.</li>
        <li><b>SIB2</b>: random access settings, common channel setup, uplink frequency and bandwidth.</li></ol>
        <p>V2X-related SIBs follow: [[SIB21]] for the V2X sidelink; SIB13, SIB15 and SIB20 for MBMS and SC-PTM broadcast (Exit 8).</p>`,
      fig: `<div class="scroll-x">${seqSVG([{ id: 'ue', name: 'Car (UE)', kind: 'ue' }, { id: 'enb', name: 'eNB', kind: 'ran' }], [
        { from: 'enb', to: 'ue', label: 'PSS (5 ms timing, N_ID2)', kind: 'dl' }, { from: 'enb', to: 'ue', label: 'SSS (frame timing, N_ID1)', kind: 'dl' },
        { from: 'ue', to: 'ue', label: 'PCI = 3·N_ID1 + N_ID2', kind: 'dl' }, { from: 'enb', to: 'ue', label: 'PBCH: MIB (every 40 ms)', kind: 'dl' },
        { from: 'enb', to: 'ue', label: 'PDSCH: SIB1 (every 80 ms)', kind: 'dl' }, { from: 'enb', to: 'ue', label: 'PDSCH: SIB2, …, SIB21', kind: 'dl' }], { colW: 230, aria: 'Cell search sequence' })}</div>`,
      takeaway: 'PSS → SSS → PCI → MIB → SIB1 → SIB2. All broadcast, so the car can read them before talking.',
      detail: `<p>Worked example: if the SSS gives N<sub>ID</sub><sup>(1)</sup> = 100 and the PSS gives N<sub>ID</sub><sup>(2)</sup> = 2, then PCI = 3 × 100 + 2 = 302. Neighbouring cells need different PCIs (and ideally different PCI mod 3 and mod 6) so their reference signals do not collide.</p>
        <p>The MIB is 24 bits sent with a 40 ms TTI (repeated four times). SIB1 has a fixed schedule: subframe 5 of every even frame, new content every 80 ms. Other SIBs are grouped into SI messages with windows announced in SIB1. NR does the same with the [[SSB]], which carries PSS, SSS and PBCH together and supports 1008 PCIs.</p>`,
      specs: ['TS 36.211 §6.11', 'TS 36.331 §5.2', 'TS 36.304'],
    },
    {
      title: 'Knock on the door: random access',
      body: `<p class="lead">To send anything, the car needs uplink timing and a grant. It gets both with a four-step handshake.</p>
        <ol><li><b>Msg1, preamble</b>: the car picks one of 64 preambles and sends it on the [[PRACH]]. No identity yet, just "someone is here".</li>
        <li><b>Msg2, [[RAR|random access response]]</b>: the eNB measured when the preamble arrived and replies with a [[TA|timing advance]], an uplink grant and a temporary [[C-RNTI]].</li>
        <li><b>Msg3</b>: using that grant, the car sends RRCConnectionRequest with an identity (S-TMSI or a random number) and a cause.</li>
        <li><b>Msg4, contention resolution</b>: the eNB echoes the identity and sends RRCConnectionSetup. If two cars chose the same preamble, only the one whose identity is echoed continues; the other starts again.</li></ol>
        <p>The car answers with RRCConnectionSetupComplete, which already carries its first [[NAS]] message.</p>`,
      fig: `<div class="scroll-x">${seqSVG([{ id: 'ue', name: 'Car (UE)', kind: 'ue' }, { id: 'enb', name: 'eNB', kind: 'ran' }], [
        { from: 'ue', to: 'enb', label: 'Msg1: preamble on PRACH', kind: 'ul' }, { from: 'enb', to: 'ue', label: 'Msg2: RAR (TA, grant, T-C-RNTI)', kind: 'dl' },
        { from: 'ue', to: 'enb', label: 'Msg3: RRCConnectionRequest', kind: 'ul' }, { from: 'enb', to: 'ue', label: 'Msg4: contention resolution + Setup', kind: 'dl' },
        { from: 'ue', to: 'enb', label: 'RRCConnectionSetupComplete (+NAS)', kind: 'ul' }], { colW: 230, aria: 'Random access sequence' })}</div>`,
      takeaway: 'Preamble → RAR → Request → Contention resolution. Timing advance first, identity second.',
      detail: `<p>The RAR is found on the PDSCH using an RA-RNTI computed from the time and frequency of the PRACH occasion. The timing advance in the RAR is 11 bits in units of 16 Ts (≈ 0.52 µs), up to about 0.67 ms, which covers cells of roughly 100 km radius; each step of round-trip time corresponds to about 78 m of distance.</p>
        <p>During handover the target cell gives a dedicated preamble, so random access is contention-free and only two steps (Msg1, Msg2) are needed. NR adds a 2-step RACH (Rel-16) that merges Msg1+Msg3 and Msg2+Msg4.</p>`,
      specs: ['TS 36.321 §5.1', 'TS 36.213 §6', 'TS 36.331 §5.3.3'],
    },
    {
      title: 'Prove who you are: attach and security',
      wide: true,
      body: `<p class="lead">Inside RRCConnectionSetupComplete rides a NAS <b>Attach Request</b>. The MME now runs the attach:</p>
        <ol><li><b>Authentication</b> ([[AKA]]): the MME gets a vector from the [[HSS]] and sends RAND and [[AUTN]]. The USIM checks the network is genuine and answers RES. Both sides now share [[K_ASME]].</li>
        <li><b>NAS security mode</b>: NAS ciphering and integrity switch on.</li>
        <li><b>Update location</b>: the HSS returns the subscription, including the V2X part (is PC5 allowed as a vehicle or pedestrian UE, and at what aggregate bit rate).</li>
        <li><b>Create session</b>: the S-GW and P-GW create the default bearer and the P-GW allocates an IP address.</li>
        <li><b>Initial context setup</b>: the MME sends the eNB the key [[K_eNB]], the bearer, and for V2X the "V2X services authorised" flag and the UE PC5 [[AMBR]].</li>
        <li><b>AS security mode</b> and <b>RRCConnectionReconfiguration</b>: radio security on, the data radio bearer set up, Attach Accept delivered. The car answers Attach Complete.</li></ol>`,
      fig: `<div class="scroll-x">${seqSVG([{ id: 'ue', name: 'Car (UE)', kind: 'ue' }, { id: 'enb', name: 'eNB', kind: 'ran' }, { id: 'mme', name: 'MME' }, { id: 'hss', name: 'HSS' }, { id: 'gw', name: 'S-GW / P-GW' }], [
        { from: 'ue', to: 'mme', label: 'Attach Request (NAS)', kind: 'cp' }, { from: 'mme', to: 'hss', label: 'Auth. info request', kind: 'cp' },
        { from: 'mme', to: 'ue', label: 'Auth. Request / Response', kind: 'cp' }, { from: 'mme', to: 'ue', label: 'NAS Security Mode', kind: 'cp' },
        { from: 'mme', to: 'hss', label: 'Update Location (V2X sub.)', kind: 'cp' }, { from: 'mme', to: 'gw', label: 'Create Session (IP)', kind: 'cp' },
        { from: 'mme', to: 'enb', label: 'Initial Context Setup', kind: 'cp' }, { from: 'enb', to: 'ue', label: 'AS Security Mode', kind: 'cp' },
        { from: 'enb', to: 'ue', label: 'RRC Reconfig. (Attach Accept)', kind: 'cp' }, { from: 'ue', to: 'mme', label: 'Attach Complete', kind: 'cp' }], { colW: 150, aria: 'LTE attach sequence' })}</div>`,
      takeaway: 'Attach = authenticate → secure NAS → fetch subscription → create bearer and IP → secure radio → done.',
      detail: `<p>The eNB learns about V2X authorisation only from the MME. If the "V2X services authorised" information is missing, the eNB will not give the car sidelink resources in Mode 3 (Exit 11). The MME took that information from the subscription it received from the HSS.</p>
        <p>In 5G the same story is called <b>registration</b> (with the AMF) followed by <b>PDU session establishment</b> (with the SMF), and authentication is 5G-AKA or EAP-AKA′.</p>`,
      specs: ['TS 23.401 §5.3.2', 'TS 23.285 §5.4', 'TS 36.413'],
    },
    {
      title: 'Get your V2X papers',
      body: `<p class="lead">Being attached is not enough. The car also needs V2X-specific parameters, and Rel-14 offers three ways to get them:</p>
        <ul><li><b>Pre-configured</b> in the vehicle or the USIM at manufacture.</li>
        <li><b>From the [[V2X CF]] over V3.</b> The car finds the V2X Control Function's address (pre-configured or by DNS, from the operator's identity) and downloads its parameters over the IP connection it just got.</li>
        <li><b>From broadcast</b>: SIB21 carries sidelink radio settings; MBMS service announcements can carry the address of a local V2X AS.</li></ul>
        <p>The parameters include: in which [[PLMN]]s the car may use PC5; radio settings for use out of coverage; for Uu, the address of the [[V2X AS]] (often per geographic area) and the MBMS details for receiving broadcasts; and how each V2X service maps to identifiers and priority ([[PPPP]]).</p>
        <p>Only now does the first V2X message travel over V1 to the V2X AS.</p>`,
      takeaway: 'Attach gives an IP address. V3 provisioning gives the V2X rules, including where the V2X AS is.',
      detail: `<p>The V3 protocol is defined in TS 24.386; the parameters it delivers are specified in TS 24.385 as a management object. In 5G (TS 23.287) the PCF delivers a V2X policy to the UE inside a NAS UE policy container through the AMF; the V2X-over-Uu part tells the UE which PDU session parameters (DNN, slice) to use for each V2X service and where the V2X AS is.</p>`,
      specs: ['TS 23.285 §4.4', 'TS 24.386', 'TS 24.385', 'TS 23.287 §5.1'],
    },
  ],
  challenges: [
    {
      type: 'sequence', title: 'Wake up and connect', colW: 236,
      lanes: [{ id: 'ue', name: 'Car (UE)', kind: 'ue' }, { id: 'enb', name: 'eNB', kind: 'ran' }],
      intro: 'The car has just been switched on. Put the steps in order from the first signal it searches for to the moment it sends its first NAS message.',
      steps: [
        { text: 'Detect the PSS: 5 ms timing and N_ID(2)', short: 'PSS', from: 'enb', to: 'ue', kind: 'dl', why: 'The only thing a UE can search for without knowing anything else.', early: 'Before decoding anything the car needs timing, and timing comes from the synchronisation signals.' },
        { text: 'Detect the SSS: frame timing and N_ID(1), so the PCI is known', short: 'SSS → PCI', from: 'enb', to: 'ue', kind: 'dl', why: 'PSS + SSS give the PCI, which unlocks the reference signals.' },
        { text: 'Decode the MIB on the PBCH', short: 'PBCH: MIB', from: 'enb', to: 'ue', kind: 'dl', why: 'Bandwidth and frame number: needed to find and decode the PDSCH.', early: 'The MIB can only be decoded once the PCI and timing are known.' },
        { text: 'Read SIB1: operator, tracking area, cell access, SIB schedule', short: 'SIB1', from: 'enb', to: 'ue', kind: 'dl', why: 'Tells the car whether it may use the cell and when the other SIBs come.', early: 'SIB1 is on the PDSCH, so the car first needs the bandwidth from the MIB.' },
        { text: 'Read SIB2: random access and common radio configuration', short: 'SIB2', from: 'enb', to: 'ue', kind: 'dl', why: 'Without the PRACH configuration the car cannot send a preamble.', early: 'SIB1 tells the car when SIB2 is sent.' },
        { text: 'Msg1: send a random access preamble on the PRACH', short: 'Msg1: preamble', from: 'ue', to: 'enb', kind: 'ul', why: 'The first uplink transmission. No grant needed.', early: 'The car needs the PRACH configuration from SIB2 first.' },
        { text: 'Msg2: random access response with timing advance, grant and temporary C-RNTI', short: 'Msg2: RAR', from: 'enb', to: 'ue', kind: 'dl', why: 'Gives uplink timing and the first grant.', early: 'The eNB can only answer a preamble it has received.' },
        { text: 'Msg3: RRCConnectionRequest with the car’s identity', short: 'Msg3: RRC Conn. Request', from: 'ue', to: 'enb', kind: 'ul', why: 'Sent on the grant from Msg2.', early: 'Msg3 needs the grant that arrives in the RAR.' },
        { text: 'Msg4: contention resolution and RRCConnectionSetup', short: 'Msg4: Setup', from: 'enb', to: 'ue', kind: 'dl', why: 'Resolves collisions and configures the signalling bearer SRB1.', early: 'The eNB echoes the identity it received in Msg3.' },
        { text: 'RRCConnectionSetupComplete carrying the NAS Attach Request', short: 'Setup Complete + Attach Req.', from: 'ue', to: 'enb', kind: 'ul', why: 'The RRC connection is up and the NAS conversation with the MME begins.', early: 'It completes the setup, so the setup must come first.' },
      ],
    },
    {
      type: 'sequence', title: 'Attach and get V2X papers', colW: 124,
      lanes: [{ id: 'ue', name: 'Car (UE)', kind: 'ue' }, { id: 'enb', name: 'eNB', kind: 'ran' }, { id: 'mme', name: 'MME' }, { id: 'hss', name: 'HSS' }, { id: 'gw', name: 'S-/P-GW' }, { id: 'cf', name: 'V2X CF', kind: 'v2x' }],
      intro: 'The RRC connection is up and the Attach Request is on its way. Order the rest of the procedure, ending with V2X provisioning.',
      steps: [
        { text: 'Attach Request reaches the MME', short: 'Attach Request', from: 'ue', to: 'mme', kind: 'cp', why: 'The eNB forwards the NAS message over S1-MME.' },
        { text: 'MME fetches an authentication vector from the HSS', short: 'Auth. info', from: 'mme', to: 'hss', kind: 'cp', why: 'RAND, AUTN, XRES and K_ASME for this attach.', early: 'Authentication comes first, and the MME needs a vector before it can challenge the car.' },
        { text: 'NAS Authentication Request and Response (RAND, AUTN / RES)', short: 'AKA', from: 'mme', to: 'ue', kind: 'cp', why: 'Mutual authentication; both sides derive K_ASME.', early: 'The MME can only challenge the car once it has the vector.' },
        { text: 'NAS Security Mode Command: NAS ciphering and integrity on', short: 'NAS SMC', from: 'mme', to: 'ue', kind: 'cp', why: 'Uses keys derived from K_ASME.', early: 'Security keys only exist after authentication.' },
        { text: 'Update Location: HSS returns the subscription, including V2X authorisation', short: 'Update Location', from: 'mme', to: 'hss', kind: 'cp', why: 'The MME now knows what the car may do, including V2X.', early: 'The subscription is fetched after the car has been authenticated and secured.' },
        { text: 'Create Session: default bearer created, P-GW allocates the IP address', short: 'Create Session', from: 'mme', to: 'gw', kind: 'cp', why: 'The user-plane path through the core now exists.', early: 'The MME needs the subscription (APN, QoS) before creating the session.' },
        { text: 'Initial Context Setup to the eNB: K_eNB, bearer, "V2X services authorised", PC5 AMBR', short: 'Initial Context Setup', from: 'mme', to: 'enb', kind: 'cp', why: 'The eNB gets everything it needs to serve this car, including its V2X rights.', early: 'The eNB context needs the bearer that Create Session just built.' },
        { text: 'AS Security Mode Command: RRC and user-plane security on', short: 'AS SMC', from: 'enb', to: 'ue', kind: 'cp', why: 'Keys derived from K_eNB.', early: 'The eNB needs K_eNB from the context setup.' },
        { text: 'RRCConnectionReconfiguration: data bearer set up, Attach Accept delivered', short: 'RRC Reconfig.', from: 'enb', to: 'ue', kind: 'cp', why: 'Now the car can send user data.', early: 'Radio bearers are configured only after radio security is active.' },
        { text: 'Attach Complete', short: 'Attach Complete', from: 'ue', to: 'mme', kind: 'cp', why: 'The car confirms; it is now registered with an IP address.', early: 'The car completes the attach after it receives Attach Accept.' },
        { text: 'Car contacts the V2X Control Function over V3 and downloads its V2X parameters', short: 'V3 provisioning', from: 'ue', to: 'cf', kind: 'lg', why: 'V3 rides the IP connection the attach just created. Now the car knows its PC5 rules and where the V2X AS is.', early: 'V3 runs over IP, so the car needs a working IP connection first.' },
      ],
    },
    {
      type: 'calc', title: 'Cell search arithmetic',
      items: [
        { q: 'The SSS gives N_ID(1) = 57 and the PSS gives N_ID(2) = 1. What is the PCI?', answer: 172, tol: 0, solution: 'PCI = 3 × 57 + 1 = 172.', hint: 'PCI = 3·N_ID(1) + N_ID(2).' },
        { q: 'How many distinct PCIs does LTE have?', answer: 504, tol: 0, solution: '168 SSS groups × 3 PSS identities = 504.', hint: 'N_ID(1) has 168 values and N_ID(2) has 3.' },
        { q: 'How many PCIs does 5G NR have?', answer: 1008, tol: 0, solution: '336 × 3 = 1008. NR doubled the SSS groups.', hint: 'NR keeps 3 PSS identities but has 336 SSS groups.' },
        { q: 'One timing-advance step is 16 Ts ≈ 0.52 µs of round-trip time. How many metres of extra distance does one step represent? (Use 3×10⁸ m/s, round to the nearest metre.)', answer: 78, tol: 2, unit: 'm', solution: 'Round trip 0.52 µs × 3×10⁸ m/s = 156 m, so one way ≈ 78 m.', hint: 'Remember the timing advance covers the round trip: halve the distance.' },
      ],
    },
  ],
  quiz: [
    { q: 'What does the PSS give the UE?', options: ['5 ms timing and N_ID(2)', 'The frame number', 'The downlink bandwidth', 'Its IP address'], answer: 0, why: 'PSS: slot/5 ms timing and one of three identities. The frame number and bandwidth come from the MIB.' },
    { q: 'Why does random access need Msg4 (contention resolution)?', options: ['Two UEs may have picked the same preamble', 'To deliver the IP address', 'To authenticate the subscriber', 'To measure the timing advance'], answer: 0, why: 'Preambles are chosen at random; Msg4 echoes one UE’s identity so the colliding UE knows to retry.' },
    { q: 'How does the eNB learn that this car is allowed to use V2X sidelink?', options: ['From the MME in the Initial Context Setup, based on the HSS subscription', 'From the car’s preamble choice', 'From SIB21', 'It assumes every car is allowed'], answer: 0, why: 'The HSS subscription reaches the MME at Update Location; the MME passes "V2X services authorised" to the eNB.' },
    { q: 'Which of these is NOT a way for the car to learn the V2X AS address?', options: ['Reading it from the PSS', 'Pre-configuration', 'V3 provisioning from the V2X Control Function', 'MBMS service announcements'], answer: 0, why: 'The PSS is a fixed synchronisation sequence and carries no data.' },
    { q: 'Which message carries the car’s first NAS message to the network?', options: ['RRCConnectionSetupComplete', 'Msg1 preamble', 'MIB', 'RRCConnectionReconfiguration'], answer: 0, why: 'NAS rides piggyback in RRCConnectionSetupComplete; the eNB forwards it to the MME in an Initial UE Message.' },
  ],
  recap: `<ul><li>Cell search from PSS to SIB2, and how the PCI is formed.</li><li>The four random access messages and why contention resolution exists.</li><li>The attach steps, where the V2X authorisation comes from, and how it reaches the eNB.</li><li>The three ways a car receives its V2X parameters.</li></ul>`,
});

defineExit({
  id: 6, num: '6', title: 'Pipes & Channels', subtitle: 'Channels, bearers and QoS for V2X', mins: 16,
  topics: ['Logical · transport · physical', 'DCI formats', 'EPS bearers · TFT', 'QCI 3 / 75 / 79', '5QI 83–86'],
  cards: [
    {
      title: 'Three kinds of channel',
      body: `<p class="lead">LTE describes the same data three times, at three layers.</p>
        <ul><li><b>Logical channels</b> say <i>what</i> is carried: broadcast control (BCCH), paging (PCCH), signalling (CCCH, [[DCCH]]), user traffic ([[DTCH]]), broadcast service control and data ([[MCCH]], [[MTCH]]). They sit between RLC and MAC.</li>
        <li><b>Transport channels</b> say <i>how</i>: with what format and error protection, between MAC and PHY. For example BCH, PCH, [[DL-SCH]], [[MCH]], [[UL-SCH]], [[RACH]].</li>
        <li><b>Physical channels</b> say <i>where</i>: which resource elements on the air. PBCH, PDSCH, PMCH, PUSCH, PRACH, plus control-only channels.</li></ul>
        <p class="analogy">Like a parcel service: the logical channel is what is in the box, the transport channel is the shipping class, the physical channel is the actual truck and lane.</p>`,
      takeaway: 'Logical = what, transport = how, physical = where.',
      specs: ['TS 36.300 §5.3, §6.1'],
    },
    {
      title: 'Downlink and uplink mapping',
      wide: true,
      body: `<p>Most traffic funnels into one shared channel in each direction: DL-SCH on the PDSCH and UL-SCH on the PUSCH. The exceptions are the MIB (BCH on PBCH), MBSFN broadcast (MCH on PMCH) and random access (RACH on PRACH). SC-PTM broadcast (SC-MCCH, SC-MTCH, Exit 8) also uses DL-SCH on the PDSCH.</p>
        <p>Some physical channels carry no transport channel at all, only control information: the [[PDCCH]] carries [[DCI]], the [[PCFICH]] and [[PHICH]] carry control format and HARQ feedback, and the [[PUCCH]] carries uplink control (ACK/NACK, scheduling requests, CQI).</p>`,
      fig: `<div class="scroll-x">${CHMAP_DL}</div><div class="scroll-x">${CHMAP_UL}</div>`,
      cap: 'Top: downlink mapping. Bottom: uplink mapping.',
      takeaway: 'Nearly everything rides DL-SCH/PDSCH and UL-SCH/PUSCH. Grants ride the PDCCH as DCI.',
      detail: `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>DCI format</th><th>Purpose</th></tr></thead><tbody>
        <tr><td>0</td><td>Uplink grant for PUSCH (also activates uplink SPS)</td></tr>
        <tr><td>1, 1A, 1B, 1C, 1D</td><td>Downlink assignments of various sizes (1C for SIBs, paging, RAR)</td></tr>
        <tr><td>2, 2A–2D</td><td>Downlink assignments with MIMO</td></tr>
        <tr><td>3, 3A</td><td>Group power control commands</td></tr>
        <tr><td>4</td><td>Uplink grant with uplink MIMO</td></tr>
        <tr><td>5</td><td>Sidelink grant for Rel-12 D2D</td></tr>
        <tr><td>5A</td><td>Sidelink grant for V2X (Mode 3), Rel-14</td></tr></tbody></table></div>`,
      specs: ['TS 36.212 §5.3.3', 'TS 36.300 §5.3.1'],
    },
    {
      title: 'Bearers: the QoS pipes',
      body: `<p class="lead">LTE gives QoS to <b>bearers</b>, not to individual packets.</p>
        <p>An <b>[[EPS bearer]]</b> is a pipe from the car to the P-GW with one QoS. It is stitched from three pieces: a [[DRB|data radio bearer]] (car to eNB), an S1 bearer (eNB to S-GW) and an S5/S8 bearer (S-GW to P-GW).</p>
        <ul><li>The <b>default bearer</b> is created at attach, is always on, and is non-GBR.</li>
        <li><b>Dedicated bearers</b> are added when a flow needs different QoS, for example V2X messages that need a tight delay budget.</li>
        <li>A <b>[[TFT]]</b> (packet filter set) decides which IP packets go into which bearer, for example "UDP to the V2X AS address and port".</li></ul>
        <p>Each bearer carries a [[QCI]], an [[ARP]], and for [[GBR]] bearers a guaranteed and maximum bit rate. Non-GBR bearers share an [[AMBR]] cap.</p>`,
      takeaway: 'EPS bearer = radio bearer + S1 bearer + S5 bearer, one QoS. TFTs sort packets into bearers.',
      detail: `<p>A dedicated bearer for V2X can be triggered by the V2X AS asking the PCRF over Rx, or by operator policy. In 5G the bearer is replaced by the [[QoS flow]] inside a [[PDU session]]; the new [[SDAP]] layer maps QoS flows to radio bearers.</p>`,
      specs: ['TS 23.401 §4.7', 'TS 23.203'],
    },
    {
      title: 'QCIs and 5QIs for V2X',
      body: `<p class="lead">Release 14 added two QoS classes for V2X messages (QCI 75 and 79) and listed V2X as a use of the existing QCI 3. All three have a 50 ms [[PDB|packet delay budget]].</p>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>QCI</th><th>Type</th><th>Priority</th><th>Delay budget</th><th>Loss rate</th><th>Example use</th></tr></thead><tbody>
        <tr><td class="n">1</td><td>GBR</td><td class="n">2</td><td class="n">100 ms</td><td class="n">10⁻²</td><td>Voice call</td></tr>
        <tr><td class="n">3</td><td>GBR</td><td class="n">3</td><td class="n">50 ms</td><td class="n">10⁻³</td><td>Real-time gaming, V2X messages</td></tr>
        <tr><td class="n">75</td><td>GBR</td><td class="n">2.5</td><td class="n">50 ms</td><td class="n">10⁻²</td><td>V2X messages over MBMS bearers only</td></tr>
        <tr><td class="n">79</td><td>Non-GBR</td><td class="n">6.5</td><td class="n">50 ms</td><td class="n">10⁻²</td><td>V2X messages</td></tr>
        <tr><td class="n">9</td><td>Non-GBR</td><td class="n">9</td><td class="n">300 ms</td><td class="n">10⁻⁶</td><td>Default internet</td></tr></tbody></table></div>
        <p>For V2X messages over a unicast bearer, use <b>QCI 3</b> when the operator reserves resources and <b>QCI 79</b> when best effort with a tight delay target is enough. <b>QCI 75</b> is used only when V2X messages are delivered over MBMS broadcast bearers (TS 23.285).</p>`,
      takeaway: 'V2X QCIs, all 50 ms: 3 (GBR, unicast), 79 (non-GBR, unicast), 75 (MBMS broadcast only). 5G adds delay-critical 5QIs down to 5 ms.',
      detail: `<p>5G keeps 5QI 75 and 79 and adds <b>delay-critical GBR</b> 5QIs with a maximum data burst volume:</p>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>5QI</th><th>Delay budget</th><th>Error rate</th><th>Example</th></tr></thead><tbody>
        <tr><td class="n">83</td><td class="n">10 ms</td><td class="n">10⁻⁴</td><td>Platooning with an RSU, cooperative lane change</td></tr>
        <tr><td class="n">84</td><td class="n">30 ms</td><td class="n">10⁻⁵</td><td>Intelligent transport systems</td></tr>
        <tr><td class="n">85</td><td class="n">5 ms</td><td class="n">10⁻⁵</td><td>Remote driving</td></tr>
        <tr><td class="n">86</td><td class="n">5 ms</td><td class="n">10⁻⁴</td><td>Collision avoidance, high-automation platooning</td></tr></tbody></table></div>
        <p>A lower priority number means more important. The delay budget covers the path from the UE to the gateway, not the full trip to a server. For most LTE QCIs, including the V2X ones, 3GPP sets aside 20 ms of it for the core network, so a 50 ms budget leaves about 30 ms for the radio. 5G lists a core-network share for every 5QI.</p>`,
      specs: ['TS 23.203 Table 6.1.7', 'TS 23.501 Table 5.7.4-1'],
    },
  ],
  challenges: [
    {
      type: 'classify', title: 'Which physical channel?',
      intro: 'Each item is something that has to cross the air. Pick the physical channel that carries it.',
      bins: [{ id: 'pbch', label: 'PBCH' }, { id: 'pdsch', label: 'PDSCH' }, { id: 'pmch', label: 'PMCH' }, { id: 'pdcch', label: 'PDCCH' }, { id: 'phich', label: 'PHICH' }, { id: 'pusch', label: 'PUSCH' }, { id: 'pucch', label: 'PUCCH' }, { id: 'prach', label: 'PRACH' }],
      items: [
        { text: 'The MIB (BCCH on BCH)', bin: 'pbch', why: 'The only thing the PBCH carries.' },
        { text: 'SIB1 and SIB21 (BCCH on DL-SCH)', bin: 'pdsch', why: 'All SIBs travel on the PDSCH, scheduled by DCI with the SI-RNTI.' },
        { text: 'A paging message (PCCH on PCH)', bin: 'pdsch', why: 'Paging is scheduled on the PDSCH with the P-RNTI.' },
        { text: 'An MBSFN broadcast of a hazard warning (MTCH on MCH)', bin: 'pmch', why: 'MCH maps onto the PMCH in MBSFN subframes.' },
        { text: 'An SC-PTM broadcast in one cell (SC-MTCH)', bin: 'pdsch', why: 'SC-PTM reuses DL-SCH on the ordinary PDSCH, scheduled with a G-RNTI.' },
        { text: 'An uplink grant (DCI format 0)', bin: 'pdcch', why: 'All DCI goes on the PDCCH.' },
        { text: 'ACK/NACK from the eNB for the car’s uplink data', bin: 'phich', why: 'Uplink HARQ feedback in LTE uses the PHICH.' },
        { text: 'The car’s V2X message to the V2X AS (DTCH on UL-SCH)', bin: 'pusch', why: 'User data in the uplink goes on the PUSCH.' },
        { text: 'A CQI report when the car has no uplink data scheduled', bin: 'pucch', why: 'Uplink control without PUSCH goes on the PUCCH.' },
        { text: 'A random access preamble', bin: 'prach', why: 'Preambles use the PRACH.' },
      ],
    },
    {
      type: 'classify', title: 'The QoS desk',
      intro: 'Assign each flow the class an operator would most likely use.',
      bins: [{ id: '1', label: 'QCI 1', hint: 'GBR, 100 ms, voice' }, { id: '9', label: 'QCI 9', hint: 'non-GBR, 300 ms, default' }, { id: '3', label: 'QCI 3', hint: 'GBR, 50 ms, V2X unicast' }, { id: '79', label: 'QCI 79', hint: 'non-GBR, 50 ms, V2X unicast' }, { id: '75', label: 'QCI 75', hint: 'GBR, 50 ms, V2X over MBMS' }, { id: '85', label: '5QI 85', hint: 'delay-critical, 5 ms' }],
      items: [
        { text: 'The driver’s phone call through the car’s modem', bin: '1', why: 'Conversational voice: QCI 1.' },
        { text: 'Passengers browsing the web', bin: '9', why: 'Best-effort internet on the default bearer.' },
        { text: 'Periodic V2X messages uploaded to the V2X AS, no reserved resources', bin: '79', why: 'Non-GBR with a 50 ms budget: QCI 79.' },
        { text: 'V2X warnings uploaded on a unicast bearer with guaranteed capacity', bin: '3', why: 'GBR V2X over unicast: QCI 3. (QCI 75 is GBR too, but TS 23.285 allows it only on MBMS bearers.)' },
        { text: 'A hazard warning broadcast to every car in an area over an MBMS bearer', bin: '75', why: 'QCI 75 is the V2X class reserved for delivery over MBMS bearers.' },
        { text: 'An over-the-air software update', bin: '9', why: 'Large, delay-tolerant: default bearer.' },
        { text: 'A remote operator’s control commands to a 5G robotaxi', bin: '85', why: 'Remote driving: 5QI 85 with a 5 ms budget and 10⁻⁵ error rate.' },
      ],
    },
  ],
  quiz: [
    { q: 'Which transport channel carries MBSFN broadcast data?', options: ['MCH', 'BCH', 'PCH', 'RACH'], answer: 0, why: 'MCH, on the PMCH. BCH carries the MIB, PCH paging, RACH random access.' },
    { q: 'What type of bearer is the default bearer?', options: ['Non-GBR', 'GBR', 'It has no QoS', 'It depends on the PCI'], answer: 0, why: 'The default bearer is always non-GBR and stays up while the UE is attached.' },
    { q: 'What is the packet delay budget of QCI 79?', options: ['50 ms', '100 ms', '300 ms', '5 ms'], answer: 0, why: 'All three V2X QCIs (3, 75, 79) have a 50 ms budget.' },
    { q: 'What does a TFT do?', options: ['Filters packets into the right bearer', 'Encrypts packets', 'Sets the timing advance', 'Compresses headers'], answer: 0, why: 'A traffic flow template is a set of packet filters bound to a bearer.' },
    { q: 'Which DCI format grants V2X sidelink resources in LTE?', options: ['5A', '0', '1A', '3'], answer: 0, why: 'DCI 5A, added in Rel-14 for Mode 3. Format 0 grants Uu uplink, 1A assigns downlink, 3 is power control.' },
  ],
  recap: `<ul><li>The difference between logical, transport and physical channels, and the main mappings.</li><li>What DCI is and which formats matter.</li><li>EPS bearers, default vs dedicated, TFTs and the QoS parameters.</li><li>The V2X QCIs and the delay-critical 5QIs.</li></ul>`,
});

defineExit({
  id: 7, num: '7', title: 'Beat the Clock', subtitle: 'Scheduling, HARQ, SPS and end-to-end latency', mins: 22,
  topics: ['SR → grant → PUSCH', 'HARQ: 8 processes, 8 ms', 'SPS · UE assistance info', 'Latency budget', 'Edge servers'],
  cards: [
    {
      title: 'Nothing moves without a grant',
      body: `<p class="lead">Every millisecond the eNB scheduler decides which car sends or receives on which resource blocks. A car cannot simply transmit.</p>
        <p>When a V2X message appears and the car has no grant:</p>
        <ol><li>It waits for its next <b>[[SR|scheduling request]]</b> opportunity on the PUCCH (configured every 1 to 80 ms).</li>
        <li>It sends the SR: a single bit meaning "I have data".</li>
        <li>The eNB answers with an uplink grant, [[DCI]] format 0, on the PDCCH.</li>
        <li>The car transmits on the [[PUSCH]] exactly <b>4 subframes after</b> the grant (the n+4 rule in FDD), usually including a [[BSR]] if more data waits.</li>
        <li>4 subframes later the eNB answers ACK or NACK on the PHICH.</li></ol>
        <p>Each step costs milliseconds before a single byte of the message has moved.</p>`,
      fig: tlSVG(17, [{ sf: 0, lane: 'ul', t: 'SR' }, { sf: 4, lane: 'dl', t: 'DCI 0' }, { sf: 8, lane: 'ul', t: 'PUSCH' }, { sf: 12, lane: 'dl', t: 'NACK' }, { sf: 16, lane: 'ul', t: 'reTx' }], { arrows: [[0, 4, 'up'], [4, 8, 'down'], [8, 12, 'up'], [12, 16, 'down']], aria: 'Uplink dynamic scheduling timeline' }),
      cap: 'Dynamic uplink scheduling in LTE FDD, one box per 1 ms subframe. If the first PUSCH fails, the retransmission comes 8 ms after it.',
      takeaway: 'SR wait + SR→grant + grant→PUSCH (4 ms) before any data moves. That is the cost of dynamic scheduling.',
      detail: `<p>The eNB’s time from SR to grant is not standardised but is typically around 3 to 4 ms. A large message may need two rounds: a small first grant carrying the BSR, then a grant big enough for the data. Rel-14 also added <b>uplink skipping</b>: a UE with nothing to send may skip a dynamic or SPS grant instead of sending padding.</p>`,
      specs: ['TS 36.213 §8', 'TS 36.321 §5.4'],
    },
    {
      title: 'HARQ: fast fix-ups',
      body: `<p class="lead">Radio links make mistakes. [[HARQ]] fixes them in milliseconds.</p>
        <ul><li>After each transport block the receiver answers ACK or NACK, 4 ms later in LTE FDD.</li>
        <li>On a NACK the sender retransmits; the receiver <b>soft-combines</b> the new copy with the failed one, so each retransmission is far more likely to succeed.</li>
        <li>Waiting for each answer would leave the link idle, so LTE FDD runs <b>8 parallel HARQ processes</b>: the round trip is 8 ms, and a different process sends in each subframe.</li>
        <li>Link adaptation aims at about 10% [[BLER]] on the first try. With a 10% BLER the average added delay is 0.1/0.9 × 8 ≈ 0.9 ms; a retransmission, when it happens, costs 8 ms.</li></ul>
        <p>Uplink HARQ in LTE is <b>synchronous</b> (retransmission exactly 8 ms later); downlink HARQ is asynchronous (the eNB chooses when).</p>`,
      fig: tlSVG(16, Array.from({ length: 16 }, (_, i) => ({ sf: i, lane: 'ul', t: 'P' + (i % 8) })).concat([{ sf: 4, lane: 'dl', t: 'A/N0' }, { sf: 5, lane: 'dl', t: 'A/N1' }]), { arrows: [[0, 4, 'up'], [4, 8, 'down']], aria: 'Eight HARQ processes in turn' }),
      cap: 'Eight uplink HARQ processes P0–P7 take turns. P0’s feedback arrives in subframe 4, and P0 transmits again (new data or a retransmission) in subframe 8.',
      takeaway: 'HARQ: ACK/NACK after 4 ms, retransmission after 8 ms, 8 processes keep the pipe full.',
      specs: ['TS 36.213 §7.3, §8', 'TS 36.321 §5.3, §5.4.2'],
    },
    {
      title: 'Semi-persistent scheduling (SPS)',
      body: `<p class="lead">Many V2X messages are periodic: a [[CAM]] or [[BSM]] every 100 ms. Asking for a grant every time is wasteful.</p>
        <p>With <b>[[SPS]]</b>, RRC configures an interval and an SPS identity (the SPS C-RNTI; for the Rel-14 multiple V2X configurations, the UL-SPS-V-RNTI); one DCI activates it; from then on the car owns the same resources every interval, with no SR and no grant. That saves PDCCH capacity and removes the request delay.</p>
        <p>Release 14 made SPS fit V2X much better:</p>
        <ul><li><b>Up to 8 SPS configurations</b> per car, running in parallel with different periods and sizes, activated and released individually by DCI.</li>
        <li><b>[[UE assistance information]]</b>: the car reports each traffic pattern's period, timing offset, message size and logical channel (for sidelink patterns, the priority), so the eNB can place the SPS occasion right after the message is generated.</li></ul>
        <p>That alignment matters a lot. If the occasion lands at a random point in a 100 ms cycle, the message waits 50 ms on average.</p>`,
      takeaway: 'SPS: one grant, many transmissions. Rel-14: 8 parallel configurations, and UE assistance information to align them with message generation.',
      detail: `<p>The same two ideas (multiple SPS configurations, UE assistance information) were applied to the sidelink for Mode 3, where the eNB configures sidelink SPS over Uu (Exit 11). In NR the uplink equivalent is the [[Configured grant]]: type 1 needs no DCI at all, type 2 is activated by DCI like LTE SPS.</p>`,
      specs: ['TS 36.321 §5.10', 'TS 36.331 (SPS-Config, UEAssistanceInformation)', 'TS 36.300 §23.14'],
    },
    {
      title: 'The end-to-end budget',
      body: `<p class="lead">The V2X requirements set the targets (TS 22.185):</p>
        <ul><li>V2V, V2I, V2P messages: <b>100 ms</b> maximum latency, up to 10 messages per second, 50–300 bytes (up to 1200 bytes when event-triggered).</li>
        <li>Special cases such as pre-crash sensing: <b>20 ms</b>.</li>
        <li>V2N: <b>1000 ms</b>.</li></ul>
        <p>A V2X message via Uu passes many stages, and each adds delay:</p>
        <ol><li>Uplink access: SR wait and grant, or the SPS wait.</li>
        <li>Uplink transmission, eNB decoding and HARQ.</li>
        <li>eNB → gateways → V2X AS, and back again. A distant data centre costs tens of ms; an <b>edge server ([[MEC]])</b> with local breakout costs about 1 ms.</li>
        <li>V2X AS processing (filtering by area, maybe checking signatures).</li>
        <li>Downlink delivery: unicast queue, or waiting for the broadcast scheduling period.</li></ol>
        <p>The latency lab lets you tune each stage.</p>`,
      takeaway: '100 ms is easy over Uu. 20 ms needs aligned SPS and an edge server. A few ms is PC5 territory.',
      detail: `<p>Rel-14 options for shortening the path include local V2X AS instances, local (edge) user-plane gateways enabled by [[CUPS]], and localised MBMS with the BM-SC and MBMS-GW close to the cells. 5G makes edge placement routine: the UPF can be selected per location and per slice.</p>`,
      specs: ['TS 22.185 §5', 'TS 23.285 §4.4.6', 'TS 23.214 (CUPS)'],
    },
  ],
  challenges: [
    {
      type: 'latency', title: 'Latency lab',
      intro: 'Tune the uplink access, where the V2X AS runs, and how the downlink reaches the cars. The bar shows where every millisecond goes. Each mission has conditions you cannot change and a target you must hit.',
      missions: [
        { name: 'Ice warning under 100 ms', periodic: false, n: 100, cells: 3, bler: 0.1, budget: 100, costCap: 60, story: 'A car detects black ice and sends one event-triggered warning. About 100 cars in 3 cells must receive it.', goal: 'arrive within 100 ms and spend at most 60 RB-pairs of downlink per message.', startCfg: { ul: 'dyn10', srv: 'cloud', dl: 'uni' }, solution: { ul: 'dyn10', srv: 'cloud', dl: 'scptm' }, debrief: 'Latency was never the hard part: even a central cloud fits in 100 ms. The cost was. One unicast copy per car is 200 RB-pairs for 100 cars; a broadcast costs 15 in total for the 3 cells, with SC-PTM or with MBSFN.' },
        { name: 'Periodic messages within 50 ms', periodic: true, n: 300, cells: 8, bler: 0.1, budget: 50, costCap: 80, needSPS: true, story: '300 cars in 8 cells relay their periodic messages through the network. The operator wants SPS instead of a scheduling request per message.', goal: 'use SPS, stay within 50 ms and at most 80 RB-pairs per message.', startCfg: { ul: 'spsU', srv: 'cloud', dl: 'mb80' }, solution: { ul: 'spsA', srv: 'region', dl: 'scptm' }, debrief: 'Two hidden delays. An SPS occasion that is not aligned with message generation costs half a period on average (50 ms). An 80 ms MCH scheduling period, the shortest before Rel-14, costs 40 ms of waiting on average. UE assistance information lets the eNB align SPS; SC-PTM or the shorter Rel-14 MCH periods shrink the broadcast wait.' },
        { name: 'Sensor sharing in 20 ms', periodic: true, n: 10, cells: 1, bler: 0.1, budget: 20, story: 'Ten cars at one intersection share sensor detections through the network. The budget is the 20 ms pre-crash class.', goal: 'arrive within 20 ms.', startCfg: { ul: 'dyn10', srv: 'region', dl: 'uni' }, solution: { ul: 'spsA', srv: 'edge', dl: 'uni' }, debrief: 'Only an edge server plus aligned SPS gets under 20 ms: any trip to a data centre eats most of the budget, and even a 1 ms scheduling-request cycle leaves dynamic scheduling just over it. PC5 sends the same message car to car in a few milliseconds without touching the network, which is why safety-critical V2V uses the sidelink.' },
      ],
      finale: 'Remember the three levers: how the uplink gets access, how far away the server is, and how the downlink reaches many cars.',
    },
    {
      type: 'calc', title: 'Timing drills',
      items: [
        { q: 'A car receives an uplink grant (DCI 0) in subframe 7. In which subframe does it transmit the PUSCH? (FDD, count past 9 if needed, e.g. 13.)', answer: 11, tol: 0, solution: 'n + 4 = 7 + 4 = 11 (that is subframe 1 of the next frame).', hint: 'FDD uplink uses n+4.' },
        { q: 'That PUSCH is NACKed. In which subframe does the synchronous retransmission happen?', answer: 19, tol: 0, solution: 'Uplink HARQ round trip is 8 ms: 11 + 8 = 19.', hint: 'The uplink HARQ round trip is 8 subframes.' },
        { q: 'Scheduling-request opportunities come every 20 ms and messages appear at random times. What is the average wait for the next opportunity?', answer: 10, tol: 0.5, unit: 'ms', solution: 'Uniformly distributed arrival: half the period, 20 / 2 = 10 ms.', hint: 'On average you arrive halfway through the cycle.' },
        { q: 'First-transmission BLER is 20% and each retransmission costs 8 ms. What is the average added HARQ delay? (Use BLER/(1−BLER) × 8.)', answer: 2, tol: 0.05, unit: 'ms', solution: '0.2 / 0.8 × 8 = 2 ms. The geometric series 0.2 + 0.04 + … sums to 0.25 expected retransmissions.', hint: 'Expected number of retransmissions is p/(1−p).' },
        { q: 'SPS has a 100 ms period but its occasions are placed with no regard to when messages are generated. What is the average wait?', answer: 50, tol: 1, unit: 'ms', solution: 'Half the period: 50 ms. This is why UE assistance information (timing offset) matters.', hint: 'Same reasoning as the SR wait.' },
      ],
    },
  ],
  quiz: [
    { q: 'In LTE FDD, an uplink grant received in subframe n means the PUSCH is sent in…', options: ['subframe n+4', 'subframe n', 'subframe n+1', 'subframe n+8'], answer: 0, why: 'The n+4 rule gives the UE time to prepare the transmission.' },
    { q: 'What is the HARQ round-trip time in LTE FDD?', options: ['8 ms', '4 ms', '1 ms', '10 ms'], answer: 0, why: 'Feedback after 4 ms, retransmission after 8 ms, hence 8 HARQ processes.' },
    { q: 'Why is SPS a good fit for CAM/BSM traffic over Uu?', options: ['The traffic is periodic, so one grant can serve every message', 'SPS gives higher modulation orders', 'SPS removes the need for HARQ', 'SPS works without RRC'], answer: 0, why: 'SPS removes the per-message SR and grant, saving latency and PDCCH capacity.' },
    { q: 'What did Rel-14 add to help the eNB align SPS with V2X traffic?', options: ['UE assistance information and up to 8 SPS configurations', 'A new waveform', 'A shorter cyclic prefix', 'TCP acceleration'], answer: 0, why: 'The car reports period, offset, size and priority; the eNB can run several matching SPS configurations.' },
    { q: 'According to TS 22.185, what is the maximum latency for V2N messages?', options: ['1000 ms', '100 ms', '20 ms', '5 ms'], answer: 0, why: '1000 ms for V2N; 100 ms for typical V2V/V2I/V2P; 20 ms for special cases such as pre-crash sensing.' },
  ],
  recap: `<ul><li>The SR → grant → PUSCH chain and the n+4 rule.</li><li>How HARQ works and what it costs.</li><li>SPS, and the two Rel-14 improvements for V2X.</li><li>Where the milliseconds go end to end, and which levers shorten the path.</li></ul>`,
});

defineExit({
  id: 8, num: '8', title: 'Broadcast the Hazard', subtitle: 'Unicast, MBSFN and SC-PTM delivery', mins: 20,
  topics: ['Uu-based V2X flow', 'MBMS · MBSFN', 'SC-PTM · G-RNTI', 'TMGI · SAI · USD', 'MB2'],
  cards: [
    {
      title: 'The Uu round trip for V2X messages',
      wide: true,
      body: `<p class="lead">This is how a V2V or V2I message can travel over Uu (TS 23.285).</p>
        <ol><li><b>Uplink, always unicast.</b> The car sends the message over its bearer as UDP/IP to the [[V2X AS]] address it was provisioned with.</li>
        <li><b>The V2X AS decides who needs it.</b> It knows the message's location and type, and maps the relevance area onto cells or broadcast areas.</li>
        <li><b>Downlink, unicast or broadcast.</b> Either one copy per car through each car's bearer, or one broadcast through [[MBMS]], requested over [[MB2]].</li></ol>
        <p>Cars filter what they receive at the application layer, using the position and type fields in the message itself.</p>`,
      fig: `<div class="scroll-x">${seqSVG([{ id: 'a', name: 'Car A', kind: 'ue' }, { id: 'enb', name: 'eNB(s)', kind: 'ran' }, { id: 'gw', name: 'S-GW / P-GW' }, { id: 'as', name: 'V2X AS', kind: 'v2x' }, { id: 'bm', name: 'BM-SC / MBMS-GW', kind: 'mbms' }, { id: 'b', name: 'Cars in area', kind: 'ue' }], [
        { from: 'a', to: 'enb', label: 'PUSCH (unicast)', kind: 'ul' }, { from: 'enb', to: 'gw', label: 'S1-U GTP-U', kind: 'up' }, { from: 'gw', to: 'as', label: 'SGi: UDP/IP', kind: 'up' },
        { from: 'as', to: 'as', label: 'which area? which cells?', kind: 'up' }, { from: 'as', to: 'bm', label: 'MB2', kind: 'up' }, { from: 'bm', to: 'enb', label: 'SGi-mb → M1 multicast', kind: 'up' },
        { from: 'enb', to: 'b', label: 'MBSFN or SC-PTM broadcast', kind: 'dl' }], { colW: 136, aria: 'Uu-based V2X message distribution via MBMS' })}</div>`,
      takeaway: 'Up by unicast to the V2X AS; down by unicast or MBMS broadcast to every car in the area.',
      specs: ['TS 23.285 §4.4.2, §5.4', 'TS 23.246'],
    },
    {
      title: 'Unicast versus broadcast',
      body: `<p class="lead">Both work. The question is how much radio capacity each copy costs.</p>
        <p><b>Unicast</b> sends one copy per car. Each copy gets its own grant, its own link adaptation and [[HARQ]], so each is efficient, but the total cost grows with the number of cars. For one car, or for personalised content, it is the right choice.</p>
        <p><b>Broadcast</b> sends one copy per cell (or per area), whatever the number of cars. There is no per-car feedback, so the [[MCS]] must be robust enough for the worst car, and there is no HARQ. For many cars it wins easily.</p>
        <p>In the broadcast commander you will use this model (RB-pairs per message):</p>
        <div class="formula">unicast = 2 × cars   ·   SC-PTM = 5 × cells   ·   MBSFN = 3 × cells + 6</div>`,
      takeaway: 'Cost of unicast grows with cars; cost of broadcast grows with cells.',
      specs: ['TS 36.300 §15'],
    },
    {
      title: 'MBMS over MBSFN',
      wide: true,
      body: `<p class="lead">With [[MBSFN]] a group of synchronised cells sends exactly the same signal in the same subframes.</p>
        <p>To a car, the copies from several towers look like echoes of one signal. The extended [[CP|cyclic prefix]] (16.7 µs) absorbs them, so they add up instead of interfering. That gives strong coverage at cell edges, where unicast is weakest.</p>
        <ul><li>Data rides [[MTCH]] on [[MCH]] on the [[PMCH]], in reserved MBSFN subframes (never subframes 0, 4, 5 or 9 in FDD, which carry sync, paging and SIBs).</li>
        <li>The [[MCE]] chooses the subframes and MCS so every eNB transmits identically. The BM-SC stamps the content with SYNC timing so every eNB sends each packet at the same moment, and the [[MBMS-GW]] carries it to all eNBs by IP multicast over M1.</li>
        <li>[[MCCH]] describes the sessions; SIB13 tells cars where the MCCH is, SIB15 lists the service areas.</li>
        <li>New content can start only at the <b>MCH scheduling period</b>. Before Rel-14 the shortest period was 80 ms; Rel-14 added 10 and 20 ms periods to cut latency for V2X, and allowed localised MBMS functions near the cells.</li></ul>`,
      fig: `<div class="scroll-x">${archSVG(MBMS_DIAGRAM)}</div>${archKey(MBMS_DIAGRAM)}`,
      cap: 'MBMS architecture. M1 (user plane) and M2 (radio coordination) go to every eNB of the MBSFN area.',
      takeaway: 'MBSFN = same signal, same subframes, many cells. Great coverage, but it needs reserved subframes and a scheduling period.',
      detail: `<p>The V2X AS reaches the BM-SC over MB2: MB2-C to allocate a [[TMGI]] and activate a bearer for a service area, MB2-U to send the content. The BM-SC sends session control on SGmb and data on SGi-mb to the MBMS-GW. The MME forwards session start to the MCE over M3 (via Sm from the MBMS-GW).</p>`,
      specs: ['TS 36.300 §15', 'TS 23.246', 'TS 29.468 (MB2)'],
    },
    {
      title: 'SC-PTM: broadcast in one cell',
      body: `<p class="lead">[[SC-PTM]] (single-cell point-to-multipoint, Rel-13) broadcasts within one cell using the ordinary [[PDSCH]].</p>
        <ul><li>The eNB schedules it in any subframe with a DCI scrambled by a [[G-RNTI]] shared by all receivers.</li>
        <li>Control is on SC-MCCH, which cars find through SIB20.</li>
        <li>No subframes are reserved and no inter-cell synchronisation is needed, so it can start and stop per cell quickly.</li>
        <li>There is no single-frequency-network gain, so each cell's transmission must be robust on its own.</li></ul>
        <p>SC-PTM fits small or fast-changing areas, such as one intersection; MBSFN fits large, stable areas, such as a long stretch of motorway.</p>`,
      takeaway: 'SC-PTM = per-cell broadcast on PDSCH with a G-RNTI. Flexible and quick; no SFN gain.',
      specs: ['TS 36.300 §15', 'TS 36.331 (SIB20, SC-MCCH)'],
    },
    {
      title: 'Hitting the right area',
      body: `<p class="lead">A hazard matters for a place, not for a list of subscribers. The network has to turn a place into a set of transmitters.</p>
        <ul><li>The V2X AS maps a geographic area onto cell identities ([[ECGI]]) or MBMS service area identities ([[SAI]]).</li>
        <li>It asks the BM-SC for a bearer in that area, identified by a [[TMGI]].</li>
        <li>Cars learn which TMGI and SAI to listen to from the [[USD|user service description]] (service announcement), and receive the broadcast whether they are idle or connected.</li>
        <li>Each car still checks the position in the message to decide whether it is relevant.</li></ul>
        <p>Broadcast reception does not need a handover: in an MBSFN area every cell sends the same thing, so a car crossing cells keeps receiving.</p>`,
      takeaway: 'Place → ECGIs or SAIs → TMGI bearer → USD tells cars what to listen to.',
      specs: ['TS 23.285 §5.4.2', 'TS 26.346'],
    },
  ],
  challenges: [
    {
      type: 'broadcast', title: 'Broadcast commander',
      intro: 'Three hazards, three decisions. Choose a delivery method and the cells to transmit in, then send. The red cells contain the cars that need the message.',
      scenarios: [
        { name: 'Reroute one truck', story: 'A logistics server tells one truck to leave the motorway at the next exit because its delivery slot moved.', vehicles: { 9: 1, 3: 6, 8: 9, 10: 8, 16: 5 }, affected: [9], n: 1, best: 'uni', why: 'One receiver and personal content: unicast costs 2 RB-pairs and gets HARQ. A broadcast would wake every car in the cell for a message meant for one.' },
        { name: 'Black ice along 12 km', story: 'Road sensors report black ice on a 12 km stretch. About 260 cars in 9 cells should slow down.', vehicles: { 3: 25, 7: 30, 8: 30, 9: 30, 10: 30, 11: 30, 12: 30, 13: 30, 17: 25, 1: 4, 19: 3 }, affected: [3, 7, 8, 9, 10, 11, 12, 13, 17], n: 260, best: 'mbsfn', why: 'Many cars over a wide, stable area: MBSFN costs 33 RB-pairs against 45 for SC-PTM and 520 for unicast, and its single-frequency-network gain helps cars at cell edges.' },
        { name: 'Crash at an intersection', story: 'A crash blocks an intersection. 35 cars in a single cell need to know now; the area will change as traffic clears.', vehicles: { 10: 35, 9: 8, 11: 7, 3: 4 }, affected: [10], n: 35, best: 'scptm', why: 'Many cars in one cell: SC-PTM costs 5 RB-pairs, can start in that cell immediately and needs no reserved subframes. MBSFN pays a fixed area overhead (9), unicast pays per car (70).' },
      ],
    },
    {
      type: 'match', title: 'Broadcast vocabulary', left: 'Term', right: 'What it does',
      pairs: [
        { a: 'TMGI', b: 'Identifies one MBMS bearer service', why: 'Temporary Mobile Group Identity.' },
        { a: 'SAI', b: 'Names a group of cells where a service is offered', why: 'MBMS Service Area Identity, listed in SIB15.' },
        { a: 'G-RNTI', b: 'Scrambles the DCI that schedules SC-PTM data', why: 'Shared by all receivers of one SC-PTM service.' },
        { a: 'MCCH', b: 'Describes the sessions in an MBSFN area', why: 'Found through SIB13.' },
        { a: 'SIB20', b: 'Tells cars where SC-PTM control is', why: 'Points to the SC-MCCH.' },
        { a: 'USD', b: 'Service announcement read by the UE', why: 'User Service Description: TMGI, frequencies, service areas.' },
        { a: 'MB2', b: 'Lets the V2X AS request broadcast bearers', why: 'Between the application server and the BM-SC.' },
        { a: 'M1', b: 'Carries broadcast content to the eNBs by IP multicast', why: 'From the MBMS-GW.' },
      ],
    },
  ],
  quiz: [
    { q: 'Which interface connects the V2X AS to the BM-SC?', options: ['MB2', 'M1', 'SGi', 'V3'], answer: 0, why: 'MB2 (MB2-C control, MB2-U content). M1 is MBMS-GW → eNB.' },
    { q: 'SC-PTM data is carried on…', options: ['the PDSCH, scheduled with a G-RNTI', 'the PMCH in MBSFN subframes', 'the PBCH', 'the PUSCH'], answer: 0, why: 'SC-PTM reuses DL-SCH on the PDSCH. MBSFN uses the PMCH.' },
    { q: 'Why is MBSFN coverage strong at cell edges?', options: ['Synchronised cells send the same signal, so the copies add up', 'MBSFN uses higher transmit power', 'MBSFN uses HARQ', 'Cars move closer to the tower'], answer: 0, why: 'The single-frequency-network combining turns neighbour-cell signals from interference into useful energy.' },
    { q: 'When is unicast downlink the better choice?', options: ['Few receivers or personalised content', 'Hundreds of receivers in many cells', 'Whenever latency matters', 'Never; broadcast is always cheaper'], answer: 0, why: 'Unicast cost scales with receivers; for one car it is cheapest and gets HARQ.' },
    { q: 'Which subframes can never be MBSFN subframes in FDD?', options: ['0, 4, 5 and 9', '1, 2, 3 and 6', 'Only subframe 0', 'All even subframes'], answer: 0, why: 'They carry synchronisation, PBCH, SIB1 and paging, which every UE must receive.' },
  ],
  recap: `<ul><li>The full Uu path of a V2X message: unicast up, unicast or broadcast down.</li><li>Why unicast cost grows with cars and broadcast cost with cells.</li><li>How MBSFN and SC-PTM work, and when to choose each.</li><li>How a geographic area becomes cells, SAIs and a TMGI.</li></ul>`,
});
