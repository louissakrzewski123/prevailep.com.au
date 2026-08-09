/* =====================================================================
   Prevail Exercise Physiology — booking.js
   Intro-call time picker.

   ══ SET YOUR AVAILABILITY HERE ══════════════════════════════════════
   Everything you need to change lives in the AVAILABILITY block below.
   Edit it, save, push. No other file needs touching.

   ── An honest note on how this works ────────────────────────────────
   The site is static files with no server and no database, so this
   picker cannot know in real time which slots are already taken. It
   shows the times you've said you're free, and a chosen time arrives
   as a REQUEST that you confirm. The page says exactly that, so nobody
   is misled into thinking they have a locked-in appointment.

   Two things follow from that:
   1. Add taken times to `booked` below so they stop being offered.
      Do this as you confirm bookings — it takes ten seconds.
   2. If this ever gets busy enough to be annoying, move to a real
      booking tool (Cal.com has a free tier) and point the button at
      it. See .github/DEPLOY-GUIDE.md for the swap.

   All times are Brisbane time. Queensland has no daylight saving, so
   there is no seasonal adjustment to worry about.
   ===================================================================== */
(function () {
  "use strict";

  /* ═══════════════════════════════════════════════════════════════════
     AVAILABILITY — edit this block
     ═══════════════════════════════════════════════════════════════════ */
  var AVAILABILITY = {

    // Your recurring weekly availability, in 24-hour Brisbane time.
    // 0 = Sunday, 1 = Monday … 6 = Saturday.
    // Delete a day entirely, or give it [], to take it off the calendar.
    weekly: {
      1: ["08:30", "09:00", "12:30", "16:30", "17:00"],   // Monday
      2: ["08:30", "09:00", "12:30", "16:30", "17:00"],   // Tuesday
      3: ["08:30", "09:00", "12:30", "16:30", "17:00"],   // Wednesday
      4: ["08:30", "09:00", "12:30", "16:30", "17:00"],   // Thursday
      5: ["08:30", "09:00", "12:30"],                     // Friday
      6: [],                                              // Saturday — closed
      0: []                                               // Sunday — closed
    },

    // Whole days you're unavailable — leave, public holidays, full days.
    // Format: "YYYY-MM-DD"
    blackoutDates: [
      // "2026-08-17",
    ],

    // Individual times already booked. Add to this as you confirm calls.
    // Format: "YYYY-MM-DD HH:MM"
    booked: [
      // "2026-08-12 09:00",
    ],

    // How far ahead people can book.
    daysAhead: 21,

    // Minimum notice, in hours. Stops someone booking a call for
    // twenty minutes from now while you're mid-session.
    minNoticeHours: 18,

    // How long the call runs, in minutes. Display only.
    durationMinutes: 15
  };
  /* ═══════════════════════════════════════════════════════════════════ */

  var strip = document.getElementById("day-strip");
  var slotWrap = document.getElementById("slot-wrap");
  var slotGrid = document.getElementById("slot-grid");
  var selectedBox = document.getElementById("booking-selected");
  var selectedText = document.getElementById("booking-selected-text");
  var formWrap = document.getElementById("booking-form-wrap");
  var slotField = document.getElementById("bk-slot");
  var durationLabel = document.getElementById("bk-duration");
  if (!strip || !slotGrid) { return; }

  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DOW_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  /* ---------- Brisbane "now" ----------
     The visitor's browser could be anywhere, so read the current time in
     Brisbane explicitly rather than trusting the local clock. en-CA gives
     an ISO-ordered date, which is what we want to parse. */
  function brisbaneNow() {
    var parts;
    try {
      parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Australia/Brisbane",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false
      }).formatToParts(new Date());
    } catch (err) {
      // Very old browser with no IANA timezone support — fall back to
      // local time. Worst case the min-notice cutoff is out by a few hours.
      var d = new Date();
      return { date: d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()),
               minutes: d.getHours() * 60 + d.getMinutes() };
    }
    var get = function (t) {
      for (var i = 0; i < parts.length; i++) { if (parts[i].type === t) { return parts[i].value; } }
      return "00";
    };
    // Intl renders midnight as "24" in some engines under hour12:false.
    var hh = parseInt(get("hour"), 10) % 24;
    return {
      date: get("year") + "-" + get("month") + "-" + get("day"),
      minutes: hh * 60 + parseInt(get("minute"), 10)
    };
  }

  var now = brisbaneNow();

  /* ---------- Date helpers ----------
     Date arithmetic is done in UTC so a visitor whose own timezone
     observes daylight saving can't shift the calendar by a day. */
  function isoToUTC(iso) {
    var p = iso.split("-");
    return Date.UTC(+p[0], +p[1] - 1, +p[2]);
  }
  function utcToIso(ms) {
    var d = new Date(ms);
    return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
  }
  function minutesOf(hhmm) {
    var p = hhmm.split(":");
    return (+p[0]) * 60 + (+p[1]);
  }
  function pretty(hhmm) {
    var p = hhmm.split(":");
    var h = +p[0], m = p[1];
    var suffix = h < 12 ? "am" : "pm";
    var h12 = h % 12; if (h12 === 0) { h12 = 12; }
    return h12 + (m === "00" ? "" : ":" + m) + " " + suffix;
  }

  /* ---------- Build the offered days ---------- */
  function openSlotsFor(iso, dow) {
    if (AVAILABILITY.blackoutDates.indexOf(iso) !== -1) { return []; }
    var all = AVAILABILITY.weekly[dow] || [];
    var todayMs = isoToUTC(now.date);
    var dayMs = isoToUTC(iso);
    var hoursFromToday = (dayMs - todayMs) / 3600000;

    return all.filter(function (t) {
      if (AVAILABILITY.booked.indexOf(iso + " " + t) !== -1) { return false; }
      // Minimum notice, measured from Brisbane "now" across day boundaries.
      return hoursFromToday + minutesOf(t) / 60 >= now.minutes / 60 + AVAILABILITY.minNoticeHours;
    });
  }

  var days = [];
  var startMs = isoToUTC(now.date);
  for (var i = 0; i < AVAILABILITY.daysAhead; i++) {
    var ms = startMs + i * 86400000;
    var iso = utcToIso(ms);
    var dow = new Date(ms).getUTCDay();
    var open = openSlotsFor(iso, dow);
    if (!open.length) { continue; }          // only show days you can actually take
    days.push({ iso: iso, dow: dow, ms: ms, slots: open });
  }

  /* ---------- Render ---------- */
  if (!days.length) {
    strip.innerHTML = '<p class="slot-empty">No times are showing for the next few weeks. Give me a call on ' +
      '<a href="tel:+61400111299">0400&nbsp;111&nbsp;299</a> or ' +
      '<a href="index.html#waitlist">join the waitlist</a> and I\'ll come to you.</p>';
    if (slotWrap) { slotWrap.hidden = true; }
    return;
  }

  if (durationLabel) { durationLabel.textContent = AVAILABILITY.durationMinutes; }

  days.forEach(function (d, index) {
    var date = new Date(d.ms);
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "day";
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("data-index", index);
    btn.innerHTML =
      '<span class="day-dow">' + DOW[d.dow] + '</span>' +
      '<span class="day-num">' + date.getUTCDate() + '</span>' +
      '<span class="day-mon">' + MON[date.getUTCMonth()] + '</span>' +
      '<span class="day-free">' + d.slots.length + ' free</span>';
    strip.appendChild(btn);
  });

  var selectedDay = null;
  var selectedSlot = null;

  function renderSlots(day) {
    slotGrid.innerHTML = "";
    day.slots.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "slot";
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("data-time", t);
      b.textContent = pretty(t);
      slotGrid.appendChild(b);
    });
    slotWrap.hidden = false;
  }

  function longLabel(day, time) {
    var date = new Date(day.ms);
    return DOW_LONG[day.dow] + " " + date.getUTCDate() + " " + MON[date.getUTCMonth()] +
           " at " + pretty(time) + " (Brisbane time)";
  }

  strip.addEventListener("click", function (e) {
    var btn = e.target.closest(".day");
    if (!btn) { return; }

    var all = strip.querySelectorAll(".day");
    for (var i = 0; i < all.length; i++) { all[i].setAttribute("aria-pressed", "false"); }
    btn.setAttribute("aria-pressed", "true");

    selectedDay = days[+btn.getAttribute("data-index")];
    selectedSlot = null;
    if (selectedBox) { selectedBox.hidden = true; }
    if (formWrap) { formWrap.hidden = true; }
    renderSlots(selectedDay);
  });

  slotGrid.addEventListener("click", function (e) {
    var btn = e.target.closest(".slot");
    if (!btn || !selectedDay) { return; }

    var all = slotGrid.querySelectorAll(".slot");
    for (var i = 0; i < all.length; i++) { all[i].setAttribute("aria-pressed", "false"); }
    btn.setAttribute("aria-pressed", "true");

    selectedSlot = btn.getAttribute("data-time");
    var label = longLabel(selectedDay, selectedSlot);

    if (slotField) { slotField.value = label; }
    if (selectedText) { selectedText.textContent = label; }
    if (selectedBox) { selectedBox.hidden = false; }
    if (formWrap) {
      formWrap.hidden = false;
      var name = document.getElementById("bk-name");
      if (name) { name.focus(); }
    }

    try {
      document.dispatchEvent(new CustomEvent("prevail:booking-slot", { detail: { day: selectedDay.iso } }));
    } catch (err) { /* measurement is optional */ }
  });

  // Preselect the first available day so the picker never opens empty.
  var first = strip.querySelector(".day");
  if (first) { first.click(); }
})();
