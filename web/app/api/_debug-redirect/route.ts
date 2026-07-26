import { NextResponse } from "next/server";
import redirects from "@/lib/redirects-301.json";

// TEMPORARY diagnostic — remove after the 301 redirect is confirmed working.
// Shows the runtime view of the redirect map so we can see whether the JSON is
// loaded, the keys are intact UTF-8, and a given path matches.
export const dynamic = "force-dynamic";

const list = redirects as { source: string; destination: string }[];
const MAP = new Map(list.map((r) => [r.source.replace(/\/+$/, ""), r.destination]));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const path = url.searchParams.get("path") ?? "/blog/infarkt-tək-urəkdə-olurmu";
  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch {}
  const key = decoded.replace(/\/+$/, "");
  return NextResponse.json({
    mapSize: MAP.size,
    firstSource: list[0]?.source ?? null,
    firstSourceHex: list[0] ? Buffer.from(list[0].source, "utf8").toString("hex") : null,
    requestedPath: path,
    decodedPath: decoded,
    decodedHex: Buffer.from(decoded, "utf8").toString("hex"),
    lookupKey: key,
    hasMatch: MAP.has(key),
    dest: MAP.get(key) ?? null,
    sampleKeys: [...MAP.keys()].slice(0, 3),
  });
}
