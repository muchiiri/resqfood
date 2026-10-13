const MIN_WORD_LENGTH = 3;

// Words (3 letters or more, lowercase, no duplicates) from a free-text profile location.
export function locationWords(location: string): string[] {
  const words = location
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length >= MIN_WORD_LENGTH);
  return [...new Set(words)];
}

// A listing is near when its pickup area contains any word of the viewer's location.
export function isNearYou(area: string, words: string[]): boolean {
  if (words.length === 0) return false;
  const lower = area.toLowerCase();
  return words.some((word) => lower.includes(word));
}

// Near items first; the incoming order is kept inside each group.
export function rankNearFirst<T>(items: T[], isNear: (item: T) => boolean): T[] {
  const near: T[] = [];
  const rest: T[] = [];
  for (const item of items) (isNear(item) ? near : rest).push(item);
  return [...near, ...rest];
}
