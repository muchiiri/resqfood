export const MAX_SEARCH_LENGTH = 50;

// Characters that are wildcards or that change PostgREST filter syntax. The raw term must
// never reach a filter string; only its sanitized form may.
const UNSAFE = /[%_,()*\\".:]/g;

export function sanitizeSearch(term: string): string {
  return term.replace(UNSAFE, " ").replace(/\s+/g, " ").trim().slice(0, MAX_SEARCH_LENGTH).trim();
}
