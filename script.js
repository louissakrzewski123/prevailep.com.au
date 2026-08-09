/* =====================================================================
   Prevail Exercise Physiology — script.js
   Mobile nav, footer year, and a shared Web3Forms submit path.

   Any form marked up as <form data-w3form data-event="name"> gets
   validation, an accessible status message and a Web3Forms submission —
   so the waitlist, the intro-call booking and the referral form all
   behave identically without triplicating this logic.

   Required inside each form:
     input[name=access_key]   Web3Forms key
     .form-status             where the result message is announced
     button[type=submit]
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var navList = document.getElementById("nav-list");
  if (toggle && navList) {
    toggle.addEventListener("click", function () {
      var open = navList.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    // Close the menu when a link is tapped (mobile)
    navList.addEventListener("click", function (e) {
      if (e.target.closest("a") && navList.classList.contains("open")) {
        navList.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    });
  }

  /* ---------- Shared form handling ---------- */

  // Announce form outcomes for analytics.js to pick up. Kept as a DOM event
  // so forms keep working unchanged if analytics is removed, and so
  // analytics never sees anything beyond what's passed in here.
  function announce(name, detail) {
    try {
      document.dispatchEvent(new CustomEvent("prevail:" + name, { detail: detail || {} }));
    } catch (err) { /* never let measurement break a form */ }
  }

  function setFieldValidity(input, ok) {
    var wrap = input.closest(".field");
    if (wrap) { wrap.classList.toggle("invalid", !ok); }
  }

  function initForm(form) {
    var eventName = form.getAttribute("data-event") || "form";
    var statusEl = form.querySelector(".form-status");
    var submitBtn = form.querySelector('button[type="submit"]');
    if (!statusEl || !submitBtn) { return; }

    // Which fields to report back to analytics on success. Segments only —
    // never a name, email, phone number or anything free-typed.
    var segmentFields = (form.getAttribute("data-segments") || "")
      .split(",").map(function (s) { return s.trim(); }).filter(Boolean);

    function validate() {
      var ok = true;
      var required = form.querySelectorAll("[required]");
      for (var i = 0; i < required.length; i++) {
        var el = required[i];
        var valid = el.type === "checkbox" ? el.checked : String(el.value).trim() !== "";
        if (valid && el.type === "email") {
          valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value);
        }
        setFieldValidity(el, valid);
        if (!valid && ok) { el.focus(); }   // focus the first invalid field
        ok = ok && valid;
      }
      return ok;
    }

    // Clear the invalid state as the user fixes a field
    form.addEventListener("input", function (e) {
      if (e.target.closest(".field.invalid")) {
        var el = e.target;
        var valid = el.type === "checkbox" ? el.checked : String(el.value).trim() !== "";
        if (valid) { setFieldValidity(el, true); }
      }
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      statusEl.className = "form-status";
      statusEl.textContent = "";

      if (!validate()) {
        statusEl.className = "form-status error";
        statusEl.textContent = "Please complete the required fields highlighted above.";
        announce(eventName + "-error", { reason: "validation" });
        return;
      }

      var keyInput = form.querySelector('input[name="access_key"]');
      var accessKey = keyInput ? keyInput.value : "";
      if (!accessKey || accessKey.indexOf("REPLACE_WITH_") === 0) {
        statusEl.className = "form-status error";
        statusEl.textContent = "This form isn't connected yet — add your Web3Forms access key (see the deploy guide).";
        announce(eventName + "-error", { reason: "not_configured" });
        return;
      }

      submitBtn.disabled = true;
      var originalLabel = submitBtn.textContent;
      submitBtn.textContent = "Sending…";

      try {
        var data = Object.fromEntries(new FormData(form).entries());
        var res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data)
        });
        var json = await res.json();

        if (res.ok && json.success) {
          var successMsg = form.getAttribute("data-success") ||
            "Thank you — your message has been sent. I'll be in touch shortly.";
          form.reset();
          statusEl.className = "form-status success";
          statusEl.textContent = successMsg;
          statusEl.setAttribute("tabindex", "-1");
          statusEl.focus();

          var segments = {};
          segmentFields.forEach(function (f) { segments[f] = data[f] || ""; });
          announce(eventName + "-success", segments);
          form.dispatchEvent(new CustomEvent("prevail:submitted", { bubbles: true }));
        } else {
          throw new Error(json.message || "Submission failed");
        }
      } catch (err) {
        statusEl.className = "form-status error";
        statusEl.textContent = "Something went wrong sending this. Please email louissakrzewski123@gmail.com or call 0400 111 299.";
        announce(eventName + "-error", { reason: "network" });
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });
  }

  var forms = document.querySelectorAll("form[data-w3form]");
  for (var i = 0; i < forms.length; i++) { initForm(forms[i]); }
})();
