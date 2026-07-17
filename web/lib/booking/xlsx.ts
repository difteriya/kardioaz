import ExcelJS from "exceljs";
import type { PatientRow } from "./service";
import { AZ_TZ } from "./config";

/**
 * Real .xlsx export of the patient directory.
 *
 * Why not just CSV: a CSV has no encoding or type information, so Excel has to
 * guess at both, and gets both wrong for this data — it reads UTF-8 as CP1252
 * (turning every ə into É™) and reads `+994…` as a formula (eating the `+`).
 * An .xlsx states its encoding and marks each cell's type, so Azerbaijani text
 * and phone numbers survive verbatim with no `'` escaping hacks.
 *
 * It also makes formula injection a non-issue: values written as strings are
 * stored as strings. A patient whose "email" is `=HYPERLINK(...)@mail.com` is
 * displayed, never executed — Excel only runs a cell that is *declared* a
 * formula, which we never do.
 */

/** "17.07.2026 14:30" in Baku time. */
function stampAz(iso: string): string {
  const p = new Intl.DateTimeFormat("en-GB", {
    timeZone: AZ_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${g("day")}.${g("month")}.${g("year")} ${g("hour")}:${g("minute")}`;
}

export async function buildPatientsWorkbook(patients: PatientRow[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "kardio.az";
  wb.created = new Date();

  const ws = wb.addWorksheet("Pasiyentlər", {
    views: [{ state: "frozen", ySplit: 1 }], // header stays put while scrolling
  });

  ws.columns = [
    { header: "Ad və soyad", key: "name", width: 26 },
    { header: "E-poçt", key: "email", width: 34 },
    { header: "Mobil nömrə", key: "phone", width: 18 },
    { header: "Görüş sayı", key: "visits", width: 12 },
    { header: "İlk müraciət", key: "first", width: 18 },
    { header: "Son müraciət", key: "last", width: 18 },
  ];

  for (const p of patients) {
    ws.addRow({
      name: p.fullName ?? "",
      email: p.email,
      // Explicitly text: keeps the leading +, and stops Excel rendering a
      // 12-digit number as 9.945E+11.
      phone: p.phone ?? "",
      visits: p.visitCount,
      first: stampAz(p.firstSeen),
      last: stampAz(p.lastSeen),
    });
  }

  // Header styling
  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: "FFF7F6F2" } };
  header.alignment = { vertical: "middle" };
  header.height = 22;
  header.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF175C55" } }; // teal
  });

  // Force the phone column to text so Excel never reformats it.
  ws.getColumn("phone").numFmt = "@";
  ws.getColumn("visits").alignment = { horizontal: "center" };

  if (patients.length > 0) {
    ws.autoFilter = { from: "A1", to: `F${patients.length + 1}` };
  }

  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out);
}
