import { describe, expect, test } from 'bun:test';
import headingLinks from './rehype-heading-links.mjs';

type Element = {
  type: 'element';
  tagName: string;
  properties?: Record<string, unknown>;
  children: Array<Element | { type: 'text'; value: string }>;
};

function transform(tree: Element): Element {
  const transformer = headingLinks();
  transformer(tree);
  return tree;
}

describe('rehype heading links', () => {
  test.each(['h2', 'h3'])('appends an accessible permalink to an id-bearing %s', (tagName) => {
    const tree = transform({
      type: 'element',
      tagName: 'root',
      children: [
        {
          type: 'element',
          tagName,
          properties: { id: 'section-id' },
          children: [{ type: 'text', value: 'Section title' }],
        },
      ],
    });

    expect(tree.children[0]).toEqual({
      type: 'element',
      tagName,
      properties: { id: 'section-id' },
      children: [
        { type: 'text', value: 'Section title' },
        {
          type: 'element',
          tagName: 'a',
          properties: {
            ariaLabel: 'Permalink to Section title',
            className: ['heading-anchor'],
            href: '#section-id',
          },
          children: [{ type: 'text', value: '#' }],
        },
      ],
    });
  });

  test('does not add links to headings without ids or to other heading levels', () => {
    const tree = transform({
      type: 'element',
      tagName: 'root',
      children: [
        {
          type: 'element',
          tagName: 'h2',
          children: [{ type: 'text', value: 'No id' }],
        },
        {
          type: 'element',
          tagName: 'h4',
          properties: { id: 'too-deep' },
          children: [{ type: 'text', value: 'Too deep' }],
        },
      ],
    });

    expect(tree.children[0].children).toHaveLength(1);
    expect(tree.children[1].children).toHaveLength(1);
  });

  test('does not double-append a heading anchor', () => {
    const tree: Element = {
      type: 'element',
      tagName: 'root',
      children: [
        {
          type: 'element',
          tagName: 'h2',
          properties: { id: 'section-id' },
          children: [{ type: 'text', value: 'Section title' }],
        },
      ],
    };

    const transformer = headingLinks();
    transformer(tree);
    transformer(tree);

    expect(tree.children[0].children).toHaveLength(2);
  });
});
