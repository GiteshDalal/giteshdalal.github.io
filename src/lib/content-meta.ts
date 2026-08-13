const DEFAULT_WORDS_PER_MINUTE = 220;

export function estimateReadingMinutes(
  markdown: string,
  wordsPerMinute = DEFAULT_WORDS_PER_MINUTE,
): number {
  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/u).length : 0;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function shouldShowTableOfContents(
  readingMinutes: number,
  headingCount: number,
): boolean {
  return readingMinutes >= 5 && headingCount >= 2;
}
