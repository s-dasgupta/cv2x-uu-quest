/* ============================================================
   Content: Exits 1–4
   ============================================================ */

/* Shared architecture diagrams (used in Exit 2 and later) */
const EPS_DIAGRAM = {
  w: 900, h: 470, aria: 'LTE EPS architecture with V2X functions and MBMS',
  nodes: [
    { id: 'ue', label: 'UE', sub: 'vehicle', x: 60, y: 240, w: 92, kind: 'ue' },
    { id: 'enb', label: 'eNB', sub: 'E-UTRAN', x: 230, y: 240, w: 100, kind: 'ran' },
    { id: 'mme', label: 'MME', x: 400, y: 120 },
    { id: 'sgw', label: 'S-GW', x: 400, y: 240 },
    { id: 'mbmsgw', label: 'MBMS-GW', x: 400, y: 380, w: 104, kind: 'mbms' },
    { id: 'hss', label: 'HSS', x: 600, y: 60 },
    { id: 'pcrf', label: 'PCRF', x: 600, y: 150 },
    { id: 'pgw', label: 'P-GW', x: 600, y: 240 },
    { id: 'v2xcf', label: 'V2X CF', sub: 'control function', x: 800, y: 90, w: 110, kind: 'v2x' },
    { id: 'v2xas', label: 'V2X AS', sub: 'application server', x: 800, y: 240, w: 110, kind: 'v2x' },
    { id: 'bmsc', label: 'BM-SC', x: 800, y: 380, w: 100, kind: 'mbms' },
  ],
  links: [
    { a: 'ue', b: 'enb', label: 'LTE-Uu', why: 'The radio interface itself: PHY, MAC, RLC, PDCP and RRC run between the vehicle and the eNB.' },
    { a: 'enb', b: 'mme', label: 'S1-MME', kind: 'cp', why: 'Control plane between eNB and MME (S1-AP over SCTP): initial UE messages, context setup, handover signalling, paging.' },
    { a: 'enb', b: 'sgw', label: 'S1-U', kind: 'up', why: 'User plane between eNB and S-GW: a GTP-U tunnel per bearer carries the vehicle’s IP packets.' },
    { a: 'mme', b: 'sgw', label: 'S11', kind: 'cp', why: 'The MME asks the S-GW to create, modify and delete sessions and bearers (GTP-C).' },
    { a: 'mme', b: 'hss', label: 'S6a', kind: 'cp', why: 'Diameter link the MME uses to fetch authentication vectors and the subscription, including V2X authorisation.' },
    { a: 'sgw', b: 'pgw', label: 'S5/S8', kind: 'up', why: 'GTP tunnel between the two gateways. It is called S8 when the P-GW is in the home network of a roaming UE.' },
    { a: 'pgw', b: 'v2xas', label: 'SGi', kind: 'up', why: 'Plain IP from the P-GW out to a packet data network. The V2X AS sits on the far side of SGi.' },
    { a: 'pcrf', b: 'pgw', label: 'Gx', kind: 'cp', why: 'The PCRF pushes QoS and charging rules to the P-GW, which can trigger a dedicated bearer.' },
    { a: 'pcrf', b: 'v2xas', label: 'Rx', kind: 'cp', why: 'An application server can ask the PCRF for specific QoS for its flows.' },
    { a: 'hss', b: 'v2xcf', label: 'V4', kind: 'lg', why: 'The V2X Control Function fetches V2X subscription information from the HSS.' },
    { a: 'v2xcf', b: 'v2xas', label: 'V2', kind: 'lg', why: 'The V2X AS can give the V2X Control Function parameters to provision into UEs, for example local server addresses.' },
    { a: 'v2xas', b: 'bmsc', label: 'MB2', why: 'The V2X AS asks the BM-SC for MBMS bearers (MB2-C) and hands over the broadcast content (MB2-U).' },
    { a: 'bmsc', b: 'mbmsgw', label: 'SGmb/SGi-mb', why: 'SGmb carries MBMS session control and SGi-mb the broadcast content from the BM-SC to the MBMS gateway.' },
    { a: 'mbmsgw', b: 'enb', label: 'M1', kind: 'up', why: 'IP multicast from the MBMS-GW to every eNB of the broadcast area.' },
    { a: 'ue', b: 'v2xcf', label: 'V3', kind: 'lg', path: 'M60,221 V22 H800 V71', bx: 430, by: 22, why: 'The UE fetches its V2X authorisation and parameters from the V2X Control Function. It is logical: the packets ride the user plane through the eNB and gateways.' },
    { a: 'ue', b: 'v2xas', label: 'V1', kind: 'lg', path: 'M60,259 V455 H888 V240 H855', bx: 480, by: 455, why: 'Application traffic between the V2X application in the car and the V2X AS. Also logical: it rides LTE-Uu, S1-U, S5 and SGi.' },
  ],
};
const FIVEGS_DIAGRAM = {
  w: 900, h: 310, aria: '5G system architecture for V2X',
  nodes: [
    { id: 'ue', label: 'UE', sub: 'vehicle', x: 60, y: 250, w: 92, kind: 'ue' },
    { id: 'gnb', label: 'gNB', sub: 'NG-RAN', x: 230, y: 250, w: 100, kind: 'ran' },
    { id: 'udm', label: 'UDM', x: 420, y: 40 },
    { id: 'amf', label: 'AMF', x: 420, y: 140 },
    { id: 'pcf', label: 'PCF', sub: 'V2X policy', x: 620, y: 40, w: 104 },
    { id: 'smf', label: 'SMF', x: 620, y: 140 },
    { id: 'upf', label: 'UPF', x: 620, y: 250 },
    { id: 'nef', label: 'NEF', x: 820, y: 40 },
    { id: 'as', label: 'V2X AS', sub: 'AF / data network', x: 820, y: 250, w: 120, kind: 'v2x' },
  ],
  links: [
    { a: 'ue', b: 'gnb', label: 'NR-Uu' },
    { a: 'ue', b: 'amf', label: 'N1', kind: 'cp', path: 'M60,231 V140 H372', bx: 200, by: 140 },
    { a: 'gnb', b: 'amf', label: 'N2', kind: 'cp' },
    { a: 'gnb', b: 'upf', label: 'N3', kind: 'up', by: 250, bx: 470 },
    { a: 'smf', b: 'upf', label: 'N4', kind: 'cp' },
    { a: 'upf', b: 'as', label: 'N6', kind: 'up' },
    { a: 'amf', b: 'smf', label: 'N11', kind: 'cp' },
    { a: 'smf', b: 'pcf', label: 'N7', kind: 'cp' },
    { a: 'amf', b: 'pcf', label: 'N15', kind: 'cp' },
    { a: 'amf', b: 'udm', label: 'N8', kind: 'cp' },
    { a: 'nef', b: 'as', label: 'N33', kind: 'cp' },
  ],
};

const EXIT1_FIG = `<svg class="dg" viewBox="0 0 460 262" role="img" aria-label="Car A talks to car B directly over PC5, and to the network over Uu through a base station">
  <rect class="fill-surf" x="182" y="16" width="160" height="50" rx="25" style="stroke:var(--line-2)" stroke-width="1.5"/>
  <text class="t-md" x="262" y="38" text-anchor="middle">Core network</text><text class="t-sm t-mute" x="262" y="54" text-anchor="middle">+ V2X application server</text>
  <path class="ln up" d="M368,82 C368,60 356,48 342,44"/>
  <g class="stroke-ink" stroke-width="2"><line x1="352" y1="204" x2="370" y2="86"/><line x1="388" y1="204" x2="370" y2="86"/><line x1="358" y1="165" x2="382" y2="165"/><line x1="362" y1="128" x2="378" y2="128"/><line x1="356" y1="180" x2="384" y2="150"/></g>
  <rect class="fill-ink" x="359" y="80" width="6" height="18" rx="1"/><rect class="fill-ink" x="375" y="80" width="6" height="18" rx="1"/>
  <text class="t-md" x="408" y="122">eNB</text><text class="t-sm t-mute" x="408" y="138">or gNB</text>
  <rect class="fill-road" x="0" y="204" width="460" height="34"/>
  <line x1="0" x2="460" y1="221" y2="221" style="stroke:var(--lane)" stroke-width="2.5" stroke-dasharray="16 12"/>
  <g class="fill-blue"><rect x="62" y="184" width="66" height="20" rx="7"/><rect x="76" y="171" width="36" height="17" rx="6"/></g>
  <g class="fill-sign"><rect x="232" y="184" width="66" height="20" rx="7"/><rect x="246" y="171" width="36" height="17" rx="6"/></g>
  <g class="fill-ink"><circle cx="80" cy="205" r="6.5"/><circle cx="112" cy="205" r="6.5"/><circle cx="250" cy="205" r="6.5"/><circle cx="282" cy="205" r="6.5"/></g>
  <path class="ln ul" d="M110,168 L356,96" stroke-dasharray="7 5"/>
  <polygon class="ah ul" points="362,94 352,92 355,101"/>
  <text class="t-lg halo" x="215" y="124" text-anchor="middle" style="fill:var(--d-ul)">Uu</text>
  <text class="t-sm t-mute halo" x="215" y="140" text-anchor="middle">cellular, licensed band</text>
  <line class="ln sl" x1="134" y1="190" x2="226" y2="190"/>
  <polygon class="ah sl" points="232,190 223,186 223,194"/><polygon class="ah sl" points="128,190 137,186 137,194"/>
  <text class="t-md halo" x="181" y="182" text-anchor="middle" style="fill:var(--d-sl)">PC5</text>
  <text class="t-sm" x="95" y="254" text-anchor="middle">Car A (a UE)</text><text class="t-sm" x="265" y="254" text-anchor="middle">Car B</text>
</svg>`;

const V2X_TYPES = {
  w: 520, h: 250, aria: 'The four V2X communication types around a vehicle',
  nodes: [
    { id: 'v', label: 'Vehicle', sub: 'on-board UE', x: 260, y: 125, w: 120, kind: 'ue' },
    { id: 'v2', label: 'Other vehicle', x: 80, y: 40, w: 128 },
    { id: 'rsu', label: 'Roadside unit', sub: 'traffic light', x: 440, y: 40, w: 128, kind: 'ran' },
    { id: 'p', label: 'Pedestrian', sub: 'phone', x: 80, y: 210, w: 128 },
    { id: 'n', label: 'Network', sub: 'cloud servers', x: 440, y: 210, w: 128, kind: 'v2x' },
  ],
  links: [{ a: 'v', b: 'v2', label: 'V2V' }, { a: 'v', b: 'rsu', label: 'V2I' }, { a: 'v', b: 'p', label: 'V2P' }, { a: 'v', b: 'n', label: 'V2N', kind: 'up' }],
};

defineExit({
  id: 1, num: '1', title: 'On-Ramp', subtitle: 'What C-V2X is, and where Uu fits', mins: 12,
  topics: ['V2V · V2I · V2P · V2N', 'Uu vs PC5', 'Releases 14–18'],
  cards: [
    {
      title: 'Cars that talk',
      body: `<p class="lead">[[V2X]] means vehicle-to-everything: a car exchanging short messages with whatever around it can help it drive more safely or efficiently.</p>
        <p>There are four partners, and you will see these abbreviations everywhere:</p>
        <ul><li>[[V2V]]: with other vehicles (I am braking hard, I am changing lanes).</li>
        <li>[[V2I]]: with roadside infrastructure, such as a traffic light telling you when it turns red.</li>
        <li>[[V2P]]: with pedestrians and cyclists through their phones or wearables.</li>
        <li>[[V2N]]: with servers in the network, such as a traffic centre, a map service or a remote operator.</li></ul>
        <p><b>C-V2X</b> (cellular V2X) is the family of technologies [[3GPP]] built for this, starting with LTE in Release 14 and continuing with 5G [[NR]].</p>`,
      fig: archSVG(V2X_TYPES),
      cap: 'The four V2X communication types. Only V2N always needs the cellular network.',
      takeaway: 'V2X = V2V + V2I + V2P + V2N. C-V2X is the 3GPP (cellular) way to deliver all four.',
      detail: `<p>The service requirements for LTE-based V2X are in TS 22.185 (Rel-14); the enhanced 5G use cases (platooning, extended sensors, advanced and remote driving) are in TS 22.186 (Rel-15 onwards).</p>
        <p>C-V2X is not the only V2X radio: IEEE 802.11p, known as DSRC in the US and ITS-G5 in Europe, solves the same direct-communication problem with Wi-Fi-style radios. The application messages on top, such as the SAE J2735 [[BSM]] or the ETSI [[CAM]] and [[DENM]], and the security layer ([[IEEE 1609.2]]) are largely independent of which radio carries them.</p>`,
      specs: ['TS 22.185', 'TS 22.186', 'TR 22.885'],
    },
    {
      title: 'Two roads to talk: Uu and PC5',
      body: `<p class="lead">C-V2X gives a vehicle two radio interfaces, and this whole game is about the first one.</p>
        <p><b>[[Uu]], the network road.</b> The car is an ordinary cellular [[UE]]. It talks to a base station ([[eNB]] in LTE, [[gNB]] in 5G), which passes the data through the operator's core network to a server, and the answer comes back the same way. It uses the operator's licensed spectrum and needs coverage and a subscription.</p>
        <p><b>[[PC5]], the direct road.</b> The car talks straight to nearby cars, roadside units and phones over the [[Sidelink]], usually in the 5.9 GHz [[ITS]] band. No base station is needed, so it works in a tunnel or a rural gap.</p>
        <p>The name Uu comes from 3G (UMTS), where the radio link between the user equipment and the radio network was called Uu; LTE kept it as LTE-Uu and 5G as NR-Uu. PC5 comes from Rel-12 proximity services (ProSe), whose reference points are numbered PC1 to PC7; PC5 is the direct UE-to-UE one.</p>`,
      fig: EXIT1_FIG,
      cap: 'Car A can reach car B directly over PC5, or reach the network (and through it, anyone) over Uu.',
      takeaway: 'Uu = car ↔ base station ↔ core ↔ server. PC5 = car ↔ car directly. Same chipset, two roads.',
      detail: `<p>Uu is not only a data pipe. In LTE-V2X sidelink <b>transmission [[Mode 3]]</b> the eNB uses the Uu link to tell the car which PC5 resources to use. In <b>[[Mode 4]]</b> the car picks PC5 resources on its own. Exit 11 covers the Uu side of this.</p>
        <p>In the US, the FCC's 2020 decision reserved the upper 30 MHz of the 5.9 GHz band (5.895 to 5.925 GHz) for C-V2X sidelink. Uu runs in whatever cellular bands the operator owns, for example 700 MHz, 1.9 GHz, 2.5 GHz or 3.5 GHz.</p>`,
      specs: ['TS 23.285 §4.2', 'TS 36.300 §23.14', 'TS 23.303 (ProSe)'],
    },
    {
      title: 'What the Uu road is good at',
      body: `<p class="lead">Uu and PC5 complement each other. Knowing which one fits a message is half of V2X system design.</p>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Uu (network)</th><th>PC5 (direct)</th></tr></thead><tbody>
        <tr><td>Range</td><td>Whole city or country, through the network</td><td>A few hundred metres</td></tr>
        <tr><td>Reaches the cloud</td><td>Yes: maps, traffic centre, software updates, remote driving</td><td>No (only via an RSU with backhaul)</td></tr>
        <tr><td>Typical latency</td><td>Tens of ms; ~10–20 ms only with edge servers</td><td>A few ms</td></tr>
        <tr><td>Needs coverage</td><td>Yes</td><td>No</td></tr>
        <tr><td>Needs subscription</td><td>Yes</td><td>No (for safety messages)</td></tr>
        <tr><td>Spectrum</td><td>Operator's licensed bands, shared with phones</td><td>5.9 GHz ITS band</td></tr></tbody></table></div>
        <p>V2V, V2I and V2P messages can also travel over Uu: the car uploads the message to a [[V2X AS]], which sends it back down to every car in the area. Exit 8 builds exactly that path.</p>`,
      takeaway: 'Choose Uu for reach, the cloud and large areas; choose PC5 for the last few milliseconds and for places without coverage.',
      detail: `<p>TS 23.285 describes "V2X message transfer over LTE-Uu": uplink by unicast to the V2X AS, downlink by unicast or by [[MBMS]] broadcast. It also allows a local V2X AS close to the cells to cut latency.</p>
        <p>Latency targets in TS 22.185 are 100 ms for typical V2V/V2I/V2P messages, 20 ms for special cases such as pre-crash sensing, and 1000 ms for V2N. You will test those numbers in the latency lab in Exit 7.</p>`,
      specs: ['TS 22.185 §5', 'TS 23.285 §4.4'],
    },
    {
      title: 'The release timeline',
      body: `<p class="lead">C-V2X grew release by release. Each step added both sidelink and Uu features.</p>
        <ol class="miles">
        <li><b>Release 14 (2017): LTE-V2X.</b> PC5 sidelink Mode 3 and Mode 4. On Uu: multiple uplink [[SPS]] configurations, [[UE assistance information]], MBMS improvements for V2X, new QCIs for V2X messages, and the V2X Control Function and V2X AS in the core.</li>
        <li><b>Release 15 (2018): LTE-eV2X.</b> Sidelink carrier aggregation, 64QAM and lower latency. 5G NR Uu appears (non-V2X-specific, but usable for V2N).</li>
        <li><b>Release 16 (2020): NR-V2X.</b> NR sidelink with unicast and groupcast, NR Uu scheduling of both NR and LTE sidelink, and the 5G V2X architecture (TS 23.287) with the [[PCF]] provisioning V2X policy.</li>
        <li><b>Release 17 (2022).</b> Sidelink power saving for pedestrians, inter-UE coordination, and NR broadcast/multicast (MBS) on Uu.</li>
        <li><b>Release 18 (2024).</b> Sidelink evolution: unlicensed spectrum, carrier aggregation, LTE/NR co-channel coexistence and sidelink positioning.</li></ol>`,
      takeaway: 'Rel-14 = LTE-V2X (the baseline you will learn most). Rel-16 = NR-V2X and the 5G core version.',
      detail: `<p>The LTE Uu enhancements for V2X are summarised in TS 36.300 (section on V2X services) and detailed in TS 36.321 (MAC) and TS 36.331 (RRC). The architecture is TS 23.285 for EPS and TS 23.287 for 5GS. The NR side lives in TS 38.300, 38.321 and 38.331.</p>`,
      specs: ['TS 36.300', 'TS 23.285', 'TS 23.287', 'TS 38.300'],
    },
  ],
  challenges: [
    {
      type: 'classify', title: 'Which road should this message take?',
      intro: 'For each message decide whether it belongs on Uu, on PC5, or whether both are reasonable. Think about range, latency, coverage and where the other end lives.',
      bins: [{ id: 'uu', label: 'Uu', hint: 'through the network' }, { id: 'pc5', label: 'PC5', hint: 'direct sidelink' }, { id: 'both', label: 'Either works', hint: 'a design choice' }],
      items: [
        { text: 'An emergency-brake warning to the car 20 m behind you.', bin: 'pc5', why: 'It must arrive within a few milliseconds and must work even without coverage. A round trip through the core adds tens of ms for no benefit.' },
        { text: 'A traffic management centre warns every driver about a crash 5 km ahead.', bin: 'uu', why: 'The sender is a server and the receivers are spread over kilometres: classic V2N over Uu, often delivered by broadcast.' },
        { text: 'Downloading a high-definition map tile for the next 2 km.', bin: 'uu', why: 'Large data from a cloud service. Only the cellular network reaches the map server.' },
        { text: 'An over-the-air software update for the brake controller.', bin: 'uu', why: 'Hundreds of megabytes from the manufacturer’s servers: Uu, usually when the car is parked.' },
        { text: 'A remote operator steers a robotaxi around a work zone.', bin: 'uu', why: 'Remote driving is V2N by definition. 5G NR Uu has dedicated QoS for it (5QI 85, 5 ms budget).' },
        { text: 'Two cars negotiate a lane change inside a tunnel with no cell coverage.', bin: 'pc5', why: 'No coverage, so only the direct link is available.' },
        { text: 'A traffic light broadcasts its signal phase and timing (SPaT) to approaching cars.', bin: 'both', why: 'An RSU at the intersection can send it over PC5, and many cities also publish SPaT through cloud services over Uu. Both are deployed.' },
        { text: 'A pedestrian’s phone warns a turning car.', bin: 'both', why: 'Most phones have no PC5 radio, so Uu via a server is realistic today; PC5 V2P is faster where phones support it.' },
        { text: 'The base station tells a car which sidelink resources to use (Mode 3).', bin: 'uu', why: 'This is control signalling for PC5, but it travels on the Uu downlink (DCI format 5A on the PDCCH).' },
        { text: 'A Basic Safety Message 10 times per second to every car within 300 m.', bin: 'pc5', why: 'High rate, short range and low latency fit PC5. Relaying every BSM through the network is possible but costly.' },
      ],
    },
  ],
  quiz: [
    { q: 'In C-V2X, the Uu interface connects…', options: ['the vehicle UE and the base station (eNB or gNB)', 'two vehicles directly', 'the eNB and the MME', 'the V2X AS and the BM-SC'], answer: 0, why: 'Uu is the radio link between a UE and the radio access network. Car-to-car is PC5; eNB–MME is S1-MME; V2X AS–BM-SC is MB2.' },
    { q: 'Which is a genuine weakness of Uu compared with PC5?', options: ['It needs network coverage and a subscription', 'It cannot carry IP packets', 'It only works below 100 km/h', 'It cannot reach cloud servers'], answer: 0, why: 'Uu depends on the operator’s network. It carries IP happily, handles high speed with handover, and is the only way to reach the cloud.' },
    { q: 'Which 3GPP release first specified LTE-V2X?', options: ['Release 14', 'Release 8', 'Release 12', 'Release 16'], answer: 0, why: 'Release 14 (2017). Release 8 was the first LTE release, Release 12 introduced device-to-device ProSe (the PC5 ancestor), Release 16 introduced NR-V2X.' },
    { q: 'Car A sends a warning that car B receives over Uu. What is the path?', options: ['A → eNB → core → V2X AS → core → eNB → B', 'A → B directly on 5.9 GHz', 'A → GNSS satellite → B', 'A → eNB → B without leaving the radio network'], answer: 0, why: 'Uu-based V2X goes up to the V2X application server and back down, by unicast or MBMS broadcast. The eNB does not relay application messages between UEs on its own.' },
    { q: 'What is the 5G name for the base station on the Uu interface?', options: ['gNB', 'eNB', 'NodeB', 'RSU'], answer: 0, why: 'gNB (next-generation NodeB). eNB is LTE, NodeB is 3G, an RSU is roadside V2X equipment.' },
  ],
  recap: `<ul><li>The four V2X types and why only V2N always needs the network.</li><li>The difference between Uu and PC5 and when each fits.</li><li>How C-V2X evolved from Rel-14 LTE-V2X to Rel-16 NR-V2X and beyond.</li></ul>`,
});

defineExit({
  id: 2, num: '2', title: 'The Map', subtitle: 'Network architecture for V2X over Uu', mins: 18,
  topics: ['eNB · MME · S-GW · P-GW · HSS', 'V2X CF · V2X AS', 'MBMS', 'V1–V6 · S1 · SGi · MB2', '5GS'],
  cards: [
    {
      title: 'Meet the network crew',
      body: `<p class="lead">Everything a vehicle sends over Uu passes through a handful of network functions. Each has one job.</p>
        <ul><li><b>[[eNB]]</b>: the base station. Runs the radio, schedules every millisecond, decides handovers.</li>
        <li><b>[[MME]]</b>: the control brain of the core. Authenticates the car, tracks where it is, sets up its bearers. Your data packets do not pass through it.</li>
        <li><b>[[S-GW]]</b>: the user-plane anchor. When the car moves to a new eNB, the S-GW simply switches its downlink tunnel to the new eNB; the P-GW and the car's IP address stay the same.</li>
        <li><b>[[P-GW]]</b>: the door to IP networks. Gives the car its IP address and applies policy.</li>
        <li><b>[[HSS]]</b>: the subscriber database, including whether this SIM may use V2X.</li>
        <li><b>[[PCRF]]</b>: decides the QoS and charging rules for each flow.</li></ul>
        <p class="analogy">Think of an airport: the MME is the control tower, the S-GW the local terminal you can switch gates in, the P-GW the international gateway, and the HSS the passport office.</p>`,
      takeaway: 'Radio = eNB. Core control = MME (+HSS, PCRF). Core user plane = S-GW → P-GW.',
      detail: `<p>Together these form the Evolved Packet System (EPS): E-UTRAN (the eNBs) plus the [[EPC]]. Rel-14 [[CUPS]] split S-GW and P-GW into control (SGW-C, PGW-C) and user (SGW-U, PGW-U) parts, so a user-plane gateway can sit at the network edge next to the cells; this is one way operators shorten the V2X latency path.</p>`,
      specs: ['TS 23.401', 'TS 36.300 §4'],
    },
    {
      title: 'What V2X adds, and what it reuses',
      body: `<p class="lead">Release 14 added two V2X-specific functions to the LTE network (TS 23.285) and reused an existing one.</p>
        <ul><li><b>New: [[V2X CF]] (V2X Control Function)</b>. Authorises the car for V2X and gives it its parameters: which networks allow PC5, radio settings to use when out of coverage, the address of the V2X AS, and how V2X services map to identifiers and priorities.</li>
        <li><b>New: [[V2X AS]] (V2X Application Server)</b>. Receives V2X messages that cars upload over Uu, works out which area needs them, and sends them back down by unicast or broadcast.</li>
        <li><b>Reused: MBMS broadcast</b> (Rel-9 eMBMS, plus Rel-13 SC-PTM). The [[BM-SC]] and [[MBMS-GW]] in the core and the [[MCE]] in the radio network (usually built into the eNB) let the network send one copy of a message to every car in an area instead of one copy per car. Rel-14 tuned it for V2X, for example with shorter broadcast scheduling periods (Exit 8).</li></ul>
        <p>The two new functions sit beside the core, and the car reaches them over ordinary IP.</p>`,
      takeaway: 'New: V2X CF (authorisation and configuration) and V2X AS (message hub). Reused and tuned: MBMS broadcast.',
      detail: `<p>The V2X CF and V2X AS are logical functions; an operator may co-locate them or let a third party (a road authority, a car maker) run the V2X AS. There can be several V2X AS instances, for example a local one per region to keep latency low; the UE learns which to use through provisioning.</p>
        <p>In 5G (TS 23.287) the V2X Control Function disappears: its provisioning role moves into the [[PCF]].</p>`,
      specs: ['TS 23.285 §4.2, §4.4', 'TS 24.386 (V3 protocol)', 'TS 24.385 (V2X parameters)'],
    },
    {
      title: 'Reference points: the named roads',
      wide: true,
      body: `<p>Every line between two functions has a name, and 3GPP documents use those names constantly. Learn the ones on this map: the challenge will ask for all sixteen. Solid green lines carry user data, dashed purple lines carry signalling, dotted amber lines are the logical V2X reference points (their packets actually ride the user plane).</p>`,
      fig: `<div class="scroll-x">${archSVG(EPS_DIAGRAM)}</div>${archKey(EPS_DIAGRAM)}`,
      cap: 'LTE EPS with the Rel-14 V2X functions and MBMS. V5 (between V2X applications in two UEs) and V6 (between V2X Control Functions of two operators) are not drawn.',
      takeaway: 'User path: LTE-Uu → S1-U → S5/S8 → SGi. Signalling: S1-MME, S11, S6a, Gx. V2X: V1 to the AS, V3 to the CF. Broadcast: MB2 → SGmb/SGi-mb → M1.',
      detail: `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Point</th><th>Between</th><th>Protocol / role</th></tr></thead><tbody>
        <tr><td>LTE-Uu</td><td>UE – eNB</td><td>Radio: PHY/MAC/RLC/PDCP/RRC</td></tr>
        <tr><td>S1-MME</td><td>eNB – MME</td><td>S1-AP over SCTP</td></tr>
        <tr><td>S1-U</td><td>eNB – S-GW</td><td>GTP-U tunnels per bearer</td></tr>
        <tr><td>S11</td><td>MME – S-GW</td><td>GTP-C session control</td></tr>
        <tr><td>S6a</td><td>MME – HSS</td><td>Diameter: authentication, subscription</td></tr>
        <tr><td>S5/S8</td><td>S-GW – P-GW</td><td>GTP (S8 when roaming)</td></tr>
        <tr><td>SGi</td><td>P-GW – external IP network</td><td>Plain IP</td></tr>
        <tr><td>Gx / Rx</td><td>PCRF – P-GW / PCRF – AS</td><td>Diameter policy</td></tr>
        <tr><td>V1</td><td>V2X app in UE – V2X AS</td><td>Application traffic</td></tr>
        <tr><td>V2</td><td>V2X AS – V2X CF</td><td>Parameters for provisioning</td></tr>
        <tr><td>V3</td><td>UE – V2X CF</td><td>Authorisation and provisioning (protocol TS 24.386, parameters TS 24.385)</td></tr>
        <tr><td>V4</td><td>HSS – V2X CF</td><td>V2X subscription data</td></tr>
        <tr><td>V5 / V6</td><td>app – app / CF – CF</td><td>Between UEs / between PLMNs</td></tr>
        <tr><td>MB2</td><td>V2X AS – BM-SC</td><td>MB2-C control, MB2-U content</td></tr>
        <tr><td>SGmb / SGi-mb</td><td>BM-SC – MBMS-GW</td><td>Session control / content</td></tr>
        <tr><td>M1 / M2 / M3</td><td>MBMS-GW–eNB / MCE–eNB / MCE–MME</td><td>Multicast data / radio coordination / session control</td></tr></tbody></table></div>`,
      specs: ['TS 23.285 §4.2', 'TS 23.401 §5', 'TS 23.246', 'TS 23.468'],
    },
    {
      title: 'Control plane and user plane',
      body: `<p class="lead">LTE splits every conversation into two kinds of traffic that take different paths.</p>
        <p><b>Control plane</b> is signalling: "let me in", "here are your keys", "move to that cell", "set up a bearer". It runs [[RRC]] between car and eNB and [[NAS]] between car and MME, then S1-AP, GTP-C and Diameter inside the core.</p>
        <p><b>User plane</b> is your actual packets, for example a V2X message to the V2X AS. They go car → eNB → S-GW → P-GW → V2X AS, inside [[GTP-U]] tunnels on the wired part.</p>
        <p>Why split? The control nodes can be centralised and scaled for signalling load, while user-plane gateways can be placed wherever the latency budget needs them.</p>`,
      fig: stackSVG([
        { name: 'UE', layers: [{ t: 'NAS', kind: 'mbms' }, { t: 'RRC', kind: 'mbms' }, { t: 'PDCP', kind: 'ran' }, { t: 'RLC', kind: 'ran' }, { t: 'MAC', kind: 'ran' }, { t: 'PHY', kind: 'core' }] },
        { name: 'eNB', layers: [null, { t: 'RRC', kind: 'mbms' }, { t: 'PDCP', kind: 'ran' }, { t: 'RLC', kind: 'ran' }, { t: 'MAC', kind: 'ran' }, { t: 'PHY', kind: 'core' }] },
        { name: 'MME', layers: [{ t: 'NAS', kind: 'mbms' }, { t: 'S1-AP', kind: 'core' }, { t: 'SCTP', kind: 'core' }, { t: 'IP', kind: 'ue' }, { t: 'L2', kind: 'core' }, { t: 'L1', kind: 'core' }] },
      ], { colW: 92, gap: 34, links: [{ from: 0, to: 1, label: 'LTE-Uu', kind: 'cp' }, { from: 1, to: 2, label: 'S1-MME', kind: 'cp' }], aria: 'Control plane stacks of UE, eNB and MME' }),
      cap: 'Control-plane stacks. RRC ends in the eNB; NAS passes through the eNB untouched and ends in the MME.',
      takeaway: 'The MME never sees your V2X message. The S-GW and P-GW never read your RRC signalling.',
      specs: ['TS 36.300 §4.3', 'TS 23.401 §5.1'],
    },
    {
      title: 'The same map in 5G',
      wide: true,
      body: `<p>The 5G core (5GS) redraws the boxes but keeps the ideas. For V2X over NR-Uu (TS 23.287):</p>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>LTE (EPS)</th><th>5G (5GS)</th><th>What changed</th></tr></thead><tbody>
        <tr><td>eNB</td><td>[[gNB]]</td><td>NR radio; can also connect to the LTE core in early deployments</td></tr>
        <tr><td>MME</td><td>[[AMF]] + [[SMF]]</td><td>Mobility (AMF) and sessions (SMF) are separate functions</td></tr>
        <tr><td>S-GW + P-GW user plane</td><td>[[UPF]]</td><td>One user-plane function, easy to place at the edge</td></tr>
        <tr><td>PCRF</td><td>[[PCF]]</td><td>Also provisions V2X policy to the UE</td></tr>
        <tr><td>V2X Control Function</td><td>PCF</td><td>V2X CF removed; policy goes over N1 via the AMF</td></tr>
        <tr><td>HSS</td><td>[[UDM]] / UDR</td><td>Subscription data, including V2X authorisation</td></tr>
        <tr><td>EPS bearer, QCI</td><td>[[QoS flow]], [[5QI]]</td><td>Finer-grained QoS</td></tr></tbody></table></div>`,
      fig: `<div class="scroll-x">${archSVG(FIVEGS_DIAGRAM)}</div>${archKey(FIVEGS_DIAGRAM)}`,
      cap: '5G system for V2X over NR-Uu. The V2X AS is an application function: it can reach the core through the NEF (N33) or the PCF (N5, not drawn).',
      takeaway: 'Same roles, new names: AMF/SMF for MME, UPF for the gateways, PCF for both PCRF and V2X CF.',
      detail: `<p>Inside the 5G core most functions talk through service-based interfaces (HTTP/2 APIs), but the reference-point names (N1, N2, N3, N4, N6, N7, N8, N11, N15, N33) are still used to describe who talks to whom. N1 is NAS between UE and AMF, N2 is NGAP between gNB and AMF, N3 is GTP-U between gNB and UPF, N4 is PFCP between SMF and UPF.</p>
        <p>In Rel-16 V2X over NR-Uu is unicast only; broadcast over NR (MBS) arrived in Rel-17.</p>`,
      specs: ['TS 23.501', 'TS 23.287 §4.2'],
    },
  ],
  challenges: [
    { type: 'label', title: 'Wire the network', intro: 'Every yellow number is an unlabelled reference point. Click one, then pick its name. Use the boxes at each end as your clue.', diagram: EPS_DIAGRAM },
    {
      type: 'match', title: 'From EPS to 5GS', left: 'LTE (EPS)', right: '5G system',
      intro: 'Match each LTE element with the 5G element that takes over its role.',
      pairs: [
        { a: 'eNB', b: 'gNB', why: 'The base station: E-UTRAN becomes NG-RAN.' },
        { a: 'MME (mobility and NAS)', b: 'AMF', why: 'The AMF terminates NAS and handles registration and mobility.' },
        { a: 'MME session handling + P-GW control', b: 'SMF', why: 'The SMF sets up PDU sessions, allocates IP addresses and steers the UPF.' },
        { a: 'S-GW and P-GW user plane', b: 'UPF', why: 'One user-plane function, which can be chained and placed at the edge.' },
        { a: 'V2X Control Function', b: 'PCF (V2X policy)', why: 'In Rel-16 the PCF provisions V2X policy and parameters to the UE.' },
        { a: 'HSS', b: 'UDM / UDR', why: 'Subscription data moves to UDM (front end) and UDR (repository).' },
        { a: 'EPS bearer with a QCI', b: 'QoS flow with a 5QI', why: 'QoS becomes per flow, marked with a QFI, inside a PDU session.' },
      ],
    },
  ],
  quiz: [
    { q: 'Which node gives the vehicle its IP address in LTE?', options: ['P-GW', 'MME', 'eNB', 'HSS'], answer: 0, why: 'The P-GW is the anchor towards the packet data network and allocates the UE’s IP address when the PDN connection is created.' },
    { q: 'Over which reference point does the UE get its V2X authorisation and parameters from the V2X Control Function?', options: ['V3', 'V1', 'V2', 'S6a'], answer: 0, why: 'V3 is UE ↔ V2X CF. V1 is UE ↔ V2X AS, V2 is V2X AS ↔ V2X CF, S6a is MME ↔ HSS.' },
    { q: 'The V2X AS wants an MBMS broadcast in a region. Which interface does it use?', options: ['MB2 to the BM-SC', 'Gx to the P-GW', 'S11 to the S-GW', 'M1 to the eNB'], answer: 0, why: 'MB2 connects an application server to the BM-SC. M1 is used later by the MBMS-GW to deliver the content to eNBs.' },
    { q: 'In the 5G system (Rel-16), which function provisions V2X policy to the UE?', options: ['PCF', 'AMF', 'UPF', 'V2X Control Function'], answer: 0, why: 'TS 23.287 moves the V2X CF role into the PCF, which sends the policy to the UE through the AMF over N1.' },
    { q: 'A V2X message from the car to the V2X AS travels over which chain?', options: ['LTE-Uu → S1-U → S5/S8 → SGi', 'LTE-Uu → S1-MME → S11 → S6a', 'PC5 → M1 → MB2', 'V3 → V4 → V2'], answer: 0, why: 'It is user-plane data, so it follows the user-plane chain. S1-MME, S11 and S6a are signalling only.' },
  ],
  recap: `<ul><li>The job of every EPS node, and which ones carry user data.</li><li>What the V2X CF, V2X AS and MBMS functions add.</li><li>The reference points from LTE-Uu to SGi, V1–V4, MB2 and M1.</li><li>How the same picture maps onto the 5G core.</li></ul>`,
});

defineExit({
  id: 3, num: '3', title: 'The Stack', subtitle: 'Protocol layers on the Uu interface', mins: 18,
  topics: ['PDCP · RLC · MAC · PHY', 'RRC · NAS', 'ROHC · ARQ · HARQ', 'Encapsulation'],
  cards: [
    {
      title: 'Where each layer lives',
      wide: true,
      body: `<p class="lead">A V2X message passes down a stack of layers in the car, across the air, and up and down more stacks in the network. Each layer adds one service.</p>
        <p>On the <b>user plane</b> the V2X message rides UDP and IP all the way to the V2X AS. Below IP, the radio layers ([[PDCP]], [[RLC]], [[MAC]], [[PHY]]) only exist between the car and the eNB. From the eNB onward the IP packet is wrapped in a [[GTP-U]] tunnel over ordinary transport networks.</p>
        <p>The diagram reads left to right as the path of one uplink message.</p>`,
      fig: `<div class="scroll-x">${stackSVG([
        { name: 'UE', layers: [{ t: 'V2X message', kind: 'v2x' }, { t: 'UDP', kind: 'ue' }, { t: 'IP', kind: 'ue' }, { t: 'PDCP', kind: 'ran' }, { t: 'RLC', kind: 'ran' }, { t: 'MAC', kind: 'ran' }, { t: 'PHY', kind: 'core' }] },
        { name: 'eNB (radio)', layers: [null, null, null, { t: 'PDCP', kind: 'ran' }, { t: 'RLC', kind: 'ran' }, { t: 'MAC', kind: 'ran' }, { t: 'PHY', kind: 'core' }] },
        { name: 'eNB (S1-U)', layers: [null, null, null, { t: 'GTP-U', kind: 'core' }, { t: 'UDP/IP', kind: 'core' }, { t: 'L2', kind: 'core' }, { t: 'L1', kind: 'core' }] },
        { name: 'S-GW / P-GW', layers: [null, null, { t: 'IP (routing)', kind: 'ue' }, { t: 'GTP-U', kind: 'core' }, { t: 'UDP/IP', kind: 'core' }, { t: 'L2', kind: 'core' }, { t: 'L1', kind: 'core' }] },
        { name: 'V2X AS', layers: [{ t: 'V2X message', kind: 'v2x' }, { t: 'UDP', kind: 'ue' }, { t: 'IP', kind: 'ue' }, null, null, { t: 'L2', kind: 'core' }, { t: 'L1', kind: 'core' }] },
      ], { colW: 104, gap: 28, links: [{ from: 0, to: 1, label: 'LTE-Uu', kind: 'up' }, { from: 2, to: 3, label: 'S1-U, S5', kind: 'up' }, { from: 3, to: 4, label: 'SGi', kind: 'up' }], aria: 'User plane protocol stacks from UE to V2X AS' })}</div>`,
      cap: 'User plane. The two eNB columns are the same box: radio layers on one side, the S1-U tunnel on the other. The P-GW removes the tunnel and routes the inner IP packet over SGi.',
      takeaway: 'Radio layers end at the eNB. The UE’s IP packet is carried unchanged, inside GTP-U, to the P-GW and on to the V2X AS.',
      detail: `<p>Over Uu, V2X messages are IP traffic (IPv4 or IPv6, normally UDP). This differs from PC5, where LTE-V2X also supports non-IP messages such as IEEE 1609.3 WSMP directly over PDCP.</p>
        <p>The control plane has the same radio layers, with [[RRC]] on top (ending in the eNB) and [[NAS]] on top of that (ending in the MME). See the control-plane stack in Exit 2.</p>`,
      specs: ['TS 36.300 §4.3', 'TS 29.281 (GTP-U)'],
    },
    {
      title: 'PDCP: the packer and the lock',
      body: `<p class="lead">[[PDCP]] is the top of the radio stack and the only layer that touches the IP packet as a whole.</p>
        <ul><li><b>Header compression ([[ROHC]]).</b> An IPv6 + UDP header is 48 bytes; most fields never change during a flow. ROHC sends them once and then only a few bytes per packet. For a 300-byte V2X message that saves about 13% of the airtime.</li>
        <li><b>Ciphering</b> of user and control data with keys derived during attach (Exit 10).</li>
        <li><b>Integrity protection</b> of control-plane messages, so nobody can forge an RRC command.</li>
        <li><b>Sequence numbers</b>, in-order delivery and duplicate removal, which keep a handover lossless.</li></ul>`,
      takeaway: 'PDCP = compress, cipher, protect, number.',
      detail: `<p>LTE PDCP sequence numbers can be 7, 12, 15 or 18 bits for data radio bearers (5 bits for signalling bearers). A 12-bit SN gives a 2-byte PDCP header. NR PDCP adds optional integrity protection for user data and supports packet duplication over two carriers for reliability, which matters for advanced V2X.</p>`,
      specs: ['TS 36.323', 'RFC 5795 (ROHC)'],
    },
    {
      title: 'RLC: the segmenter',
      body: `<p class="lead">The scheduler gives the UE a grant of a certain size every millisecond. [[RLC]] cuts or joins packets to fit exactly.</p>
        <p>It runs in one of three modes, chosen per radio bearer:</p>
        <ul><li><b>TM, transparent mode</b>: passes data untouched. Used for broadcast and common control channels.</li>
        <li><b>UM, unacknowledged mode</b>: segments, reassembles and reorders, but never retransmits. Good for real-time traffic, where a late copy is useless. Periodic V2X messages typically use UM.</li>
        <li><b>AM, acknowledged mode</b>: adds ARQ. The receiver sends STATUS reports and missing pieces are resent. Used for signalling and for downloads such as maps, where every byte must arrive.</li></ul>`,
      takeaway: 'UM for time-critical V2X messages, AM for anything that must arrive complete.',
      detail: `<p>RLC ARQ sits on top of MAC [[HARQ]]. HARQ fixes most errors within 8 ms; RLC AM catches the rare residual errors (for example a NACK misread as ACK) at the cost of tens of milliseconds. LTE RLC UM uses a 5-bit or 10-bit sequence number (1- or 2-byte header). In NR, RLC no longer concatenates; that job moved to MAC.</p>`,
      specs: ['TS 36.322', 'TS 38.322'],
    },
    {
      title: 'MAC: the scheduler’s hands',
      body: `<p class="lead">[[MAC]] is where the radio becomes shared. It decides what goes into each transport block and keeps the conversation with the scheduler going.</p>
        <ul><li><b>Multiplexing</b>: maps logical channels (signalling, V2X traffic, other data) into one transport block per [[TTI]], by priority.</li>
        <li><b>[[HARQ]]</b>: fast retransmissions with soft combining, 8 parallel processes in LTE FDD.</li>
        <li><b>Asking for resources</b>: a [[SR]] when the UE has nothing granted, a [[BSR]] to say how much data waits.</li>
        <li><b>Housekeeping</b>: timing advance, power headroom reports, [[DRX]] sleep cycles.</li>
        <li><b>Identities</b>: every scheduling message is tagged with an [[RNTI]], such as the [[C-RNTI]] of one UE.</li></ul>`,
      takeaway: 'MAC = who sends what, when. It follows the eNB scheduler’s grants and runs HARQ.',
      detail: `<p>The MAC header is a list of subheaders, each with a logical channel ID and a length, followed by MAC control elements (BSR, power headroom, timing advance command and, for V2X, the sidelink BSR) and the RLC PDUs. Padding fills whatever is left of the transport block. The eNB scheduler itself is not standardised; vendors compete on it.</p>`,
      specs: ['TS 36.321', 'TS 38.321'],
    },
    {
      title: 'PHY: onto the air',
      body: `<p class="lead">[[PHY]] turns each transport block into a radio signal and back.</p>
        <ol><li>Attach a 24-bit [[CRC]] so the receiver can tell if decoding worked.</li>
        <li>Channel-code it: turbo code in LTE, [[LDPC]] in NR. Coding adds redundancy that corrects errors.</li>
        <li>Rate-match to the exact number of bits the grant can carry, then scramble.</li>
        <li>Modulate: QPSK, 16QAM, 64QAM or 256QAM (2 to 8 bits per symbol).</li>
        <li>Map to antennas (MIMO) and to resource elements, then [[OFDM]] modulate.</li></ol>
        <p>The LTE uplink adds a DFT step before OFDM, which gives [[SC-FDMA]]: a single-carrier-like signal with low peak power, kinder to the phone's power amplifier and battery.</p>`,
      takeaway: 'CRC → coding → rate matching → modulation → resource mapping → OFDM. Uplink uses SC-FDMA for low peak power.',
      detail: `<p>LTE control channels use tail-biting convolutional codes; NR uses polar codes for control. The PHY also measures the channel ([[RSRP]], [[CQI]]) and runs the reference signals (Exit 4).</p>`,
      specs: ['TS 36.212', 'TS 36.211', 'TS 38.212'],
    },
    {
      title: 'RRC and NAS: the managers',
      body: `<p class="lead">Two signalling layers manage the whole thing.</p>
        <p><b>[[RRC]]</b>, between car and eNB: broadcasts system information, sets up and releases the connection, activates radio security, configures radio bearers, orders measurements and handovers. A UE is either <b>RRC_IDLE</b> (no connection, network only knows its tracking area) or <b>RRC_CONNECTED</b>. NR adds RRC_INACTIVE. For V2X, RRC also carries [[SIB21]], SidelinkUEInformation and [[UE assistance information]].</p>
        <p><b>[[NAS]]</b>, between car and MME: attach and detach, authentication, NAS security, tracking area updates (EMM), and PDN connections and bearers (ESM). The eNB forwards NAS messages without reading them.</p>`,
      takeaway: 'RRC manages the radio connection; NAS manages the subscription session with the core.',
      specs: ['TS 36.331', 'TS 24.301'],
    },
  ],
  challenges: [
    {
      type: 'sequence', title: 'Stack it: the user plane',
      intro: 'Build the user-plane stack inside the car from the top (application) to the bottom (radio). Pick the layers in order.',
      steps: [
        { text: 'V2X message (for example a CAM or BSM)', why: 'The application payload the car wants to deliver.' },
        { text: 'UDP', why: 'Connectionless transport: no handshake, no retransmission delay.' },
        { text: 'IP', why: 'Addresses the V2X AS; carried end to end through the core.' },
        { text: 'PDCP', why: 'Header compression and ciphering.' },
        { text: 'RLC', why: 'Segmentation to fit the grant (UM for V2X).' },
        { text: 'MAC', why: 'Multiplexing, HARQ and scheduling requests.' },
        { text: 'PHY', why: 'Coding, modulation and OFDM onto the air.' },
      ],
    },
    {
      type: 'classify', title: 'Who does what?',
      intro: 'Assign each job to the layer that performs it.',
      bins: [{ id: 'nas', label: 'NAS' }, { id: 'rrc', label: 'RRC' }, { id: 'pdcp', label: 'PDCP' }, { id: 'rlc', label: 'RLC' }, { id: 'mac', label: 'MAC' }, { id: 'phy', label: 'PHY' }],
      items: [
        { text: 'Compress a 48-byte IPv6/UDP header to a few bytes', bin: 'pdcp', why: 'ROHC runs in PDCP.' },
        { text: 'Resend a missing segment after a STATUS report', bin: 'rlc', why: 'That is ARQ in RLC acknowledged mode.' },
        { text: 'Retransmit a failed transport block 8 ms later and soft-combine it', bin: 'mac', why: 'HARQ is a MAC process (with soft combining in the PHY).' },
        { text: 'Cipher user data with K_UPenc', bin: 'pdcp', why: 'All access-stratum ciphering (user data and RRC) happens in PDCP. NAS messages are ciphered by the NAS layer itself, with K-NASenc.' },
        { text: 'Turbo-code a transport block', bin: 'phy', why: 'Channel coding is a physical-layer function.' },
        { text: 'Send a handover command to the car', bin: 'rrc', why: 'RRCConnectionReconfiguration with mobility control information.' },
        { text: 'Authenticate the subscriber and run the attach', bin: 'nas', why: 'Attach and authentication are EMM procedures in NAS, between UE and MME.' },
        { text: 'Report how many bytes are waiting in the buffer', bin: 'mac', why: 'The buffer status report is a MAC control element.' },
        { text: 'Cut a 1200-byte packet into pieces that fit a small grant', bin: 'rlc', why: 'Segmentation is RLC’s main job.' },
        { text: 'Map the coded bits onto 16QAM symbols', bin: 'phy', why: 'Modulation is a physical-layer step. (Choosing the MCS is the eNB scheduler’s decision; applying it is the PHY’s job.)' },
      ],
    },
    {
      type: 'encap', title: 'Ride the stack',
      intro: 'Follow one 300-byte V2X message from the application down to the antenna. At each layer, choose what happens to it; watch the packet grow and shrink.',
      start: [{ t: 'V2X message', b: 300, c: 'c3' }],
      steps: [
        { layer: 'Transport', q: 'The message needs a transport protocol to reach the V2X AS. What is added?', options: ['A UDP header, 8 bytes', 'A TCP header and a three-way handshake first', 'Nothing; V2X messages go straight onto IP', 'A GTP-U header'], answer: 0, why: 'V2X messages are small, frequent and time-critical. UDP adds 8 bytes and no handshake; a lost message is simply replaced by the next one.', push: [{ t: 'UDP', b: 8, c: 'c6', front: true }] },
        { layer: 'Network', q: 'Next, the network layer. What is added?', options: ['An IPv6 header, 40 bytes', 'An Ethernet header', 'A PDCP header', 'A MAC subheader'], answer: 0, why: 'IPv6 (40 bytes) addresses the V2X AS. IPv4 (20 bytes) is also allowed; this example uses IPv6. The packet is now 348 bytes.', push: [{ t: 'IPv6', b: 40, c: 'c7', front: true }] },
        { layer: 'PDCP', q: 'PDCP receives the 348-byte IP packet. What happens to the 48 bytes of IPv6 + UDP header?', options: ['ROHC compresses them to about 3 bytes', 'PDCP adds a TCP checksum', 'They pass unchanged', 'They are encrypted but left full size'], answer: 0, why: 'ROHC replaces the static fields with a context and sends only a few bytes per packet. PDCP then ciphers the payload with K_UPenc and adds a 2-byte header carrying a 12-bit sequence number.', replace: { from: ['IPv6', 'UDP'], to: { t: 'ROHC header', b: 3, c: 'c8' } }, push: [{ t: 'PDCP header', b: 2, c: 'c2', front: true }] },
        { layer: 'RLC', q: 'RLC in unacknowledged mode receives the PDCP PDU. What does it add?', options: ['A 1–2 byte header with a sequence number, segmenting if the grant is smaller', 'A STATUS report requesting retransmission', 'A 24-bit CRC', 'The UE’s IP address'], answer: 0, why: 'UM adds a short header (here 2 bytes, 10-bit SN) so the receiver can reassemble and reorder. STATUS reports only exist in acknowledged mode.', push: [{ t: 'RLC header', b: 2, c: 'c4', front: true }] },
        { layer: 'MAC', q: 'MAC builds the transport block. What does it add?', options: ['A subheader with the logical channel ID and length, plus control elements or padding', 'IP routing information', 'Ciphering', 'The PDCCH grant'], answer: 0, why: 'A 2–3 byte subheader tells the receiver which logical channel each piece belongs to. A BSR control element may ride along; padding fills the rest of the grant.', push: [{ t: 'MAC subheader', b: 3, c: 'c5', front: true }] },
        { layer: 'PHY', q: 'Finally the PHY. What happens first?', options: ['A 24-bit CRC is attached, then the block is turbo-coded and modulated', 'The block is split into IP fragments', 'An RRC header is added', 'Nothing; the PHY sends the bits as they are'], answer: 0, why: 'The CRC (3 bytes) lets the eNB detect errors. Then coding roughly doubles the bits at code rate ½, and 16QAM packs 4 coded bits into each resource element.', push: [{ t: 'CRC', b: 3, c: 'c1' }] },
      ],
      finale: `<p><b>The arithmetic.</b> 313 bytes = 2504 bits. At code rate ½ that is about 5008 coded bits; with 16QAM (4 bits per symbol) about 1252 resource elements. An uplink RB pair has 168 resource elements, minus 24 for the two DMRS symbols = 144 usable. So this message needs about <b>9 resource blocks for one 1 ms subframe</b>.</p>
        <p><b>Overhead.</b> Without ROHC the headers would be 48 + 2 + 2 + 3 + 3 = 58 bytes, 19% of the payload. With ROHC they are 13 bytes, about 4%.</p>`,
    },
  ],
  quiz: [
    { q: 'Periodic V2X safety messages are replaced every 100 ms, so a late copy is useless. Which RLC mode fits?', options: ['Unacknowledged mode (UM)', 'Acknowledged mode (AM)', 'Transparent mode (TM)', 'Any mode; RLC mode does not affect latency'], answer: 0, why: 'UM avoids ARQ delays. AM would retransmit stale data; TM cannot segment.' },
    { q: 'Which protocol layer terminates in the MME rather than in the eNB?', options: ['NAS', 'RRC', 'PDCP', 'MAC'], answer: 0, why: 'NAS runs between UE and MME. RRC, PDCP, RLC, MAC and PHY all end in the eNB.' },
    { q: 'Where does HARQ live?', options: ['MAC, with soft combining in the PHY', 'RLC', 'PDCP', 'NAS'], answer: 0, why: 'HARQ is a MAC entity with the PHY doing soft combining. RLC has its own slower ARQ in AM.' },
    { q: 'Why does the LTE uplink use SC-FDMA instead of plain OFDMA?', options: ['Lower peak-to-average power, so the UE’s amplifier is efficient', 'It gives higher peak data rates', 'It removes the need for a cyclic prefix', 'It allows the eNB to skip channel estimation'], answer: 0, why: 'OFDM signals have high peaks. DFT-spreading gives a single-carrier-like signal that a battery-powered amplifier can handle efficiently.' },
    { q: 'What does ROHC compress?', options: ['IP, UDP and RTP headers', 'The V2X message payload', 'The MAC subheaders', 'The CRC'], answer: 0, why: 'ROHC removes redundancy between consecutive packet headers. Payload compression is not its job.' },
  ],
  recap: `<ul><li>Which layers exist where, from the car to the V2X AS.</li><li>The jobs of PDCP, RLC (TM/UM/AM), MAC and PHY, and of RRC and NAS.</li><li>How a 300-byte message becomes about 9 resource blocks on the air.</li></ul>`,
});

defineExit({
  id: 4, num: '4', title: 'The Grid', subtitle: 'OFDMA, frames and resource blocks', mins: 20,
  topics: ['OFDM · subcarriers', 'Frame · subframe · slot', 'RB · RE', 'PDCCH · PSS/SSS · PBCH', 'CQI · MCS'],
  cards: [
    {
      title: 'OFDM in one picture',
      body: `<p class="lead">LTE does not send one fast signal across its whole channel. It sends many slow ones side by side.</p>
        <p>[[OFDM]] divides the channel into narrow <b>subcarriers</b> 15 kHz apart. Each carries one symbol at a time, and each symbol lasts 1/15 kHz = 66.7 µs. Because the spacing equals one over the symbol length, neighbouring subcarriers overlap without interfering: they are orthogonal.</p>
        <p>Why bother? Signals bounce off buildings and arrive several microseconds apart. For a 66.7 µs symbol that smear is small, and a <b>[[CP|cyclic prefix]]</b> of about 4.7 µs in front of each symbol absorbs it completely.</p>
        <p>[[OFDMA]] then shares the grid: different cars get different groups of subcarriers in different milliseconds.</p>`,
      mount: 'modulation',
      cap: 'Each resource element carries one point of a constellation. Better radio conditions allow denser constellations.',
      takeaway: '15 kHz subcarriers, 66.7 µs symbols plus a cyclic prefix. Many slow parallel streams beat one fast one when there is multipath.',
      detail: `<p>The LTE sample rate for 20 MHz is 30.72 MHz (a 2048-point FFT); the basic time unit Ts = 1/30.72 MHz ≈ 32.6 ns. Normal CP is 160 Ts (5.2 µs) on the first symbol of a slot and 144 Ts (4.7 µs) on the others; extended CP is 512 Ts (16.7 µs) and is used for MBSFN.</p>`,
      specs: ['TS 36.211 §6.12', 'TS 36.104'],
    },
    {
      title: 'Time: frame, subframe, slot, symbol',
      body: `<p class="lead">LTE time is a set of nested boxes.</p>
        <ul><li><b>Radio frame</b>: 10 ms, numbered 0 to 1023 by the [[SFN]].</li>
        <li><b>Subframe</b>: 1 ms, ten per frame. This is the [[TTI]]: the scheduler decides once per subframe.</li>
        <li><b>Slot</b>: 0.5 ms, two per subframe.</li>
        <li><b>OFDM symbol</b>: seven per slot with normal CP, so fourteen per subframe (six and twelve with extended CP).</li></ul>
        <p>Many LTE timings are counted in subframes: "send PUSCH 4 subframes after the grant", "HARQ round trip of 8 subframes". When you see <code>n+4</code>, read it as 4 ms later.</p>`,
      fig: `<svg class="dg" viewBox="0 0 520 170" role="img" aria-label="Radio frame of 10 subframes, one subframe of 2 slots, one slot of 7 symbols">
        ${Array.from({ length: 10 }, (_, i) => `<rect class="box ${i === 3 ? 'sign' : 'ran'}" x="${10 + i * 50}" y="20" width="48" height="26" rx="3"/><text class="t-sm${i === 3 ? ' t-on' : ''}" x="${34 + i * 50}" y="37" text-anchor="middle">${i}</text>`).join('')}
        <text class="t-sm t-mute" x="10" y="14">Radio frame = 10 ms = 10 subframes</text>
        <path class="ln thin" d="M160,46 L60,70 M210,46 L460,70"/>
        <rect class="box ran" x="60" y="72" width="198" height="26" rx="3"/><rect class="box ran" x="262" y="72" width="198" height="26" rx="3"/>
        <text class="t-sm" x="159" y="89" text-anchor="middle">slot 0 · 0.5 ms</text><text class="t-sm" x="361" y="89" text-anchor="middle">slot 1 · 0.5 ms</text>
        <text class="t-sm t-mute" x="60" y="66">Subframe 3 = 1 ms = 1 TTI</text>
        <path class="ln thin" d="M60,98 L60,122 M258,98 L460,122"/>
        ${Array.from({ length: 7 }, (_, i) => `<rect class="box core" x="${60 + i * 57.2}" y="124" width="55" height="24" rx="3"/><text class="t-sm" x="${87.5 + i * 57.2}" y="140" text-anchor="middle">sym ${i}</text>`).join('')}
        <text class="t-sm t-mute" x="60" y="164">Slot = 7 OFDM symbols (normal CP), each ≈ 71.4 µs including CP</text></svg>`,
      takeaway: 'Frame 10 ms → subframe 1 ms (one TTI) → slot 0.5 ms → 7 symbols. 14 symbols per subframe.',
      specs: ['TS 36.211 §4, §6.2'],
    },
    {
      title: 'Frequency: resource blocks',
      body: `<p class="lead">Subcarriers are grouped in twelves.</p>
        <p>A <b>[[RB|resource block]]</b> is 12 subcarriers (180 kHz) for one slot. The smallest piece of the grid, one subcarrier for one symbol, is a <b>[[RE|resource element]]</b>. The scheduler hands out <b>RB pairs</b> (both slots of a subframe), each holding 12 × 14 = 168 resource elements.</p>
        <p>The channel bandwidth fixes how many RBs exist. About 10% is left as guard band at the edges.</p>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Bandwidth</th><th>1.4</th><th>3</th><th>5</th><th>10</th><th>15</th><th>20 MHz</th></tr></thead>
        <tbody><tr><td>Resource blocks</td><td class="n">6</td><td class="n">15</td><td class="n">25</td><td class="n">50</td><td class="n">75</td><td class="n">100</td></tr></tbody></table></div>
        <p>Try the bandwidth buttons: the grid shows subframe 0 at RB resolution.</p>`,
      mount: 'gridExplorer',
      takeaway: 'RB = 12 subcarriers × 1 slot. RB pair = 168 REs per 1 ms. 10 MHz = 50 RBs, 20 MHz = 100 RBs.',
      detail: `<p>Carrier aggregation (Rel-10 onward) combines up to five 20 MHz carriers (later more) for one UE. Each carrier keeps its own grid. For V2X over Uu the data rates are small, so the grid matters more for latency and capacity than for peak rate.</p>`,
      specs: ['TS 36.211 §6.2.3', 'TS 36.101 §5.6'],
    },
    {
      title: 'Who lives where in the grid',
      body: `<p class="lead">Not every resource element carries user data. Some are reserved for signals every UE needs.</p>
        <ul><li><b>Control region</b>: the first 1 to 3 symbols of each downlink subframe (2 to 4 at 1.4 MHz). It holds the [[PDCCH]] with all the grants, the [[PCFICH]] saying how big the region is, and the [[PHICH]] with uplink ACK/NACKs.</li>
        <li><b>[[CRS]]</b>: reference signals sprinkled across the whole band, used to estimate the channel and measure [[RSRP]].</li>
        <li><b>[[PSS]] and [[SSS]]</b>: synchronisation signals in subframes 0 and 5, central 6 RBs (FDD; in TDD the PSS sits in subframes 1 and 6).</li>
        <li><b>[[PBCH]]</b>: the [[MIB]], in subframe 0, central 6 RBs.</li>
        <li><b>[[PDSCH]]</b>: everything else, for data.</li></ul>
        <p>The uplink is laid out differently: [[PUCCH]] control at both band edges, [[PUSCH]] data in the middle, a [[DMRS]] in the middle symbol of each slot, and an optional sounding signal in the last symbol.</p>`,
      mount: 'reGrid',
      cap: 'Subframe 0 of a 1.4 MHz cell (6 RBs) with two CRS antenna ports. Click an element to identify it.',
      takeaway: 'Control first (PDCCH), sync in subframes 0 and 5 (PSS/SSS), MIB in subframe 0 (PBCH), CRS everywhere, data in the rest.',
      specs: ['TS 36.211 §6.7–6.11', 'TS 36.211 §5.5'],
    },
    {
      title: 'Bits per element: link adaptation',
      body: `<p class="lead">The same grid carries more bits when the radio conditions are good.</p>
        <p>The UE measures its channel and reports a <b>[[CQI]]</b> from 0 to 15: roughly "I could decode this modulation and code rate with about 10% errors". The eNB picks an <b>[[MCS]]</b> (0 to 28), which fixes the modulation and the code rate, and from it and the number of RBs, the transport block size.</p>
        <ul><li>Near the tower: 64QAM or 256QAM, high code rate, many bits per RB.</li>
        <li>At the cell edge or at high speed: QPSK, low code rate, few bits but robust.</li></ul>
        <p>The first transmission is allowed to fail about one time in ten ([[BLER]] ≈ 10%); [[HARQ]] repairs those cheaply. Aiming for zero errors would waste capacity.</p>`,
      takeaway: 'CQI (from UE) → MCS (from eNB) → modulation, code rate and transport block size. Target about 10% BLER, let HARQ fix the rest.',
      detail: `<p>Peak-rate example, 20 MHz, 64QAM, one layer: 100 RBs × 12 subcarriers × 14 symbols × 1000 subframes/s = 16.8 million REs per second. Subtract roughly 25% for control and reference signals → 12.6 million; × 6 bits × code rate ~0.93 ≈ 70 Mbit/s per layer, about 140 Mbit/s with 2×2 MIMO. The well-known 150 Mbit/s of LTE Category 4 assumes somewhat less overhead.</p>
        <p>For V2X the point is the opposite: a 300-byte message at 16QAM needs only about 9 RBs for 1 ms, so a 10 MHz cell could in principle carry several of them every millisecond. Latency, not throughput, is the hard part.</p>`,
      specs: ['TS 36.213 §7.1.7, §7.2.3'],
    },
  ],
  challenges: [
    {
      type: 'calc', title: 'Grid calculator',
      intro: 'Work these out with the numbers from the briefing. Every answer comes with a worked solution.',
      items: [
        { q: 'How many resource blocks does a 10 MHz LTE carrier have?', answer: 50, tol: 0, solution: 'From the table: 10 MHz → 50 RBs (9 MHz occupied, the rest is guard band).', hint: 'Look back at the bandwidth table: 1.4, 3, 5, 10, 15, 20 MHz.' },
        { q: 'How many resource elements are in one RB pair (one subframe, normal cyclic prefix)?', answer: 168, tol: 0, solution: '12 subcarriers × 14 OFDM symbols = 168 REs.', hint: 'Subcarriers per RB times symbols per subframe.' },
        { q: 'How many active subcarriers does a 20 MHz carrier use?', answer: 1200, tol: 0, solution: '100 RBs × 12 subcarriers = 1200 subcarriers, spanning 18 MHz.', hint: 'RBs × 12.' },
        { q: 'A car is granted 6 RB pairs with 16QAM. Ignoring control, reference signals and coding, how many raw bits can that subframe carry?', answer: 4032, tol: 0, solution: '6 × 168 = 1008 REs; 16QAM carries 4 bits each → 4032 bits.', hint: 'REs per RB pair × RB pairs × bits per symbol.' },
        { q: 'What is the useful OFDM symbol duration (without cyclic prefix) for 15 kHz spacing, in microseconds?', answer: 66.7, tol: 0.2, unit: 'µs', solution: '1 / 15 000 Hz = 66.7 µs. The subcarrier spacing and the symbol length are reciprocals: that is what makes the subcarriers orthogonal.', hint: 'Take the reciprocal of 15 kHz.' },
        { q: 'How many OFDM symbols are in one 10 ms radio frame with normal CP?', answer: 140, tol: 0, solution: '10 subframes × 14 symbols = 140.', hint: 'Symbols per subframe times subframes per frame.' },
      ],
    },
    {
      type: 'gridfind', title: 'Find it in the grid',
      intro: 'This is subframe 0 of a 1.4 MHz FDD cell, but the channel colours are hidden. Click a resource element that belongs to each target. Use what you know about where each signal lives.',
      prompts: [
        { want: 'pss', ask: 'An element of the PSS', hint: 'The PSS is in the last symbol of slot 0, in the central 62 subcarriers.', why: 'Symbol 6, central subcarriers. Its fixed position lets a UE find the 5 ms timing before it knows anything else.' },
        { want: 'sss', ask: 'An element of the SSS', hint: 'In FDD the SSS sits in the symbol just before the PSS.', why: 'Symbol 5. The relative position of SSS and PSS also tells the UE whether the cell is FDD or TDD.' },
        { want: 'pbch', ask: 'An element of the PBCH (it carries the MIB)', hint: 'The first four symbols of the second slot, central 72 subcarriers.', why: 'Symbols 7 to 10, skipping the reference-signal positions.' },
        { want: 'crs', ask: 'A cell-specific reference signal (CRS)', hint: 'With two antenna ports they sit in symbols 0, 4, 7 and 11, every third subcarrier.', why: 'CRS positions shift with the PCI (here PCI mod 6 = 0). The UE uses them to estimate the channel and measure RSRP.' },
        { want: 'pdcch', ask: 'An element of the control region (PDCCH)', hint: 'The control region is at the very start of the subframe.', why: 'Symbols 0 to 2 here. With 10 RBs or fewer the control region is CFI + 1 symbols, so this cell signals CFI = 2. Every grant for this subframe lives in this region.' },
        { want: 'pdsch', ask: 'An element free for PDSCH user data', hint: 'Anything not used by control, reference signals, sync or broadcast.', why: 'For example symbols 3, 12 and 13. In subframes without PSS/SSS/PBCH, almost everything after the control region is PDSCH.' },
      ],
    },
  ],
  quiz: [
    { q: 'How long is one LTE subframe?', options: ['1 ms', '0.5 ms', '10 ms', '66.7 µs'], answer: 0, why: 'Subframe = 1 ms = one TTI. A slot is 0.5 ms, a frame 10 ms, and 66.7 µs is one symbol without CP.' },
    { q: 'A resource block spans…', options: ['12 subcarriers × 1 slot (180 kHz × 0.5 ms)', '1 subcarrier × 1 symbol', '72 subcarriers × 1 subframe', '15 kHz × 1 ms'], answer: 0, why: 'One subcarrier × one symbol is a resource element. 72 subcarriers is the central 6 RBs used by sync signals.' },
    { q: 'In LTE FDD, where are the PSS and SSS?', options: ['Subframes 0 and 5, in the central 6 RBs', 'Every subframe, across the full band', 'Only in subframe 9', 'In the PUCCH region'], answer: 0, why: 'Twice per frame, always in the centre, so a UE can find them without knowing the bandwidth.' },
    { q: 'A car reports a higher CQI than before. What will the eNB most likely do?', options: ['Raise the MCS: denser modulation and/or higher code rate', 'Hand the car over to another cell', 'Switch it to SC-PTM', 'Lower the MCS to be safe'], answer: 0, why: 'Higher CQI means better channel, so the eNB can pack more bits per resource element.' },
    { q: 'A UE has no PUSCH allocation but must send a HARQ ACK. Where does it go?', options: ['PUCCH at the band edges', 'PDCCH', 'PRACH', 'PBCH'], answer: 0, why: 'PUCCH carries uplink control information when there is no PUSCH. PDCCH and PBCH are downlink; PRACH is for random access.' },
  ],
  recap: `<ul><li>Why OFDM uses many slow subcarriers and a cyclic prefix.</li><li>The frame/subframe/slot/symbol structure and why n+4 means 4 ms.</li><li>RBs, REs, RBs per bandwidth, and where control, sync, broadcast and data sit.</li><li>How CQI, MCS and BLER work together.</li></ul>`,
});
