import { describe, expect, test } from 'bun:test';
import { chmod, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
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
    expect(html).toContain('docs/fdf/features/payments/');
    expect(html).toContain('fdf validate — conformant with FDF v1.2');
    expect(html).toContain('curl -fsSL https://giteshdalal.com/fdf.sh | bash');
    expect(html).toContain('aria-label="Table of contents"');
    expect(html).toContain('href="/blog/three-years-with-ai/"');
  });

  test('the compiled FDF overview keeps the install command locally scrollable', async () => {
    const html = await readPage('projects', 'fdf', 'index.html');
    const styles = await readPageStyles(html);

    expect(styles).toMatch(
      /\.project-overview\{[^}]*grid-template-columns:minmax\(0,1fr\)[^}]*\}/,
    );
    expect(styles).toMatch(/\.project-overview>\*\{[^}]*min-width:0[^}]*\}/);
    expect(styles).toMatch(
      /\.project-install\{(?=[^}]*min-width:0)(?=[^}]*width:100%)[^}]*\}/,
    );
    expect(styles).toMatch(
      /\.project-install-command\{(?=[^}]*max-width:100%)(?=[^}]*overflow-x:auto)(?=[^}]*white-space:pre)[^}]*\}/,
    );
    expect(styles).not.toContain('.project-overview-actions');
  });

  test('FDF exposes one GitHub action and a semantic copyable install command', async () => {
    const html = await readPage('projects', 'fdf', 'index.html');
    const githubActionLabels = [
      ...html.matchAll(
        /<a class="button-link" href="https:\/\/github\.com\/GiteshDalal\/fdf" rel="noopener noreferrer">([^<]+)<\/a>/g,
      ),
    ].map(([, label]) => label);

    expect(githubActionLabels).toEqual(['View on GitHub']);
    expect(html).toContain(
      '<button class="project-install-copy" type="button" data-copy-command aria-label="Copy install command">',
    );
    expect(html).toContain(
      '<pre class="project-install-command" tabindex="0" aria-labelledby="project-install-label"><code data-install-command>curl -fsSL https://giteshdalal.com/fdf.sh | bash</code></pre>',
    );
    expect(html).toContain(
      '<p class="visually-hidden" data-copy-status aria-live="polite" aria-atomic="true"></p>',
    );
  });
});

describe('FDF reference links', () => {
  const commandReference = 'https://pkg.go.dev/github.com/GiteshDalal/fdf/cli/cmd/fdf';

  test('the FDF page links to its command reference beside the GitHub action', async () => {
    const html = await readPage('projects', 'fdf', 'index.html');
    const [actions] = html.match(/<p class="cta-row">.*?<\/p>/s) ?? [''];

    expect(actions).toContain(`<a href="${commandReference}" rel="noopener">Command reference</a>`);
  });

  test('the FDF page describes the software and its reference pages in structured data', async () => {
    const html = await readPage('projects', 'fdf', 'index.html');
    const [, json] = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s) ?? [];
    const graph = JSON.parse(json)['@graph'] as Record<string, unknown>[];

    expect(graph).toContainEqual(
      expect.objectContaining({
        '@type': 'SoftwareSourceCode',
        name: 'FDF - Feature Document Format',
        url: 'https://giteshdalal.com/projects/fdf/',
        codeRepository: 'https://github.com/GiteshDalal/fdf',
        sameAs: ['https://github.com/GiteshDalal/fdf', commandReference],
        author: { '@id': 'https://giteshdalal.com/#person' },
      }),
    );
  });
});

describe('short FDF install link', () => {
  const installer = 'https://raw.githubusercontent.com/GiteshDalal/fdf/main/install.sh';

  // A curl that serves a stand-in installer from the fdf repository's URL and fails for any other.
  async function fakeCurl(): Promise<string> {
    const bin = await mkdtemp(join(tmpdir(), 'fdf-sh-'));
    await writeFile(
      join(bin, 'curl'),
      [
        '#!/bin/sh',
        'for arg; do url=$arg; done',
        `[ "$url" = "${installer}" ] || exit 22`,
        `echo 'echo "installer ran with: $*"'`,
        `echo 'echo "install dir: $FDF_INSTALL_DIR"'`,
        '',
      ].join('\n'),
    );
    await chmod(join(bin, 'curl'), 0o755);
    return bin;
  }

  function runShortLink(bin: string) {
    const result = Bun.spawnSync({
      cmd: ['bash', distPath('fdf.sh'), '--version', 'v1.2.0'],
      env: { PATH: `${bin}:/usr/bin:/bin`, FDF_INSTALL_DIR: '/opt/fdf' },
    });
    return { exitCode: result.exitCode, stdout: result.stdout.toString(), stderr: result.stderr.toString() };
  }

  test('fdf.sh runs the installer kept in the fdf repository, passing arguments and environment', async () => {
    const result = runShortLink(await fakeCurl());

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe('installer ran with: --version v1.2.0\ninstall dir: /opt/fdf\n');
  });

  test('fdf.sh fails, naming the installer, when it cannot download it', async () => {
    const bin = await fakeCurl();
    await writeFile(join(bin, 'curl'), '#!/bin/sh\nexit 22\n');

    const result = runShortLink(bin);

    expect(result.exitCode).not.toBe(0);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain(installer);
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
