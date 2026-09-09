#!/usr/bin/env node
/**
 * Google Search Console MCP server for kardio.az.
 *
 * Written in-house rather than pulling a third-party npm package, because the
 * only credential this takes is a Google service-account key with access to the
 * Search Console property — worth being able to read every line that touches it.
 *
 * Auth: GOOGLE_APPLICATION_CREDENTIALS points at the service-account JSON.
 * Default property: GSC_SITE_URL (so tool calls need not repeat it).
 * Set GSC_READONLY=1 to refuse the one write tool (sitemap submission).
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { google } from "googleapis";

const READONLY = process.env.GSC_READONLY === "1";
const DEFAULT_SITE = process.env.GSC_SITE_URL || "";

const auth = new google.auth.GoogleAuth({
  scopes: [
    READONLY
      ? "https://www.googleapis.com/auth/webmasters.readonly"
      : "https://www.googleapis.com/auth/webmasters",
  ],
});
const webmasters = google.webmasters({ version: "v3", auth });
const searchconsole = google.searchconsole({ version: "v1", auth });

/** ISO date N days ago. Search Console data lags ~2 days, hence the defaults. */
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

function site(args) {
  const s = args?.siteUrl || DEFAULT_SITE;
  if (!s) {
    throw new Error(
      "No siteUrl given and GSC_SITE_URL is unset. Run gsc_list_sites to see the " +
        "property names — a domain property looks like `sc-domain:kardio.az`, a URL " +
        "prefix property like `https://kardio.az/`.",
    );
  }
  return s;
}

const SITE_ARG = {
  siteUrl: {
    type: "string",
    description:
      "Property, e.g. `sc-domain:kardio.az` or `https://kardio.az/`. Defaults to GSC_SITE_URL.",
  },
};

const TOOLS = [
  {
    name: "gsc_list_sites",
    description:
      "List every Search Console property this service account can read. Call this " +
      "first — it gives the exact siteUrl string every other tool needs.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "gsc_search_analytics",
    description:
      "Search performance rows: clicks, impressions, CTR and average position, " +
      "grouped by the dimensions you ask for. This is the query data behind the " +
      "Performance report.",
    inputSchema: {
      type: "object",
      properties: {
        ...SITE_ARG,
        startDate: { type: "string", description: "YYYY-MM-DD. Default: 28 days ago." },
        endDate: { type: "string", description: "YYYY-MM-DD. Default: 3 days ago (data lags)." },
        dimensions: {
          type: "array",
          items: { enum: ["query", "page", "country", "device", "searchAppearance", "date"] },
          description: "Group by these. Default: [\"query\"].",
        },
        rowLimit: { type: "number", description: "1-25000. Default 500." },
        startRow: { type: "number", description: "Offset for paging. Default 0." },
        type: {
          enum: ["web", "image", "video", "news", "discover", "googleNews"],
          description: "Search type. Default: web.",
        },
        filters: {
          type: "array",
          description: "AND-ed filters.",
          items: {
            type: "object",
            properties: {
              dimension: { enum: ["query", "page", "country", "device", "searchAppearance"] },
              operator: {
                enum: [
                  "equals",
                  "notEquals",
                  "contains",
                  "notContains",
                  "includingRegex",
                  "excludingRegex",
                ],
              },
              expression: { type: "string" },
            },
            required: ["dimension", "expression"],
          },
        },
      },
    },
  },
  {
    name: "gsc_inspect_url",
    description:
      "URL Inspection: is this page indexed, when was it last crawled, which " +
      "canonical did Google pick, is it mobile friendly. Quota is tight (~2000/day).",
    inputSchema: {
      type: "object",
      properties: {
        ...SITE_ARG,
        url: { type: "string", description: "Full URL to inspect, e.g. https://kardio.az/" },
      },
      required: ["url"],
    },
  },
  {
    name: "gsc_list_sitemaps",
    description: "Sitemaps known to Search Console for this property, with their last-read status.",
    inputSchema: { type: "object", properties: { ...SITE_ARG } },
  },
  {
    name: "gsc_submit_sitemap",
    description:
      "Submit (or resubmit) a sitemap. This WRITES to the property — the only tool " +
      "here that changes anything. Disabled when GSC_READONLY=1.",
    inputSchema: {
      type: "object",
      properties: {
        ...SITE_ARG,
        sitemapUrl: { type: "string", description: "Full URL, e.g. https://kardio.az/sitemap.xml" },
      },
      required: ["sitemapUrl"],
    },
  },
];

/** Turn the API's parallel keys/metrics arrays into readable objects. */
function shapeRows(rows, dimensions) {
  return (rows ?? []).map((r) => {
    const out = {};
    dimensions.forEach((d, i) => (out[d] = r.keys?.[i]));
    out.clicks = r.clicks;
    out.impressions = r.impressions;
    out.ctr = r.ctr == null ? null : +(r.ctr * 100).toFixed(2); // percent, not fraction
    out.position = r.position == null ? null : +r.position.toFixed(1);
    return out;
  });
}

const HANDLERS = {
  async gsc_list_sites() {
    const { data } = await webmasters.sites.list();
    return (data.siteEntry ?? []).map((s) => ({
      siteUrl: s.siteUrl,
      permission: s.permissionLevel,
    }));
  },

  async gsc_search_analytics(args = {}) {
    const dimensions = args.dimensions?.length ? args.dimensions : ["query"];
    const { data } = await webmasters.searchanalytics.query({
      siteUrl: site(args),
      requestBody: {
        startDate: args.startDate || daysAgo(28),
        endDate: args.endDate || daysAgo(3),
        dimensions,
        rowLimit: Math.min(args.rowLimit ?? 500, 25000),
        startRow: args.startRow ?? 0,
        type: args.type || "web",
        dimensionFilterGroups: args.filters?.length
          ? [
              {
                groupType: "and",
                filters: args.filters.map((f) => ({
                  dimension: f.dimension,
                  operator: f.operator || "contains",
                  expression: f.expression,
                })),
              },
            ]
          : undefined,
      },
    });
    const rows = shapeRows(data.rows, dimensions);
    return {
      range: [args.startDate || daysAgo(28), args.endDate || daysAgo(3)],
      dimensions,
      rowCount: rows.length,
      totals: rows.reduce(
        (a, r) => ({ clicks: a.clicks + (r.clicks || 0), impressions: a.impressions + (r.impressions || 0) }),
        { clicks: 0, impressions: 0 },
      ),
      rows,
    };
  },

  async gsc_inspect_url(args = {}) {
    const { data } = await searchconsole.urlInspection.index.inspect({
      requestBody: { inspectionUrl: args.url, siteUrl: site(args), languageCode: "az" },
    });
    const r = data.inspectionResult ?? {};
    return {
      url: args.url,
      verdict: r.indexStatusResult?.verdict,
      coverage: r.indexStatusResult?.coverageState,
      lastCrawled: r.indexStatusResult?.lastCrawlTime,
      googleCanonical: r.indexStatusResult?.googleCanonical,
      userCanonical: r.indexStatusResult?.userCanonical,
      robotsTxt: r.indexStatusResult?.robotsTxtState,
      indexingState: r.indexStatusResult?.indexingState,
      mobileUsability: r.mobileUsabilityResult?.verdict,
      richResults: r.richResultsResult?.verdict,
      inspectionLink: r.inspectionResultLink,
    };
  },

  async gsc_list_sitemaps(args = {}) {
    const { data } = await webmasters.sitemaps.list({ siteUrl: site(args) });
    return (data.sitemap ?? []).map((s) => ({
      path: s.path,
      lastSubmitted: s.lastSubmitted,
      lastDownloaded: s.lastDownloaded,
      isPending: s.isPending,
      errors: s.errors,
      warnings: s.warnings,
      contents: s.contents,
    }));
  },

  async gsc_submit_sitemap(args = {}) {
    if (READONLY) throw new Error("Refused: this server is running with GSC_READONLY=1.");
    await webmasters.sitemaps.submit({ siteUrl: site(args), feedpath: args.sitemapUrl });
    return { submitted: args.sitemapUrl, note: "Google reads it asynchronously; check back later." };
  },
};

const server = new Server(
  { name: "kardio-gsc", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: READONLY ? TOOLS.filter((t) => t.name !== "gsc_submit_sitemap") : TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const handler = HANDLERS[req.params.name];
  if (!handler) {
    return { isError: true, content: [{ type: "text", text: `Unknown tool: ${req.params.name}` }] };
  }
  try {
    const result = await handler(req.params.arguments ?? {});
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    // Google's errors carry the useful part in nested fields; surface all of it.
    const detail = err?.response?.data?.error?.message || err?.errors?.[0]?.message || err.message;
    return { isError: true, content: [{ type: "text", text: `Search Console API: ${detail}` }] };
  }
});

await server.connect(new StdioServerTransport());
