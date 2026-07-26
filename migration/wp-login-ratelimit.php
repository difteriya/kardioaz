<?php
/**
 * Plugin Name: kardio.az login rate limit
 * Description: Brute-force protection for wp-login on the headless CMS. After a
 *   handful of failed logins from one IP, further attempts are refused for a
 *   cool-off window. Lightweight, storage-free (uses transients). Intended as a
 *   belt-and-braces layer alongside Plesk Fail2ban, not a replacement.
 *
 * INSTALL (on cms.kardio.az): drop next to the other mu-plugins in
 *   wp-content/mu-plugins/wp-login-ratelimit.php — auto-loads, no activation.
 */

if (!defined('ABSPATH')) {
    exit;
}

/** Failures allowed before lock-out, and the counting / lock-out window (sec). */
const KARDIO_LL_MAX    = 6;
const KARDIO_LL_WINDOW = 900; // 15 minutes

/**
 * Best-effort client IP. Uses REMOTE_ADDR (not spoofable) and only falls back
 * to the forwarded header when REMOTE_ADDR is the local reverse proxy
 * (nginx→Apache), so a direct attacker cannot forge X-Forwarded-For to dodge
 * the limit.
 */
function kardio_ll_ip() {
    $remote = $_SERVER['REMOTE_ADDR'] ?? '';
    if (in_array($remote, ['127.0.0.1', '::1'], true) && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts  = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $remote = trim($parts[0]);
    }
    return preg_replace('/[^0-9A-Fa-f:.]/', '', $remote) ?: 'unknown';
}

function kardio_ll_key() {
    return 'kardio_ll_' . md5(kardio_ll_ip());
}

/**
 * Gate the attempt BEFORE credentials are checked: a locked IP is refused
 * outright, so guessing passwords costs nothing to verify against.
 */
add_filter('authenticate', function ($user, $username) {
    if (empty($username)) {
        return $user; // page load, not a submitted login
    }
    $data = get_transient(kardio_ll_key());
    if (is_array($data) && ($data['count'] ?? 0) >= KARDIO_LL_MAX) {
        return new WP_Error(
            'kardio_locked',
            '<strong>Çox sayda uğursuz cəhd.</strong> Təhlükəsizlik üçün giriş müvəqqəti bloklandı. Zəhmət olmasa 15 dəqiqə sonra yenidən cəhd edin.'
        );
    }
    return $user;
}, 30, 2);

/** Count a failed attempt (refreshes the window, so hammering keeps it locked). */
add_action('wp_login_failed', function () {
    $key   = kardio_ll_key();
    $data  = get_transient($key);
    $count = (is_array($data) ? ($data['count'] ?? 0) : 0) + 1;
    set_transient($key, ['count' => $count], KARDIO_LL_WINDOW);
});

/** A successful login clears the counter for that IP. */
add_action('wp_login', function () {
    delete_transient(kardio_ll_key());
});
