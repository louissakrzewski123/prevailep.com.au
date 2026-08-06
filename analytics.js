/* =====================================================================
   Prevail Exercise Physiology — analytics.js
   Google Analytics 4.

   ── SETUP (one line) ─────────────────────────────────────────────────
   Paste your GA4 Measurement ID below. Find it in Google Analytics under
   Admin → Data streams → (your web stream). It looks like "G-ABC1234XYZ".
   Until it's set, this file does nothing at all — no cookies, no requests.

   ── Why this isn't the snippet Google gives you ──────────────────────
   Google's copy-paste snippet is an *inline* <script>, which would force
   'unsafe-inline' into the page's script-src and weaken the CSP for every
   other script on the site. Loading the tag from here keeps the policy
   strict — see .github/DEPLOY-GUIDE.md.
   ===================================================================== */
(function () {
  "use strict";

  var MEASUREMENT_ID = "REPLACE_WITH_GA4_MEASUREMENT_ID";

  // Not configured yet — stay completely inert.
  if (MEASUREMENT_ID.indexOf("G-") !== 0) { return; }

  /* ---------- Bootstrap gtag ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  // Consent Mode v2. Measurement on, advertising storage off. Google's
  // personalised-advertising policy prohibits building ad audiences from
  // health or disability signals, so these stay denied by default. If you
  // ever run Google Ads, read that policy before changing them.
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted"
  });

  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  var tag = document.createElement("script");
  tag.async = true;
  tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(MEASUREMENT_ID);
  document.head.appendChild(tag);

  /* ---------- Helpers ---------- */
  function track(name, params) { gtag("event", name, params || {}); }

  // Which part of the page a click came from, so you can tell which CTA
  // is actually earning its place. Falls back to the section's first class
  // for the sections that have no id (hero, trustbar).
  function placement(el) {
    var host = el.closest("section, nav, header, footer");
    if (!host) { return "page"; }
    return host.id || (host.className || "").split(" ")[0] || host.tagName.toLowerCase();
  }

  function label(el) { return (el.textContent || "").trim().slice(0, 80); }

  /* ---------- Contact + CTA clicks ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) { return; }
    var href = a.getAttribute("href") || "";

    if (href.indexOf("tel:") === 0) {
      track("contact_click", { method: "phone", link_location: placement(a) });
    } else if (href.indexOf("mailto:") === 0) {
      track("contact_click", { method: "email", link_location: placement(a) });
    } else if (href.indexOf("#waitlist") !== -1) {
      track("waitlist_cta_click", { link_location: placement(a), link_text: label(a) });
    }
  }, true);

  /* ---------- FAQ: which questions people actually open ---------- */
  var faqs = document.querySelectorAll(".faq details");
  for (var i = 0; i < faqs.length; i++) {
    faqs[i].addEventListener("toggle", function () {
      if (!this.open) { return; }
      var summary = this.querySelector("summary");
      track("faq_open", { faq_question: summary ? label(summary) : "" });
    });
  }

  /* ---------- Waitlist funnel ---------- */
  // Started filling it in (fires once) — the gap between this and
  // generate_lead is your form drop-off.
  var form = document.getElementById("waitlist-form");
  if (form) {
    var started = false;
    form.addEventListener("input", function () {
      if (started) { return; }
      started = true;
      track("waitlist_start");
    });
  }

  // script.js dispatches these once the Web3Forms round-trip resolves.
  // The payload carries enquiry *segments* only — never name, email, phone,
  // free text or anything else that could identify a person.
  document.addEventListener("prevail:waitlist-success", function (e) {
    var d = (e && e.detail) || {};
    track("generate_lead", {
      enquiring_as: d.enquiring_as || "not specified",
      funding: d.funding || "not specified"
    });
  });

  document.addEventListener("prevail:waitlist-error", function (e) {
    var d = (e && e.detail) || {};
    track("waitlist_error", { error_type: d.reason || "unknown" });
  });
})();
