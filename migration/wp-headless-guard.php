<?php
/**
 * Plugin Name: kardio.az headless guard
 * Description: cms.kardio.az is a CMS-only backend. Visitors see only the admin
 *   login; front-end views bounce to the live site at kardio.az. The REST and
 *   GraphQL APIs stay open so the Next.js front-end can keep reading content.
 *
 * INSTALL (Phase 3, on cms.kardio.az): drop this file in
 *   wp-content/mu-plugins/wp-headless-guard.php   (create the mu-plugins folder
 *   if it doesn't exist). mu-plugins load automatically — no activation needed.
 *
 * ⚠️ UNTESTED until cms.kardio.az exists. Verify the checklist at the bottom
 *    the moment the server is up, BEFORE pointing WORDPRESS_API_URL at it.
 */

if (!defined('ABSPATH')) {
    exit; // no direct access
}

/** The public site the front-end actually lives on. */
const KARDIO_PUBLIC_SITE = 'https://kardio.az';

/**
 * Block the whole CMS domain from search engines (belt-and-braces alongside the
 * 301s below). The header goes on EVERY response, including /wp-json — that is
 * harmless: it marks the cms.kardio.az responses noindex, not the live site,
 * and the Next.js fetcher ignores it. kardio.az sets its own (indexable)
 * headers, so it is unaffected.
 */
add_action('send_headers', function () {
    header('X-Robots-Tag: noindex, nofollow, noarchive', true);
});

/**
 * Front-end request router.
 *
 * The whole point: a human hitting cms.kardio.az should only ever meet the
 * login screen or the dashboard — never a rendered WordPress theme. But the
 * machine endpoints the Next.js site depends on MUST pass through untouched,
 * or the live site goes blank.
 */
add_action('template_redirect', function () {
    // 1. Never intercept the admin, the APIs, AJAX, cron or WP-CLI.
    //    This is the guard that keeps the headless front-end alive.
    if (is_admin()
        || (defined('REST_REQUEST') && REST_REQUEST)
        || (defined('DOING_AJAX') && DOING_AJAX)
        || (defined('DOING_CRON') && DOING_CRON)
        || (defined('WP_CLI') && WP_CLI)) {
        return;
    }

    $uri  = $_SERVER['REQUEST_URI'] ?? '/';
    $path = parse_url($uri, PHP_URL_PATH) ?: '/';

    // 2. robots.txt: block the entire CMS from crawlers. Served here explicitly
    //    so rule 4 below doesn't 301 it away to the live site's robots.txt.
    if (is_robots() || $path === '/robots.txt') {
        header('Content-Type: text/plain; charset=utf-8');
        echo "User-agent: *\nDisallow: /\n";
        exit;
    }

    // 3. Belt-and-braces: let WordPress auth + API paths through even if the
    //    flags above didn't catch them (e.g. direct /wp-json hits).
    $passthrough = ['/wp-login.php', '/wp-admin', '/wp-json', '/graphql', '/wp-cron.php'];
    foreach ($passthrough as $prefix) {
        if (strpos($path, $prefix) === 0) {
            return;
        }
    }

    // 4. Root → the admin. Not logged in ⇒ WordPress bounces to wp-login.php,
    //    so "visiting cms.kardio.az" shows only the login screen.
    if ($path === '/' || $path === '') {
        wp_safe_redirect(admin_url());
        exit;
    }

    // 5. Any other front-end URL (a post, page, category, feed, sitemap) →
    //    the same path on the live site. This is the "go to the real site"
    //    behaviour, and it also stops Google indexing the CMS front-end.
    wp_redirect(KARDIO_PUBLIC_SITE . $uri, 301);
    exit;
});

/**
 * Make in-admin links ("View Post", "Visit Site") point at the live front-end,
 * so clicking them from the dashboard lands on kardio.az directly instead of
 * relying on the redirect above. Requires the CMS permalink structure to match
 * the Next.js routes (/%category%/%postname%/) — a Phase-3 settings step.
 */
function kardio_public_permalink($url) {
    return str_replace(home_url(), KARDIO_PUBLIC_SITE, $url);
}
add_filter('post_link', 'kardio_public_permalink');
add_filter('page_link', 'kardio_public_permalink');
add_filter('post_type_link', 'kardio_public_permalink');

/* ---------------------------------------------------------------------------
 * POST-INSTALL VERIFY (do all of these on cms.kardio.az before go-live):
 *
 *   ✅ cms.kardio.az/                       → redirects to the login screen
 *   ✅ log in                               → lands on wp-admin dashboard
 *   ✅ click "View Post" on any post        → opens kardio.az/<cat>/<slug>
 *   ✅ cms.kardio.az/blog/<some-slug>/      → 301s to kardio.az/blog/<some-slug>
 *   ✅ cms.kardio.az/wp-json/wp/v2/posts    → returns JSON (NOT redirected!)  ← critical
 *   ✅ cms.kardio.az/graphql (if used)      → responds (NOT redirected!)
 *   ✅ cms.kardio.az/wp-login.php           → shows login (NOT redirected!)
 *   ✅ cms.kardio.az/robots.txt             → "User-agent: * / Disallow: /"
 *   ✅ curl -I cms.kardio.az/wp-json/…       → header "X-Robots-Tag: noindex, nofollow"
 *
 * If the /wp-json check redirects instead of returning JSON, the live site will
 * go blank — fix the passthrough before repointing WORDPRESS_API_URL.
 * ------------------------------------------------------------------------- */
