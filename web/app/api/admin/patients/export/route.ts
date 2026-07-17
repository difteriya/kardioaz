import { listPatients } from "@/lib/booking/service";
import { isAdmin } from "@/lib/admin-auth";
import { toCsv } from "@/lib/booking/csv";
import { buildPatientsWorkbook } from "@/lib/booking/xlsx";
import { AZ_TZ } from "@/lib/booking/config";

/** "2026-07-17" in Baku time — used in the filename. */
function todayAz(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: AZ_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** "17.07.2026 14:30" — readable in a spreadsheet, unambiguous. */
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

/**
 * Export the patient directory. `?format=csv` for raw data; .xlsx by default
 * because Excel guesses CSV encoding wrong for Azerbaijani text.
 *
 * Admin-only: this is the whole personal-data set in one file, so it is the
 * single most sensitive endpoint in the app. Marked no-store so the file never
 * sits in a shared cache.
 */
export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return new Response("İcazə yoxdur.", { status: 401 });
  }

  const format = new URL(req.url).searchParams.get("format");
  const patients = await listPatients();
  const filename = `kardio-pasiyentler-${todayAz()}`;

  if (format === "csv") {
    const csv = toCsv(
      ["Ad və soyad", "E-poçt", "Mobil nömrə", "Görüş sayı", "İlk müraciət", "Son müraciət"],
      patients.map((p) => [
        p.fullName ?? "",
        p.email,
        p.phone ?? "",
        p.visitCount,
        stampAz(p.firstSeen),
        stampAz(p.lastSeen),
      ]),
    );
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const xlsx = await buildPatientsWorkbook(patients);
  return new Response(new Uint8Array(xlsx), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
