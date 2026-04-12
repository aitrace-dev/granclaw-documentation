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
