import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const distPath = (...parts: string[]) => join(import.meta.dir, '..', 'dist', ...parts);

async function readPage(...parts: string[]): Promise<string> {
  return readFile(distPath(...parts), 'utf8');
}

async function readPageStyles(html: string): Promise<string> {
  const hrefs = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(
    ([, href]) => href,
  );
  const styles = await Promise.all(
    hrefs.map((href) => readFile(distPath(href.replace(/^\//, '')), 'utf8')),
  );
  return styles.join('\n');
}

async function readPngDimensions(filename: string): Promise<{
  width: number;
  height: number;
  bytes: Buffer;
}> {
  const bytes = await readFile(join(import.meta.dir, '..', 'public', 'og', filename));
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bytes,
  };
}

describe('long-form reader output', () => {
  test('the AI essay exposes reading navigation and its related FDF project', async () => {
    const html = await readPage('blog', 'three-years-with-ai', 'index.html');

    expect(html).toContain('aria-label="Table of contents"');
    expect(html).toContain('11 min read');
    expect(html).toContain('href="/projects/fdf/"');
    expect(html).toContain('class="heading-anchor"');
    expect(html).toContain('href="#phase-1-the-gateway-drug-replacing-stack-overflow"');
  });

  test('FDF leads with a product overview and links back to the essay', async () => {
    const html = await readPage('projects', 'fdf', 'index.html');

    expect(html).toContain('Audience');
    expect(html).toContain('Teams building long-lived software with AI agents.');
    expect(html).toContain('docs/features/payments/');
    expect(html).toContain('curl -fsSL https://raw.githubusercontent.com/GiteshDalal/fdf/main/install.sh | bash');
    expect(html).toContain('aria-label="Table of contents"');
    expect(html).toContain('href="/blog/three-years-with-ai/"');
  });

  test('the compiled FDF overview styles contain the install command locally', async () => {
    const html = await readPage('projects', 'fdf', 'index.html');
    const styles = await readPageStyles(html);

    expect(styles).toMatch(
      /\.project-overview\{[^}]*grid-template-columns:minmax\(0,1fr\)[^}]*\}/,
    );
    expect(styles).toMatch(/\.project-overview>\*\{[^}]*min-width:0[^}]*\}/);
    expect(styles).toMatch(
      /\.project-overview-actions code\{[^}]*white-space:nowrap[^}]*overflow-x:auto[^}]*\}/,
    );
  });

  test('the lower FDF action matches the primary GitHub action and stays intact', async () => {
    const html = await readPage('projects', 'fdf', 'index.html');
    const styles = await readPageStyles(html);
    const githubActionLabels = [
      ...html.matchAll(
        /<a class="button-link" href="https:\/\/github\.com\/GiteshDalal\/fdf" rel="noopener noreferrer">([^<]+)<\/a>/g,
      ),
    ].map(([, label]) => label);

    expect({
      githubActionLabels,
      hasNonShrinkingSingleLineOverviewAction:
        /\.project-overview-actions \.button-link\{(?=[^}]*flex-shrink:0)(?=[^}]*white-space:nowrap)[^}]*\}/.test(
          styles,
        ),
    }).toEqual({
      githubActionLabels: ['View on GitHub', 'View on GitHub'],
      hasNonShrinkingSingleLineOverviewAction: true,
    });
  });
});

describe('homepage and navigation output', () => {
  test('the homepage leads with one clear thesis and current work', async () => {
    const html = await readPage('index.html');

    expect(html.match(/<h1(?:\s|>)/g)).toHaveLength(1);
    expect(html).toContain('Solution architecture for AI-assisted delivery.');
    expect(html).toContain('Current work');
    expect(html).toContain('FDF');
    expect(html).toContain('Low-cost commerce rewrite');
    expect(html).toContain('Multi-agent workflows');
    expect(html).toContain('<a href="/projects/fdf/">Explore FDF</a>');
  });

  test.each([
    ['index.html'],
    ['blog', 'index.html'],
    ['projects', 'index.html'],
  ])('every primary page exposes the skip target and calls the feed RSS', async (...parts) => {
    const html = await readPage(...parts);

    expect(html).toContain('<a class="skip-link" href="#main-content">Skip to content</a>');
    expect(html).toContain('<main class="site-main" id="main-content">');
    expect(html).toContain('<a href="/rss.xml">RSS</a>');
    expect(html).not.toContain('<a href="/rss.xml">Subscribe</a>');
  });

  test.each([
    [['blog', 'index.html'], '/blog/'],
    [['projects', 'index.html'], '/projects/'],
  ])('marks the active primary navigation entry', async (parts, href) => {
    const html = await readPage(...parts);

    expect(html).toContain(`<a href="${href}" aria-current="page">`);
  });

  test('uses an h2 for project cards on the project index', async () => {
    const html = await readPage('projects', 'index.html');

    expect(html).toMatch(/<h2 class="project-card-title">\s*<a href="\/projects\/fdf\/">/);
    expect(html).not.toMatch(/<h3 class="project-card-title">\s*<a href="\/projects\/fdf\/">/);
  });
});

describe('page-specific social images', () => {
  const pages = [
    [['index.html'], 'home.png'],
    [['blog', 'index.html'], 'blog.png'],
    [['projects', 'index.html'], 'projects.png'],
    [['blog', 'three-years-with-ai', 'index.html'], 'three-years-with-ai.png'],
    [['projects', 'fdf', 'index.html'], 'fdf.png'],
  ] as const;

  test.each(pages)('references its own Open Graph image', async (parts, filename) => {
    const html = await readPage(...parts);

    expect(html).toContain(
      `<meta property="og:image" content="https://giteshdalal.com/og/${filename}">`,
    );
  });

  test('all five social images are distinct 1200 by 630 PNG files', async () => {
    const images = await Promise.all(pages.map(([, filename]) => readPngDimensions(filename)));

    for (const image of images) {
      expect({ width: image.width, height: image.height }).toEqual({
        width: 1200,
        height: 630,
      });
    }
    expect(new Set(images.map(({ bytes }) => bytes.toString('base64'))).size).toBe(5);
  });
});
