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
