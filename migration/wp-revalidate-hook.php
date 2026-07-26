<?php
/**
 * Plugin Name: kardio.az revalidate hook
 * Description: When a post on cms.kardio.az is published, updated, or removed,
 *   pings the Next.js front-end's /api/revalidate so kardio.az reflects the
 *   change instantly instead of waiting for the hourly ISR cache to expire.
 *
 * INSTALL (on cms.kardio.az): drop this file in
 *   wp-content/mu-plugins/wp-revalidate-hook.php  and set
 *   KARDIO_REVALIDATE_SECRET below to the SAME value as REVALIDATE_SECRET in the
 *   Next.js app's web/.env.local. mu-plugins auto-load — no activation needed.
 *
 * SECURITY: the secret only lets the caller force a cache refresh of our own
 *   pages (see the /api/revalidate route) — low impact, but keep it off git and
 *   identical on both sides.
 */

if (!defined('ABSPATH')) {
    exit;
}

/** The live front-end's on-demand revalidation endpoint. */
const KARDIO_REVALIDATE_URL = 'https://kardio.az/api/revalidate';

/** ⚠️ Replace with the REVALIDATE_SECRET from web/.env.local before uploading. */
const KARDIO_REVALIDATE_SECRET = 'PUT-THE-REVALIDATE_SECRET-HERE';

/** Fire-and-forget ping — never blocks or breaks the editor if the front-end
 *  is momentarily unreachable. */
function kardio_ping_revalidate(): void {
    if (KARDIO_REVALIDATE_SECRET === 'PUT-THE-REVALIDATE_SECRET-HERE') {
        return; // not configured yet
    }
    wp_remote_post(KARDIO_REVALIDATE_URL, [
        'headers'   => ['x-revalidate-secret' => KARDIO_REVALIDATE_SECRET],
        'timeout'   => 5,
        'blocking'  => false,
        'sslverify' => true,
    ]);
}

/**
 * Any transition into or out of "publish" for a real post — publishing, editing
 * a live post, unpublishing, or trashing — should refresh the site. Revisions,
 * autosaves and non-post types (pages, attachments) are skipped: their
 * post_type is not 'post', so the early return covers them.
 */
add_action('transition_post_status', function ($new_status, $old_status, $post) {
    if (!isset($post->post_type) || $post->post_type !== 'post') {
        return;
    }
    if ($new_status === 'publish' || $old_status === 'publish') {
        kardio_ping_revalidate();
    }
}, 10, 3);
