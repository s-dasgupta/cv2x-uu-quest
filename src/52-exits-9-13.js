/* ============================================================
   Content: Exits 9–12 and the Destination
   ============================================================ */

const A3_FIG = (() => {
  const k = 120 / 460, ys = (x) => 50 + k * (x - 40), yn = (x) => 170 - k * (x - 40);
  return `<svg class="dg" viewBox="0 0 520 230" role="img" aria-label="A3 event: neighbour exceeds serving plus hysteresis for the time-to-trigger, then the handover happens">
    <line class="stroke-line" x1="40" y1="20" x2="40" y2="190"/><line class="stroke-line" x1="40" y1="190" x2="505" y2="190"/>
    <text class="t-sm t-mute" x="44" y="16">RSRP</text><text class="t-sm t-mute" x="505" y="206" text-anchor="end">time / distance →</text>
    <path class="ln dl" d="M40,${ys(40)} L500,${ys(500)}"/><path class="ln ul" d="M40,${yn(40)} L500,${yn(500)}"/>
    <path class="ln thin dash" d="M40,${ys(40) - 20} L500,${ys(500) - 20}"/>
    <text class="t-sm" x="60" y="${ys(60) + 16}" style="fill:var(--d-dl)">serving cell</text><text class="t-sm" x="60" y="${yn(60) - 6}" style="fill:var(--d-ul)">neighbour cell</text>
    <text class="t-sm t-mute" x="150" y="${ys(150) - 26}">serving + Hys (+ offset)</text>
    <line class="stroke-ink" x1="308" y1="${yn(308)}" x2="308" y2="190" stroke-dasharray="3 3"/><line class="stroke-ink" x1="362" y1="${yn(362)}" x2="362" y2="190" stroke-dasharray="3 3"/>
    <path class="stroke-ink" d="M308,176 L362,176" stroke-width="2"/>${arrowHead(362, 176, 'r', '')}
    <text class="t-sm" x="335" y="170" text-anchor="middle">TTT</text>
    <text class="t-sm" x="304" y="${yn(308) - 8}" text-anchor="end">A3 entered</text>
    <text class="t-sm" x="366" y="${yn(362) - 8}">report → handover</text>
    <circle class="fill-ink" cx="270" cy="${ys(270)}" r="3.5"/><text class="t-sm t-mute" x="262" y="${ys(270) + 18}" text-anchor="end">equal power</text>
  </svg>`;
})();

const KEY_TREE = layeredSVG({
  w: 640, rowGap: 64, labelW: 10, aria: 'LTE key hierarchy from K to the RRC and user plane keys',
  rows: [
    { items: [{ id: 'k', t: 'K (in USIM and HSS)', x: 320, kind: 'v2x' }] },
    { items: [{ id: 'ck', t: 'CK', x: 260 }, { id: 'ik', t: 'IK', x: 380 }] },
    { items: [{ id: 'kasme', t: 'K-ASME (MME)', x: 320, kind: 'mbms' }] },
    { items: [{ id: 'nenc', t: 'K-NASenc', x: 90 }, { id: 'nint', t: 'K-NASint', x: 210 }, { id: 'kenb', t: 'K-eNB', x: 400, kind: 'ran' }, { id: 'nh', t: 'NH (next hop)', x: 560 }] },
    { items: [{ id: 'renc', t: 'K-RRCenc', x: 290, kind: 'ran' }, { id: 'rint', t: 'K-RRCint', x: 410, kind: 'ran' }, { id: 'upenc', t: 'K-UPenc', x: 530, kind: 'ran' }] },
  ],
  links: [['k', 'ck'], ['k', 'ik'], ['ck', 'kasme'], ['ik', 'kasme'], ['kasme', 'nenc'], ['kasme', 'nint'], ['kasme', 'kenb'], ['kasme', 'nh'], ['kenb', 'renc'], ['kenb', 'rint'], ['kenb', 'upenc']].map(([a, b]) => ({ a, b })),
});

defineExit({
  id: 9, num: '9', title: 'Keep Moving', subtitle: 'Mobility and handover at highway speed', mins: 18,
  topics: ['RRC_IDLE · RRC_CONNECTED', 'RSRP · RSRQ', 'A3 · Hys · TTT', 'X2 handover', 'Doppler'],
  cards: [
    {
      title: 'Idle or connected',
      body: `<p class="lead">How a car moves between cells depends on its RRC state.</p>
        <p><b>RRC_IDLE.</b> The car chooses cells itself (<b>cell reselection</b>) using thresholds and priorities broadcast in the SIBs. The network only knows its tracking area; to reach it, the network pages every cell in that area. The car wakes at its paging occasions and sleeps in between. It tells the MME when it enters a new tracking area.</p>
        <p><b>RRC_CONNECTED.</b> The network decides. The car measures neighbour cells as configured, reports when an event triggers, and the eNB orders a <b>handover</b>. Data keeps flowing with only a short interruption.</p>
        <p>A car sending V2X messages every 100 ms over Uu stays connected, so handover is the mechanism that matters. NR adds <b>RRC_INACTIVE</b>, which keeps the context so the car can resume quickly.</p>`,
      takeaway: 'Idle: the car picks the cell. Connected: the eNB picks, based on the car’s reports.',
      specs: ['TS 36.304', 'TS 36.331 §5.5', 'TS 38.300 §9'],
    },
    {
      title: 'Measuring: RSRP and RSRQ',
      body: `<p class="lead">Every handover decision starts with measurements of the reference signals.</p>
        <ul><li><b>[[RSRP]]</b>: the average power of one reference-signal resource element, in dBm. It measures coverage. About −80 dBm is excellent, −100 dBm fair, below −110 dBm poor.</li>
        <li><b>[[RSRQ]]</b>: RSRP compared with the total power received (N × RSRP / RSSI), in dB from about −3 to −20. It also reflects load and interference.</li>
        <li><b>[[SINR]]</b>: the wanted signal over interference plus noise, which decides what MCS the link can carry.</li></ul>
        <p>The car smooths measurements with a layer-3 filter before comparing them, so a single fade does not trigger a report. RRC tells it which frequencies to measure (measurement objects), what to report (report configurations) and how to link them (measurement IDs).</p>`,
      takeaway: 'RSRP = how strong; RSRQ = how clean. Both are filtered before use.',
      specs: ['TS 36.214 §5.1', 'TS 36.331 §5.5.3'],
    },
    {
      title: 'The A3 event, hysteresis and time-to-trigger',
      body: `<p class="lead">The usual handover trigger is the [[A3 event]]: a neighbour becomes better than the serving cell by a margin.</p>
        <p class="formula">Mn + Ofn + Ocn − Hys  >  Ms + Ofs + Ocs + Off</p>
        <p>Here Mn and Ms are the neighbour and serving measurements, the O terms are configurable offsets, and Hys is the [[Hysteresis]]. The condition must hold continuously for the <b>[[TTT|time-to-trigger]]</b> before the car sends a measurement report.</p>
        <ul><li><b>Too little hysteresis or TTT:</b> brief fades make the cells swap places and the car hands over back and forth (<b>ping-pong</b>), wasting signalling and risking data loss.</li>
        <li><b>Too much:</b> the handover is late. By the time the command is sent the old cell is too weak to deliver it, and the car suffers a <b>[[RLF|radio link failure]]</b>.</li></ul>
        <p>Speed shifts the balance: a fast car crosses the border zone quickly, so it needs a shorter TTT.</p>`,
      fig: A3_FIG,
      takeaway: 'A3 + Hys + TTT trade ping-pong (too eager) against radio link failure (too late). Fast cars need faster triggers.',
      detail: `<p>Other events: A1 (serving better than a threshold), A2 (serving worse than a threshold, often used to start inter-frequency measurements), A4 (neighbour better than a threshold), A5 (serving below one threshold and neighbour above another), A6 (neighbour better than a secondary cell), B1/B2 (inter-RAT). TTT values range from 0 to 5120 ms (0, 40, 64, 80, 100, 128, 160, 256, 320, 480, 512, 640, …). In connected mode RRC can scale the time-to-trigger by the UE’s mobility state (medium or high speed), so fast cars react faster automatically. Idle-mode cell reselection has its own speed scaling of the reselection timer and hysteresis.</p>`,
      specs: ['TS 36.331 §5.5.4', 'TS 36.331 §5.5.6'],
    },
    {
      title: 'The X2 handover',
      wide: true,
      body: `<p class="lead">Once the source eNB decides, the handover runs mostly between the two eNBs over [[X2]].</p>
        <ol><li>The car's <b>measurement report</b> reaches the source eNB, which decides to hand over.</li>
        <li><b>Handover Request</b> over X2 with the car's context, bearers and a fresh security key (K<sub>eNB</sub>*). The target admits the car and answers <b>Handover Request Acknowledge</b>, which contains the RRC message for the car.</li>
        <li>The source sends <b>RRCConnectionReconfiguration</b> with mobility control information: target PCI, new C-RNTI and usually a dedicated preamble. It forwards buffered data and PDCP sequence numbers to the target.</li>
        <li>The car synchronises to the target and does contention-free random access, then sends <b>RRCConnectionReconfigurationComplete</b>.</li>
        <li>The target asks the MME to <b>switch the path</b>; the S-GW now sends downlink data to the target. The source releases the context.</li></ol>`,
      fig: `<div class="scroll-x">${seqSVG([{ id: 'ue', name: 'Car (UE)', kind: 'ue' }, { id: 's', name: 'Source eNB', kind: 'ran' }, { id: 't', name: 'Target eNB', kind: 'ran' }, { id: 'mme', name: 'MME' }, { id: 'gw', name: 'S-GW' }], [
        { from: 'ue', to: 's', label: 'Measurement Report (A3)', kind: 'cp' }, { from: 's', to: 't', label: 'X2: Handover Request', kind: 'cp' },
        { from: 't', to: 's', label: 'X2: HO Request Ack', kind: 'cp' }, { from: 's', to: 'ue', label: 'RRC Reconfig. (mobility)', kind: 'cp' },
        { from: 's', to: 't', label: 'SN status + data forwarding', kind: 'up' }, { from: 'ue', to: 't', label: 'RACH + Reconfig. Complete', kind: 'cp' },
        { from: 't', to: 'mme', label: 'Path Switch Request', kind: 'cp' }, { from: 'mme', to: 'gw', label: 'Modify Bearer (new path)', kind: 'cp' }], { colW: 150, aria: 'X2 handover sequence' })}</div>`,
      takeaway: 'Report → X2 request/ack → RRC reconfiguration → RACH to target → path switch in the core.',
      detail: `<p>A classic LTE handover interrupts user data for some tens of milliseconds, mostly while the car resynchronises and does random access. Rel-14 added RACH-less handover (the target gives the uplink grant in advance) and make-before-break handover (the car keeps the source link until it first transmits to the target) to shrink the gap. NR adds conditional handover (Rel-16): the car receives the command early and executes it itself when the condition is met.</p>`,
      specs: ['TS 36.300 §10.1.2', 'TS 36.423 (X2AP)', 'TS 36.413'],
    },
    {
      title: 'Speed and Doppler',
      body: `<p class="lead">Speed changes the radio channel itself, not just how often the car changes cells.</p>
        <p>Motion shifts the received frequency by the <b>[[Doppler]]</b> shift f<sub>D</sub> = v · f<sub>c</sub> / c. At 250 km/h on a 2 GHz carrier that is about 460 Hz, roughly 3% of a 15 kHz subcarrier. (On the sidelink, two cars approaching each other see double that; on Uu the base station stands still.)</p>
        <p>The channel also changes faster. The <b>coherence time</b>, roughly 0.423 / f<sub>D</sub>, falls below 1 ms at those speeds: a channel estimate goes stale within a subframe, which is why reference-signal density and fast link adaptation matter.</p>
        <p>LTE was designed to work up to 350 km/h. On a motorway with cells every 1–2 km, a car at 120 km/h changes cell every 30 to 60 seconds.</p>`,
      mount: 'doppler',
      takeaway: 'f_D = v·f/c. Faster or higher-frequency means the channel changes faster.',
      specs: ['TS 36.104 Annex B', 'TS 22.185'],
    },
  ],
  challenges: [
    {
      type: 'handover', title: 'Handover highway',
      intro: 'Cell A is at 0 m, cell B at 1000 m. The car drives from 200 m to 960 m. Set the hysteresis and time-to-trigger, press Drive and read the RRC log. A clean run has exactly one handover to B, no ping-pong and no failure.',
      missions: [
        { name: 'City street, 60 km/h', speeds: [60], preset: [0.5, 40], solution: [3, 160], story: 'The settings came from a lab test: 0.5 dB hysteresis and 40 ms time-to-trigger. Drive through the border and watch the log, then fix them.', debrief: 'At 60 km/h the car lingers near the cell border, and shadow fading makes the two cells swap places for a moment. Hysteresis and time-to-trigger stop those brief swaps from causing handovers back and forth.' },
        { name: 'Motorway, 250 km/h', speeds: [250], preset: [5, 640], solution: [2, 160], story: 'The city team over-corrected and set 5 dB and 640 ms everywhere. Try that on the high-speed corridor.', debrief: 'The two margins add up. A 5 dB hysteresis means the neighbour must already be far stronger before the clock even starts, and at 69 m/s the 640 ms time-to-trigger adds another 44 m. Together they delay the command until the old cell can no longer deliver it. Cutting either one fixes it: what matters at high speed is the total delay, hysteresis distance plus TTT distance. RRC mobility-state scaling shortens TTT automatically for fast UEs.' },
        { name: 'One setting for every speed', speeds: [60, 120, 250], solution: [3, 160], story: 'The network can only hold one setting for this cell pair. Find hysteresis and TTT that give a clean handover at 60, 120 and 250 km/h.', debrief: 'Robust settings sit in the middle: enough margin to ignore fading, fast enough for fast cars. Real networks add speed-dependent scaling on top.' },
      ],
      finale: 'You have felt the core trade-off of mobility management: ping-pong against late handover.',
    },
    {
      type: 'calc', title: 'Doppler drills',
      items: [
        { q: 'Doppler shift for a car at 108 km/h (30 m/s) on a 2 GHz carrier? (f_D = v·f/c, c = 3×10⁸ m/s)', answer: 200, tol: 2, unit: 'Hz', solution: '30 × 2×10⁹ / 3×10⁸ = 200 Hz.', hint: 'Convert km/h to m/s first: divide by 3.6.' },
        { q: 'Same car, but on a 5.9 GHz carrier?', answer: 590, tol: 5, unit: 'Hz', solution: '30 × 5.9×10⁹ / 3×10⁸ = 590 Hz. Higher frequency, proportionally more Doppler.', hint: 'Doppler scales linearly with carrier frequency.' },
        { q: 'Approximate coherence time for a 463 Hz Doppler shift (Tc ≈ 0.423 / f_D), in ms?', answer: 0.91, tol: 0.03, unit: 'ms', solution: '0.423 / 463 ≈ 0.000914 s ≈ 0.91 ms, less than one subframe.', hint: 'Compute 0.423 / 463 and convert seconds to milliseconds.' },
        { q: 'Cells are 1.5 km apart along a motorway. A car drives at 120 km/h. Roughly how many seconds between handovers?', answer: 45, tol: 1, unit: 's', solution: '120 km/h = 33.3 m/s; 1500 / 33.3 = 45 s.', hint: 'Distance between cells divided by speed in m/s.' },
      ],
    },
  ],
  quiz: [
    { q: 'What does the A3 event mean?', options: ['A neighbour cell became better than the serving cell by an offset', 'The serving cell fell below an absolute threshold', 'The UE lost GNSS', 'A neighbour from another RAT became available'], answer: 0, why: 'A3 is the relative intra-frequency comparison. "Serving below a threshold" is A2; inter-RAT events are B1/B2.' },
    { q: 'Hysteresis and time-to-trigger are both set very low. What is the most likely problem?', options: ['Ping-pong handovers', 'Radio link failure from late handovers', 'No handovers at all', 'The PCI changes'], answer: 0, why: 'Low margins let short fades trigger handovers back and forth. High margins cause late handovers.' },
    { q: 'Who decides a handover in RRC_CONNECTED?', options: ['The source eNB, based on the UE’s measurement reports', 'The UE alone', 'The MME', 'The V2X AS'], answer: 0, why: 'LTE handover is network-controlled and UE-assisted.' },
    { q: 'After the handover, who changes the downlink path in the core?', options: ['The MME, by asking the S-GW to modify the bearer (path switch)', 'The UE, by sending a new attach', 'The P-GW, on its own', 'Nobody; the source eNB keeps forwarding forever'], answer: 0, why: 'Once the car has arrived, the new eNB asks the MME to switch the path, and the MME tells the S-GW to point the S1-U tunnel at the new eNB.' },
    { q: 'What does RSRP measure?', options: ['The average power of a reference-signal resource element', 'The total received power across the band', 'The block error rate', 'The timing advance'], answer: 0, why: 'RSRP is per-RE reference-signal power. Total power is RSSI; RSRQ relates the two.' },
  ],
  recap: `<ul><li>Idle-mode reselection versus connected-mode handover.</li><li>RSRP, RSRQ and SINR.</li><li>The A3 condition and how hysteresis and TTT trade ping-pong against failure.</li><li>The X2 handover steps and the path switch.</li><li>Doppler and coherence time at speed.</li></ul>`,
});

defineExit({
  id: 10, num: '10', title: 'Lock It Down', subtitle: 'Security and privacy on Uu', mins: 16,
  topics: ['AKA · AUTN', 'Key hierarchy', 'GUTI · SUCI', 'Ciphering vs integrity', 'IEEE 1609.2'],
  cards: [
    {
      title: 'Two layers of trust',
      body: `<p class="lead">A V2X message over Uu is protected twice, by two different systems that answer two different questions.</p>
        <p><b>3GPP network security</b> answers: is this SIM allowed on the network, and can anyone listen to or tamper with the radio link and the signalling? It covers the car-to-eNB link and NAS signalling to the MME. It ends at the eNB (radio) and the MME (NAS).</p>
        <p><b>V2X application security</b> answers: did this message really come from a legitimate vehicle, and was it changed? The sender signs each message with a certificate under [[IEEE 1609.2]] (US, managed by the [[SCMS]]) or ETSI TS 103 097 (Europe). The signature travels with the message end to end, through the V2X AS and the broadcast, all the way to the receiving car.</p>
        <p>Only the second kind lets car B trust car A, because car B never sees car A's radio keys.</p>`,
      takeaway: '3GPP security protects the link hop by hop. 1609.2 signatures protect the message end to end.',
      specs: ['TS 33.401', 'TS 33.185', 'IEEE 1609.2', 'ETSI TS 103 097'],
    },
    {
      title: 'AKA: proving identity both ways',
      body: `<p class="lead">LTE authentication is mutual. The car proves itself to the network, and the network proves itself to the car.</p>
        <ol><li>A secret key <b>K</b> lives only in the USIM and in the operator's HSS/AuC.</li>
        <li>The HSS creates an authentication vector: a random challenge RAND, the token [[AUTN]], the expected answer XRES, and the key [[K_ASME]].</li>
        <li>The MME sends RAND and AUTN to the car.</li>
        <li>The USIM checks AUTN: its MAC proves the challenge came from the home network, and its sequence number proves it is fresh (not replayed). Then it computes RES and the same keys.</li>
        <li>The car answers RES; the MME compares it with XRES.</li></ol>
        <p>Because the network must prove it knows K, a fake base station cannot complete AKA. That closes the classic GSM hole, where only the phone was authenticated.</p>`,
      takeaway: 'AKA: AUTN proves the network is real and fresh; RES proves the SIM is real. Both derive K_ASME.',
      detail: `<p>AUTN = (SQN ⊕ AK) ‖ AMF ‖ MAC. The algorithm set is operator-chosen; MILENAGE (AES-based) is the common one, TUAK the alternative. K_ASME is bound to the serving network’s identity, so keys from one network are useless in another. 5G uses 5G-AKA or EAP-AKA′ with an extra confirmation step by the home network.</p>`,
      specs: ['TS 33.401 §6.1', 'TS 33.102', 'TS 33.501'],
    },
    {
      title: 'The key ladder',
      wide: true,
      body: `<p class="lead">One long-term secret produces a whole family of short-lived keys, each with one job.</p>
        <ul><li>From K: <b>CK</b> and <b>IK</b> (computed in USIM and AuC).</li>
        <li>From CK and IK: <b>K<sub>ASME</sub></b>, held by the MME.</li>
        <li>From K<sub>ASME</sub>: the NAS keys (K<sub>NASenc</sub>, K<sub>NASint</sub>), the base station key <b>[[K_eNB]]</b>, and NH (next hop) for later handovers.</li>
        <li>From K<sub>eNB</sub>: the radio keys K<sub>RRCenc</sub>, K<sub>RRCint</sub> and K<sub>UPenc</sub>.</li></ul>
        <p>At every handover a new K<sub>eNB</sub> is derived, so the target eNB cannot decrypt traffic from before it took over. Ciphering algorithms are EEA1 (SNOW 3G), EEA2 (AES) and EEA3 (ZUC); integrity uses EIA1–EIA3 with the same ciphers.</p>
        <p><b>Note:</b> in LTE, user-plane data is ciphered but <i>not integrity-protected</i> on the radio. Only signalling (RRC, NAS) gets integrity. NR adds optional user-plane integrity.</p>`,
      fig: KEY_TREE,
      cap: 'LTE key hierarchy. Encryption keys end in "enc", integrity keys in "int".',
      takeaway: 'K → CK/IK → K_ASME → (NAS keys, K_eNB) → (RRC and UP keys). New K_eNB at every handover.',
      specs: ['TS 33.401 §6.2, §7.2'],
    },
    {
      title: 'Hiding who you are',
      body: `<p class="lead">A car that announces a permanent identity can be tracked. 3GPP avoids sending it.</p>
        <ul><li>The permanent [[IMSI]] is sent only when the network does not know the car yet.</li>
        <li>After attach the MME assigns a [[GUTI]] (and its short form, the S-TMSI), changed from time to time. On the radio the car is just a [[C-RNTI]].</li>
        <li>5G goes further: the car never sends its [[SUPI]] in clear. It sends a [[SUCI]], with the subscriber part encrypted using the home network's public key, which defeats "IMSI catchers".</li></ul>
        <p>For V2X, privacy has a second side. Signed V2X messages use <b>pseudonym certificates</b> that change regularly so observers cannot link one car's messages over a long trip. On PC5, 3GPP lets the car change its sidelink Layer-2 identity and IP address together with its pseudonym, so the radio identifiers do not give it away. Over Uu that trick does not work: the operator always knows which subscription sent a message, and the V2X AS sees an IP address. TS 33.185 says plainly that it provides no technical solution for this; privacy over Uu rests on operator policy, regulation and data minimisation.</p>`,
      takeaway: 'GUTI and C-RNTI hide the IMSI; 5G SUCI encrypts it. Pseudonym certificates hide the car at application level.',
      specs: ['TS 33.401', 'TS 33.501 §6.12', 'TS 33.185'],
    },
    {
      title: 'The signed V2X message',
      body: `<p class="lead">Whatever road it takes, the V2X message itself carries its own proof.</p>
        <p>An IEEE 1609.2 signed message wraps the payload with header information (the service identifier PSID, generation time, sometimes location), the signer (a full certificate, or an 8-byte digest of a certificate the receiver already has), and an ECDSA signature, usually on the P-256 curve.</p>
        <p>The receiver checks the signature, the certificate chain up to a trusted root, the permissions in the certificate (is this certificate allowed to send this kind of message?) and the revocation lists. Misbehaving cars are reported and their certificates revoked.</p>
        <p>The V2X AS can verify messages too before rebroadcasting them, which stops a forged message from being amplified to a whole region.</p>`,
      takeaway: 'End-to-end trust = signature + certificate chain + permissions + revocation, independent of Uu or PC5.',
      detail: `<p>This is the bridge to the IEEE 1609 world: the same 1609.2 security services (and the 1609.2.1 SCMS interfaces for obtaining certificates) apply whether the message is carried by WSMP over PC5 or by UDP/IP over Uu.</p>`,
      specs: ['IEEE 1609.2', 'IEEE 1609.2.1', 'TS 33.185'],
    },
  ],
  challenges: [
    {
      type: 'classify', title: 'Climb the key ladder',
      intro: 'For each key, choose the key it is directly derived from.',
      bins: [{ id: 'k', label: 'K', hint: 'USIM and HSS' }, { id: 'ckik', label: 'CK + IK' }, { id: 'kasme', label: 'K-ASME', hint: 'MME' }, { id: 'kenb', label: 'K-eNB', hint: 'eNB' }],
      items: [
        { text: 'CK and IK', bin: 'k', why: 'Computed from K and RAND by the AKA functions in the USIM and AuC.' },
        { text: 'K-ASME', bin: 'ckik', why: 'Derived from CK and IK together with the serving network identity.' },
        { text: 'K-NASenc and K-NASint', bin: 'kasme', why: 'The MME derives the NAS keys from K-ASME.' },
        { text: 'K-eNB', bin: 'kasme', why: 'The MME derives it and hands it to the eNB in the Initial Context Setup.' },
        { text: 'K-RRCenc and K-RRCint', bin: 'kenb', why: 'The eNB derives the RRC keys from K-eNB.' },
        { text: 'K-UPenc', bin: 'kenb', why: 'The user-plane ciphering key also comes from K-eNB.' },
        { text: 'NH (next hop) for later handovers', bin: 'kasme', why: 'NH is computed from K-ASME so the MME can give future target eNBs fresh keys.' },
      ],
    },
    {
      type: 'classify', title: 'Threat and defence',
      intro: 'Pick the mechanism that stops each attack.',
      bins: [{ id: 'aka', label: 'AKA mutual authentication' }, { id: 'cipher', label: 'Radio ciphering' }, { id: 'int', label: 'RRC/NAS integrity' }, { id: 'tmp', label: 'Temporary IDs / SUCI' }, { id: 'sig', label: 'IEEE 1609.2 signature' }],
      items: [
        { text: 'A fake base station pretends to be the car’s operator.', bin: 'aka', why: 'It cannot produce a valid AUTN without the home network’s K.' },
        { text: 'An eavesdropper records the car’s uplink V2X packets off the air.', bin: 'cipher', why: 'User-plane data is ciphered with K-UPenc in PDCP.' },
        { text: 'An attacker alters an RRC handover command in flight.', bin: 'int', why: 'RRC messages carry a MAC computed with K-RRCint; a modified message fails the check.' },
        { text: 'An IMSI catcher tries to track a vehicle by its permanent identity.', bin: 'tmp', why: 'GUTI/S-TMSI replace the IMSI; in 5G the SUPI is only sent concealed as a SUCI.' },
        { text: 'An app on a valid SIM, but with no V2X certificate, uploads fake "emergency brake" messages to the V2X AS.', bin: 'sig', why: '3GPP security cannot help: the sender is a legitimate subscriber. Without a valid certificate the message cannot carry a valid IEEE 1609.2 signature, so receivers (and the V2X AS) reject it. A car with a genuine certificate that lies needs misbehaviour detection and revocation instead.' },
        { text: 'A captured NAS message is replayed later.', bin: 'int', why: 'NAS integrity includes a counter (NAS COUNT), so a replayed message is rejected.' },
      ],
    },
  ],
  quiz: [
    { q: 'In LTE, is user-plane data integrity-protected on the radio link?', options: ['No; it is ciphered only', 'Yes, always', 'Only for V2X bearers', 'Only in MBSFN'], answer: 0, why: 'LTE integrity covers RRC and NAS signalling. NR adds optional user-plane integrity.' },
    { q: 'K-eNB is derived from…', options: ['K-ASME', 'K-RRCint', 'The PCI', 'The C-RNTI'], answer: 0, why: 'The MME derives K-eNB from K-ASME and passes it to the eNB.' },
    { q: 'What does AUTN let the USIM check?', options: ['That the challenge came from its home network and is fresh', 'That the eNB has enough capacity', 'That the car has a valid 1609.2 certificate', 'The timing advance'], answer: 0, why: 'AUTN carries a MAC and a masked sequence number: authenticity and freshness.' },
    { q: 'What is a SUCI?', options: ['The SUPI with its subscriber part encrypted by the home network’s public key', 'A temporary radio identity', 'A sidelink resource pool', 'A QoS identifier'], answer: 0, why: 'SUCI protects the permanent identity even on the very first contact.' },
    { q: 'Car B receives a hazard warning via Uu broadcast. What lets it trust that car A really sent it?', options: ['The IEEE 1609.2 / ETSI signature and certificate on the message', 'The 3GPP AS ciphering between car A and its eNB', 'Car B’s own K-eNB', 'The TMGI'], answer: 0, why: 'Radio security ends at car A’s eNB. Only the application-layer signature survives end to end.' },
  ],
  recap: `<ul><li>Why 3GPP security and V2X application security are both needed.</li><li>How AKA authenticates both sides.</li><li>The key hierarchy and what changes at handover.</li><li>How identities are hidden, and the pseudonym problem over Uu.</li><li>What a 1609.2 signed message contains and how it is checked.</li></ul>`,
});

defineExit({
  id: 11, num: '11', title: 'The Conductor', subtitle: 'How Uu controls the PC5 sidelink', mins: 14,
  topics: ['Mode 3 / Mode 1', 'SIB21', 'SidelinkUEInformation', 'SL BSR · DCI 5A', 'SL SPS · DCI 3_0 / 3_1'],
  cards: [
    {
      title: 'Two sidelink modes',
      body: `<p class="lead">The sidelink (PC5) can get its radio resources in two ways, and one of them is run entirely over Uu.</p>
        <ul><li><b>[[Mode 3]]</b> (LTE) / <b>Mode 1</b> (NR): <b>scheduled</b>. The base station tells the car exactly which sidelink resources to use, over the Uu downlink.</li>
        <li><b>[[Mode 4]]</b> (LTE) / <b>Mode 2</b> (NR): <b>autonomous</b>. The car senses the channel and picks its own resources. Works with no network at all.</li></ul>
        <p>Mode 3 lets the operator coordinate PC5 transmissions centrally, avoiding collisions, but it needs Uu coverage and adds Uu signalling. This exit covers that Uu side. PC5 Quest covers the sidelink itself.</p>`,
      takeaway: 'Mode 3 / Mode 1: the eNB/gNB schedules PC5 over Uu. Mode 4 / Mode 2: the car schedules itself.',
      specs: ['TS 36.300 §23.14', 'TS 38.300 §16.9'],
    },
    {
      title: 'Permission and configuration',
      body: `<p class="lead">Before any sidelink grant, three things happen on Uu.</p>
        <ol><li><b>Authorisation.</b> At attach, the MME told the eNB "V2X services authorised" and the car's PC5 [[AMBR]] (Exit 5). Without that, no Mode 3.</li>
        <li><b>[[SIB21]].</b> The cell broadcasts its V2X sidelink configuration: receive resource pools, transmit pools for autonomous use and exceptional cases, synchronisation settings, and related parameters.</li>
        <li><b>SidelinkUEInformation.</b> The connected car tells the eNB it wants to transmit V2X on the sidelink, on which frequency, and to which destinations. The eNB answers with an <b>RRCConnectionReconfiguration</b> that sets the car up for scheduled transmission and gives it a <b>[[SL-V-RNTI]]</b>.</li></ol>`,
      takeaway: 'Authorised by the MME, configured by SIB21 and RRC, identified by an SL-V-RNTI.',
      specs: ['TS 36.331 §5.10', 'TS 36.413 (V2X Services Authorized)'],
    },
    {
      title: 'Asking for and granting sidelink resources',
      wide: true,
      body: `<p class="lead">The grant loop looks like the Uu uplink loop, with a sidelink twist.</p>
        <ol><li>A V2X message arrives for PC5. The car sends a <b>sidelink BSR</b>, a MAC control element on the Uu uplink (PUSCH) that reports how much data waits per destination and priority group. If it has no uplink grant, it first sends an SR.</li>
        <li>The eNB sends <b>DCI format 5A</b> on the Uu PDCCH, scrambled with the car's SL-V-RNTI. It tells the car which sidelink subchannels to use and the time gap to an optional retransmission; the first transmission goes in the first sidelink subframe at least 4 ms after the DCI.</li>
        <li>The car transmits on PC5: control on the [[PSCCH]] and data on the [[PSSCH]], at least 4 ms after the DCI.</li></ol>
        <p>The PDCCH can be on a licensed Uu carrier while the sidelink runs on the 5.9 GHz ITS carrier: DCI 5A includes a carrier indicator for this <b>cross-carrier scheduling</b>.</p>`,
      fig: `<div class="scroll-x">${seqSVG([{ id: 'ue', name: 'Car A', kind: 'ue' }, { id: 'enb', name: 'eNB', kind: 'ran' }, { id: 'b', name: 'Nearby cars (PC5)', kind: 'ue' }], [
        { from: 'enb', to: 'ue', label: 'SIB21: V2X sidelink config', kind: 'dl' }, { from: 'ue', to: 'enb', label: 'SidelinkUEInformation', kind: 'ul' },
        { from: 'enb', to: 'ue', label: 'RRC Reconfig. (scheduled, SL-V-RNTI)', kind: 'dl' }, { from: 'ue', to: 'enb', label: 'SR, then SL BSR (MAC CE on PUSCH)', kind: 'ul' },
        { from: 'enb', to: 'ue', label: 'PDCCH: DCI 5A (SL-V-RNTI)', kind: 'dl' }, { from: 'ue', to: 'b', label: 'PSCCH + PSSCH on PC5', kind: 'sl' }], { colW: 250, aria: 'Mode 3 sidelink scheduling over Uu' })}</div>`,
      takeaway: 'SL BSR up on Uu → DCI 5A down on Uu → transmission on PC5.',
      detail: `<p>DCI 5A carries: a carrier indicator (3 bits), the lowest index of the subchannel allocation for the initial transmission, the SCI format 1 fields for frequency resource location of initial transmission and retransmission and the time gap between them, an SL index for TDD, and, when scrambled with the SL-SPS-V-RNTI, an SPS configuration index and an activation/release flag.</p>`,
      specs: ['TS 36.212 §5.3.3.1.9A', 'TS 36.321 §5.14', 'TS 36.213 §14.1'],
    },
    {
      title: 'Sidelink SPS and the NR version',
      body: `<p class="lead">Periodic sidelink traffic gets the same Rel-14 treatment as the Uu uplink.</p>
        <ul><li>The eNB can configure up to <b>8 sidelink SPS configurations</b>, each activated or released by a DCI 5A scrambled with the SL-SPS-V-RNTI.</li>
        <li>The car's [[UE assistance information]] reports its sidelink traffic pattern (period, timing offset, size, priority), so the eNB can line the SPS up with message generation.</li></ul>
        <p>NR Uu (Rel-16) schedules sidelink with new DCI formats:</p>
        <ul><li><b>DCI 3_0</b> schedules NR sidelink (Mode 1): dynamic grants, activation and release of type 2 configured grants, and retransmission resources. Type 1 configured grants are set up by RRC alone, with no DCI. The car reports sidelink HARQ feedback back to the gNB on the PUCCH.</li>
        <li><b>DCI 3_1</b> lets an NR cell activate or release <b>LTE</b> sidelink SPS (cross-RAT). It does not give dynamic LTE sidelink grants.</li>
        <li>NR SIB12 carries the NR sidelink configuration; SIB13 and SIB14 carry LTE V2X sidelink configuration from an NR cell.</li></ul>`,
      takeaway: 'LTE: DCI 5A (+ SL SPS). NR: DCI 3_0 for NR sidelink, DCI 3_1 to activate or release LTE sidelink SPS.',
      specs: ['TS 38.212 §7.3.1.4', 'TS 38.331 (SIB12–14)'],
    },
  ],
  challenges: [
    {
      type: 'sequence', title: 'Run a Mode 3 grant', colW: 250,
      lanes: [{ id: 'ue', name: 'Car A', kind: 'ue' }, { id: 'enb', name: 'eNB', kind: 'ran' }, { id: 'b', name: 'Nearby cars', kind: 'ue' }],
      intro: 'Car A is attached and authorised for V2X. Put the steps in order until its first sidelink transmission.',
      steps: [
        { text: 'Car reads SIB21, the cell’s V2X sidelink configuration', short: 'SIB21', from: 'enb', to: 'ue', kind: 'dl', why: 'Broadcast configuration: pools and synchronisation.', early: 'The car first needs to know how this cell runs the sidelink.' },
        { text: 'Car sends SidelinkUEInformation: wants to transmit V2X on this frequency', short: 'SidelinkUEInformation', from: 'ue', to: 'enb', kind: 'ul', why: 'Announces interest so the eNB can configure it.', early: 'The eNB cannot configure a car that has not said it wants to transmit.' },
        { text: 'eNB sends RRCConnectionReconfiguration: scheduled mode, SL-V-RNTI', short: 'RRC Reconfig.', from: 'enb', to: 'ue', kind: 'dl', why: 'The car now knows it must ask for grants and which RNTI to watch.', early: 'The eNB responds to the car’s SidelinkUEInformation.' },
        { text: 'Car sends a scheduling request, then a sidelink BSR on the PUSCH', short: 'SR + SL BSR', from: 'ue', to: 'enb', kind: 'ul', why: 'Reports how much sidelink data waits, per destination and priority.', early: 'Asking for sidelink resources only makes sense once the car is in scheduled mode.' },
        { text: 'eNB sends DCI format 5A on the PDCCH, scrambled with the SL-V-RNTI', short: 'DCI 5A', from: 'enb', to: 'ue', kind: 'dl', why: 'The sidelink grant: subchannels and timing on PC5.', early: 'The eNB grants after it knows how much data waits.' },
        { text: 'Car transmits PSCCH and PSSCH on the sidelink', short: 'PSCCH + PSSCH', from: 'ue', to: 'b', kind: 'sl', why: 'The actual V2X message goes car to car over PC5.', early: 'The car needs a grant first.' },
      ],
    },
    {
      type: 'classify', title: 'Uu or PC5?',
      intro: 'Which interface carries each item?',
      bins: [{ id: 'uu', label: 'Uu' }, { id: 'pc5', label: 'PC5' }],
      items: [
        { text: 'SIB21', bin: 'uu', why: 'System information is broadcast by the eNB on the Uu downlink.' },
        { text: 'Sidelink BSR', bin: 'uu', why: 'A MAC control element on the Uu uplink (PUSCH).' },
        { text: 'DCI format 5A', bin: 'uu', why: 'Sent on the Uu PDCCH.' },
        { text: 'SCI format 1 describing the data transmission', bin: 'pc5', why: 'Sidelink control information rides the PSCCH on PC5.' },
        { text: 'The BSM or CAM itself, sent in Mode 3', bin: 'pc5', why: 'Mode 3 only changes who chooses the resources; the message still goes over PC5.' },
        { text: 'UE assistance information about sidelink traffic', bin: 'uu', why: 'An RRC message to the eNB.' },
        { text: 'Sidelink synchronisation signals between cars', bin: 'pc5', why: 'Transmitted on the sidelink for cars that need a timing reference.' },
        { text: 'DCI 3_0 scheduling NR sidelink', bin: 'uu', why: 'NR Uu PDCCH.' },
      ],
    },
  ],
  quiz: [
    { q: 'Which DCI format grants LTE-V2X sidelink resources?', options: ['5A', '0', '3_0', '1A'], answer: 0, why: '5A for LTE-V2X (Rel-14). 3_0 is NR sidelink, 0 is Uu uplink, 1A is downlink.' },
    { q: 'Which RNTI scrambles a dynamic Mode 3 sidelink grant?', options: ['SL-V-RNTI', 'C-RNTI', 'G-RNTI', 'P-RNTI'], answer: 0, why: 'SL-V-RNTI for dynamic grants; SL-SPS-V-RNTI for sidelink SPS.' },
    { q: 'Which LTE sidelink mode works without any network coverage?', options: ['Mode 4', 'Mode 3', 'Both', 'Neither'], answer: 0, why: 'Mode 4 is autonomous. Mode 3 needs Uu for every grant.' },
    { q: 'How does the sidelink BSR reach the eNB?', options: ['As a MAC control element on the Uu PUSCH', 'On the PSCCH', 'In SIB21', 'Through the V2X AS'], answer: 0, why: 'It is a Uu uplink MAC CE, just like the ordinary BSR.' },
    { q: 'Which NR DCI format lets an NR cell activate LTE sidelink SPS?', options: ['3_1', '3_0', '5A', '0_1'], answer: 0, why: '3_1 is the cross-RAT case (activation and release of LTE sidelink SPS only). 3_0 schedules NR sidelink; 0_1 is an NR uplink grant.' },
  ],
  recap: `<ul><li>The difference between scheduled and autonomous sidelink.</li><li>The Uu steps before a sidelink grant: authorisation, SIB21, SidelinkUEInformation, RRC configuration.</li><li>The SL BSR → DCI 5A → PC5 loop, cross-carrier scheduling and sidelink SPS.</li><li>The NR equivalents: DCI 3_0 and 3_1, SIB12–14.</li></ul>`,
});

defineExit({
  id: 12, num: '12', title: '5G NR Uu', subtitle: 'What changes on the 5G Uu interface', mins: 18,
  topics: ['Numerology μ', 'SSB · BWP · beams', 'Flexible timing · configured grant', 'SDAP · QoS flows', 'Slice SST 4 · 5QI 85/86'],
  cards: [
    {
      title: 'Flexible numerology',
      body: `<p class="lead">LTE has one subcarrier spacing. NR has a family of them, called the <b>[[Numerology|numerology]]</b> μ.</p>
        <p>Subcarrier spacing is 15 · 2<sup>μ</sup> kHz. A slot is always 14 symbols, so it shrinks as the spacing grows: 1 ms at 15 kHz, 0.5 ms at 30 kHz, 0.125 ms at 120 kHz.</p>
        <ul><li><b>[[FR1]]</b> (below 7.125 GHz): 15, 30 or 60 kHz, carriers up to 100 MHz.</li>
        <li><b>[[FR2]]</b> (millimetre wave): 60 or 120 kHz for data, carriers up to 400 MHz; 240 kHz for synchronisation blocks.</li></ul>
        <p>Wider spacing means shorter slots (lower latency) and more tolerance to [[Doppler]] and phase noise, but a shorter cyclic prefix (less tolerance to long echoes). Move the slider to see the trade.</p>
        <p>An NR resource block is still 12 subcarriers, but it is defined in frequency only; time is counted in symbols and slots.</p>`,
      mount: 'numerology',
      takeaway: 'SCS = 15·2^μ kHz, slot = 1/2^μ ms. Wider spacing: faster slots, more Doppler tolerance, shorter CP.',
      detail: `<p>A <b>[[Mini-slot]]</b> of 2, 4 or 7 symbols can start at almost any symbol, so an urgent packet does not wait for the next slot boundary. With 30 kHz and a 2-symbol mini-slot the transmission itself lasts about 71 µs. Rel-17 added 480 and 960 kHz for the 52.6–71 GHz range.</p>`,
      specs: ['TS 38.211 §4', 'TS 38.101-1', 'TS 38.101-2'],
    },
    {
      title: 'Beams, SSB and bandwidth parts',
      body: `<p class="lead">NR was designed to be lean and beam-based.</p>
        <ul><li><b>[[SSB]]</b>: PSS, SSS and PBCH travel together in a block of 4 symbols × 240 subcarriers. The gNB sweeps SSBs across beams (up to 4, 8 or 64 per burst depending on the band), by default every 20 ms. The car picks the best beam during access.</li>
        <li><b>No always-on CRS.</b> Reference signals are sent only where needed (DMRS with data, CSI-RS for measurements, phase-tracking RS at high frequency). That saves energy and interference.</li>
        <li><b>1008 PCIs</b> instead of 504.</li>
        <li><b>[[BWP|Bandwidth parts]]</b>: a car can work in a slice of a wide carrier and switch between slices, which saves power and lets different devices share one carrier.</li>
        <li><b>Coding</b>: [[LDPC]] for data, polar codes for control.</li></ul>`,
      takeaway: 'Beam-swept SSBs, no CRS, 1008 PCIs, bandwidth parts, LDPC and polar codes.',
      specs: ['TS 38.211 §7.4.3', 'TS 38.213 §4', 'TS 38.212'],
    },
    {
      title: 'Faster loops',
      body: `<p class="lead">LTE's fixed n+4 timing is gone. NR timing is configurable and much shorter.</p>
        <ul><li>The DCI tells the car how many slots until the data (K0, K2) and until the HARQ feedback (K1). Fast UEs can answer within a fraction of a millisecond.</li>
        <li><b>[[Configured grant]]</b> replaces uplink SPS. Type 1 is fully configured by RRC and needs no activation DCI; type 2 is activated by DCI, like LTE SPS. Either way, periodic V2X traffic needs no request.</li>
        <li><b>Pre-emption</b> lets an urgent transmission cut into resources already given to someone else, with an indication so the victim can discard the damaged part.</li>
        <li><b>PDCP duplication</b> sends the same packet over two carriers or two links for reliability.</li></ul>
        <p>Together these support the URLLC target of 1 ms user-plane latency at 99.999% reliability on the radio.</p>`,
      takeaway: 'Flexible K0/K1/K2 timing, configured grants, pre-emption and duplication make NR Uu fast and reliable.',
      specs: ['TS 38.214 §5.1.2, §6.1.2', 'TS 38.321 §5.8.2', 'TS 38.323 §5.11'],
    },
    {
      title: 'The 5G core for V2X',
      wide: true,
      body: `<p class="lead">On top of the radio, the 5G system changes how V2X traffic is identified and treated (TS 23.287).</p>
        <ul><li><b>[[PDU session|PDU sessions]] and [[QoS flow|QoS flows]]</b> replace PDN connections and bearers. The new [[SDAP]] layer, above PDCP, maps each QoS flow to a radio bearer.</li>
        <li><b>Network slicing</b>: a slice is identified by an [[S-NSSAI]]; slice/service type <b>SST = 4 means V2X</b>. The V2X policy tells the car which slice and data network to use for each V2X service.</li>
        <li><b>V2X policy from the [[PCF]]</b>, delivered over N1 through the AMF.</li>
        <li><b>Delay-critical 5QIs</b> for advanced V2X, for example 5QI 85 (remote driving) and 86 (collision avoidance) with 5 ms budgets.</li>
        <li><b>Predictive QoS</b>: the [[NWDAF]] can warn the V2X application that QoS is likely to drop along a route, and alternative QoS profiles let the application degrade gracefully (for example lower video resolution for a remote operator) instead of failing.</li></ul>`,
      fig: stackSVG([
        { name: 'UE', layers: [{ t: 'V2X app', kind: 'v2x' }, { t: 'UDP / IP', kind: 'ue' }, { t: 'SDAP', kind: 'mbms' }, { t: 'PDCP', kind: 'ran' }, { t: 'RLC', kind: 'ran' }, { t: 'MAC', kind: 'ran' }, { t: 'PHY', kind: 'core' }] },
        { name: 'gNB', layers: [null, null, { t: 'SDAP', kind: 'mbms' }, { t: 'PDCP', kind: 'ran' }, { t: 'RLC', kind: 'ran' }, { t: 'MAC', kind: 'ran' }, { t: 'PHY', kind: 'core' }] },
        { name: 'UPF', layers: [null, { t: 'IP (routing)', kind: 'ue' }, { t: 'GTP-U', kind: 'core' }, { t: 'UDP/IP', kind: 'core' }, null, { t: 'L2', kind: 'core' }, { t: 'L1', kind: 'core' }] },
      ], { colW: 110, gap: 40, links: [{ from: 0, to: 1, label: 'NR-Uu', kind: 'up' }, { from: 1, to: 2, label: 'N3', kind: 'up' }], aria: 'NR user plane stack with SDAP' }),
      cap: 'NR user plane: SDAP is new. The gNB maps QoS flows (marked with a QFI in the N3 tunnel) onto data radio bearers.',
      takeaway: 'QoS flows + SDAP, slice SST 4 for V2X, PCF policy, 5QI 85/86, and predictive QoS.',
      detail: `<p>TS 22.186 lists the advanced V2X use-case groups: vehicle platooning, advanced driving, extended sensors and remote driving. Remote driving, for example, asks for 5 ms end-to-end latency, 99.999% reliability and about 25 Mbit/s uplink for video. Only NR Uu with an edge UPF (and NR sidelink for car-to-car) can approach those numbers.</p>`,
      specs: ['TS 23.287', 'TS 23.501 §5.7, §5.15', 'TS 23.288', 'TS 22.186'],
    },
  ],
  challenges: [
    {
      type: 'calc', title: 'Numerology drills',
      items: [
        { q: 'What is the subcarrier spacing for μ = 3?', answer: 120, tol: 0, unit: 'kHz', solution: '15 × 2³ = 120 kHz (FR2).', hint: '15 · 2^μ.' },
        { q: 'How long is one slot at μ = 2, in ms?', answer: 0.25, tol: 0.001, unit: 'ms', solution: '1 / 2² = 0.25 ms (14 symbols at 60 kHz).', hint: 'Slot length is 1/2^μ ms.' },
        { q: 'How many slots are in one 10 ms frame at 30 kHz spacing?', answer: 20, tol: 0, solution: '30 kHz is μ = 1: 2 slots per 1 ms subframe × 10 = 20.', hint: 'Find μ from the spacing, then 10 · 2^μ.' },
        { q: 'Useful symbol length (without CP) at 30 kHz, in µs?', answer: 33.3, tol: 0.2, unit: 'µs', solution: '1 / 30 000 Hz = 33.3 µs.', hint: 'Reciprocal of the spacing.' },
        { q: 'A car at 250 km/h on a 3.5 GHz NR carrier: Doppler shift in Hz? (c = 3×10⁸ m/s)', answer: 810, tol: 10, unit: 'Hz', solution: '69.4 m/s × 3.5×10⁹ / 3×10⁸ ≈ 810 Hz, about 2.7% of a 30 kHz subcarrier.', hint: '250 / 3.6 = 69.4 m/s.' },
      ],
    },
    {
      type: 'match', title: 'LTE to NR', left: 'LTE Uu', right: 'NR Uu',
      pairs: [
        { a: 'One 15 kHz subcarrier spacing', b: 'Numerology μ: 15·2^μ kHz', why: 'Several spacings, chosen per band and per bandwidth part.' },
        { a: 'Fixed 1 ms TTI', b: 'Slots and mini-slots', why: 'Slot length scales with μ; mini-slots of 2, 4 or 7 symbols.' },
        { a: 'Always-on CRS', b: 'No CRS; DMRS and CSI-RS on demand', why: 'Lean carrier design.' },
        { a: 'Turbo code for data', b: 'LDPC for data', why: 'Better at high throughput with parallel decoding.' },
        { a: 'Uplink SPS', b: 'Configured grant type 1 / type 2', why: 'Type 1 needs no DCI at all.' },
        { a: 'EPS bearer with a QCI', b: 'QoS flow with a 5QI, mapped by SDAP', why: 'Finer-grained QoS.' },
        { a: 'SIB21 (LTE V2X sidelink settings)', b: 'SIB12 (NR sidelink settings)', why: 'Functional counterparts. An NR cell that also configures LTE sidelink carries the SIB21 content in its SIB13 (and SIB14).' },
        { a: 'DCI 5A', b: 'DCI 3_0', why: 'Sidelink grants: LTE Mode 3 vs NR Mode 1.' },
      ],
    },
  ],
  quiz: [
    { q: 'What subcarrier spacing does μ = 1 give?', options: ['30 kHz', '15 kHz', '60 kHz', '120 kHz'], answer: 0, why: '15 × 2¹ = 30 kHz, common for mid-band FR1 (for example 3.5 GHz).' },
    { q: 'Which new NR user-plane layer maps QoS flows to radio bearers?', options: ['SDAP', 'PDCP', 'RLC', 'NAS'], answer: 0, why: 'SDAP sits above PDCP and marks packets with the QoS flow identifier.' },
    { q: 'Which slice/service type value is standardised for V2X?', options: ['SST = 4', 'SST = 1', 'SST = 2', 'SST = 3'], answer: 0, why: '1 = eMBB, 2 = URLLC, 3 = massive IoT, 4 = V2X.' },
    { q: 'What replaces LTE uplink SPS in NR?', options: ['Configured grant', 'Mini-slot', 'Bandwidth part', 'Pre-emption indication'], answer: 0, why: 'Configured grant type 1 (RRC only) and type 2 (RRC + DCI activation).' },
    { q: 'Which 5QI is defined for collision-avoidance V2X messages with a 5 ms budget?', options: ['86', '9', '79', '1'], answer: 0, why: '5QI 86: delay-critical GBR, 5 ms, 10⁻⁴. 5QI 85 (remote driving) also has 5 ms.' },
  ],
  recap: `<ul><li>NR numerology and the trade-offs of wider subcarrier spacing.</li><li>SSB beams, no CRS, bandwidth parts, LDPC and polar codes.</li><li>Flexible timing, configured grants, pre-emption and duplication.</li><li>QoS flows and SDAP, V2X slicing, PCF policy and predictive QoS.</li></ul>`,
});

defineExit({
  id: 13, num: 'END', final: true, title: 'Destination', subtitle: 'The grand tour: one hazard, end to end', mins: 15,
  topics: ['Everything, in story order', 'Certificate'],
  cards: [
    {
      title: 'Black ice at the overpass',
      body: `<p class="lead">It is 6:40 on a January morning. Car A crosses an overpass, and its traction control flags black ice.</p>
        <p>In the final exam you will follow that one warning all the way: from the moment car A's application builds the message, through the radio, the core and the V2X application server, out by broadcast to hundreds of cars, across a handover, and into car B's verification check.</p>
        <p>Each question is one step of the journey and draws on one or more exits. Every answer is explained, so even a wrong answer teaches the step. Score 50% or more to earn your certificate.</p>`,
      takeaway: 'You already know every piece. The exam asks you to put them in order.',
    },
  ],
  challenges: [],
  quizIntro: 'Follow the ice warning from car A to car B. Fourteen steps, all of them from earlier exits.',
  quiz: [
    { scene: 'Car A’s application builds a 300-byte hazard warning. Drivers up to 5 km behind should get it.', q: 'Which interface should carry it?', options: ['Uu, up to the V2X AS', 'PC5 only', 'Neither; hazards are only shown on the car’s own dashboard', 'GNSS'], answer: 0, why: 'PC5 reaches a few hundred metres. To cover 5 km the warning goes up over Uu to the V2X AS, which redistributes it. (Exits 1 and 8)' },
    { scene: 'Car A had been parked and its modem is in RRC_IDLE.', q: 'What is the very first thing it sends?', options: ['A random access preamble on the PRACH', 'The hazard message on the PUSCH', 'A scheduling request on the PUCCH', 'A measurement report'], answer: 0, why: 'An idle UE has no uplink timing or grant. It starts with Msg1 on the PRACH. (Exit 5)' },
    { scene: 'Car A is now connected but has no uplink grant. The warning is event-triggered, not periodic.', q: 'How does it get resources?', options: ['Scheduling request on PUCCH, then an uplink grant (DCI 0) on the PDCCH', 'It uses its SPS occasion', 'It transmits on the PDSCH', 'It asks the V2X AS'], answer: 0, why: 'Event-triggered traffic uses dynamic scheduling: SR, grant, then PUSCH, usually with a BSR. (Exit 7)' },
    { scene: 'The grant (DCI 0) arrives in subframe 12.', q: 'In which subframe does car A transmit the PUSCH?', options: ['16', '12', '13', '20'], answer: 0, why: 'LTE FDD n+4: 12 + 4 = 16. (Exit 7)' },
    { scene: 'The eNB fails to decode that first transmission and sends a NACK on the PHICH.', q: 'When does the uplink retransmission happen?', options: ['Subframe 24, 8 ms after the first attempt', 'Subframe 17', 'Whenever car A sends a new SR', 'Never; RLC will handle it'], answer: 0, why: 'LTE uplink HARQ is synchronous with an 8 ms round trip: 16 + 8 = 24. (Exit 7)' },
    { scene: 'Over the air, the 48-byte IPv6 + UDP header shrank to about 3 bytes.', q: 'Which layer did that?', options: ['PDCP, with ROHC', 'RLC', 'MAC', 'The P-GW'], answer: 0, why: 'Robust Header Compression runs in PDCP, which also ciphers the packet. (Exit 3)' },
    { scene: 'The eNB has the IP packet and must get it to the V2X AS.', q: 'Which path does it take?', options: ['S1-U (GTP-U) to the S-GW, S5 to the P-GW, SGi to the V2X AS', 'S1-MME to the MME, then S6a', 'X2 to a neighbour eNB', 'M1 to the MBMS-GW'], answer: 0, why: 'User data follows the user plane. The MME never carries user packets. (Exits 2 and 3)' },
    { scene: 'The operator put this V2X flow on a bearer with a 50 ms delay budget and no reserved bit rate.', q: 'Which QCI is that?', options: ['QCI 79', 'QCI 9', 'QCI 1', 'QCI 75'], answer: 0, why: 'QCI 79: non-GBR, 50 ms, for V2X messages on a unicast bearer. With reserved resources it would be QCI 3; QCI 75 is only for V2X over MBMS bearers. (Exit 6)' },
    { scene: 'The V2X AS works out that about 250 cars in 9 cells along 12 km of motorway need the warning.', q: 'What delivery is most efficient?', options: ['MBMS over an MBSFN area, requested over MB2', 'Unicast to each car', 'SC-PTM in one cell only', 'Ask each car to poll the server'], answer: 0, why: 'Many cars over a wide, stable area: one MBSFN broadcast beats 250 unicast copies, and the SFN gain helps at cell edges. (Exit 8)' },
    { scene: 'Car B is driving at 120 km/h and crosses from one cell to the next while the broadcast is on air.', q: 'Does the handover interrupt reception of the broadcast?', options: ['Not really: every cell in the MBSFN area sends the same signal in the same subframes', 'Yes, the broadcast restarts after every handover', 'Car B must leave the MBSFN area to receive it', 'Broadcast only works in RRC_IDLE'], answer: 0, why: 'MBSFN reception does not depend on the serving cell; all cells of the area transmit identically. (Exits 8 and 9)' },
    { scene: 'Car B decodes the warning.', q: 'How does car B know it really came from a legitimate vehicle and was not altered?', options: ['It verifies the IEEE 1609.2 signature and certificate chain', 'Car A’s radio ciphering proves it', 'The TMGI proves it', 'It trusts anything from the network'], answer: 0, why: '3GPP security ended at car A’s eNB. Only the application-layer signature survives end to end. (Exit 10)' },
    { scene: 'Car C is 20 m behind car A and must react within 20 ms.', q: 'What is the right way to warn car C?', options: ['Directly over PC5', 'The same Uu path via a central cloud', 'An over-the-air software update', 'Paging'], answer: 0, why: 'A round trip through the network costs tens of ms; PC5 delivers in a few ms and works without coverage. That is the next game. (Exits 1 and 7)' },
    { scene: 'Car A now also wants to send periodic status messages via Uu every 100 ms.', q: 'How should the network schedule them efficiently?', options: ['Uplink SPS, aligned using UE assistance information', 'A scheduling request before every message', 'Random access before every message', 'MBSFN in the uplink'], answer: 0, why: 'SPS avoids per-message SR and grant; UE assistance information lets the eNB align the occasions with message generation. (Exit 7)' },
    { scene: 'In a 5G network, a remote operator takes over car A to steer it around the icy section.', q: 'Which QoS fits the operator’s control link?', options: ['5QI 85 (remote driving, 5 ms)', 'QCI 9', '5QI 79 (50 ms)', 'QCI 1 (voice)'], answer: 0, why: 'Remote driving has its own delay-critical 5QI with a 5 ms budget and 10⁻⁵ error rate. (Exits 6 and 12)' },
  ],
  recap: `<ul><li>The complete Uu journey of a V2X message, from application to receiver.</li><li>When Uu is the right road, and when only PC5 will do.</li></ul><p>Next: <b>PC5 Quest</b>, the sidelink game.</p>`,
});
