/**
 * CSV generation for admin exports.
 *
 * Two things this file exists to get right:
 *
 * 1. **Excel + Azerbaijani.** Without a UTF-8 BOM, Excel reads the file as
 *    ANSI (CP1252) and mangles every ə/ü/ş/ğ/ç/ö/ı — i.e. most patient names.
 *    Do NOT add a `sep=,` hint: when that line is present Excel skips BOM
 *    encoding detection entirely and the mojibake comes straight back. If a
 *    machine's list separator is `;` the columns merge — that is what the
 *    .xlsx export is for (see xlsx.ts); this file stays a plain, correct CSV.
 *
 * 2. **Formula injection.** Patients type their own details. A field starting
 *    with = + - @ (or a control char) is executed as a formula when the sheet
 *    is opened — the classic `=cmd|'/c calc'!A0` trick, and it exfiltrates via
 *    things like =HYPERLINK too. We prefix such fields with a single quote so
 *    Excel treats them as literal text. This is the doctor's own machine
 *    opening a file full of stranger-supplied strings, so it matters.
 *
 *    Note the visible cost: Excel shows that `'` when opening a CSV, so phone
 *    numbers (which start with `+`, itself a formula prefix) read as
 *    `'+994…`. Dropping the guard is not an option — `+HYPERLINK(...)` runs
 *    just like `=HYPERLINK(...)`. Anyone who wants clean cells should take the
 *    .xlsx export, where types are declared and no escaping is needed.
 */

/** Neutralise a value Excel would otherwise treat as a formula. */
function deFang(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

/** RFC 4180 escaping: wrap in quotes, double any inner quote. */
function escapeCell(value: string): string {
  const safe = deFang(value);
  return `"${safe.replace(/"/g, '""')}"`;
}

/**
 * Build a CSV document: UTF-8 BOM, comma-delimited, CRLF rows (RFC 4180).
 * Cells are stringified; null/undefined become empty.
 */
export function toCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][],
): string {
  const lines = [
    headers.map((h) => escapeCell(h)).join(","),
    ...rows.map((r) => r.map((c) => escapeCell(c == null ? "" : String(c))).join(",")),
  ];
  return `﻿${lines.join("\r\n")}\r\n`;
}
