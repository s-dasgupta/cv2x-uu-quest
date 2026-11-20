// Consistency checks for Uu Quest (no dependencies; Node 18+). Usage: node tools/check.mjs
//  1. index.html is up to date with src/ (run `node tools/build.mjs` if not)
//  2. the bundled script compiles
//  3. every [[TERM]] used in the content has a glossary entry
//  4. the page loads nothing from outside Google Fonts
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { build, ROOT } from './build.mjs';

let failed = 0;
const ok = (msg) => console.log('ok   ' + msg);
const fail = (msg) => { failed++; console.log('FAIL ' + msg); };

const { standalone } = build();
const current = readFileSync(join(ROOT, 'index.html'), 'utf8');
current === standalone ? ok('index.html matches src/') : fail('index.html is stale: run `node tools/build.mjs`');

const js = standalone.slice(standalone.indexOf('<script>') + 8, standalone.lastIndexOf('</script>'));
try { new vm.Script(js, { filename: 'bundle.js' }); ok('script compiles'); } catch (e) { fail('script does not compile: ' + e.message); }

const src = join(ROOT, 'src');
const gl = readFileSync(join(src, '40-glossary.js'), 'utf8');
const keys = new Set([...gl.matchAll(/^\s*'([^']+)':\s*\[/gm)].map((m) => m[1]));
const used = new Map();
for (const f of readdirSync(src).filter((f) => f.endsWith('.js') && f !== '40-glossary.js')) {
  for (const m of readFileSync(join(src, f), 'utf8').matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) used.set(m[1], f);
}
for (const m of gl.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) used.set(m[1], '40-glossary.js');
used.delete('KEY'); // the placeholder in code comments that document the [[KEY]] syntax
const missing = [...used.keys()].filter((k) => !keys.has(k));
missing.length ? fail('glossary entries missing for: ' + missing.map((k) => `${k} (${used.get(k)})`).join(', ')) : ok(`${used.size} glossary terms used, all defined (${keys.size} entries)`);

// resources the page loads (scripts, styles, images, frames); plain <a> links are fine
const hosts = new Set([...standalone.matchAll(/<(?:script|link|img|iframe|source|video|audio)\b[^>]*?(?:src|href)=["'](https?:\/\/[^/"']+)/g)].map((m) => m[1]));
const allowed = new Set(['https://fonts.googleapis.com', 'https://fonts.gstatic.com']);
const extra = [...hosts].filter((h) => !allowed.has(h));
extra.length ? fail('unexpected external hosts: ' + extra.join(', ')) : ok('external resources: Google Fonts only');

process.exit(failed ? 1 : 0);
