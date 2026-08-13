function textContent(node) {
  if (node.type === 'text') return node.value;
  if (!Array.isArray(node.children)) return '';
  return node.children.map(textContent).join('');
}

function hasHeadingAnchor(node) {
  if (node.type !== 'element' || node.tagName !== 'a') return false;
  const classes = node.properties?.className;
  return Array.isArray(classes)
    ? classes.includes('heading-anchor')
    : classes === 'heading-anchor';
}

export default function rehypeHeadingLinks() {
  return function transform(node) {
    if (!node || typeof node !== 'object') return;

    if (
      node.type === 'element' &&
      (node.tagName === 'h2' || node.tagName === 'h3') &&
      typeof node.properties?.id === 'string' &&
      Array.isArray(node.children) &&
      !node.children.some(hasHeadingAnchor)
    ) {
      const label = textContent(node).trim();
      node.children.push({
        type: 'element',
        tagName: 'a',
        properties: {
          ariaLabel: `Permalink to ${label}`,
          className: ['heading-anchor'],
          href: `#${node.properties.id}`,
        },
        children: [{ type: 'text', value: '#' }],
      });
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) transform(child);
    }
  };
}
