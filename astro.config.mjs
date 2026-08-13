// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import rehypeHeadingLinks from './src/lib/rehype-heading-links.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://giteshdalal.com',
  output: 'static',
  integrations: [sitemap()],
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeHeadingIds, rehypeHeadingLinks],
    }),
  },
});
