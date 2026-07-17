/** Elements that never nest content — they must not affect depth tracking. */
const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

/** Only cut after one of these — a cut after an inline tag would read as a stray break. */
const BLOCK_TAGS = new Set([
  "p", "div", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "blockquote", "figure", "table", "pre", "section",
]);

/** A post shorter than this gets no mid-content interruption. */
const MIN_TEXT_FOR_SPLIT = 900;

/**
 * Roughly how much text should sit between two in-article CTAs.
 *
 * Tuned so a ~5k-char post gets one break and a 36k-char one gets three — the
 * longest post on the site (the Seliak article) is ~36k. The cap matters more
 * than the ratio: repeating the same offer every screen reads as spam, hurts the
 * page for a medical YMYL audience, and Google treats intrusive interstitial-ish
 * patterns as a negative. Two or three is persuasion; six is a pop-up.
 */
const TEXT_PER_CTA = 9000;
const MAX_CTAS = 3;

/**
 * Never interrupt within the first fifth of the text.
 *
 * Some posts are written as one long block with a single early paragraph, so
 * the only "safe" boundary sits at 3% — which would put a booking ad directly
 * under the opening sentence. Better to skip the inline CTA entirely and let
 * the closing one do the work than to shout at a reader who has read one line.
 */
const MIN_LEAD_RATIO = 0.2;

/**
 * Split rendered post HTML into two halves at the block boundary nearest the
 * middle *by visible text*, so something can be inserted between them.
 *
 * Why it is written this way: the body is arbitrary WordPress HTML injected via
 * dangerouslySetInnerHTML. Cutting at a character offset would slice a tag open
 * and the browser would silently reparent the rest of the article. So we walk
 * the tags, track nesting depth, and only ever cut where depth returns to 0
 * right after a closing block element — a point where the two halves are each
 * valid standalone HTML.
 *
 * Measuring by *text* rather than markup length matters too: an early image or
 * a table of markup-heavy rows would drag a byte-based midpoint far up the page.
 *
 * Returns `after: null` when the post is too short to interrupt, or when no safe
 * boundary exists (e.g. the whole body is one wrapper div) — callers should then
 * render the body whole and put the CTA after it.
 */
export function splitHtmlIntoSections(html: string): string[] {
  const totalText = visibleTextLength(html);
  if (totalText < MIN_TEXT_FOR_SPLIT) return [html];

  // 1 CTA for a normal post, up to MAX_CTAS for a very long one.
  const wanted = Math.min(MAX_CTAS, Math.max(1, Math.round(totalText / TEXT_PER_CTA)));

  const cuts = findCutPoints(html);
  if (cuts.length < 2) return [html];

  // Never use the final boundary: a CTA glued to the end of the body would sit
  // right on top of the one we already render after the article. And never
  // interrupt in the opening stretch — see MIN_LEAD_RATIO.
  const usable = cuts
    .slice(0, -1)
    .filter(([, textBefore]) => textBefore >= totalText * MIN_LEAD_RATIO);
  if (usable.length === 0) return [html];

  // Aim for evenly spaced targets: with 2 CTAs, 1/3 and 2/3 through the text.
  const chosen: number[] = [];
  for (let i = 1; i <= wanted; i++) {
    const target = (totalText * i) / (wanted + 1);
    let best: [number, number] | null = null;
    for (const c of usable) {
      if (chosen.includes(c[0])) continue; // don't stack two CTAs at one boundary
      if (!best || Math.abs(c[1] - target) < Math.abs(best[1] - target)) best = c;
    }
    if (best) chosen.push(best[0]);
  }

  const offsets = [...new Set(chosen)].sort((a, b) => a - b);
  if (offsets.length === 0) return [html];

  const sections: string[] = [];
  let prev = 0;
  for (const o of offsets) {
    sections.push(html.slice(prev, o));
    prev = o;
  }
  const tail = html.slice(prev);
  if (tail.trim()) sections.push(tail);

  return sections.filter((s) => s.trim());
}

/**
 * Kept for the single-split case and for tests.
 * @deprecated prefer splitHtmlIntoSections
 */
export function splitHtmlAtMidpoint(html: string): { before: string; after: string | null } {
  const totalText = visibleTextLength(html);
  if (totalText < MIN_TEXT_FOR_SPLIT) return { before: html, after: null };

  const cuts = findCutPoints(html);
  if (cuts.length < 2) return { before: html, after: null };

  const target = totalText / 2;
  const usable = cuts.slice(0, -1);
  let best = usable[0];
  for (const c of usable) {
    if (Math.abs(c[1] - target) < Math.abs(best[1] - target)) best = c;
  }
  const after = html.slice(best[0]).trim();
  if (!after) return { before: html, after: null };
  return { before: html.slice(0, best[0]), after };
}

/**
 * Every offset where the document is safely cuttable, paired with how much
 * visible text precedes it. Depth tracking is what makes this safe: we only
 * record a point where nesting returns to 0 right after a closing block tag,
 * so each resulting slice is valid standalone HTML.
 */
function findCutPoints(html: string): [number, number][] {
  const tag = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?(\/?)>/g;
  let depth = 0;
  let textSoFar = 0;
  let lastIndex = 0;
  /** Candidate cut points: [offset, textBefore] */
  const cuts: [number, number][] = [];

  let m: RegExpExecArray | null;
  while ((m = tag.exec(html)) !== null) {
    // Count the text between the previous tag and this one.
    textSoFar += decodedLength(html.slice(lastIndex, m.index));
    lastIndex = tag.lastIndex;

    if (m[0].startsWith("<!--")) continue;

    const closing = m[1] === "/";
    const name = m[2].toLowerCase();
    const selfClosing = m[3] === "/";

    if (VOID_TAGS.has(name) || selfClosing) continue;

    if (closing) {
      depth = Math.max(0, depth - 1);
      if (depth === 0 && BLOCK_TAGS.has(name)) {
        cuts.push([tag.lastIndex, textSoFar]);
      }
    } else {
      depth++;
    }
  }

  return cuts;
}

/** Length of text with tags removed — what the reader actually sees. */
function visibleTextLength(html: string): number {
  return decodedLength(html.replace(/<[^>]*>/g, ""));
}

/** Collapse whitespace so indentation in the source doesn't inflate the count. */
function decodedLength(text: string): number {
  return text.replace(/\s+/g, " ").trim().length;
}
