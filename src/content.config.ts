import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    ogImage: z.string().optional(),
    relatedProject: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    github: z.string().url(),
    order: z.number().default(0),
    status: z.enum(['active', 'archived']).default('active'),
    ogImage: z.string().optional(),
    relatedPost: z.string().optional(),
    overview: z
      .object({
        audience: z.string(),
        problem: z.string(),
        capabilities: z.array(z.string()).length(3),
        supports: z.array(z.string()).min(1),
        install: z.string(),
        examplePath: z.string(),
        exampleFiles: z.array(z.string()).min(1),
        validation: z.string(),
      })
      .optional(),
  }),
});

export const collections = { blog, projects };
