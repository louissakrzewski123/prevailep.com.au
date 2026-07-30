/* =====================================================================
   Prevail Exercise Physiology — script.js
   Mobile nav, footer year, and Web3Forms waitlist submission.
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

  /* ---------- Waitlist form (Web3Forms) ---------- */
  var form = document.getElementById("waitlist-form");
  if (!form) { return; }

  var statusEl = document.getElementById("wf-status");
  var submitBtn = document.getElementById("wf-submit");

  function setFieldValidity(input, ok) {
    var wrap = input.closest(".field");
    if (wrap) { wrap.classList.toggle("invalid", !ok); }
  }

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
      return;
    }

    var accessKey = form.querySelector('input[name="access_key"]').value;
    if (accessKey.indexOf("REPLACE_WITH_") === 0) {
      statusEl.className = "form-status error";
      statusEl.textContent = "This form isn't connected yet — add your Web3Forms access key (see the deploy guide).";
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
        form.reset();
        statusEl.className = "form-status success";
        statusEl.textContent = "Thank you — you're on the waitlist. I'll be in touch as soon as a spot opens.";
        statusEl.focus && statusEl.focus();
      } else {
        throw new Error(json.message || "Submission failed");
      }
    } catch (err) {
      statusEl.className = "form-status error";
      statusEl.textContent = "Something went wrong sending your enquiry. Please email louissakrzewski123@gmail.com or call 0400 111 299.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
})();
