<?php
/**
 * Plugin Name: kardio.az REST auth header fix
 * Description: This server strips the standard `Authorization` header before it
 *   reaches PHP, which breaks Application Password auth for the WordPress REST
 *   API (every request looks anonymous). Custom headers are NOT stripped, so we
 *   accept the same Basic credentials in an `X-WP-Auth` header and re-inject them
 *   into PHP's auth globals early, before WordPress authenticates the request.
 *
 * INSTALL: drop this file in  wp-content/mu-plugins/wp-rest-auth-fix.php
 *   (create the mu-plugins folder if it doesn't exist). mu-plugins auto-load —
 *   no activation needed.
 *
 * Then API clients send:  X-WP-Auth: Basic base64(user:application_password)
 *
 * SECURITY: only Basic values are honored, and only over the REST API using an
 *   Application Password (revocable, scoped) — never the account's main password.
 *   Revoke the Application Password when automation is finished.
 */

if (!empty($_SERVER['HTTP_X_WP_AUTH'])) {
    $header = trim($_SERVER['HTTP_X_WP_AUTH']);

    if (stripos($header, 'Basic ') === 0) {
        $decoded = base64_decode(substr($header, 6), true);

        if ($decoded !== false && strpos($decoded, ':') !== false) {
            list($user, $pass) = explode(':', $decoded, 2);

            // What WordPress's Application Password auth actually reads:
            $_SERVER['PHP_AUTH_USER'] = $user;
            $_SERVER['PHP_AUTH_PW']   = $pass;

            // Belt-and-braces for code paths that read the raw header instead:
            $_SERVER['HTTP_AUTHORIZATION'] = $header;
        }
    }
}

/* The diagnostic endpoint used to confirm this works was removed once auth was
 * verified. If you need it again, restore it from git history (it registered
 * GET /wp-json/authfix/v1/debug). Keep this file lean in production. */
