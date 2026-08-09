/* =====================================================================
   Prevail Exercise Physiology — checker.js
   "Can I use my funding here?" — a self-qualifying funding checker.

   Design constraints, deliberately:
   • Collects NOTHING. No names, no contact details, no plan documents.
     Nothing is stored or transmitted, so this sits entirely outside the
     scope of the privacy policy and creates no health-record liability.
   • Every path ends somewhere useful — even the "no" ends with a route
     forward rather than a dead end.
   • The answers feed the waitlist form so an enquiry arrives pre-qualified.

   ── MAINTAINING THIS ────────────────────────────────────────────────
   All copy lives in RESULTS below. Edit the strings; the flow rebuilds
   itself. If Prevail later becomes NDIS-registered, change the "ndia"
   result from a decline to a yes and drop the branch note.
   ===================================================================== */
(function () {
  "use strict";

  var root = document.getElementById("checker");
  if (!root) { return; }

  /* ---------- Flow definition ---------- */

  var STEPS = {
    funding: {
      title: "What funding are you hoping to use?",
      hint: "Pick the closest one — you can change it later, and \"not sure\" is a perfectly good answer.",
      options: [
        { value: "ndis",      icon: "◈", label: "NDIS",              sub: "I have an NDIS plan", next: "management" },
        { value: "medicare",  icon: "✚", label: "Medicare",          sub: "Through my GP", result: "medicare" },
        { value: "dva",       icon: "★", label: "DVA",               sub: "Veteran — Gold or White Card", result: "dva" },
        { value: "workcover", icon: "▤", label: "WorkCover",         sub: "Injured at work", result: "workcover" },
        { value: "private",   icon: "◎", label: "Private",           sub: "Paying for myself", result: "private" },
        { value: "unsure",    icon: "?", label: "I'm not sure yet",  sub: "Help me work it out", result: "unsure" }
      ]
    },
    management: {
      title: "How is your NDIS plan managed?",
      hint: "This is the one thing that decides whether you can work with me — it's stated on the first page or two of your plan.",
      options: [
        { value: "self",   icon: "◈", label: "Self-managed",   sub: "I pay providers and claim it back myself", next: "goal", result: "ndis-self" },
        { value: "plan",   icon: "◈", label: "Plan-managed",   sub: "A plan manager pays my invoices", next: "goal", result: "ndis-plan" },
        { value: "ndia",   icon: "◈", label: "NDIA-managed",   sub: "Also called agency-managed", result: "ndis-ndia" },
        { value: "unsure", icon: "?", label: "I don't know",   sub: "Show me how to check", result: "ndis-unsure" }
      ]
    },
    goal: {
      title: "What would you most like to work on?",
      hint: "So I can tell you what the first few sessions would actually look like for you.",
      single: true,
      options: [
        { value: "Strength, balance and mobility",              icon: "◈", label: "Strength, balance & mobility",      sub: "Moving more easily and safely, fewer falls" },
        { value: "Independence at home and everyday tasks",     icon: "⌂", label: "Independence at home",              sub: "Everyday tasks — stairs, transfers, getting dressed" },
        { value: "Getting out into the community",              icon: "◐", label: "Getting out & about",               sub: "Confidence and stamina to do more outside the house" },
        { value: "Confidence, mood and emotional regulation",   icon: "✦", label: "Confidence, mood & regulation",      sub: "Movement as support for mental health" },
        { value: "Managing a health condition",                 icon: "✚", label: "Managing a health condition",       sub: "Pain, fatigue, heart, lungs, weight or recovery" }
      ]
    }
  };

  /* ---------- Verdicts ----------
     tone: "yes" | "maybe" | "no" — drives the badge colour and icon.
     funding: the matching option in the waitlist form's funding select,
     so the enquiry lands pre-labelled.                                  */

  var IMPROVED_DAILY_LIVING =
    '<h4>What to look for in your plan</h4>' +
    '<p>Find the <strong>Capacity Building</strong> section and look for' +
    '<span class="quote">&ldquo;Improved Daily Living Skills&rdquo;</span>' +
    'Exercise physiology is funded from that budget. If there\'s money sitting there, you can spend it here.</p>';

  var RESULTS = {
    "ndis-self": {
      tone: "yes",
      funding: "NDIS — self-managed",
      title: "Yes — you can start with Prevail directly.",
      sub: "Self-managed participants can choose any provider, registered or not. No referral, no approval, no waiting.",
      lookup: IMPROVED_DAILY_LIVING,
      body:
        "<p>Because you're self-managed, you're in control: I invoice you after each block of sessions and you claim it back through the myplace portal. Most participants find this the simplest arrangement of all.</p>" +
        "<p><strong>What you'll need to get going:</strong> nothing but a conversation. We'll talk through your goals, I'll confirm my rates fall within the NDIS price limits, and we'll book your assessment.</p>"
    },

    "ndis-plan": {
      tone: "yes",
      funding: "NDIS — plan-managed",
      title: "Yes — and your plan manager does the paperwork.",
      sub: "Plan-managed participants can use unregistered providers like Prevail. No referral needed.",
      lookup: IMPROVED_DAILY_LIVING,
      body:
        "<p>I invoice your plan manager directly, so you never handle money, receipts or claims. All I need to get started is your NDIS number and your plan manager's email address.</p>" +
        "<p><strong>Worth knowing:</strong> your plan manager can't refuse a provider you've chosen, as long as the support is in your plan and the price is within the NDIS limits. Mine are.</p>"
    },

    "ndis-ndia": {
      tone: "no",
      funding: "NDIS — NDIA-managed",
      title: "Not right now — but there's a straightforward path.",
      sub: "NDIA-managed funding can only be spent with NDIS-registered providers, and Prevail isn't registered.",
      body:
        "<p>I'd rather tell you that plainly than take an enquiry I can't fulfil. Here's what actually works:</p>" +
        "<p><strong>1. Ask to change your plan management.</strong> You can request plan management at your next plan review, or sooner through a plan variation. It's a common request, the NDIA funds plan management as a separate budget so it doesn't come out of your other supports, and it opens up every unregistered provider — including me.</p>" +
        "<p><strong>2. Start privately in the meantime.</strong> Plenty of people do this while a change is being processed.</p>" +
        "<p>Either way, get in touch — I'm happy to explain how to word the request to your LAC or planner. It costs you nothing to ask me.</p>"
    },

    "ndis-unsure": {
      tone: "maybe",
      funding: "Not sure yet",
      title: "Easy to check — about thirty seconds.",
      sub: "Your plan states how each budget is managed. There are three quick ways to find it.",
      body:
        "<p><strong>1. Your plan document.</strong> Look at the first page or two — it says whether your supports are self-managed, plan-managed or NDIA-managed. Different budgets in the same plan can be managed differently, so check the Capacity Building one.</p>" +
        "<p><strong>2. The myplace participant portal.</strong> Your plan management type is shown alongside your budgets.</p>" +
        "<p><strong>3. Ask.</strong> Your support coordinator, LAC or plan manager will know instantly.</p>" +
        "<p>If it turns out you're <strong>self-managed or plan-managed</strong>, you can start with me straight away. If it's <strong>NDIA-managed</strong>, there's still a route — ask me and I'll walk you through it.</p>"
    },

    medicare: {
      tone: "yes",
      funding: "Medicare (GP care plan)",
      title: "Yes — with a referral from your GP.",
      sub: "A Chronic Disease Management plan subsidises up to five allied health sessions per calendar year.",
      body:
        "<p>Ask your GP for a <strong>GP Management Plan</strong> and a referral to an <strong>Accredited Exercise Physiologist</strong>. Most GPs will know exactly what you mean.</p>" +
        "<p><strong>Two things worth knowing before you go:</strong> Medicare pays a set rebate per session and there's a gap to pay — I'll tell you the exact figure before you book, never after. And those five sessions are shared across <em>all</em> allied health, so if you're also seeing a podiatrist or dietitian this year, they come out of the same five.</p>" +
        "<p>For most people, a care plan works best as a way to start — then continue privately or under another funding source once you've got momentum.</p>"
    },

    dva: {
      tone: "yes",
      funding: "DVA",
      title: "Yes — and typically at no cost to you.",
      sub: "Eligible Gold and White Card holders can access exercise physiology with a referral.",
      body:
        "<p>Ask your GP for a <strong>D904 referral</strong> to an exercise physiologist. It covers a set number of sessions within a referral period and can be renewed by your GP when it runs out.</p>" +
        "<p><strong>Gold Card</strong> holders are covered for all clinically necessary care. <strong>White Card</strong> holders are covered for accepted conditions. I bill DVA directly, so there's normally nothing for you to pay.</p>" +
        "<p>I'll confirm your specific eligibility with you before we start — no surprises.</p>"
    },

    workcover: {
      tone: "maybe",
      funding: "WorkCover",
      title: "Usually yes — once your claim is approved.",
      sub: "Exercise physiology is commonly funded for injury rehabilitation and return-to-work programs.",
      body:
        "<p>You'll need an accepted claim and a referral from your treating doctor. From there I'll liaise with your case manager, agree the program up front, and report on your progress as required.</p>" +
        "<p><strong>Include your claim number and insurer when you enquire</strong> and I'll check the specifics for you before you commit to anything.</p>" +
        "<p>Return-to-work programs work best when they start early, so it's worth asking even if your claim is still being processed.</p>"
    },

    private: {
      tone: "yes",
      funding: "Private",
      title: "Yes — no referral, no approvals, no waiting.",
      sub: "You can book privately and start as soon as there's a spot.",
      body:
        "<p>This is the simplest path of all. No paperwork, no eligibility criteria — we just get started.</p>" +
        "<p><strong>Check your private health cover.</strong> Many funds pay a rebate for exercise physiology if you hold extras cover that includes it. A two-minute call to your fund will tell you your per-visit rebate and annual limit. I'll give you a receipt with my provider number so you can claim it back.</p>"
    },

    unsure: {
      tone: "maybe",
      funding: "Not sure yet",
      title: "That's the most common answer. Let's narrow it down.",
      sub: "Find the line below that sounds most like you.",
      body:
        "<p><strong>You live with a permanent disability and have an NDIS plan</strong> → NDIS. Check whether it's self-managed or plan-managed and we're away.</p>" +
        "<p><strong>You're managing a long-term condition and see a GP regularly</strong> → ask your GP about a Chronic Disease Management plan.</p>" +
        "<p><strong>You're a veteran with a DVA card</strong> → DVA, with a D904 referral from your GP.</p>" +
        "<p><strong>You were injured at work and have an open claim</strong> → WorkCover.</p>" +
        "<p><strong>None of the above</strong> → private. No referral needed, and you can start whenever you like.</p>" +
        "<p>Still stuck? That's genuinely fine — put it in the waitlist form and I'll work it out with you. Sorting out funding is part of the job.</p>"
    }
  };

  var BADGE = { yes: "✓", maybe: "?", no: "!" };

  /* ---------- State ---------- */
  var state = { funding: "", management: "", goal: "" };
  var history = [];
  // Set when a choice resolves to a verdict but still has a question to ask
  // first (self- and plan-managed both get the goal question before their
  // "yes"). currentResult is what's on screen, for the waitlist pre-fill.
  var pendingResult = "";
  var currentResult = "";

  /* ---------- Helpers ---------- */

  function announce(name, detail) {
    try {
      document.dispatchEvent(new CustomEvent("prevail:" + name, { detail: detail || {} }));
    } catch (err) { /* measurement must never break the widget */ }
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Move focus to the new heading so screen-reader and keyboard users are
  // told the step changed. Without this the widget silently swaps content.
  function focusHeading() {
    var h = root.querySelector("[data-focus]");
    if (h) { h.focus(); }
  }

  function progressBar(pct, labelText) {
    return '<div class="checker-progress">' +
             '<span>' + esc(labelText) + '</span>' +
             '<span class="bar"><span style="width:' + pct + '%"></span></span>' +
           '</div>';
  }

  /* ---------- Rendering ---------- */

  function renderStep(stepId) {
    var step = STEPS[stepId];
    var pct = stepId === "funding" ? 33 : stepId === "management" ? 66 : 85;
    var stepNo = stepId === "funding" ? "1" : stepId === "management" ? "2" : "3";

    var html = progressBar(pct, "Step " + stepNo);
    html += '<div class="checker-step">';
    html += '<h3 tabindex="-1" data-focus>' + esc(step.title) + '</h3>';
    html += '<p class="checker-hint">' + esc(step.hint) + '</p>';
    html += '<ul class="checker-options' + (step.single ? " single" : "") + '">';

    for (var i = 0; i < step.options.length; i++) {
      var o = step.options[i];
      html += '<li><button type="button" class="opt" data-step="' + esc(stepId) + '" data-value="' + esc(o.value) + '" data-index="' + i + '">' +
                '<span class="opt-ico" aria-hidden="true">' + esc(o.icon) + '</span>' +
                '<span class="opt-text"><span>' + esc(o.label) + '</span><small>' + esc(o.sub) + '</small></span>' +
              '</button></li>';
    }
    html += '</ul>';
    if (history.length) {
      html += '<button type="button" class="checker-back" data-back>← Back</button>';
    }
    html += '</div>';

    root.innerHTML = html;
    focusHeading();
  }

  function renderResult(key) {
    var r = RESULTS[key];
    if (!r) { return; }

    var html = progressBar(100, "Your answer");
    html += '<div class="verdict verdict-' + r.tone + '">';
    html +=   '<div class="verdict-head">' +
                '<span class="verdict-badge" aria-hidden="true">' + BADGE[r.tone] + '</span>' +
                '<div><h3 tabindex="-1" data-focus>' + esc(r.title) + '</h3><p>' + esc(r.sub) + '</p></div>' +
              '</div>';
    if (r.lookup) {
      html += '<div class="plan-lookup">' + r.lookup + '</div>';
    }
    html +=   '<div class="verdict-detail">' + r.body + '</div>';
    html +=   '<div class="verdict-actions">' +
                '<a class="btn btn-primary" href="#waitlist" data-prefill>Join the waitlist</a>' +
                '<a class="btn btn-ghost" href="booking.html">Book a free 15-min chat</a>' +
              '</div>';
    html +=   '<button type="button" class="checker-back" data-restart>← Start over</button>';
    html +=   '<p class="checker-disclaimer">This is general information to help you get oriented, not financial or clinical advice. Funding rules change and every plan is different — always check your own plan or ask your plan manager, and I\'m happy to help you do that.</p>';
    html += '</div>';

    root.innerHTML = html;
    focusHeading();
    announce("checker-result", { funding: r.funding, verdict: r.tone });
  }

  /* ---------- Waitlist pre-fill ----------
     Carries the answers across to the enquiry form so Louis receives a
     qualified lead instead of a blank one. Only ever writes the funding
     category and the goal the person picked from a fixed list — nothing
     free-typed, nothing identifying.                                    */

  function prefillWaitlist(fundingLabel) {
    var select = document.getElementById("wf-funding");
    if (select) {
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].text === fundingLabel) {
          select.selectedIndex = i;
          break;
        }
      }
    }

    var message = document.getElementById("wf-message");
    if (message && !message.value && state.goal) {
      message.value = "I'd like to work on: " + state.goal.charAt(0).toLowerCase() + state.goal.slice(1) + ".";
    }

    // Briefly highlight what was filled in, so it doesn't look like the
    // form mysteriously pre-populated itself.
    [select, message].forEach(function (el) {
      if (!el || !el.value) { return; }
      var field = el.closest(".field");
      if (!field) { return; }
      field.style.transition = "box-shadow .4s ease";
      field.style.boxShadow = "0 0 0 4px var(--brand-tint)";
      field.style.borderRadius = "var(--radius-sm)";
      setTimeout(function () { field.style.boxShadow = "none"; }, 2600);
    });
  }

  /* ---------- Interaction ---------- */

  root.addEventListener("click", function (e) {
    var back = e.target.closest("[data-back]");
    if (back) {
      var prev = history.pop();
      renderStep(prev || "funding");
      return;
    }

    var restart = e.target.closest("[data-restart]");
    if (restart) {
      state = { funding: "", management: "", goal: "" };
      history = [];
      pendingResult = "";
      currentResult = "";
      renderStep("funding");
      announce("checker-restart", {});
      return;
    }

    var prefill = e.target.closest("[data-prefill]");
    if (prefill) {
      var res = RESULTS[currentResult];
      if (res) { prefillWaitlist(res.funding); }
      return;   // let the anchor scroll normally
    }

    var opt = e.target.closest(".opt");
    if (!opt) { return; }

    var stepId = opt.getAttribute("data-step");
    var index = parseInt(opt.getAttribute("data-index"), 10);
    var choice = STEPS[stepId].options[index];

    state[stepId] = choice.value;
    history.push(stepId);
    announce("checker-step", { step: stepId, choice: choice.value });

    // A step can branch onward, resolve to a verdict, or both — "both"
    // means ask the next question but remember which verdict we're heading
    // for (self- and plan-managed both get the goal question first).
    if (choice.result) { pendingResult = choice.result; }

    if (choice.next) {
      renderStep(choice.next);
    } else if (choice.result) {
      show(choice.result);
    } else if (pendingResult) {
      show(pendingResult);
    }
  });

  function show(key) {
    currentResult = key;
    renderResult(key);
    // Keep the top of the widget in view — results are taller than steps.
    var top = root.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({ top: top, behavior: "smooth" });
  }

  /* ---------- Go ---------- */
  renderStep("funding");
})();
