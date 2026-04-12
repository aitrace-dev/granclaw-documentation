#!/usr/bin/env node
// scripts/check-backlinks.mjs
// Validates that every `backlinks: [slug]` in frontmatter points to an existing content file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.resolve(__dirname, '..', 'src', 'content', 'docs');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) out.push(full);
  }
  return out;
}

function frontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split('\n')) {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (!mm) continue;
    let [, k, v] = mm;
    v = v.trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      fm[k] = v.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean);
    } else {
      fm[k] = v.replace(/^["']|["']$/g, '');
    }
  }
  return fm;
}

const files = walk(DOCS_DIR);
const slugs = new Set(
  files.map((f) => path.relative(DOCS_DIR, f).replace(/\.(md|mdx)$/, ''))
);

let errors = 0;
for (const file of files) {
  const fm = frontmatter(fs.readFileSync(file, 'utf8'));
  const backlinks = Array.isArray(fm.backlinks) ? fm.backlinks : [];
  for (const b of backlinks) {
    if (!slugs.has(b)) {
      console.error(`✗ ${path.relative(process.cwd(), file)}: backlink "${b}" does not resolve`);
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(`\n${errors} broken backlink(s)`);
  process.exit(1);
}
console.log(`✓ ${files.length} files, all backlinks resolve`);
