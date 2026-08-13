import { describe, expect, test } from 'bun:test';
import {
  estimateReadingMinutes,
  shouldShowTableOfContents,
} from './content-meta';

describe('estimateReadingMinutes', () => {
  test.each([
    ['', 1],
    ['   \n\t ', 1],
    [Array(220).fill('word').join(' '), 1],
    [Array(221).fill('word').join(' '), 2],
  ])('returns the expected minute count for markdown input', (markdown, expected) => {
    expect(estimateReadingMinutes(markdown)).toBe(expected);
  });

  test('supports a custom reading speed', () => {
    expect(estimateReadingMinutes('one two three', 2)).toBe(2);
  });
});

describe('shouldShowTableOfContents', () => {
  test.each([
    [5, 2, true],
    [4, 2, false],
    [5, 1, false],
    [4, 1, false],
  ])(
    'requires at least five minutes and two headings',
    (readingMinutes, headingCount, expected) => {
      expect(shouldShowTableOfContents(readingMinutes, headingCount)).toBe(expected);
    },
  );
});
