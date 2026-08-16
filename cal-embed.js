/* =====================================================================
   Prevail Exercise Physiology — cal-embed.js
   Cal.com booking widget for the intro call.

   ══ SET YOUR CAL.COM LINK HERE ══════════════════════════════════════
   One line to change: CAL_LINK below. Everything else is wired.

   Until it's set, this file does nothing and the built-in time picker
   (booking.js) keeps running exactly as it does today — so you can
   deploy this safely before your Cal.com account is ready.

   ── What Cal.com gives you that the built-in picker can't ───────────
   The built-in picker is a static list of times you maintain by hand.
   It can't see your calendar and it can't reserve anything, so two
   people can request the same slot and you have to catch it.

   Cal.com connects to your Google Calendar properly: it reads your
   busy times so conflicting slots disappear on their own, and it
   writes the confirmed booking back as a real event. With "requires
   confirmation" switched on (see the setup steps in
   .github/DEPLOY-GUIDE.md) a booking still lands as a request you
   approve — same as today — it just stops being your job to track.

   ── Why this isn't the snippet Cal.com gives you ────────────────────
   Cal's documented snippet is an *inline* <script>, which would force
   'unsafe-inline' into the page's script-src and weaken the CSP for
   every other script on the site. Loading it from here keeps the
   policy strict. Same reasoning as analytics.js.
   ===================================================================== */
(function () {
  "use strict";

  /* ═══════════════════════════════════════════════════════════════════
     CONFIG — edit this block
     ═══════════════════════════════════════════════════════════════════ */

  // Your Cal.com booking link, WITHOUT the https://cal.com/ prefix.
  // If your booking page is  cal.com/prevail-ep/intro-call
  // then this is           "prevail-ep/intro-call"
  var CAL_LINK = "prevail-ep/intro-call";

  // Cal.com's embed script origin. Only change this if you self-host Cal.
  // It must also be allowed in the Content-Security-Policy — see the
  // meta tag in booking.html and the header block in netlify.toml.
  var CAL_ORIGIN = "https://app.cal.com";

  /* ═══════════════════════════════════════════════════════════════════ */

  var mount = document.getElementById("cal-embed");
  var legacy = document.getElementById("legacy-booking");
  if (!mount) { return; }

  // Not configured yet — leave the built-in picker in charge and stay
  // completely inert. No script is loaded, no request is made.
  if (CAL_LINK.indexOf("REPLACE_WITH_") === 0 || !CAL_LINK) { return; }

  /* ---------- Hand over from the built-in picker ----------
     This runs before booking.js (both are deferred, so they execute in
     document order). booking.js checks whether the legacy block is
     hidden and bails out, so only one picker is ever live. The legacy
     markup is empty until booking.js fills it, so there's nothing to
     flash on screen in between. */
  if (legacy) { legacy.hidden = true; }
  mount.hidden = false;

  /* ---------- Restore the fallback if Cal never arrives ----------
     Ad blockers and content filters do block embed domains, and a
     blocked widget would otherwise leave someone staring at an empty
     box with no way to reach you. If nothing has rendered in the mount
     after a reasonable wait, put the built-in picker back. */
  var settled = false;      // the embed has either rendered or been given up on
  function fallBack(reason) {
    if (settled) { return; }
    settled = true;
    mount.hidden = true;
    if (legacy) {
      legacy.hidden = false;
      // booking.js has already run and bailed out, so re-run it.
      var again = document.createElement("script");
      again.src = "booking.js";
      document.body.appendChild(again);
    }
    try {
      document.dispatchEvent(new CustomEvent("prevail:booking-error", {
        detail: { reason: reason }
      }));
    } catch (err) { /* measurement is optional */ }
  }

  window.setTimeout(function () {
    // Cal renders an iframe into the mount once it's up.
    if (!mount.querySelector("iframe")) { fallBack("embed_blocked"); }
  }, 8000);

  /* ---------- Cal.com embed bootstrap ----------
     This is Cal's documented loader stub, reformatted and commented.
     It stands up a queue on window.Cal so calls made before the remote
     script arrives are replayed once it does. */
  (function (win, src) {
    var doc = win.document;
    function push(target, args) { target.q.push(args); }
    win.Cal = win.Cal || function () {
      var cal = win.Cal;
      var args = arguments;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        var tag = doc.createElement("script");
        tag.src = src;
        tag.addEventListener("error", function () { fallBack("embed_unreachable"); });
        doc.head.appendChild(tag);
        cal.loaded = true;
      }
      if (args[0] === "init") {
        var api = function () { push(api, arguments); };
        var namespace = args[1];
        api.q = api.q || [];
        if (typeof namespace === "string") {
          cal.ns[namespace] = cal.ns[namespace] || api;
          push(cal.ns[namespace], args);
          push(cal, ["initNamespace", namespace]);
        } else {
          push(cal, args);
        }
        return;
      }
      push(cal, args);
    };
  })(window, CAL_ORIGIN + "/embed/embed.js");

  var Cal = window.Cal;

  Cal("init", { origin: CAL_ORIGIN });

  // The site is light-only, so pin the widget to light rather than letting
  // it follow the visitor's OS setting — otherwise someone browsing in dark
  // mode gets a dark widget inside a white page. This has to be set here in
  // the inline config; setting it only in the "ui" call below doesn't stick.
  Cal("inline", {
    elementOrSelector: "#cal-embed",
    calLink: CAL_LINK,
    config: { layout: "month_view", theme: "light" }
  });

  // Match the site's palette so the widget doesn't look bolted on.
  // Keep this in step with --brand-dark in styles.css.
  Cal("ui", {
    layout: "month_view",
    theme: "light",
    hideEventTypeDetails: false,
    cssVarsPerTheme: {
      light: { "cal-brand": "#0f5a54" }
    }
  });

  /* ---------- Measurement ----------
     Reuses the events analytics.js already listens for, so GA4 keeps
     reporting intro calls the same way it does now.

     Cal's callback payload carries the booker's name, email and any
     answers they typed. None of that is passed on — the same rule the
     rest of the site follows (see the note in analytics.js). Only the
     fact that a booking happened is sent. */
  Cal("on", {
    action: "bookingSuccessful",
    callback: function () {
      settled = true;
      try {
        document.dispatchEvent(new CustomEvent("prevail:booking-success", {
          detail: { enquiring_as: "not specified" }
        }));
      } catch (err) { /* never let measurement break a booking */ }
    }
  });

  // The widget is up — stand the fallback timer down.
  Cal("on", { action: "linkReady", callback: function () { settled = true; } });

  // Cal reached us but couldn't load the booking page — usually a wrong
  // CAL_LINK, or the event type was renamed or unpublished.
  Cal("on", { action: "linkFailed", callback: function () { fallBack("cal_link_failed"); } });
})();
