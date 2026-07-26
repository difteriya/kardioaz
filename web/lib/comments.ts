import "server-only";

/**
 * Blog comments, backed by WordPress's native comment system on cms.kardio.az.
 *
 * Reading approved comments is public. Submitting goes through our own API route
 * (spam checks live there) and lands here with the doctor's credentials, forced
 * to `status: "hold"` — so every comment waits for approval in wp-admin. That
 * moderation gate is the real spam backstop; the API-route checks just cut the
 * noise before it reaches the queue.
 */

const API = process.env.WORDPRESS_API_URL ?? "https://cms.kardio.az/wp-json/wp/v2";

/** Custom header the mu-plugin re-injects (the server strips `Authorization`). */
function authHeader(): string {
  const user = process.env.WP_MIGRATE_USER ?? "";
  const pass = process.env.WP_MIGRATE_APP_PASSWORD ?? "";
  return "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
}

export interface Comment {
  id: number;
  author: string;
  contentHtml: string;
  date: string;
}

/** Approved comments for a post, oldest first. Public — no auth. */
export async function listComments(postId: number): Promise<Comment[]> {
  const res = await fetch(
    `${API}/comments?post=${postId}&status=approve&per_page=100&orderby=date&order=asc` +
      `&_fields=id,author_name,content,date`,
    { next: { revalidate: 300 } },
  );
  if (!res.ok) return [];
  const data = (await res.json()) as {
    id: number;
    author_name: string;
    content: { rendered: string };
    date: string;
  }[];
  return data.map((c) => ({
    id: c.id,
    author: c.author_name,
    contentHtml: c.content.rendered,
    date: c.date,
  }));
}

/**
 * Create a comment, always held for moderation. Runs server-side only (uses the
 * doctor's credentials). Returns a friendly reason on failure.
 */
export async function submitComment(input: {
  postId: number;
  name: string;
  email: string;
  content: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    const res = await fetch(`${API}/comments`, {
      method: "POST",
      headers: { "X-WP-Auth": authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({
        post: input.postId,
        author_name: input.name,
        author_email: input.email,
        content: input.content,
        status: "hold", // never auto-publish
      }),
    });
    if (res.status === 201) return { ok: true };
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    return { ok: false, reason: err.message ?? "Şərh göndərilmədi." };
  } catch {
    return { ok: false, reason: "Şəbəkə xətası." };
  }
}
