# GranClaw Documentation Site — Design Spec

**Date:** 2026-04-12
**Status:** Approved — ready for implementation plan
**Repo:** `git@github.com-aitrace:aitrace-dev/granclaw-documentation.git`
**Location:** `/Users/juanroldan/develop/aitrace/agent-brother/documentation/` (nested git repo, ignored by parent)

---

## 1. Goal

A standalone, user-facing documentation site for GranClaw. **Users, not developers.** The site explains how to install, run, and use GranClaw to non-technical readers — no source-code tours, no internals, no contribution guides. Hosted on a separate domain from the product.

The aesthetic is the **"Scholarly Sanctuary"** design system (see `design/DESIGN.md` and `design/code.html` in the parent repo) — warm paper, serif body, no hard lines, Obsidian-style file tree sidebar.

## 2. Non-goals

- No hero/marketing landing page. First route goes straight into docs.
- No API reference, no TypeDoc output, no internals documentation.
- No interactive playgrounds or embedded demos (screenshots only).
- No CI/CD, Vercel/Cloudflare wiring, or deploy automation — the user handles deploy via their own pre-commit hook.
- No dark mode in v1. The Scholarly Sanctuary is a light/paper aesthetic. Dark mode can come later if needed.
- No i18n in v1.

## 3. Tech stack

- **Astro 4.x** (plain, no Starlight) — static output, file-based routing, markdown content collections, zero JS by default.
- **Tailwind CSS** — design tokens ported from `design/code.html`.
- **MDX** — for pages that need custom components (`<Callout>`, `<TagChip>`).
- **Pagefind** — static full-text search, generated post-build. No server, no third party.
- **Playwright** — one smoke spec.

Self-hosted fonts (Noto Serif, Space Grotesk, JetBrains Mono) in `public/fonts/` — no Google Fonts CDN at runtime (local-first philosophy).

## 4. Project layout

```
documentation/
├── .git/                          (own repo, remote: granclaw-documentation)
├── .gitignore                     (dist/, node_modules/, .astro/, _pagefind/)
├── SPEC.md                        (this file)
├── README.md                      (how to develop/build)
├── package.json
├── astro.config.mjs
├── tailwind.config.js
├── tsconfig.json
├── public/
│   ├── paper-fibers.png
│   └── fonts/
│       ├── NotoSerif-{Regular,Bold,Italic}.woff2
│       ├── SpaceGrotesk-{Regular,Bold}.woff2
│       └── JetBrainsMono-{Regular,Bold}.woff2
├── src/
│   ├── content/
│   │   ├── config.ts              (content collection schema + zod validation)
│   │   └── docs/
│   │       ├── getting-started/
│   │       │   ├── introduction.md
│   │       │   ├── install.md
│   │       │   ├── first-run.md
│   │       │   └── configure-llm-provider.md
│   │       ├── using-granclaw/
│   │       │   ├── create-an-agent.md
│   │       │   ├── chat.md
│   │       │   ├── resume-and-reuse-sessions.md
│   │       │   ├── mission-control.md
│   │       │   ├── schedules-and-workflows.md
│   │       │   └── usage-and-costs.md
│   │       ├── agent-superpowers/
│   │       │   ├── browser-profiles.md
│   │       │   ├── watch-and-replay-sessions.md
│   │       │   ├── telegram-integration.md
│   │       │   ├── vault-obsidian-memory.md
│   │       │   └── mcp-tools-and-capability-approval.md
│   │       ├── data-and-privacy/
│   │       │   ├── secrets.md
│   │       │   ├── export-and-import-agents.md
│   │       │   └── local-first-philosophy.md
│   │       └── reference/
│   │           ├── faq.md
│   │           └── troubleshooting.md
│   ├── layouts/
│   │   └── DocLayout.astro
│   ├── components/
│   │   ├── Sidebar.astro
│   │   ├── TopNav.astro
│   │   ├── TableOfContents.astro
│   │   ├── SearchPalette.astro
│   │   ├── Footer.astro
│   │   ├── Callout.astro
│   │   ├── Blockquote.astro
│   │   ├── CodeBlock.astro
│   │   ├── Wikilink.astro
│   │   ├── TagChip.astro
│   │   └── NoiseOverlay.astro
│   ├── config/
│   │   └── sidebar.ts             (single source of truth for nav order)
│   ├── pages/
│   │   ├── index.astro            (redirect → /getting-started/introduction)
│   │   └── [...slug].astro        (dynamic route from content collection)
│   └── styles/
│       └── global.css             (body grid, noise overlay, scrollbar, selection)
└── tests/
    └── smoke.spec.ts              (Playwright)
```

## 5. Theme — Scholarly Sanctuary tokens

Port every token from `design/code.html` into `tailwind.config.js`.

**Colors (exact):**
- `background` `#fef9ef` — base paper
- `surface-container-lowest` `#ffffff`
- `surface-container-low` `#f8f3e9`
- `surface-container` `#f2ede3`
- `surface-container-highest` `#e7e2d8`
- `surface-dim` `#dedad0`
- `on-surface` / `on-background` `#1d1c16` — ink
- `primary` `#5d39e0` — wikilink violet
- `secondary` `#b12e09` — earthy red-orange
- `tertiary-fixed` `#f3e48f` — highlight marker
- `outline-variant` `#c9c4d8` — ghost border only

**Typography:**
- `font-headline` / `font-body` → Noto Serif
- `font-label` → Space Grotesk
- `font-mono` → JetBrains Mono

**Border radius:** `DEFAULT: 0.125rem`, `lg: 0.25rem`, `xl: 0.5rem`, `full: 0.75rem`.

**Global CSS:**
- Body background: the grid pattern from `design/code.html` lines 66–72
- `.noise-overlay` fixed div with `paper-fibers.png` at 5% opacity
- `.custom-scrollbar` 4px `#c9c4d8`
- `.highlight-marker` yellow ink-bleed gradient
- `.callout-shadow` tinted ambient shadow `0 10px 40px rgba(29, 28, 22, 0.06)`

**The "no-line" rule:** enforce by lint — no `border` Tailwind utility except on `Blockquote` (0px, used for bg-contrast), input bottom-border, and ghost borders at ≤15% opacity. Boundaries must be expressed via `surface-container-*` tier shifts.

## 6. Layout — `DocLayout.astro`

```
┌─────────────┬──────────────────────────────┬──────────┐
│             │   TopNav (breadcrumb)        │          │
│  Sidebar    ├──────────────────────────────┤  TOC     │
│  (fixed,    │                              │  (fixed, │
│   256px)    │   max-w-3xl prose column     │  200px,  │
│             │                              │  hidden  │
│  Search btn │                              │   <lg)   │
│  Graph view │                              │          │
└─────────────┴──────────────────────────────┴──────────┘
                 Footer (fixed, meta)
```

- Sidebar, TopNav, TOC, Footer are all `position: fixed`.
- Content column is `max-w-3xl`, horizontally centered inside the `ml-64 mr-52` area.
- TOC only renders when the page has ≥2 `h2` headings, and hides below `lg` breakpoint.
- Graph view widget from the mock is **kept**, but renders a fixed static SVG (no real graph). It's decorative.

## 7. Content model

Astro content collections. Schema in `src/content/config.ts`:

```ts
import { defineCollection, z } from 'astro:content';

const docs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.enum([
      'getting-started',
      'using-granclaw',
      'agent-superpowers',
      'data-and-privacy',
      'reference',
    ]),
    tags: z.array(z.string()).default([]),
    backlinks: z.array(z.string()).default([]),
  }),
});

export const collections = { docs };
```

Build fails on unknown `section` — typos can't ship.

## 8. Sidebar — `src/config/sidebar.ts`

Explicit ordered list, single source of truth. No auto-discovery — clarity over cleverness.

```ts
export const sidebar = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    items: [
      { slug: 'getting-started/introduction',           title: 'Introduction.md' },
      { slug: 'getting-started/install',                title: 'Install.md' },
      { slug: 'getting-started/first-run',              title: 'First-run.md' },
      { slug: 'getting-started/configure-llm-provider', title: 'LLM-provider.md' },
    ],
  },
  // ... 4 more sections
];
```

Active file: 2px primary left bar + bold primary text, matching the mock lines 117–120.
Hover: `hover:bg-[#ede3cf]` (surface-container-high analog).
Sections: Space Grotesk uppercase `folder_open` icon + label. Collapsed by default except the section containing the current route.

## 9. Custom markdown rendering

Via Astro's component mapping on the dynamic route:

```astro
<Content components={{
  blockquote: Blockquote,
  pre: CodeBlock,
  a: Wikilink,
}} />
```

- **Blockquote** — italic Noto Serif, left padding, `bg-surface-container-highest`, no vertical bar.
- **CodeBlock** — dark paper `#1d1c16` bg, `#fef9ef` text, `#a38cf4` for keywords, language label top-right.
- **Wikilink** — detects `[[text]]` pattern inside link text and styles with underline decoration at 30% opacity. Plain links stay primary.

MDX shortcodes available to authors:
- `<Callout type="note|warning|tip">` — in-set plate with icon + colored fill, using primary/tertiary/secondary container tones.
- `<TagChip>tag</TagChip>` — pill with `secondary-fixed-dim` bg.

## 10. Search — Pagefind

Install: `npm install --save-dev pagefind`.
Build command: `astro build && pagefind --site dist`.
Pagefind crawls the static HTML output and emits `_pagefind/` alongside the pages.

`SearchPalette.astro`:
- Bound to `⌘K` / `Ctrl+K` globally.
- Modal: frosted vellum (`bg-surface/90 backdrop-blur-[20px]`), `callout-shadow`, centered `max-w-xl`.
- Lazy-imports `/_pagefind/pagefind.js` on first open — 0 bytes on pages where user never searches.
- Results list uses sidebar styling for consistency.

## 11. Footer

Mimics the mock's footer (lines 333–342) but with **static, accurate** data per page:
- `edited YYYY-MM-DD` — from the markdown file's git `HEAD` commit timestamp at build time (Astro integration that reads `git log -1 --format=%cs <file>`).
- `N words` — computed from rendered body at build time.
- `Backlinks: [[...]]` — read from frontmatter `backlinks` field, rendered as chips linking to `/<slug>`.

## 12. Content strategy

- **Voice:** second person, direct, warm. No jargon without a gloss. No "developer" mode.
- **Length:** 300–600 words per page target. Some reference pages (FAQ) may exceed; some callout pages may be shorter.
- **Opening line:** every page starts with a one-sentence promise. "In 5 minutes you'll be chatting with a local agent."
- **Closing line:** every page ends with `**Next:** [Link to next logical page](...)`.
- **Images:** reuse existing screenshots from the parent repo (`docs/images/*`). Copy them into `public/images/` at init. Do not generate new screenshots in v1 — if none exists, describe in text.
- **Source material:** README.md, `vault/wiki/`, `vault/decisions/`, `CLAUDE.md`. Strictly user-facing content — skip anything about internals.

### 20 pages, opening promises

| Page | Promise |
|---|---|
| Introduction | GranClaw is a local AI agent you own. Here's what it does. |
| Install | In 5 minutes you'll have GranClaw running. |
| First run | Your first agent says hello. |
| Configure LLM provider | Point GranClaw at Claude, OpenAI, Gemini, or a local model. |
| Create an agent | One JSON entry, one refresh, new agent. |
| Chat | The chat window, and what each piece does. |
| Resume & reuse sessions | Close the tab. Come back tomorrow. The agent remembers. |
| Mission Control | A kanban your agent already knows how to use. |
| Schedules & workflows | "Every weekday at 8am, brief me." |
| Usage & costs | Every token. Every session. No surprises. |
| Browser profiles | Log in once. Never again. |
| Watch & replay sessions | See what your agent sees, live or recorded. |
| Telegram integration | Talk to your agent from your phone. |
| Vault — Obsidian memory | Your agent's brain is just markdown files. |
| MCP tools & capability approval | Give your agent new skills, with the brakes on. |
| Secrets | API keys that never touch disk. |
| Export & import agents | Move an agent to another machine with one zip. |
| Local-first philosophy | Why everything runs on your hardware. |
| FAQ | Answers to the questions everyone asks. |
| Troubleshooting | When something breaks, here's what to check. |

## 13. Build & scripts

`package.json` scripts:
- `dev` — `astro dev`, serves at `localhost:4321`
- `build` — `astro build && pagefind --site dist`
- `preview` — `astro preview`
- `test` — `playwright test`

Output: fully static `dist/`. Zero server requirements.

## 14. Testing

Pragmatic minimum:
- `npm run build` exits 0 — CI gate.
- `tests/smoke.spec.ts`:
  - visit `/`, assert redirect to `/getting-started/introduction`
  - assert sidebar renders 20 items
  - click 3 random sidebar links, assert h1 matches frontmatter title
  - press `⌘K`, type `install`, assert ≥1 result, click first result, assert navigation
- Link check: a small build-time script verifies every `backlinks` slug resolves.

No unit tests for components — they're markup.

## 15. Git setup

```bash
cd documentation
git init -b main
git remote add origin git@github.com-aitrace:aitrace-dev/granclaw-documentation.git
echo -e "node_modules/\ndist/\n.astro/\n_pagefind/\n*.log" > .gitignore
```

In the **parent** `/Users/juanroldan/develop/aitrace/agent-brother/.gitignore`, append:
```
documentation/
```

First commit in `documentation/` stages the scaffolded files. Do not push — the user will push when they're ready.

## 16. Decisions taken (previously open)

| Q | Answer |
|---|---|
| documentation/ in parent .gitignore | Yes, not a submodule |
| Content width | max-w-3xl |
| Index route | Redirect to /getting-started/introduction |
| Content length | 300–600 words/page target |
| Spec location | documentation/SPEC.md (travels with repo) |

## 17. Out of scope for v1 (future)

- Dark mode
- i18n
- Interactive "try it" embeds
- Full-text graph view (real node graph from wikilinks)
- RSS / changelog feed
- Contributor workflow guide
