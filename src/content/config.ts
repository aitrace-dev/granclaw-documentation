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
