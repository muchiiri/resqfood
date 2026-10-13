export type ExtractedDates = { purchasedAt?: string; expiresAt?: string };

type Found = { iso: string; kind: "expiry" | "purchase" | null };

const MAX_TEXT_LENGTH = 20000;

const MONTHS: Record<string, number> = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
};

const NUMERIC = /(?<!\d)(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4}|\d{2})(?!\d)/g;
const ISO = /(?<!\d)(\d{4})-(\d{2})-(\d{2})(?!\d)/g;
const NAMED =
  /(?<!\d)(\d{1,2})\s*(JAN(?:UARY)?|FEB(?:RUARY)?|MAR(?:CH)?|APR(?:IL)?|MAY|JUN(?:E)?|JUL(?:Y)?|AUG(?:UST)?|SEP(?:T(?:EMBER)?)?|OCT(?:OBER)?|NOV(?:EMBER)?|DEC(?:EMBER)?)[\s,.\-/]*(\d{4}|\d{2})(?!\d)/gi;

const EXPIRY_WORDS = /(?<![A-Z])(?:EXP(?:IRY|IRES|IRATION)?|BEST\s*BEFORE|BBE?(?![A-Z])|USE\s*BY|SELL\s*BY)/gi;
const PURCHASE_WORDS = /(?<![A-Z])(?:DATE|PURCHASED?|INVOICE|ISSUED|RECEIPT|PAID|MFG|PACKED|PRODUCED)(?![A-Z])/gi;

const pad = (n: number) => String(n).padStart(2, "0");

function toIso(year: number, month: number, day: number): string | null {
  if (year < 2000 || year > 2099) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  const real = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return real ? `${year}-${pad(month)}-${pad(day)}` : null;
}

const fullYear = (text: string) => (text.length === 2 ? 2000 + Number(text) : Number(text));

function lastLabelBefore(line: string, position: number): "expiry" | "purchase" | null {
  const head = line.slice(0, position);
  let expiryEnd = -1;
  let purchaseStart = -1;
  let purchaseEnd = -1;
  for (const m of head.matchAll(EXPIRY_WORDS)) expiryEnd = m.index + m[0].length;
  for (const m of head.matchAll(PURCHASE_WORDS)) {
    purchaseStart = m.index;
    purchaseEnd = m.index + m[0].length;
  }
  if (expiryEnd < 0 && purchaseEnd < 0) return null;
  if (expiryEnd >= purchaseEnd) return "expiry";
  // "EXPIRY DATE 3 MARCH 2027": a purchase word right after an expiry word belongs to the expiry label.
  return expiryEnd >= 0 && /^[\s:.\-]*$/.test(head.slice(expiryEnd, purchaseStart)) ? "expiry" : "purchase";
}

function lineLabel(line: string): "expiry" | "purchase" | null {
  if (new RegExp(EXPIRY_WORDS.source, "i").test(line)) return "expiry";
  if (new RegExp(PURCHASE_WORDS.source, "i").test(line)) return "purchase";
  return null;
}

function datesInLine(line: string): { iso: string; position: number }[] {
  const found: { iso: string; position: number }[] = [];

  for (const m of line.matchAll(NUMERIC)) {
    const iso = toIso(fullYear(m[3]), Number(m[2]), Number(m[1]));
    if (iso) found.push({ iso, position: m.index });
  }
  for (const m of line.matchAll(ISO)) {
    const iso = toIso(Number(m[1]), Number(m[2]), Number(m[3]));
    if (iso) found.push({ iso, position: m.index });
  }
  for (const m of line.matchAll(NAMED)) {
    const month = MONTHS[m[2].slice(0, 3).toUpperCase()];
    const iso = toIso(fullYear(m[3]), month, Number(m[1]));
    if (iso) found.push({ iso, position: m.index });
  }
  return found.sort((a, b) => a.position - b.position);
}

// Suggests purchase and expiry dates (YYYY-MM-DD) from OCR text. Day first, UAE order.
// Never throws and never reads the clock; the text is untrusted.
export function extractDates(text: string): ExtractedDates {
  try {
    const lines = text.slice(0, MAX_TEXT_LENGTH).split(/\r?\n/);
    const all: Found[] = [];

    lines.forEach((line, i) => {
      const previous = i > 0 ? lineLabel(lines[i - 1]) : null;
      for (const { iso, position } of datesInLine(line)) {
        all.push({ iso, kind: lastLabelBefore(line, position) ?? previous });
      }
    });

    const expiry = all.find((d) => d.kind === "expiry")?.iso;
    const purchase = all.find((d) => d.kind === "purchase")?.iso;
    let result: ExtractedDates;

    if (expiry || purchase) {
      result = { purchasedAt: purchase, expiresAt: expiry };
    } else {
      const sorted = all.map((d) => d.iso).sort();
      if (sorted.length === 0) result = {};
      else if (sorted.length === 1) result = { expiresAt: sorted[0] };
      else result = { purchasedAt: sorted[0], expiresAt: sorted[sorted.length - 1] };
    }

    if (result.purchasedAt && result.expiresAt && result.expiresAt < result.purchasedAt) {
      result = { purchasedAt: result.expiresAt, expiresAt: result.purchasedAt };
    }
    if (!result.purchasedAt) delete result.purchasedAt;
    if (!result.expiresAt) delete result.expiresAt;
    return result;
  } catch {
    return {};
  }
}
