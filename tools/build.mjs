// Build Uu Quest from src/ (no dependencies; Node 18+).
//   index.html          standalone page: GitHub Pages, or double-click to open
//   dist/artifact.html  body-only variant for publishing as a claude.ai Artifact
// Usage: node tools/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const JS_PARTS = ['20-core.js', '30-sims.js', '40-glossary.js', '50-exits-1-4.js', '51-exits-5-8.js', '52-exits-9-13.js', '90-boot.js'];
const read = (f) => readFileSync(join(ROOT, 'src', f), 'utf8');

const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect x='3' y='3' width='58' height='58' rx='12' fill='%230b6b4a'/%3E%3Crect x='8' y='8' width='48' height='48' rx='8' fill='none' stroke='%23fff' stroke-width='3'/%3E%3Ctext x='32' y='42' font-family='Arial,sans-serif' font-size='24' font-weight='700' fill='%23fff' text-anchor='middle'%3EUu%3C/text%3E%3C/svg%3E";

export function build() {
  const head = read('00-head.html');
  const body = read('10-body.html');
  const script = '<script>\n(function () {\n"use strict";\n' + JS_PARTS.map(read).join('') + '\n})();\n</script>\n';
  const artifact = head + body + script;
  const standalone = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0b6b4a">
<meta property="og:title" content="C-V2X Uu Quest">
<meta property="og:description" content="A free browser game that teaches the C-V2X Uu interface: architecture, protocol stack, LTE/NR radio, procedures, QoS, scheduling and latency, broadcast, handover, security and Uu control of the sidelink.">
<meta property="og:type" content="website">
<link rel="icon" href="${FAVICON}">
${head}</head>
<body>
<noscript><p style="padding:24px;font-family:system-ui,sans-serif">Uu Quest is an interactive game and needs JavaScript. Please enable it and reload the page.</p></noscript>
${body}${script}</body>
</html>
`;
  return { artifact, standalone };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { artifact, standalone } = build();
  mkdirSync(join(ROOT, 'dist'), { recursive: true });
  writeFileSync(join(ROOT, 'index.html'), standalone);
  writeFileSync(join(ROOT, 'dist', 'artifact.html'), artifact);
  console.log(`built index.html (${standalone.length} chars) and dist/artifact.html (${artifact.length} chars)`);
}
