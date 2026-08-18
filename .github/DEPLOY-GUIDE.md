# Prevail Website — Maintenance & Deploy Guide

Internal notes. This file lives in `.github/` so GitHub Pages does **not** publish it — it stays in the repo but never appears on the website.

---

## How the site is hosted

| | |
|---|---|
| **Host** | GitHub Pages (free) |
| **Repo** | `louissakrzewski123/prevailep.com.au` (must stay **public** — Pages on a private repo requires a paid GitHub plan) |
| **Source** | branch `main`, folder `/ (root)` |
| **Domain** | `prevailep.com.au`, registered with VentraIP |
| **DNS** | VentraIP nameservers (`ns1-3.nameserver.net.au`), managed in VIPControl → DNS Hosting |

---

## What's in this folder

| File | What it is |
|------|------------|
| `index.html` | The homepage (hero, services, funding, FAQ, waitlist) |
| `privacy.html` | Privacy policy page |
| `styles.css` | All the styling / design |
| `script.js` | Mobile menu + waitlist form logic |
| `analytics.js` | Google Analytics 4 + conversion tracking. Live on `G-2R5DVDM991` |
| `favicon.svg`, `apple-touch-icon.png` | Browser tab + phone icons |
| `og-image.png` | Preview image shown when the link is shared |
| `robots.txt`, `sitemap.xml` | SEO |
| `CNAME` | Tells GitHub Pages the custom domain. **Don't delete it** — the site drops back to a github.io address |
| `.nojekyll` | Stops GitHub running Jekyll over the files. **Don't delete it** — without it, anything starting with `_` silently stops being served |
| `netlify.toml` | Left over from the old Netlify plan. Does nothing on GitHub Pages. Kept only as a fallback if hosting ever moves |

You only ever **edit `index.html`** for content changes.

---

## Updating the site

Edits deploy by pushing to `main`. There's no drag-and-drop step any more.

```bash
git add -A
git commit -m "Describe the change"
git push
```

Pages rebuilds automatically, usually within a minute. Hard-refresh (Cmd-Shift-R) if you still see the old version — the CDN caches aggressively.

---

## DNS records (already configured)

For reference, in VIPControl → Domain Names → `prevailep.com.au` → **DNS Hosting**.

> **VentraIP quirk:** the Hostname field auto-appends `.prevailep.com.au`. For the root domain, leave Hostname **blank** — typing `@` produces the invalid `@.prevailep.com.au`.

| Type | Hostname | Value |
|------|----------|-------|
| `A` | *(blank)* | `185.199.108.153` |
| `A` | *(blank)* | `185.199.109.153` |
| `A` | *(blank)* | `185.199.110.153` |
| `A` | *(blank)* | `185.199.111.153` |
| `CNAME` | `www` | `louissakrzewski123.github.io` |

All four A records are required — they're a redundancy set, not alternatives. Current values can always be re-checked at `https://api.github.com/meta` under `pages`.

The domain also carries **email records** now that Google Workspace hosts
`hello@prevailep.com.au`. These are nothing to do with the website — deleting
them breaks mail, not Pages, and vice versa.

| Type | Hostname | Value | Purpose |
|------|----------|-------|---------|
| `MX` | *(blank)* | `1 SMTP.GOOGLE.COM` | Delivers mail to Workspace |
| `TXT` | *(blank)* | `google-site-verification=...` | Proves domain ownership |

See **Email authentication** below for the SPF, DKIM and DMARC records that
still need adding.

---

## HTTPS

GitHub requests a free Let's Encrypt certificate automatically once DNS points at it. You don't buy or request anything.

Once issued, tick **Enforce HTTPS** in Settings → Pages. That makes `http://` redirect to `https://`. Essential — the site collects health enquiries.

**If the checkbox stays greyed out** more than an hour after the DNS check goes green: clear the Custom domain field → Save → wait a minute → re-enter `prevailep.com.au` → Save. This re-triggers provisioning. Note it rewrites the `CNAME` file in the repo, so `git pull` afterwards.

**To verify it's genuinely working:**

```bash
echo | openssl s_client -connect prevailep.com.au:443 -servername prevailep.com.au 2>/dev/null | openssl x509 -noout -subject -dates
```

The subject must be `CN=prevailep.com.au`. If it says `CN=*.github.io`, the certificate has **not** been issued yet and visitors on `https://` are seeing a security warning.

---

## Google Analytics

### Turning it on — **done**, kept as a record

The Measurement ID `G-2R5DVDM991` is already in `analytics.js` and reporting. These
steps are only useful if you ever rebuild the property from scratch.

1. Go to [analytics.google.com](https://analytics.google.com) and sign in with your Google account.
2. **Admin** (cog, bottom-left) → **Create** → **Property**. Name it `Prevail Exercise Physiology`, timezone **Australia/Brisbane**, currency **AUD**.
3. When it asks for a platform, choose **Web**. Website URL `https://prevailep.com.au`, stream name `Prevail website`.
4. It shows you a **Measurement ID** in the top right — `G-` followed by ten characters. Copy it. *(Ignore the installation snippet it offers; it's already wired up.)*
5. Open `analytics.js` and replace the ID on the `MEASUREMENT_ID` line with that one. Keep the quotes:

   ```js
   var MEASUREMENT_ID = "G-ABC1234XYZ";
   ```

6. Commit and push. Open the site, then check **Reports → Realtime** in Analytics — you should appear within about 30 seconds.

Note that without a Measurement ID the file is completely inert — no cookies set, no requests to Google. That's the state it ships in, not the state it's in now.

### What gets tracked

Page views and scrolling come free with GA4. On top of that:

| Event | Fires when |
|-------|-----------|
| `generate_lead` | **The conversion.** Waitlist form submitted successfully |
| `waitlist_start` | Someone starts typing in the form — the gap to `generate_lead` is your drop-off |
| `waitlist_error` | Form failed (`validation` or `network`) |
| `waitlist_cta_click` | Any "Join the waitlist" button, tagged with which section it was in |
| `contact_click` | Phone or email link tapped |
| `faq_open` | An FAQ opened, with the question — tells you what people are worried about |

**Mark the conversion:** in GA4, **Admin → Events**, find `generate_lead` and toggle **Mark as key event**. Without this it's just a number in a list; with it, it becomes the metric every report can be measured against.

### Privacy choices baked in

- **Advertising storage, ad user data and ad personalisation are all set to `denied`** (Consent Mode v2), and Google Signals is off. Google's personalised-advertising policy prohibits building ad audiences from health or disability signals, so this is the correct default for this site — not just a nicety. Don't flip it on without reading that policy.
- **No personal data reaches Google.** On a successful submission only two dropdown values are sent (enquirer type, funding source). Name, email, phone and the free-text message never leave the browser. If you'd rather send nothing at all, delete those two lines in `script.js`.
- **Section 8 of `privacy.html` discloses all of this.** If you change what's tracked, change that section too.

### No cookie banner?

Correct — Australian privacy law doesn't require one, and the Privacy Act is satisfied by disclosure in the privacy policy. If you ever advertise into the EU or UK, you'd need a real consent banner before GA loads.

---

## Known gotchas

- **Repo must stay public.** Making it private silently disables Pages and the site 404s. GitHub Free does not support Pages on private repos.
- **Deleting `CNAME`** drops the custom domain.
- **Security policy lives in the HTML, not in headers.** GitHub Pages cannot send custom headers, so the CSP from `netlify.toml` was ported into a `<meta http-equiv="Content-Security-Policy">` tag in both `index.html` and `privacy.html`. It sits directly under `<meta charset>` and **must stay there** — a meta CSP only governs content that appears *after* it in the document.
  - **If you add anything external** (analytics, a booking widget, embedded video, a new font host), it will be **blocked** until you add its domain to the policy. Symptom: the feature silently doesn't load, with a CSP violation in the browser console. Update the `content` attribute in *both* files.
  - **Still not covered:** `frame-ancestors`, `X-Frame-Options`, `X-Content-Type-Options`, and `Permissions-Policy` are header-only and cannot be set via meta. Clickjacking protection is therefore unavailable on GitHub Pages. Moving to Netlify or Cloudflare Pages would restore them via `netlify.toml`.

---

## Email authentication (SPF, DKIM, DMARC)

**Status: not done.** Mail is delivered to Workspace, but the domain does not
yet prove that mail *sent from it* is genuine. Unauthenticated mail from a new
domain with no sending reputation is the textbook spam profile, and the people
this site is built to reach — GPs, support coordinators, plan managers — sit
behind exactly the corporate filters that act on it. Nothing bounces; it just
silently lands in Junk, so you never learn it happened.

All three go in VIPControl → DNS Hosting. Remember the blank-Hostname quirk above.

| Type | Hostname | Value |
|------|----------|-------|
| `TXT` | *(blank)* | `v=spf1 include:_spf.google.com ~all` |
| `TXT` | `google._domainkey` | *(generated — see below)* |
| `TXT` | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hello@prevailep.com.au` |

**DKIM needs generating first.** Google Admin → Apps → Google Workspace → Gmail
→ *Authenticate email*. Generate the record, publish the TXT it gives you, wait
for propagation, then come back and click **Start authentication** — the key is
inert until you do.

**DMARC starts at `p=none`** deliberately: it reports without rejecting
anything, so a misconfigured SPF or DKIM can't take your mail offline while
you're still checking. Once the reports show consistent passes, move to
`p=quarantine`.

**To verify:**

```bash
dig +short TXT prevailep.com.au
dig +short TXT google._domainkey.prevailep.com.au
dig +short TXT _dmarc.prevailep.com.au
```

Then send a test to both a Gmail and an Outlook/Hotmail address and check the
message headers show `spf=pass`, `dkim=pass` and `dmarc=pass`. Header inspection
is the only real confirmation — a published record that fails alignment looks
identical to a working one from the DNS side.

---

## Outstanding to-dos

**Before driving any traffic to the site:**

- [ ] **Publish SPF, DKIM and DMARC** — see *Email authentication* above. The
      highest-value item on this list: every path through the site ends in you
      emailing someone back.
- [ ] **Re-issue the Web3Forms key against `hello@prevailep.com.au`.** The site
      now *displays* the new address everywhere, but the key
      `18d2da56-0898-432a-a40b-cee9866d1ed1` is bound to the address it was
      created with, so waitlist, referral and booking-form submissions still
      arrive at the old Gmail. Generate a new key at
      [web3forms.com](https://web3forms.com) and replace it in **three** files:
      `index.html`, `booking.html`, `for-referrers.html`.
- [ ] **Change the notification address on the Cal.com account** (Settings →
      Account). Booking requests go wherever the account points, not where the
      page says.
- [ ] **Review Cal.com availability** — still on the default Mon–Fri 9am–5pm.
      Set it to hours you would genuinely take a call, in Australia/Brisbane.

**Content that gets worse with traffic, not better:**

- [ ] **Trim the suburb list in `for-referrers.html`** (marked `TODO` in the
      file). A coordinator who books you for a suburb you won't drive to is a
      worse outcome than one who never calls.
- [ ] **NDIS Worker Screening / WWCC in `service-profile.html`** — currently
      commented out. Coordinators ask for these routinely. Uncomment once you
      hold them and can produce the numbers on request.
- [ ] **Add a service address to the structured data in `index.html`** — local
      SEO leans on it heavily. A service-area business can list a suburb
      without publishing a street address.

**Discoverability:**

- [ ] **Create a Google Business Profile** — free, and the single biggest lever
      for local search and Maps.
- [ ] **Confirm `sitemap.xml` was submitted** in Search Console. Verification
      itself is done (meta tag and TXT record both present); submission is a
      separate step and can't be checked from outside.
- [ ] *(Optional)* Add ESSA / AEP registration number as a trust signal.
- [ ] *(Optional)* Add 2–3 testimonials once you have written, de-identified consent.

**Done:**

- [x] ~~Waitlist form connected.~~ Web3Forms key live in all three form pages.
- [x] ~~Tick **Enforce HTTPS**~~ — certificate issued, `http://` 301s to `https://`.
- [x] ~~Paste the GA4 Measurement ID into `analytics.js`~~ — `G-2R5DVDM991` is live.
- [x] ~~Remove the draft banner and set the effective date on `privacy.html`~~ —
      effective 17 August 2026.
- [x] ~~Swap the contact address to `hello@prevailep.com.au`~~ — done across
      `index.html` (including structured data), `booking.html`,
      `for-referrers.html`, `service-profile.html`, `privacy.html` and the
      form-failure message in `script.js`. **Note the two follow-ups above** —
      Web3Forms and Cal.com are separate systems and did not move with it.
- [x] ~~Add a photo in the About section~~ — `about-louis.jpg`.
- [x] ~~Fix `medicalSpecialty` in the structured data~~ — field dropped.
- [x] ~~Verify the site in Google Search Console~~ — meta tag in `index.html`
      plus a TXT record on the domain.

---

## Turning on Cal.com for the intro call

The booking page ships with two pickers. Which one runs depends on a single
line in `cal-embed.js`:

- **`CAL_LINK` not set** (how it ships) — the hand-maintained picker in
  `booking.js` is live. It shows the times listed in its `AVAILABILITY`
  block, and you keep the `booked` list up to date yourself.
- **`CAL_LINK` set** — Cal.com takes over. It reads your Google Calendar,
  so slots that clash with something already in your diary stop being
  offered without you doing anything. `booking.js` stands down, and comes
  back automatically if the widget is ever blocked or unreachable.

Nothing breaks in between, so there's no rush to finish this in one sitting.

**Status: done.** `CAL_LINK` is set to `prevail-ep/intro-call` and the account
is configured, so Cal.com is the live picker. The steps below are kept as a
record of how it was set up — useful if you ever add a second event type or
need to rebuild it. **The one thing still worth reviewing is availability
(step 3)** — it's on Cal's default Mon–Fri 9am–5pm.

### Setup, once

1. **Create a free account** at cal.com. The username you pick becomes part
   of your booking URL — something like `prevail-ep`.
2. **Connect Google Calendar** (Settings → Apps → Calendars). Two separate
   choices worth getting right: which calendars it *checks* for conflicts,
   and which calendar it *writes* confirmed bookings to.
3. **Set your availability** — the hours you're willing to take intro calls.
   This is the outer boundary; Cal subtracts your real calendar events from
   it. Set the timezone to **Australia/Brisbane**.
4. **Create the event type**: 15 minutes, slug `intro-call`. Under *Limits*,
   match what the old picker did — minimum notice **18 hours**, bookable
   **21 days** out.
5. **Turn on "Requires confirmation"** (event type → **Privacy & security**,
   not Confirmation — that tab is about confirmation *emails*). This is the
   important one. It keeps today's behaviour: a booking arrives as a request
   you approve, not a locked-in appointment. Leave "Unconfirmed bookings
   still block calendar slots" ticked, so two people can't request the same
   slot while you're deciding.
6. **Add the booking questions** so you still collect what the old form did.
   Under **Booking form**, add "I'm enquiring as" (select — participant/client,
   family or carer, support coordinator, GP or health professional, private
   client, other) and a **required checkbox for privacy consent** linking to
   prevailep.com.au/privacy.html. Phone is already covered: setting the
   location to "Attendee phone number" makes it a required field, so don't
   also enable the separate Phone question or people will type it twice.
7. **Paste your link into `cal-embed.js`** — just the path part, no domain.
   If your page is `cal.com/prevail-ep/intro-call`, the line reads:

   ```js
   var CAL_LINK = "prevail-ep/intro-call";
   ```

Deploy, then load `/booking.html` and check the widget renders and the times
match your real calendar.

### Afterwards

- **`privacy.html` — done.** Section 9 now discloses both Cal.com and
  Web3Forms as overseas recipients under Australian Privacy Principle 8, and
  offers phone or email as an alternative for anyone who would rather their
  details didn't go through them. The policy is no longer marked draft and
  is effective 17 August 2026 — which matters, because the booking form asks
  people to tick that they've read it, and consent to a document labelled
  "draft" is a weak footing.
- **Re-date the policy whenever you change it.** Both the effective date and
  "last updated" are now real dates rather than placeholders, so they need
  to move when the wording does.
- **Keep `booking.js` roughly current.** It's the fallback now rather than
  the main path, but if Cal is ever blocked it's what visitors see — so
  don't let its `AVAILABILITY` block drift so far from reality that it
  offers times you'd never take.

### Longer term

If you move to full practice management, **Halaxy** or **Cliniko** handle
booking *and* NDIS invoicing. Point the "Book a free 15-min chat" links at
whichever tool wins; they're in `index.html`, `for-referrers.html` and
`service-profile.html`.

---

## After launch

1. **Google Business Profile** — free, gets you into local search and Maps.
2. **Professional email** on the domain.
3. **A real headshot + an action photo.**
4. **Testimonials** as they come in.
