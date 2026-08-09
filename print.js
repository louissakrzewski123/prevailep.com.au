/* =====================================================================
   Prevail Exercise Physiology — print.js
   Wires the "Print / Save as PDF" button on the service profile.

   Lives in its own file rather than an inline onclick because the site's
   Content-Security-Policy sets script-src 'self' with no 'unsafe-inline'.
   ===================================================================== */
(function () {
  "use strict";
  var btn = document.getElementById("sp-print");
  if (!btn) { return; }
  btn.addEventListener("click", function () { window.print(); });
})();
