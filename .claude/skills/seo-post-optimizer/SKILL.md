---
name: seo-post-optimizer
description: >
  Optimize a single blog post or web page for SEO on demand — for WordPress /
  headless-WordPress + Next.js sites. Use whenever the user pastes a post, gives a
  post URL, or a WordPress REST API link and asks to "optimize this post", "improve
  SEO", "check SEO", "make this SEO friendly", "write the meta", or similar. Produces
  a ready-to-paste SEO deliverable (title tag, meta description, slug, headings,
  keywords, internal links, image alt text, JSON-LD schema, E-E-A-T check). Tuned
  for Azerbaijani-language and medical/health (YMYL) content, but works for any topic.
---

# SEO Post Optimizer

On-demand ("Tier 1") SEO optimization for a single blog post or page. The user
brings a post; you return a complete, copy-paste-ready optimization package that
plugs straight into WordPress (Yoast/RankMath) and a Next.js frontend.

## When to use

Trigger when the user wants to optimize/improve/check the SEO of a specific piece
of content — a new blog post, an existing post, or a page. Do NOT trigger for
whole-site technical audits (use the `seo-audit` skill for that) — this skill is
per-post/on-page.

## How the user gives you the content

Accept any of these — ask which if unclear:
1. **Pasted text** — the post body pasted into chat.
2. **A live URL** — fetch it with WebFetch and read the rendered content.
3. **A WordPress REST API link** — e.g. `https://site.tld/wp-json/wp/v2/posts/<id>`
   or `?slug=<slug>` — pull the raw title/content/excerpt from the JSON.

If you only get a topic (no draft yet), produce a **keyword-optimized content brief
+ outline** instead of optimizing existing text.

## Language & locale

- Default output language is **Azerbaijani (az)** unless the user says otherwise.
- Write meta titles/descriptions in natural Azerbaijani — do not machine-translate
  awkwardly. Keep medical terms accurate.
- Assume a single-language (az) site: canonical self-referencing, `lang="az"`,
  no hreflang needed unless the user says the site is multilingual.
- Some content may intentionally be in **English or German** (author's choice) — do NOT
  flag this as an error or suggest translating it. Optimize it in its own language.

## ⚠️ Azerbaijani transliteration / dual-spelling (ALWAYS apply for az content)

Azerbaijani special letters are frequently typed with ASCII substitutes because of
keyboards/habit: `ə→e, ü→u, ç→c, ş→s, ğ→g, ö→o, ı→i, İ→i`. Google does NOT reliably
treat these as equivalent, so **target BOTH the proper and ASCII-folded form** of every
keyword and name.

- **Keywords:** list each target term twice — proper + ASCII (e.g. `ürək xəstəliyi` AND
  `urek xesteliyi`, `təzyiq` AND `tezyiq`).
- **Names:** provide `alternateName` (e.g. `Kənan Əhmədov` → also `Kenan Ehmedov`) and use
  both naturally in author bio/bylines.
- **Slugs:** ASCII-folded, no diacritics (`urek-xesteliyi`) — matches how people type and
  avoids `%`-encoded URLs.
- **On-page:** keep visible copy in correct Azerbaijani (professional/accurate); seed ASCII
  variants naturally in alt text, FAQ phrasing, or a heading where it reads well — never
  keyword-stuff.
- In the deliverable, show BOTH spellings in the keyword list and note the ASCII slug.

## ⚠️ Medical / YMYL rule (critical for health sites like kardioaz)

Health content is **YMYL ("Your Money or Your Life")** and judged on **E-E-A-T**
(Experience, Expertise, Authoritativeness, Trust). Rankings depend on this MORE
than on keywords. For any medical post, always check and flag:
- **Named author with credentials** (doctor name + qualifications).
- **Medical reviewer / review date** where possible.
- **Citations** to authoritative sources (guidelines, journals, official health orgs).
- **Accuracy, caution, and a "consult your doctor" disclaimer** where appropriate.
- Use `MedicalWebPage` schema (not just `Article`) for medical posts.

If any E-E-A-T element is missing, call it out explicitly as a required fix.

## The optimization workflow

1. **Identify search intent & keywords**
   - Determine the post's primary topic and the searcher's intent (informational,
     etc.). If useful, web-search for how people phrase this in Azerbaijani and what
     competitors rank.
   - Choose **1 primary keyword** + **2–5 secondary/long-tail keywords**.
2. **Audit the current content** against the checklist below.
3. **Produce the deliverable** (exact format in the next section).
4. **Explain the "why"** briefly for non-obvious changes, and flag anything the user
   must decide (e.g. missing author credentials).

## Required output format

Always return this structured package, ready to paste:

```
## SEO Optimization — <post title>

**Primary keyword:** <kw>
**Secondary keywords:** <kw>, <kw>, <kw>

### 1. Title tag  (≤ 60 chars)
<optimized title — includes primary keyword, compelling>

### 2. Meta description  (≤ 155 chars, Azerbaijani)
<benefit-driven description with primary keyword and a soft CTA>

### 3. URL slug
<short-hyphenated-latin-slug>   ← if changing an existing live URL, ADD a 301 redirect note

### 4. Heading structure
- H1: <one, contains primary keyword>
- H2: <section> ...
- H3: <subsection> ...
(flag if the draft has multiple H1s or skipped levels)

### 5. On-page keyword placement
- ✅/❌ primary keyword in first 100 words
- ✅/❌ in at least one H2
- ✅/❌ natural density (no stuffing)
- notes...

### 6. Internal links
- Link "<anchor>" → <related post/page>  (2–5 suggestions; explain relevance)

### 7. Image alt text
- <image> → "<descriptive alt with keyword where natural>"

### 8. Structured data (JSON-LD)
<Article or MedicalWebPage block; add FAQ schema if the post has Q&A; add
BreadcrumbList>

### 9. E-E-A-T check  (medical/YMYL)
- Author + credentials: ✅/❌ ...
- Citations: ✅/❌ ...
- Review date / disclaimer: ✅/❌ ...

### 10. Readability & content notes
- thin sections to expand, sentences to shorten, missing subtopics competitors cover, etc.
```

## On-page checklist (what you verify every time)

- Title tag: unique, ≤60 chars, primary keyword near the front.
- Meta description: ≤155 chars, compelling, keyword present, not duplicated.
- Exactly one H1; logical H2/H3 hierarchy; keyword in ≥1 subheading.
- Primary keyword in first 100 words; natural usage, no stuffing.
- Slug: short, lowercase, hyphenated, meaningful (latin-script for az is fine).
- Internal links to relevant posts/pages (and inbound links from others).
- All images have descriptive alt text; large images flagged for compression.
- Canonical URL self-referencing; noindex only where intended.
- Structured data present and valid for the content type.
- Content depth matches or beats top-ranking results for the query.
- (Medical) E-E-A-T signals present.

## Applying it in WordPress

Tell the user where each piece goes:
- **Title tag & meta description** → Yoast/RankMath "SEO title" and "Meta description"
  fields (NOT the H1/post title, though they often align).
- **Slug** → the post's Permalink field. If the post is already live with traffic,
  DO NOT change the slug without adding a **301 redirect** old→new.
- **Headings/body/alt text** → the post editor.
- **JSON-LD** → injected by the Next.js frontend per-page (preferred), or via the
  SEO plugin's schema settings.

## Related

- `seo-audit` — for whole-site / technical SEO audits (this skill is per-post).
- `vercel-react-best-practices` — for Next.js performance (Core Web Vitals feed SEO).
