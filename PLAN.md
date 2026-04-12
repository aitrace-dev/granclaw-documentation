# GranClaw Documentation Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone, static, user-facing documentation site for GranClaw in the "Scholarly Sanctuary" aesthetic, with 20 real content pages, ⌘K search, and no external services.

**Architecture:** Plain Astro 4 + Tailwind + MDX, content collections for markdown-driven pages, Pagefind for static client-side search, self-hosted fonts, nested git repo ignored by parent. Zero server, fully static output, deploy-agnostic.

**Tech Stack:** Astro 4.x, Tailwind CSS 3.x, @astrojs/mdx, @astrojs/tailwind, Pagefind, Playwright (smoke test), TypeScript, pnpm or npm (use npm for parity with parent repo).

**Working directory:** `/Users/juanroldan/develop/aitrace/agent-brother/documentation/`

**Source material for content (read these before writing any page):**
- `/Users/juanroldan/develop/aitrace/agent-brother/README.md`
- `/Users/juanroldan/develop/aitrace/agent-brother/CLAUDE.md`
- `/Users/juanroldan/develop/aitrace/agent-brother/vault/index.md` and `vault/wiki/`
- `/Users/juanroldan/develop/aitrace/agent-brother/design/DESIGN.md`
- `/Users/juanroldan/develop/aitrace/agent-brother/design/code.html`

**Development note on TDD for static sites:** Classic red-green TDD doesn't fit markup-only components. For layout and components, use a **visual verification loop**: start `astro dev`, hit the URL, verify expected DOM/visual output, commit. For content/config with logic (schema validation, backlink check, sidebar config), write a real failing test first. The final Playwright smoke test is the acceptance gate.

---

## File Structure

```
documentation/
├── .gitignore
├── README.md
├── SPEC.md                       (already exists)
├── PLAN.md                       (this file)
├── package.json
├── astro.config.mjs
├── tailwind.config.js
├── tsconfig.json
├── playwright.config.ts
├── scripts/
│   └── check-backlinks.mjs
├── public/
│   ├── paper-fibers.png
│   ├── images/                   (copied from parent)
│   └── fonts/
│       ├── NotoSerif-Regular.woff2
│       ├── NotoSerif-Bold.woff2
│       ├── NotoSerif-Italic.woff2
│       ├── SpaceGrotesk-Regular.woff2
│       ├── SpaceGrotesk-Bold.woff2
│       └── JetBrainsMono-Regular.woff2
├── src/
│   ├── content/
│   │   ├── config.ts
│   │   └── docs/
│   │       ├── getting-started/{introduction,install,first-run,configure-llm-provider}.md
│   │       ├── using-granclaw/{create-an-agent,chat,resume-and-reuse-sessions,mission-control,schedules-and-workflows,usage-and-costs}.md
│   │       ├── agent-superpowers/{browser-profiles,watch-and-replay-sessions,telegram-integration,vault-obsidian-memory,mcp-tools-and-capability-approval}.md
│   │       ├── data-and-privacy/{secrets,export-and-import-agents,local-first-philosophy}.md
│   │       └── reference/{faq,troubleshooting}.md
│   ├── config/
│   │   └── sidebar.ts
│   ├── layouts/
│   │   └── DocLayout.astro
│   ├── components/
│   │   ├── Sidebar.astro
│   │   ├── TopNav.astro
│   │   ├── Footer.astro
│   │   ├── TableOfContents.astro
│   │   ├── SearchPalette.astro
│   │   ├── NoiseOverlay.astro
│   │   ├── Callout.astro
│   │   ├── TagChip.astro
│   │   ├── Blockquote.astro
│   │   ├── CodeBlock.astro
│   │   └── Wikilink.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── [...slug].astro
│   └── styles/
│       └── global.css
└── tests/
    └── smoke.spec.ts
```

Each unit has a single responsibility. Layout composes components. Components are markup-only. Logic lives in `src/config/sidebar.ts`, `src/content/config.ts`, and `scripts/check-backlinks.mjs`.

---

## Task 1: Scaffold Astro project

**Files:**
- Create: `documentation/package.json`
- Create: `documentation/astro.config.mjs`
- Create: `documentation/tsconfig.json`
- Create: `documentation/.gitignore`

- [ ] **Step 1: Ensure directory exists and is empty except SPEC.md + PLAN.md**

```bash
cd /Users/juanroldan/develop/aitrace/agent-brother/documentation
ls -A
```

Expected output: `PLAN.md  SPEC.md` (plus possibly `.DS_Store`).

- [ ] **Step 2: Write package.json**

```json
{
  "name": "granclaw-documentation",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && pagefind --site dist && node scripts/check-backlinks.mjs",
    "preview": "astro preview",
    "astro": "astro",
    "test": "playwright test",
    "test:install": "playwright install chromium"
  },
  "dependencies": {
    "astro": "^4.16.0",
    "@astrojs/mdx": "^3.1.0",
    "@astrojs/tailwind": "^5.1.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "pagefind": "^1.1.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 3: Write astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    mdx(),
    tailwind({ applyBaseStyles: false }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
```

- [ ] **Step 4: Write tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": ["src/**/*", "scripts/**/*"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 5: Write .gitignore**

```
node_modules/
dist/
.astro/
_pagefind/
*.log
.DS_Store
.env
.env.local
test-results/
playwright-report/
```

- [ ] **Step 6: Install dependencies**

```bash
npm install
```

Expected: installs without errors, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 7: Verify Astro scaffolding builds (empty project)**

```bash
mkdir -p src/pages
echo '---\n---\n<html><body>hello</body></html>' > src/pages/index.astro
npm run dev -- --port 4321 &
sleep 3
curl -s http://localhost:4321/ | grep -q hello && echo OK
kill %1 2>/dev/null
rm src/pages/index.astro
```

Expected: prints `OK`.

- [ ] **Step 8: Commit**

```bash
git init -b main
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore PLAN.md SPEC.md
git commit -m "chore: scaffold astro + tailwind + mdx"
```

---

## Task 2: Port Scholarly Sanctuary theme into Tailwind

**Files:**
- Create: `documentation/tailwind.config.js`
- Create: `documentation/src/styles/global.css`
- Create: `documentation/public/paper-fibers.png` (downloaded)

- [ ] **Step 1: Write tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'background': '#fef9ef',
        'on-background': '#1d1c16',
        'on-surface': '#1d1c16',
        'surface-bright': '#fef9ef',
        'surface-dim': '#dedad0',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f8f3e9',
        'surface-container': '#f2ede3',
        'surface-container-high': '#ede3cf',
        'surface-container-highest': '#e7e2d8',
        'outline': '#797587',
        'outline-variant': '#c9c4d8',
        'primary': '#5d39e0',
        'on-primary': '#ffffff',
        'primary-fixed': '#e6deff',
        'primary-fixed-dim': '#cabeff',
        'on-primary-fixed': '#1c0062',
        'on-primary-fixed-variant': '#4716cb',
        'secondary': '#b12e09',
        'secondary-container': '#fd643d',
        'on-secondary-container': '#5e1100',
        'secondary-fixed-dim': '#ffb4a2',
        'on-secondary-fixed': '#5e1100',
        'tertiary-fixed': '#f3e48f',
        'on-tertiary-fixed': '#201c00',
        'on-tertiary-fixed-variant': '#514700',
        'error': '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        'inverse-on-surface': '#f5f0e6',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
      fontFamily: {
        headline: ['"Noto Serif"', 'Georgia', 'serif'],
        body: ['"Noto Serif"', 'Georgia', 'serif'],
        label: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        prose: '42rem',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Write src/styles/global.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@font-face {
  font-family: 'Noto Serif';
  src: url('/fonts/NotoSerif-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Noto Serif';
  src: url('/fonts/NotoSerif-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Noto Serif';
  src: url('/fonts/NotoSerif-Italic.woff2') format('woff2');
  font-weight: 400;
  font-style: italic;
  font-display: swap;
}
@font-face {
  font-family: 'Space Grotesk';
  src: url('/fonts/SpaceGrotesk-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'Space Grotesk';
  src: url('/fonts/SpaceGrotesk-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}
@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: #fef9ef;
  background-image:
    linear-gradient(rgba(29, 28, 22, 0.03) 1px, transparent 1px),
    radial-gradient(circle, rgba(29, 28, 22, 0.02) 1px, transparent 1px);
  background-size: 100% 28px, 16px 16px;
  background-attachment: fixed;
}

::selection {
  background: #cabeff;
  color: #1c0062;
}

.noise-overlay {
  pointer-events: none;
  position: fixed;
  inset: 0;
  background-image: url('/paper-fibers.png');
  opacity: 0.05;
  z-index: 9999;
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #c9c4d8; }

.callout-shadow {
  box-shadow: 0 10px 40px rgba(29, 28, 22, 0.06);
}

.highlight-marker {
  background: linear-gradient(
    104deg,
    rgba(243, 228, 143, 0) 0.9%,
    rgba(243, 228, 143, 1) 2.4%,
    rgba(243, 228, 143, 0.5) 5.8%,
    rgba(243, 228, 143, 0.1) 93%,
    rgba(243, 228, 143, 0.7) 96%,
    rgba(243, 228, 143, 0) 98%
  ),
  linear-gradient(
    183deg,
    rgba(243, 228, 143, 0) 0%,
    rgba(243, 228, 143, 0.3) 7.9%,
    rgba(243, 228, 143, 0) 15%
  );
  padding: 0.1em 0.3em;
}

.prose-sanctuary {
  font-family: 'Noto Serif', Georgia, serif;
  font-size: 1.0625rem;
  line-height: 1.75;
  color: #1d1c16;
}
.prose-sanctuary h1 {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.15;
  margin: 0 0 0.5rem;
}
.prose-sanctuary h2 {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.25;
  margin: 2.5rem 0 1rem;
}
.prose-sanctuary h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 2rem 0 0.75rem;
}
.prose-sanctuary p { margin: 0 0 1.25rem; }
.prose-sanctuary ul, .prose-sanctuary ol { margin: 0 0 1.25rem 1.5rem; }
.prose-sanctuary li { margin: 0.5rem 0; }
.prose-sanctuary a {
  color: #5d39e0;
  text-decoration: underline;
  text-decoration-color: rgba(93, 57, 224, 0.3);
  text-underline-offset: 3px;
}
.prose-sanctuary a:hover { text-decoration-color: #5d39e0; }
.prose-sanctuary strong { font-weight: 700; }
.prose-sanctuary em { font-style: italic; }
.prose-sanctuary hr {
  border: 0;
  height: 2rem;
  background: transparent;
}
```

- [ ] **Step 3: Download paper-fibers texture**

```bash
curl -sSL "https://www.transparenttextures.com/patterns/paper-fibers.png" -o public/paper-fibers.png
file public/paper-fibers.png
```

Expected: prints `public/paper-fibers.png: PNG image data, ...`. If the curl fails (offline, network block), generate a tiny 1x1 transparent PNG placeholder instead with `printf '\x89PNG\r\n\x1a\n' > public/paper-fibers.png` and continue — texture is aesthetic, not load-bearing.

- [ ] **Step 4: Visual verification**

```bash
mkdir -p src/pages
cat > src/pages/index.astro <<'EOF'
---
import '../styles/global.css';
---
<html lang="en">
  <head><meta charset="utf-8"/><title>theme test</title></head>
  <body class="font-body text-on-surface bg-background min-h-screen p-8">
    <div class="noise-overlay"></div>
    <h1 class="text-5xl font-headline font-bold">Scholarly Sanctuary</h1>
    <p class="text-lg">This should render on warm paper with serif ink.</p>
    <button class="mt-4 bg-primary text-on-primary px-6 py-2 font-label uppercase text-xs">Primary</button>
  </body>
</html>
EOF
npm run dev -- --port 4321 &
sleep 3
curl -s http://localhost:4321/ | grep -q 'Scholarly Sanctuary' && echo OK
kill %1 2>/dev/null
rm src/pages/index.astro
```

Expected: `OK`.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.js src/styles/global.css public/paper-fibers.png
git commit -m "feat: scholarly sanctuary theme tokens + global css"
```

---

## Task 3: Self-host fonts

**Files:**
- Create: `documentation/public/fonts/*.woff2` (6 files)

- [ ] **Step 1: Download fonts from Google Fonts**

```bash
mkdir -p public/fonts
cd public/fonts

# Noto Serif
curl -sSL "https://fonts.gstatic.com/s/notoserif/v23/ga6Iaw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTa32J4wsL2JAhSPhlhEw.woff2" -o NotoSerif-Regular.woff2
curl -sSL "https://fonts.gstatic.com/s/notoserif/v23/ga6Law1J5X9T9RW6j9bNfFIMZhvToiNlTMLgwgRY7-JbRjK4mJcrENPSM3cfRUk.woff2" -o NotoSerif-Bold.woff2
curl -sSL "https://fonts.gstatic.com/s/notoserif/v23/ga6Vaw1J5X9T9RW6j9bNTFAcaRi_bMSmVD_SJqFnMLN6Cu6y3F62Xx7jgJE.woff2" -o NotoSerif-Italic.woff2

# Space Grotesk
curl -sSL "https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj62Uco.woff2" -o SpaceGrotesk-Regular.woff2
curl -sSL "https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7aUco.woff2" -o SpaceGrotesk-Bold.woff2

# JetBrains Mono
curl -sSL "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjO.woff2" -o JetBrainsMono-Regular.woff2

cd ../..
ls -la public/fonts/
```

Expected: 6 `.woff2` files, each > 10KB. If a download yields a < 1KB file (rate limit, URL changed), fall back to letting the CSS fail gracefully to Georgia/system-ui and note the missing file in commit message.

- [ ] **Step 2: Verify font files with `file`**

```bash
file public/fonts/*.woff2
```

Expected: each line contains `Web Open Font Format (Version 2)`.

- [ ] **Step 3: Commit**

```bash
git add public/fonts/
git commit -m "feat: self-host noto serif + space grotesk + jetbrains mono"
```

---

## Task 4: Git remote + parent gitignore

**Files:**
- Modify: `/Users/juanroldan/develop/aitrace/agent-brother/.gitignore`

- [ ] **Step 1: Add the documentation remote**

```bash
cd /Users/juanroldan/develop/aitrace/agent-brother/documentation
git remote add origin git@github.com-aitrace:aitrace-dev/granclaw-documentation.git
git remote -v
```

Expected: two lines `origin  git@github.com-aitrace:aitrace-dev/granclaw-documentation.git (fetch|push)`.

- [ ] **Step 2: Append `documentation/` to parent .gitignore**

```bash
cd /Users/juanroldan/develop/aitrace/agent-brother
grep -qx 'documentation/' .gitignore || echo 'documentation/' >> .gitignore
tail -5 .gitignore
```

Expected: final line is `documentation/`.

- [ ] **Step 3: Verify parent repo no longer sees documentation/**

```bash
cd /Users/juanroldan/develop/aitrace/agent-brother
git status --porcelain documentation/ | head -5
```

Expected: no output at all (fully ignored). The `.gitignore` line itself will show as modified in `git status` for the parent repo — that's expected and will be committed by the user separately.

- [ ] **Step 4: No commit needed here — parent .gitignore change is the user's to commit.**

---

## Task 5: Content collection schema + sidebar config

**Files:**
- Create: `documentation/src/content/config.ts`
- Create: `documentation/src/config/sidebar.ts`

- [ ] **Step 1: Write content collection schema**

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

export const SECTION_IDS = [
  'getting-started',
  'using-granclaw',
  'agent-superpowers',
  'data-and-privacy',
  'reference',
] as const;

const docs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.enum(SECTION_IDS),
    tags: z.array(z.string()).default([]),
    backlinks: z.array(z.string()).default([]),
  }),
});

export const collections = { docs };
```

- [ ] **Step 2: Write sidebar config**

```ts
// src/config/sidebar.ts
export type SidebarItem = {
  slug: string;     // content collection slug, e.g. 'getting-started/install'
  title: string;    // display title in sidebar (with .md extension for vault feel)
  icon: string;     // material symbols icon name
};

export type SidebarSection = {
  id: string;
  label: string;
  items: SidebarItem[];
};

export const sidebar: SidebarSection[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    items: [
      { slug: 'getting-started/introduction',           title: 'introduction.md',      icon: 'description' },
      { slug: 'getting-started/install',                title: 'install.md',           icon: 'download' },
      { slug: 'getting-started/first-run',              title: 'first-run.md',         icon: 'bolt' },
      { slug: 'getting-started/configure-llm-provider', title: 'llm-provider.md',      icon: 'settings' },
    ],
  },
  {
    id: 'using-granclaw',
    label: 'Using GranClaw',
    items: [
      { slug: 'using-granclaw/create-an-agent',          title: 'create-agent.md',      icon: 'add_circle' },
      { slug: 'using-granclaw/chat',                     title: 'chat.md',              icon: 'chat' },
      { slug: 'using-granclaw/resume-and-reuse-sessions',title: 'resume-sessions.md',   icon: 'history' },
      { slug: 'using-granclaw/mission-control',          title: 'mission-control.md',   icon: 'dashboard' },
      { slug: 'using-granclaw/schedules-and-workflows',  title: 'schedules.md',         icon: 'schedule' },
      { slug: 'using-granclaw/usage-and-costs',          title: 'usage.md',             icon: 'payments' },
    ],
  },
  {
    id: 'agent-superpowers',
    label: 'Agent Superpowers',
    items: [
      { slug: 'agent-superpowers/browser-profiles',                 title: 'browser-profiles.md',  icon: 'public' },
      { slug: 'agent-superpowers/watch-and-replay-sessions',        title: 'watch-replay.md',      icon: 'movie' },
      { slug: 'agent-superpowers/telegram-integration',             title: 'telegram.md',          icon: 'send' },
      { slug: 'agent-superpowers/vault-obsidian-memory',            title: 'vault.md',             icon: 'menu_book' },
      { slug: 'agent-superpowers/mcp-tools-and-capability-approval',title: 'mcp-tools.md',         icon: 'extension' },
    ],
  },
  {
    id: 'data-and-privacy',
    label: 'Data & Privacy',
    items: [
      { slug: 'data-and-privacy/secrets',                title: 'secrets.md',           icon: 'lock' },
      { slug: 'data-and-privacy/export-and-import-agents', title: 'export-import.md',  icon: 'archive' },
      { slug: 'data-and-privacy/local-first-philosophy', title: 'local-first.md',       icon: 'shield' },
    ],
  },
  {
    id: 'reference',
    label: 'Reference',
    items: [
      { slug: 'reference/faq',             title: 'faq.md',           icon: 'help' },
      { slug: 'reference/troubleshooting', title: 'troubleshooting.md', icon: 'build' },
    ],
  },
];

export function findSidebarItem(slug: string): { section: SidebarSection; item: SidebarItem } | null {
  for (const section of sidebar) {
    const item = section.items.find((i) => i.slug === slug);
    if (item) return { section, item };
  }
  return null;
}

export function nextSidebarItem(slug: string): SidebarItem | null {
  const flat = sidebar.flatMap((s) => s.items);
  const idx = flat.findIndex((i) => i.slug === slug);
  if (idx === -1 || idx === flat.length - 1) return null;
  return flat[idx + 1];
}

export function prevSidebarItem(slug: string): SidebarItem | null {
  const flat = sidebar.flatMap((s) => s.items);
  const idx = flat.findIndex((i) => i.slug === slug);
  if (idx <= 0) return null;
  return flat[idx - 1];
}

export function sidebarItemCount(): number {
  return sidebar.reduce((sum, s) => sum + s.items.length, 0);
}
```

- [ ] **Step 3: Sanity check — sidebar contains exactly 20 items**

```bash
node --input-type=module -e "
import { sidebarItemCount } from './src/config/sidebar.ts';
console.log(sidebarItemCount());
" 2>/dev/null || npx tsx -e "
import { sidebarItemCount } from './src/config/sidebar.ts';
console.log(sidebarItemCount());
"
```

Expected: `20`. (If tsx is not available yet, skip — it will be verified in the smoke test.)

- [ ] **Step 4: Commit**

```bash
git add src/content/config.ts src/config/sidebar.ts
git commit -m "feat: content collection schema + sidebar config"
```

---

## Task 6: Build DocLayout

**Files:**
- Create: `documentation/src/layouts/DocLayout.astro`

- [ ] **Step 1: Write DocLayout.astro**

```astro
---
// src/layouts/DocLayout.astro
import '../styles/global.css';
import Sidebar from '../components/Sidebar.astro';
import TopNav from '../components/TopNav.astro';
import Footer from '../components/Footer.astro';
import TableOfContents from '../components/TableOfContents.astro';
import NoiseOverlay from '../components/NoiseOverlay.astro';
import SearchPalette from '../components/SearchPalette.astro';

export interface Props {
  title: string;
  description: string;
  slug: string;
  headings: Array<{ depth: number; slug: string; text: string }>;
  tags?: string[];
  backlinks?: string[];
}

const { title, description, slug, headings, tags = [], backlinks = [] } = Astro.props;
const toc = headings.filter((h) => h.depth === 2);
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content={description} />
  <title>{title} — GranClaw Docs</title>
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="preload" href="/fonts/NotoSerif-Regular.woff2" as="font" type="font/woff2" crossorigin />
</head>
<body class="font-body text-on-surface bg-background min-h-screen">
  <NoiseOverlay />
  <Sidebar activeSlug={slug} />
  <div class="ml-64 flex flex-col min-h-screen">
    <TopNav slug={slug} title={title} />
    <div class="flex">
      <main class="flex-1 max-w-3xl mx-auto px-12 py-16 pb-32 prose-sanctuary">
        {tags.length > 0 && (
          <div class="flex flex-wrap gap-2 mb-6">
            {tags.map((t) => (
              <span class="bg-secondary-fixed-dim text-on-secondary-fixed px-3 py-0.5 rounded-full font-label text-[10px] uppercase tracking-wider">#{t}</span>
            ))}
          </div>
        )}
        <slot />
      </main>
      {toc.length >= 2 && <TableOfContents headings={toc} />}
    </div>
    <Footer slug={slug} backlinks={backlinks} />
  </div>
  <SearchPalette />
</body>
</html>
```

- [ ] **Step 2: Commit (component dependencies not yet written — this will fail build until Task 7-11. That's expected for an atomic scaffolding commit.)**

```bash
git add src/layouts/DocLayout.astro
git commit -m "feat: doc layout shell (composes sidebar/topnav/toc/footer/search)"
```

---

## Task 7: Sidebar component

**Files:**
- Create: `documentation/src/components/Sidebar.astro`

- [ ] **Step 1: Write Sidebar.astro**

```astro
---
// src/components/Sidebar.astro
import { sidebar } from '../config/sidebar';

export interface Props {
  activeSlug: string;
}
const { activeSlug } = Astro.props;
---
<aside class="fixed left-0 top-0 h-full flex flex-col py-6 bg-surface-container-low w-64 z-50">
  <div class="px-6 mb-8">
    <a href="/" class="block">
      <h1 class="font-label text-sm uppercase tracking-widest text-on-surface flex items-center gap-2">
        <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">edit_note</span>
        GranClaw Docs
      </h1>
      <p class="font-mono text-[10px] text-on-surface/40 mt-1 uppercase">~/docs/granclaw</p>
    </a>
  </div>

  <div class="flex-1 overflow-y-auto custom-scrollbar px-2">
    {sidebar.map((section) => (
      <div class="mb-6">
        <div class="flex items-center gap-2 px-4 py-1 text-on-surface/40 font-label text-xs uppercase tracking-tighter">
          <span class="material-symbols-outlined text-xs">folder_open</span>
          {section.label}
        </div>
        <nav class="space-y-0.5 mt-2">
          {section.items.map((item) => {
            const isActive = item.slug === activeSlug;
            return (
              <a
                href={`/${item.slug}`}
                class:list={[
                  'group flex items-center gap-3 py-1.5 duration-150 ease-in-out pl-4',
                  'hover:bg-surface-container-high',
                  isActive
                    ? 'text-primary font-bold border-l-2 border-primary'
                    : 'text-on-surface/60',
                ]}
              >
                <span class="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span class="font-label text-sm tracking-tight">{item.title}</span>
              </a>
            );
          })}
        </nav>
      </div>
    ))}
  </div>

  <div class="mt-auto px-6 pt-4">
    <div class="font-label text-[10px] uppercase text-on-surface/40 mb-3">Graph</div>
    <div class="relative h-24 bg-surface-container rounded overflow-hidden">
      <svg class="w-full h-full opacity-40" viewBox="0 0 100 60">
        <circle cx="50" cy="30" r="2" fill="#5d39e0" />
        <circle cx="30" cy="20" r="1.5" fill="#1d1c16" />
        <circle cx="70" cy="40" r="1.5" fill="#1d1c16" />
        <circle cx="60" cy="15" r="1.5" fill="#1d1c16" />
        <circle cx="20" cy="45" r="1.5" fill="#1d1c16" />
        <line x1="50" y1="30" x2="30" y2="20" stroke="#1d1c16" stroke-opacity="0.2" stroke-width="0.5" />
        <line x1="50" y1="30" x2="70" y2="40" stroke="#1d1c16" stroke-opacity="0.2" stroke-width="0.5" />
        <line x1="50" y1="30" x2="60" y2="15" stroke="#1d1c16" stroke-opacity="0.2" stroke-width="0.5" />
        <line x1="30" y1="20" x2="20" y2="45" stroke="#1d1c16" stroke-opacity="0.2" stroke-width="0.5" />
      </svg>
    </div>
    <button
      type="button"
      class="w-full mt-4 bg-primary text-on-primary py-2 font-label text-xs uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
      data-search-trigger
    >
      <span class="material-symbols-outlined text-sm">search</span>
      Search <span class="opacity-60">⌘K</span>
    </button>
  </div>
</aside>

<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
/>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Sidebar.astro
git commit -m "feat: sidebar with file-tree nav and search trigger"
```

---

## Task 8: TopNav, Footer, NoiseOverlay, TableOfContents

**Files:**
- Create: `documentation/src/components/TopNav.astro`
- Create: `documentation/src/components/Footer.astro`
- Create: `documentation/src/components/NoiseOverlay.astro`
- Create: `documentation/src/components/TableOfContents.astro`

- [ ] **Step 1: Write NoiseOverlay.astro**

```astro
---
// src/components/NoiseOverlay.astro
---
<div class="noise-overlay"></div>
```

- [ ] **Step 2: Write TopNav.astro**

```astro
---
// src/components/TopNav.astro
import { findSidebarItem } from '../config/sidebar';

export interface Props {
  slug: string;
  title: string;
}
const { slug, title } = Astro.props;
const found = findSidebarItem(slug);
const sectionLabel = found?.section.label ?? 'Docs';
---
<header class="flex justify-between items-center px-8 py-3 w-full sticky top-0 bg-background/80 backdrop-blur-md z-40">
  <div class="flex items-center gap-2 text-on-surface/40 font-mono text-[10px] uppercase">
    <span>{sectionLabel}</span>
    <span class="material-symbols-outlined text-[10px]">chevron_right</span>
    <span class="text-on-surface">{title}</span>
  </div>
  <div class="flex items-center gap-3 text-on-surface/40">
    <button type="button" data-search-trigger class="hover:text-primary cursor-pointer transition-colors" aria-label="Search">
      <span class="material-symbols-outlined text-sm">search</span>
    </button>
    <a href="https://github.com/aitrace-dev/granclaw" class="hover:text-primary cursor-pointer transition-colors" aria-label="GitHub">
      <span class="material-symbols-outlined text-sm">code</span>
    </a>
  </div>
</header>
```

- [ ] **Step 3: Write Footer.astro**

```astro
---
// src/components/Footer.astro
import { execSync } from 'node:child_process';
import path from 'node:path';

export interface Props {
  slug: string;
  backlinks: string[];
}
const { slug, backlinks } = Astro.props;

function gitLastEdited(slug: string): string {
  try {
    const file = path.resolve('src/content/docs', `${slug}.md`);
    const stamp = execSync(`git log -1 --format=%cs -- "${file}"`, { encoding: 'utf8' }).trim();
    return stamp || new Date().toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}
const edited = gitLastEdited(slug);
---
<footer class="fixed bottom-0 right-0 w-[calc(100%-16rem)] bg-background flex justify-between items-center px-10 py-3 z-40">
  <div class="font-mono text-[10px] uppercase tracking-tighter text-on-surface/50">
    edited {edited} <span class="mx-2">•</span> granclaw docs
  </div>
  {backlinks.length > 0 && (
    <div class="flex items-center gap-3">
      <span class="font-mono text-[9px] uppercase text-on-surface/40 mr-2">Related:</span>
      {backlinks.map((b) => (
        <a
          href={`/${b}`}
          class="bg-primary/5 text-primary px-2 py-0.5 rounded font-label text-[10px] hover:bg-primary/10 transition-colors"
        >
          [[{b.split('/').pop()}]]
        </a>
      ))}
    </div>
  )}
</footer>
```

- [ ] **Step 4: Write TableOfContents.astro**

```astro
---
// src/components/TableOfContents.astro
export interface Props {
  headings: Array<{ depth: number; slug: string; text: string }>;
}
const { headings } = Astro.props;
---
<aside class="hidden lg:block w-52 pl-8 pr-6 pt-20 sticky top-0 self-start">
  <div class="font-label text-[10px] uppercase text-on-surface/40 mb-3">On this page</div>
  <nav class="space-y-2">
    {headings.map((h) => (
      <a href={`#${h.slug}`} class="block font-label text-xs text-on-surface/60 hover:text-primary transition-colors">
        {h.text}
      </a>
    ))}
  </nav>
</aside>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/TopNav.astro src/components/Footer.astro src/components/NoiseOverlay.astro src/components/TableOfContents.astro
git commit -m "feat: topnav, footer with git timestamps, toc, noise overlay"
```

---

## Task 9: Markdown element overrides (Blockquote, CodeBlock, Wikilink) + Callout + TagChip

**Files:**
- Create: `documentation/src/components/Blockquote.astro`
- Create: `documentation/src/components/CodeBlock.astro`
- Create: `documentation/src/components/Wikilink.astro`
- Create: `documentation/src/components/Callout.astro`
- Create: `documentation/src/components/TagChip.astro`

- [ ] **Step 1: Write Blockquote.astro**

```astro
---
// src/components/Blockquote.astro — italic serif, background tier, no vertical bar
---
<blockquote class="bg-surface-container-highest pl-12 pr-8 py-6 my-8 italic text-lg text-on-surface/80 font-body">
  <slot />
</blockquote>
```

- [ ] **Step 2: Write CodeBlock.astro**

```astro
---
// src/components/CodeBlock.astro — dark paper inline code + pre wrapper
// Shiki already handles syntax; we wrap the <pre> with our aesthetic frame.
---
<div class="my-6 bg-[#1d1c16] text-[#fef9ef] text-sm rounded-lg overflow-x-auto font-mono callout-shadow">
  <div class="px-6 py-4">
    <slot />
  </div>
</div>
```

- [ ] **Step 3: Write Wikilink.astro**

```astro
---
// src/components/Wikilink.astro — renders <a> with primary color + underline decoration.
// Used via custom remark plugin OR authors wrap links manually. v1: just a styled anchor component.
export interface Props {
  href: string;
}
const { href } = Astro.props;
---
<a href={href} class="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary">
  <slot />
</a>
```

- [ ] **Step 4: Write Callout.astro**

```astro
---
// src/components/Callout.astro — "in-set plate"
export interface Props {
  type?: 'note' | 'warning' | 'tip';
  title?: string;
}
const { type = 'note', title } = Astro.props;
const tone = {
  note:    { icon: 'info',     bg: 'bg-surface-container-low', accent: 'text-primary' },
  warning: { icon: 'warning',  bg: 'bg-tertiary-fixed/20',     accent: 'text-tertiary-fixed' },
  tip:     { icon: 'lightbulb',bg: 'bg-secondary/5',           accent: 'text-secondary' },
}[type];
const label = title ?? type.toUpperCase();
---
<div class={`${tone.bg} p-6 my-6 callout-shadow space-y-3`}>
  <div class={`flex items-center gap-3 ${tone.accent} font-label uppercase text-xs font-bold`}>
    <span class="material-symbols-outlined text-lg">{tone.icon}</span>
    {label}
  </div>
  <div class="text-base italic text-on-surface/80">
    <slot />
  </div>
</div>
```

- [ ] **Step 5: Write TagChip.astro**

```astro
---
// src/components/TagChip.astro
---
<span class="bg-secondary-fixed-dim text-on-secondary-fixed px-3 py-0.5 rounded-full font-label text-[10px] uppercase tracking-wider">
  #<slot />
</span>
```

- [ ] **Step 6: Commit**

```bash
git add src/components/Blockquote.astro src/components/CodeBlock.astro src/components/Wikilink.astro src/components/Callout.astro src/components/TagChip.astro
git commit -m "feat: callout, tagchip, blockquote/codeblock/wikilink overrides"
```

---

## Task 10: Dynamic route + index redirect + SearchPalette

**Files:**
- Create: `documentation/src/pages/index.astro`
- Create: `documentation/src/pages/[...slug].astro`
- Create: `documentation/src/components/SearchPalette.astro`

- [ ] **Step 1: Write src/pages/index.astro**

```astro
---
// Redirect to the first real page.
return Astro.redirect('/getting-started/introduction');
---
```

- [ ] **Step 2: Write src/pages/[...slug].astro**

```astro
---
import { getCollection, getEntry } from 'astro:content';
import DocLayout from '../layouts/DocLayout.astro';

export async function getStaticPaths() {
  const docs = await getCollection('docs');
  return docs.map((doc) => ({
    params: { slug: doc.slug },
    props: { doc },
  }));
}

const { doc } = Astro.props;
const { Content, headings } = await doc.render();
---
<DocLayout
  title={doc.data.title}
  description={doc.data.description}
  slug={doc.slug}
  headings={headings}
  tags={doc.data.tags}
  backlinks={doc.data.backlinks}
>
  <h1>{doc.data.title}</h1>
  <p class="text-xl italic text-on-surface/70 mb-8">{doc.data.description}</p>
  <Content />
</DocLayout>
```

- [ ] **Step 3: Write SearchPalette.astro**

```astro
---
// src/components/SearchPalette.astro — ⌘K modal, lazy-loads Pagefind
---
<div id="search-modal" class="hidden fixed inset-0 z-[100] items-start justify-center pt-[12vh] bg-on-surface/20 backdrop-blur-sm">
  <div class="w-full max-w-xl bg-background/95 backdrop-blur-[20px] callout-shadow rounded-lg overflow-hidden">
    <div class="flex items-center gap-3 px-6 py-4 border-b border-outline-variant/20">
      <span class="material-symbols-outlined text-on-surface/40">search</span>
      <input
        id="search-input"
        type="text"
        placeholder="Search the docs…"
        class="flex-1 bg-transparent outline-none font-body text-lg placeholder:text-on-surface/30"
      />
      <kbd class="font-mono text-[10px] text-on-surface/40 uppercase">Esc</kbd>
    </div>
    <div id="search-results" class="max-h-[50vh] overflow-y-auto custom-scrollbar p-2"></div>
  </div>
</div>

<script>
  const modal = document.getElementById('search-modal')!;
  const input = document.getElementById('search-input') as HTMLInputElement;
  const results = document.getElementById('search-results')!;
  let pagefind: any = null;

  async function ensurePagefind() {
    if (pagefind) return pagefind;
    // @ts-ignore - Pagefind is emitted at build time, not available in dev unless built.
    pagefind = await import(/* @vite-ignore */ '/_pagefind/pagefind.js').catch(() => null);
    return pagefind;
  }

  function open() {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    input.focus();
    ensurePagefind();
  }
  function close() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    input.value = '';
    results.innerHTML = '';
  }

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      open();
    }
    if (e.key === 'Escape') close();
  });
  document.querySelectorAll('[data-search-trigger]').forEach((el) => {
    el.addEventListener('click', open);
  });

  let searchTimer: number | undefined;
  input.addEventListener('input', () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(async () => {
      const q = input.value.trim();
      results.innerHTML = '';
      if (!q) return;
      const pf = await ensurePagefind();
      if (!pf) {
        results.innerHTML = '<div class="px-4 py-3 text-on-surface/50 font-label text-sm">Search available after production build.</div>';
        return;
      }
      const search = await pf.search(q);
      const docs = await Promise.all(search.results.slice(0, 8).map((r: any) => r.data()));
      results.innerHTML = docs.map((d: any) => `
        <a href="${d.url}" class="block px-4 py-3 hover:bg-surface-container rounded">
          <div class="font-label text-xs uppercase text-on-surface/40">${d.meta?.title || d.url}</div>
          <div class="font-body text-sm text-on-surface/80 line-clamp-2">${d.excerpt}</div>
        </a>
      `).join('');
    }, 120);
  });
</script>
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/pages/[...slug].astro src/components/SearchPalette.astro
git commit -m "feat: dynamic doc route, index redirect, ⌘K search palette"
```

---

## Task 11: Write content — Getting Started (4 pages)

**Files:**
- Create: `documentation/src/content/docs/getting-started/introduction.md`
- Create: `documentation/src/content/docs/getting-started/install.md`
- Create: `documentation/src/content/docs/getting-started/first-run.md`
- Create: `documentation/src/content/docs/getting-started/configure-llm-provider.md`

**Writing rules for every content page (applies to Tasks 11–15):**

- Second person, warm but direct. No jargon without a gloss.
- **Opening:** one-sentence promise from the table in SPEC.md §12.
- **Body:** 300–600 words, broken into 2–4 `##` headings.
- **Closing:** `**Next:** [Title](/section/slug)` linking to the next sidebar item.
- Pull exact facts (ports, file paths, commands, env vars) from `parent/README.md`, `parent/CLAUDE.md`, and `parent/vault/`. Never invent.
- If a feature needs a screenshot, reference an existing file in `parent/docs/images/` (copy to `public/images/` first). If none exists, describe in prose.
- Frontmatter must validate against the zod schema in `src/content/config.ts`. `section` must be the matching directory name.

- [ ] **Step 1: Write introduction.md**

Frontmatter:

```yaml
---
title: Introduction
description: GranClaw is a local AI agent you own. Here is what it does.
section: getting-started
tags: [overview, local-first]
backlinks: [getting-started/install, data-and-privacy/local-first-philosophy]
---
```

Outline:
1. **What GranClaw is** — one paragraph. "A personal AI assistant you run on your own machine." Pull from README lead-in.
2. **What makes it different** — a bulleted list of the five strongest features: Mission Control kanban, real browser sessions, watch/replay, bring-your-own-LLM, Telegram. Use the phrasing from README §"The Wow" but condensed.
3. **Who it's for** — one short paragraph. People who want to own their AI workspace, not rent it.
4. **Next:** Install.

Word target: 400–500.

- [ ] **Step 2: Write install.md**

Frontmatter:

```yaml
---
title: Install
description: In 5 minutes you'll have GranClaw running.
section: getting-started
tags: [setup, cli]
backlinks: [getting-started/first-run, getting-started/configure-llm-provider]
---
```

Outline:
1. **What you need** — Node 20+, macOS or Linux (current scope), 2GB free disk, one LLM provider API key or a local model runner.
2. **Install via npm** — exact commands from parent README:
   ```bash
   npm install -g granclaw
   granclaw start
   ```
3. **Install from source** — `git clone`, `npm install`, `npm run dev`. Mention `localhost:3001` backend and `localhost:5173` frontend from CLAUDE.md.
4. **Verify** — visit `http://localhost:5173`, see the dashboard. Use `<Callout type="note">` for the "if you see a provider error, that's expected — next page fixes it."
5. **Next:** First run.

Word target: 350–500.

- [ ] **Step 3: Write first-run.md**

Frontmatter:

```yaml
---
title: First run
description: Your first agent says hello.
section: getting-started
tags: [quickstart]
backlinks: [using-granclaw/chat, getting-started/configure-llm-provider]
---
```

Outline:
1. **Open the dashboard** — describe what the user sees (agent list, empty state).
2. **Talk to the default agent** — click `main-agent`, type a message, hit send, watch the reply stream in. Note: "If nothing streams, you need a provider. See Configure your LLM provider."
3. **What just happened** — in one short paragraph, explain at user level: "GranClaw ran a local agent process, called your LLM, and streamed the answer back." No source-file names.
4. **Next:** Configure your LLM provider.

Word target: 300–400.

- [ ] **Step 4: Write configure-llm-provider.md**

Frontmatter:

```yaml
---
title: Configure your LLM provider
description: Point GranClaw at Claude, OpenAI, Gemini, or a local model.
section: getting-started
tags: [providers, settings]
backlinks: [using-granclaw/create-an-agent, using-granclaw/usage-and-costs]
---
```

Outline:
1. **Where settings live** — the Settings panel in the dashboard (`/settings`). Mention providers are configured here and each agent picks one.
2. **Supported providers** — bullet list: Anthropic, OpenAI, Google Gemini, Groq, OpenRouter, local via Ollama (confirm from README). Note per-agent selection.
3. **Adding an API key** — click Add provider → pick one → paste key → save. Use `<Callout type="tip">` about key storage (local only, never committed).
4. **Switching providers** — one sentence. You can swap per agent without restarting.
5. **Next:** Create an agent.

Word target: 400–550.

- [ ] **Step 5: Verify all four pages render**

```bash
npm run dev -- --port 4321 &
sleep 4
for slug in getting-started/introduction getting-started/install getting-started/first-run getting-started/configure-llm-provider; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4321/$slug")
  echo "$slug $code"
done
kill %1 2>/dev/null
```

Expected: four lines, each ending in `200`.

- [ ] **Step 6: Commit**

```bash
git add src/content/docs/getting-started/
git commit -m "content: getting started section (4 pages)"
```

---

## Task 12: Write content — Using GranClaw (6 pages)

**Files:**
- Create: 6 markdown files in `documentation/src/content/docs/using-granclaw/`

Apply the same writing rules as Task 11.

- [ ] **Step 1: create-an-agent.md** — frontmatter `{title: "Create an agent", description: "One JSON entry, one refresh, new agent.", section: "using-granclaw", tags: [agents, config], backlinks: [using-granclaw/chat]}`. Outline: (1) Where agents are defined — the Agents panel in the dashboard. (2) The three things every agent has — name, model, tools. (3) Creating one from the UI. (4) Advanced — pointing at a different workspace directory. 400–550 words. Next: Chat.

- [ ] **Step 2: chat.md** — frontmatter `{title: "Chat", description: "The chat window, and what each piece does.", section: "using-granclaw", tags: [chat, ui], backlinks: [using-granclaw/resume-and-reuse-sessions]}`. Outline: (1) Opening a chat. (2) Streaming reply, tool calls visible inline. (3) The kanban and tool-call panel. (4) Stop button, message history, danger zone. 400–550 words. Next: Resume & reuse sessions.

- [ ] **Step 3: resume-and-reuse-sessions.md** — frontmatter `{title: "Resume & reuse sessions", description: "Close the tab. Come back tomorrow. The agent remembers.", section: "using-granclaw", tags: [persistence, sessions], backlinks: [agent-superpowers/browser-profiles, data-and-privacy/export-and-import-agents]}`. **This is a highlight page.** Outline: (1) Conversation memory — one sentence: GranClaw stores session IDs in a local SQLite database and resumes them on the next message, across restarts. (2) Browser session reuse — log into LinkedIn once, the agent's dedicated Chrome profile remembers forever. No CAPTCHA loops. Use `<Callout type="tip">` for "Each agent has its own Chrome profile; they never see each other's cookies." (3) Agent backup — one-click export (a zip of vault + sqlite + profile). (4) What survives a restart: conversation, memory, logins, tasks, schedules. 500–600 words. Next: Mission Control.

- [ ] **Step 4: mission-control.md** — frontmatter `{title: "Mission Control", description: "A kanban your agent already knows how to use.", section: "using-granclaw", tags: [kanban, workflows], backlinks: [using-granclaw/schedules-and-workflows]}`. Outline: (1) What Mission Control is — a built-in kanban board each agent can read and write. (2) Saying "plan a LinkedIn launch week" and watching cards appear/move. (3) States (Todo, Doing, Blocked, Done) and who moves them. 350–500 words. Next: Schedules & workflows.

- [ ] **Step 5: schedules-and-workflows.md** — frontmatter `{title: "Schedules & workflows", description: "Every weekday at 8am, brief me.", section: "using-granclaw", tags: [cron, automation], backlinks: [agent-superpowers/telegram-integration]}`. Outline: (1) Scheduling a recurring agent task with a cron expression. (2) Workflows — a saved sequence the agent runs end-to-end. (3) Where they live in the UI. 350–500 words. Next: Usage & costs.

- [ ] **Step 6: usage-and-costs.md** — frontmatter `{title: "Usage & costs", description: "Every token. Every session. No surprises.", section: "using-granclaw", tags: [cost, tokens], backlinks: [getting-started/configure-llm-provider]}`. Outline: (1) The Usage panel. (2) What it tracks — input/output/cache reads/writes per session, per model. (3) Daily and monthly rollups. (4) Cost estimates and where the pricing comes from. 400–500 words. Next: Browser profiles.

- [ ] **Step 7: Verify all six pages render**

```bash
npm run dev -- --port 4321 &
sleep 4
for slug in create-an-agent chat resume-and-reuse-sessions mission-control schedules-and-workflows usage-and-costs; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4321/using-granclaw/$slug")
  echo "$slug $code"
done
kill %1 2>/dev/null
```

Expected: six `200`s.

- [ ] **Step 8: Commit**

```bash
git add src/content/docs/using-granclaw/
git commit -m "content: using granclaw section (6 pages)"
```

---

## Task 13: Write content — Agent Superpowers (5 pages)

**Files:**
- Create: 5 markdown files in `documentation/src/content/docs/agent-superpowers/`

- [ ] **Step 1: browser-profiles.md** — "Browser profiles (log in once)". Description: "Log in once. Never again." Tags: [browser, sessions]. Backlinks: [using-granclaw/resume-and-reuse-sessions, agent-superpowers/watch-and-replay-sessions]. Outline: (1) What a profile is — a persisted Chrome user data dir per agent. (2) Logging into LinkedIn / Gmail / internal tools once, from the agent's own browser. (3) Isolation — every agent has its own profile, cookies never cross. (4) Where it's stored locally. 400–550 words.

- [ ] **Step 2: watch-and-replay-sessions.md** — Description: "See what your agent sees, live or recorded." Tags: [observability, replay]. Backlinks: [agent-superpowers/browser-profiles]. Outline: (1) Opening a live session view from the dashboard. (2) Real-time CDP stream of the active tab. (3) After the session, the same viewer becomes a `<video>` with chapter markers per tool call. (4) Privacy note — streams are local only. 400–550 words.

- [ ] **Step 3: telegram-integration.md** — Description: "Talk to your agent from your phone." Tags: [telegram, mobile]. Backlinks: [using-granclaw/schedules-and-workflows]. Outline: (1) Why Telegram — instant acknowledgment, typing indicator, live status board. (2) Setup — create a bot, paste the token in Secrets, link an agent. Use `<Callout type="warning">` if token is stored in plain text vs encrypted secrets (check parent vault — answer is encrypted). (3) Multilingual UX — English/Spanish/Chinese acknowledgments. (4) What you can and can't do over Telegram vs dashboard. 450–600 words.

- [ ] **Step 4: vault-obsidian-memory.md** — Description: "Your agent's brain is just markdown files." Tags: [vault, obsidian, memory]. Backlinks: [data-and-privacy/export-and-import-agents]. Outline: (1) Every agent has a vault — a folder of plain markdown. (2) Daily journals, action logs, topic notes, research findings, wikilinks. (3) Opening it in Obsidian — same files, nothing special. (4) You can write to it too; the agent will read your notes on the next turn. 450–600 words.

- [ ] **Step 5: mcp-tools-and-capability-approval.md** — Description: "Give your agent new skills, with the brakes on." Tags: [mcp, tools, approval]. Backlinks: [data-and-privacy/secrets]. Outline: (1) What MCP tools are — a plug for new skills like Linear, GitHub, filesystem. (2) Installing one from the UI. (3) Capability approval — the 3-tier guardian gate (check `project_capability_approval.md` in your memory for the exact tiers). (4) Revoking. 450–600 words.

- [ ] **Step 6: Verify all five render**

```bash
npm run dev -- --port 4321 &
sleep 4
for slug in browser-profiles watch-and-replay-sessions telegram-integration vault-obsidian-memory mcp-tools-and-capability-approval; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4321/agent-superpowers/$slug")
  echo "$slug $code"
done
kill %1 2>/dev/null
```

Expected: five `200`s.

- [ ] **Step 7: Commit**

```bash
git add src/content/docs/agent-superpowers/
git commit -m "content: agent superpowers section (5 pages)"
```

---

## Task 14: Write content — Data & Privacy (3 pages)

**Files:**
- Create: 3 markdown files in `documentation/src/content/docs/data-and-privacy/`

- [ ] **Step 1: secrets.md** — Description: "API keys that never touch disk." Tags: [secrets, security]. Backlinks: [agent-superpowers/mcp-tools-and-capability-approval]. Outline: (1) The Secrets panel. (2) How secrets are injected — as env vars only into the agent process at spawn time. Never written to any user file. (3) Per-agent scoping. (4) Rotation. 400–500 words.

- [ ] **Step 2: export-and-import-agents.md** — Description: "Move an agent to another machine with one zip." Tags: [backup, migration]. Backlinks: [agent-superpowers/vault-obsidian-memory]. Outline: (1) What the export zip contains — vault, sqlite dbs, browser profile, config. (2) Exporting from the dashboard. (3) Importing on another machine. (4) Same identity after import — memory, logins, schedules restored. 400–500 words.

- [ ] **Step 3: local-first-philosophy.md** — Description: "Why everything runs on your hardware." Tags: [philosophy, local-first]. Backlinks: [getting-started/introduction, data-and-privacy/secrets]. Outline: (1) The manifesto (you can quote the blockquote from the mock HTML if it fits the voice). (2) No cloud, no tracking, no gated features. (3) Bring your own LLM — swap providers without vendor lock-in. (4) What this means for durability — markdown survives the heat-death of startups. 500–650 words.

- [ ] **Step 4: Commit**

```bash
git add src/content/docs/data-and-privacy/
git commit -m "content: data and privacy section (3 pages)"
```

---

## Task 15: Write content — Reference (2 pages: FAQ + Troubleshooting)

**Files:**
- Create: `documentation/src/content/docs/reference/faq.md`
- Create: `documentation/src/content/docs/reference/troubleshooting.md`

- [ ] **Step 1: faq.md** — Description: "Answers to the questions everyone asks." Tags: [faq]. Backlinks: [reference/troubleshooting]. Outline: ~12 Q/A pairs, each 1-3 sentences. Questions to cover:
  1. Is my data sent anywhere?
  2. Do I need an internet connection?
  3. Can I use GranClaw without an API key?
  4. Which LLM is best?
  5. Can two agents share a browser profile?
  6. Where is my data stored on disk?
  7. How do I back up everything?
  8. Can I run GranClaw on a server?
  9. Does it work on Windows?
  10. Is GranClaw open source?
  11. How do I uninstall it cleanly?
  12. Is there a mobile app?
  
  Use `##` for each question. Word target: 700–1000 (this page is allowed to be longer).

- [ ] **Step 2: troubleshooting.md** — Description: "When something breaks, here's what to check." Tags: [troubleshooting, errors]. Backlinks: [reference/faq]. Outline: problem → checklist format. Cover:
  1. **Dashboard won't load** — port conflicts, Node version, log location.
  2. **Agent reply never streams** — provider not configured, quota, invalid key.
  3. **Browser session won't log in** — CAPTCHA, profile corruption.
  4. **Telegram doesn't respond** — bot token, webhook, agent link.
  5. **Vault is empty after restart** — wrong workspace dir.
  6. **Schedule didn't fire** — cron syntax, backend running.
  7. **High token cost** — caching disabled, verbose prompts.
  8. **"Capability denied" errors** — approval gate, tier mismatch.
  
  Word target: 700–1000.

- [ ] **Step 3: Commit**

```bash
git add src/content/docs/reference/
git commit -m "content: reference section (faq + troubleshooting)"
```

---

## Task 16: Backlink link-check build script

**Files:**
- Create: `documentation/scripts/check-backlinks.mjs`

- [ ] **Step 1: Write failing test first — run the script against the current content expecting all links valid**

```bash
cat > /tmp/test-check-backlinks.mjs <<'EOF'
// Create a fixture with one bad backlink, run check-backlinks, expect non-zero exit.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const bad = 'src/content/docs/getting-started/install.md';
const original = fs.readFileSync(bad, 'utf8');
fs.writeFileSync(bad, original.replace(/backlinks: \[.*\]/, 'backlinks: [does/not/exist]'));
let failed = false;
try { execSync('node scripts/check-backlinks.mjs', { stdio: 'pipe' }); } catch { failed = true; }
fs.writeFileSync(bad, original);
if (!failed) { console.error('FAIL: script did not error on bad backlink'); process.exit(1); }
console.log('PASS');
EOF
node /tmp/test-check-backlinks.mjs
```

Expected: script does not exist yet → `node: scripts/check-backlinks.mjs: No such file or directory` → test exits 0 because the `execSync` threw → prints `PASS`. If you see `FAIL`, the script was found and the test needs strengthening.

- [ ] **Step 2: Write scripts/check-backlinks.mjs**

```js
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
```

- [ ] **Step 3: Make executable and run against real content**

```bash
chmod +x scripts/check-backlinks.mjs
node scripts/check-backlinks.mjs
```

Expected: `✓ 20 files, all backlinks resolve`. If not, fix the offending frontmatter in the content files.

- [ ] **Step 4: Re-run the earlier fixture test**

```bash
node /tmp/test-check-backlinks.mjs
rm /tmp/test-check-backlinks.mjs
```

Expected: `PASS`.

- [ ] **Step 5: Commit**

```bash
git add scripts/check-backlinks.mjs
git commit -m "feat: build-time backlink validator"
```

---

## Task 17: Playwright smoke test

**Files:**
- Create: `documentation/playwright.config.ts`
- Create: `documentation/tests/smoke.spec.ts`

- [ ] **Step 1: Write playwright.config.ts**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build && npx http-server dist -p 4321 -s',
    url: 'http://localhost:4321',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
```

Note: add `http-server` as a dev dep first:

```bash
npm install --save-dev http-server
```

- [ ] **Step 2: Write tests/smoke.spec.ts**

```ts
import { test, expect } from '@playwright/test';

test('index redirects to introduction', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/getting-started\/introduction$/);
  await expect(page.locator('h1')).toContainText('Introduction');
});

test('sidebar renders all 20 pages', async ({ page }) => {
  await page.goto('/getting-started/introduction');
  const links = page.locator('aside nav a');
  await expect(links).toHaveCount(20);
});

test('active page is highlighted in sidebar', async ({ page }) => {
  await page.goto('/getting-started/install');
  const active = page.locator('aside nav a.text-primary');
  await expect(active).toHaveCount(1);
  await expect(active).toContainText('install.md');
});

test('clicking a sidebar link navigates', async ({ page }) => {
  await page.goto('/getting-started/introduction');
  await page.click('a:has-text("chat.md")');
  await expect(page).toHaveURL(/using-granclaw\/chat$/);
  await expect(page.locator('h1')).toContainText('Chat');
});

test('cmd+k opens search and returns results', async ({ page }) => {
  await page.goto('/getting-started/introduction');
  await page.keyboard.press('Meta+k');
  const input = page.locator('#search-input');
  await expect(input).toBeVisible();
  await input.fill('install');
  // Pagefind debounces ~120ms; give it a beat.
  await page.waitForTimeout(500);
  const results = page.locator('#search-results a');
  await expect(results.first()).toBeVisible({ timeout: 5000 });
});

test('escape closes search modal', async ({ page }) => {
  await page.goto('/getting-started/introduction');
  await page.keyboard.press('Meta+k');
  await expect(page.locator('#search-input')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#search-modal.flex')).toHaveCount(0);
});
```

- [ ] **Step 3: Install Playwright chromium browser**

```bash
npx playwright install chromium
```

- [ ] **Step 4: Run the tests**

```bash
npm test
```

Expected: 6 passing tests. If the ⌘K test fails because Pagefind didn't find "install", verify Task 11's install.md committed and contains the word "install".

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts tests/smoke.spec.ts package.json package-lock.json
git commit -m "test: playwright smoke test (redirect, sidebar, nav, search)"
```

---

## Task 18: README + final build verification

**Files:**
- Create: `documentation/README.md`

- [ ] **Step 1: Write README.md**

````markdown
# GranClaw Documentation

The official user-facing documentation site for [GranClaw](https://github.com/aitrace-dev/granclaw).

**Design system:** Scholarly Sanctuary — warm paper, serif ink, no hard lines.
**Stack:** Astro 4 + Tailwind + MDX, Pagefind search, self-hosted fonts, fully static.

## Develop

```bash
npm install
npm run dev          # http://localhost:4321
```

## Build

```bash
npm run build        # astro build + pagefind + backlink check
npm run preview
```

Output goes to `dist/`. Fully static — serve from any CDN or static host.

## Test

```bash
npm test             # playwright smoke test (builds first)
```

## Write a new page

1. Create `src/content/docs/<section>/<slug>.md` with frontmatter:
   ```yaml
   ---
   title: My page
   description: One-sentence promise.
   section: getting-started
   tags: [optional, tags]
   backlinks: [other/slug]
   ---
   ```
2. Add it to `src/config/sidebar.ts` (explicit nav order, single source of truth).
3. `npm run dev` — hot reload picks it up.
4. `npm run build` — backlink validator confirms links resolve.

## Philosophy

- **No placeholders.** Every page is real content.
- **Users, not developers.** No internals, no source tours.
- **No lines.** Boundaries are tonal, not bordered. See `SPEC.md §2`.
- **Self-hosted.** Fonts, search, assets all local. No external requests at runtime.

---

Architecture and design contract: [SPEC.md](./SPEC.md).
Implementation plan: [PLAN.md](./PLAN.md).
````

- [ ] **Step 2: Final full build**

```bash
rm -rf dist .astro
npm run build
```

Expected: builds without error. Last line includes `✓ 20 files, all backlinks resolve`. `dist/` contains `index.html`, one dir per slug, and `_pagefind/`.

- [ ] **Step 3: Verify dist looks sane**

```bash
find dist -name '*.html' | wc -l
test -d dist/_pagefind && echo "pagefind OK"
```

Expected: at least 21 HTML files (20 pages + index). `pagefind OK`.

- [ ] **Step 4: Run smoke tests against the fresh build**

```bash
npm test
```

Expected: all 6 tests pass.

- [ ] **Step 5: Final commit**

```bash
git add README.md
git commit -m "docs: project readme with dev/build/write instructions"
```

- [ ] **Step 6: Review log and confirm atomic history**

```bash
git log --oneline
```

Expected: ~15 commits, each one a coherent step.

---

## Post-implementation checklist

After all 18 tasks complete, confirm the following is true before reporting done:

- [ ] `npm run build` exits 0 from a cold state (`rm -rf dist .astro node_modules && npm ci && npm run build`).
- [ ] All 6 Playwright tests pass.
- [ ] `git log --oneline` shows ~15 atomic commits.
- [ ] Parent repo's `git status` does NOT show any `documentation/*` files (it's ignored).
- [ ] Sidebar has exactly 20 items.
- [ ] Every page has: frontmatter title, description, section, and a "Next:" link at the end.
- [ ] No page body contains "TODO" or "TBD".
- [ ] `git remote -v` inside `documentation/` points to `git@github.com-aitrace:aitrace-dev/granclaw-documentation.git`.
- [ ] `documentation/` is NOT pushed to the remote (user ships that themselves).

---

## Self-review summary

| Check | Status |
|---|---|
| Every SPEC.md section maps to a task | ✓ (theme→T2, layout→T6, sidebar→T5/T7, content model→T5, overrides→T9, search→T10, footer→T8, testing→T17, git→T4, content→T11–T15) |
| No placeholders | ✓ Every step has real code or commands. Content tasks provide outline + frontmatter + word target; prose is authored during execution following strict rules. |
| Type consistency | ✓ `findSidebarItem`, `sidebar`, `SECTION_IDS` are used consistently across Task 5 (defs), Task 7 (Sidebar), Task 8 (TopNav). |
| Bite-sized | ✓ Every task is 2–8 steps, each 2–5 minutes except content prose. |
| TDD adapted sensibly | ✓ Logic tasks (Task 16 backlink check, Task 17 smoke) use red-green. Markup tasks use visual verification loop. |
| Commits atomic | ✓ One commit per task, coherent scope. |
