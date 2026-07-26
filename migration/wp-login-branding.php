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
 *   activation needed. Purely presentational: only CSS + the logo link/text
 *   filters, no auth or request logic.
 */

if (!defined('ABSPATH')) {
    exit;
}

/* The login logo links to the live site (not wordpress.org), and its alt/title
   text names the clinic. */
add_filter('login_headerurl', function () {
    return 'https://kardio.az';
});
add_filter('login_headertext', function () {
    return 'kardio.az — Sizin ürək həkiminiz';
});

add_action('login_enqueue_scripts', function () {
    // Heartbeat line (pulse crimson), inlined so the page needs no external asset.
    $ecg = "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20200%2024'%3E%3Cpath%20d='M0%2012H66l5-8%208%2016%206-12%204%204h101'%20fill='none'%20stroke='%23e5484d'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'/%3E%3C/svg%3E";
    ?>
    <style>
    :root{
      --porcelain:#f7f6f2; --porcelain-2:#efeee8; --ink:#16232b; --ink-soft:#45555e;
      --teal:#175c55; --teal-deep:#0f3f3a; --pulse:#e5484d; --mist:#cbd6d3; --mist-soft:#dfe6e3;
    }
    body.login{
      background:var(--porcelain);
      color:var(--ink);
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    }
    #login{ width:360px; padding-top:5vh; }

    /* Logo area → heartbeat line + wordmark + tagline, all via CSS (no image). */
    .login h1{
      background-image:url("<?php echo $ecg; ?>");
      background-repeat:no-repeat;
      background-position:center top;
      background-size:150px auto;
      padding-top:30px;
    }
    .login h1 a{
      background:none !important;
      width:auto; height:auto; text-indent:0; overflow:visible;
      font-size:0; line-height:1.1;
    }
    .login h1 a::before{
      content:"kardio.az";
      display:block;
      font-size:34px; font-weight:700; letter-spacing:-.5px;
      color:var(--teal);
    }
    .login h1 a::after{
      content:"Sizin ürək həkiminiz";
      display:block; margin-top:5px;
      font-size:13px; font-weight:500; color:var(--ink-soft);
    }

    /* Form card */
    .login form{
      background:#fff;
      border:1px solid var(--mist);
      border-radius:16px;
      box-shadow:0 12px 34px -14px rgba(22,35,43,.20);
      padding:26px 24px 24px;
      margin-top:22px;
    }
    .login label{ color:var(--ink-soft); font-size:14px; }
    .login input[type=text],
    .login input[type=password]{
      border:1px solid var(--mist);
      border-radius:10px;
      padding:11px 12px;
      background:var(--porcelain);
      font-size:16px;
    }
    .login input[type=text]:focus,
    .login input[type=password]:focus{
      border-color:var(--teal);
      box-shadow:0 0 0 3px rgba(23,92,85,.18);
      outline:none;
    }

    /* Primary button */
    .wp-core-ui .button-primary{
      background:var(--teal); border:none; border-radius:10px;
      padding:9px 18px; font-weight:600; text-shadow:none; box-shadow:none;
      transition:background .15s ease;
    }
    .wp-core-ui .button-primary:hover,
    .wp-core-ui .button-primary:focus{ background:var(--teal-deep); box-shadow:none; }

    /* Links + notices */
    .login #nav a, .login #backtoblog a{ color:var(--ink-soft); }
    .login #nav a:hover, .login #backtoblog a:hover{ color:var(--teal); }
    .login .message, .login .notice{ border-left-color:var(--teal); border-radius:8px; }
    .login #login_error{ border-left-color:var(--pulse); border-radius:8px; }

    /* "Remember me" + language switcher spacing */
    .login .forgetmenot label{ font-size:13px; }
    .login .language-switcher{ margin-top:14px; }
    </style>
    <?php
});
