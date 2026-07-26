<?php
/**
 * Plugin Name: kardio.az login branding
 * Description: Brands the wp-login.php screen to match kardio.az (palette, a
 *   "kardio.az" wordmark, the heartbeat line, teal buttons). Because the CMS is
 *   locked to admin-only (see wp-headless-guard.php), this login page is the
 *   ONLY public face of cms.kardio.az — so it should look like the clinic, not
 *   default WordPress.
 *
 * INSTALL (on cms.kardio.az): drop this file next to the guard in
 *   wp-content/mu-plugins/wp-login-branding.php  — mu-plugins auto-load, no
 *   activation needed. Presentational only: CSS + the logo link/text filters.
 *
 * Why login_head + !important: WordPress prints its own login.css, and on some
 * setups it lands AFTER anything echoed from login_enqueue_scripts, overriding
 * plain rules (button stayed blue, wordmark grey). Printing on login_head at a
 * late priority and marking the key properties !important makes the brand win
 * regardless of print order (core login.css uses no !important).
 */

if (!defined('ABSPATH')) {
    exit;
}

/* Logo links to the live site; the anchor TEXT itself becomes the visible
   wordmark (styled below), so it stays real for screen readers — no duplicate
   generated text. */
add_filter('login_headerurl', function () {
    return 'https://kardio.az';
});
add_filter('login_headertext', function () {
    return 'kardio.az';
});

/* Keep the CMS out of search results (belt-and-braces with the headless guard). */
add_action('login_head', function () {
    header('X-Robots-Tag: noindex, nofollow', true);
}, 1);

add_action('login_head', function () {
    // Heartbeat line (pulse crimson), inlined so the page needs no external asset.
    $ecg = "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20200%2024'%3E%3Cpath%20d='M0%2012H66l5-8%208%2016%206-12%204%204h101'%20fill='none'%20stroke='%23e5484d'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'/%3E%3C/svg%3E";
    ?>
    <style id="kardio-login-brand">
    body.login{
      background:#f7f6f2 !important;
      color:#16232b;
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    }
    #login{ width:360px !important; padding-top:5vh !important; }

    /* Logo area: heartbeat line (h1 background) + the anchor text as wordmark. */
    .login h1{
      background-image:url("<?php echo $ecg; ?>") !important;
      background-repeat:no-repeat !important;
      background-position:center top !important;
      background-size:150px auto !important;
      padding-top:32px !important;
      height:auto !important;
      margin-bottom:22px !important;
      text-align:center !important;
    }
    .login h1 a{
      display:inline-block !important;
      width:auto !important;
      height:auto !important;
      background:none !important;
      text-indent:0 !important;
      overflow:visible !important;
      text-decoration:none !important;
      color:#175c55 !important;
      font-size:34px !important;
      font-weight:700 !important;
      letter-spacing:-.5px !important;
      line-height:1.1 !important;
    }
    .login h1 a::after{
      content:"Sizin ürək həkiminiz";
      display:block;
      margin-top:6px;
      font-size:13px !important;
      font-weight:500 !important;
      letter-spacing:0 !important;
      color:#45555e !important;
    }

    /* Form card */
    .login form{
      background:#fff !important;
      border:1px solid #cbd6d3 !important;
      border-radius:16px !important;
      box-shadow:0 12px 34px -14px rgba(22,35,43,.20) !important;
      padding:26px 24px 24px !important;
    }
    .login label{ color:#45555e !important; font-size:14px !important; }
    .login input[type=text],
    .login input[type=password]{
      border:1px solid #cbd6d3 !important;
      border-radius:10px !important;
      padding:11px 12px !important;
      background:#f7f6f2 !important;
      font-size:16px !important;
    }
    .login input[type=text]:focus,
    .login input[type=password]:focus{
      border-color:#175c55 !important;
      box-shadow:0 0 0 3px rgba(23,92,85,.18) !important;
      outline:none !important;
    }
    /* Show/hide-password button sits inside the field wrapper */
    .login .wp-pwd .button.wp-hide-pw{ color:#45555e !important; }

    /* Primary button → teal */
    .wp-core-ui .button-primary{
      background:#175c55 !important;
      border-color:#175c55 !important;
      color:#fff !important;
      border-radius:10px !important;
      padding:2px 18px !important;
      font-weight:600 !important;
      text-shadow:none !important;
      box-shadow:none !important;
      transition:background .15s ease !important;
    }
    .wp-core-ui .button-primary:hover,
    .wp-core-ui .button-primary:focus{
      background:#0f3f3a !important;
      border-color:#0f3f3a !important;
    }

    /* Secondary buttons (language "Change") → quiet teal outline */
    .wp-core-ui .button-secondary{
      color:#175c55 !important;
      border-color:#cbd6d3 !important;
      border-radius:10px !important;
    }

    /* Language switcher sits OUTSIDE #login, so the .login form card rule above
       stretched it into a full-width white bar. Reset it and constrain its width
       to match the login box. */
    .login .language-switcher{
      width:360px !important;
      margin:16px auto 0 !important;
    }
    .login .language-switcher form{
      background:none !important;
      border:none !important;
      box-shadow:none !important;
      padding:0 !important;
      display:flex !important;
      align-items:center !important;
      justify-content:center !important;
      gap:8px !important;
    }
    .login .language-switcher select{ max-width:200px !important; }

    /* Links + notices */
    .login #nav a, .login #backtoblog a{ color:#45555e !important; }
    .login #nav a:hover, .login #backtoblog a:hover{ color:#175c55 !important; }
    .login .message, .login .notice{ border-left-color:#175c55 !important; border-radius:8px !important; }
    .login #login_error{ border-left-color:#e5484d !important; border-radius:8px !important; }
    </style>
    <?php
}, 99);
