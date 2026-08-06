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
| `analytics.js` | Google Analytics 4 + conversion tracking. **Needs your Measurement ID pasted in** — see below |
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

There are **no MX or TXT records** on this domain, so no email depends on it.

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

### Turning it on (5 minutes, one line to edit)

1. Go to [analytics.google.com](https://analytics.google.com) and sign in with your Google account.
2. **Admin** (cog, bottom-left) → **Create** → **Property**. Name it `Prevail Exercise Physiology`, timezone **Australia/Brisbane**, currency **AUD**.
3. When it asks for a platform, choose **Web**. Website URL `https://prevailep.com.au`, stream name `Prevail website`.
4. It shows you a **Measurement ID** in the top right — `G-` followed by ten characters. Copy it. *(Ignore the installation snippet it offers; it's already wired up.)*
5. Open `analytics.js` and replace `REPLACE_WITH_GA4_MEASUREMENT_ID` on line 19 with that ID. Keep the quotes:

   ```js
   var MEASUREMENT_ID = "G-ABC1234XYZ";
   ```

6. Commit and push. Open the site, then check **Reports → Realtime** in Analytics — you should appear within about 30 seconds.

Until step 5 is done the file is completely inert: no cookies are set and no requests are made to Google.

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

## Outstanding to-dos

- [x] ~~**Waitlist form connected.**~~ Web3Forms key is live in `index.html`. Signups email `louissakrzewski123@gmail.com`. Manage the form at [web3forms.com](https://web3forms.com).
- [x] ~~Tick **Enforce HTTPS**~~ — done, certificate issued and `http://` now 301s to `https://`.
- [ ] **Paste the GA4 Measurement ID into `analytics.js`** (see *Google Analytics* above). Everything else is wired.
- [ ] **Remove the draft banner and set the effective date on `privacy.html`.** The grey "This is a draft policy prepared for review" box is publicly visible right now, and the date reads `[to be set on approval]`.
- [ ] Confirm the contact email. Currently `louissakrzewski123@gmail.com`; a `hello@prevailep.com.au` address would look more professional.
- [ ] Add a photo in the About section (placeholder marked *"Add a friendly photo of Louis here"*).
- [ ] Fix `medicalSpecialty` in the structured data in `index.html` — it currently says `Physiotherapy`, which is a protected AHPRA title you don't hold. Closest valid schema.org value is `PhysicalTherapy`, or drop the field.
- [ ] Add a postal/service address to the structured data — local SEO leans on it heavily.
- [ ] Verify the site in Google Search Console and submit `sitemap.xml`.
- [ ] Create a Google Business Profile.
- [ ] *(Optional)* Add ESSA / AEP registration number as a trust signal.
- [ ] *(Optional)* Add 2–3 testimonials once you have written, de-identified consent.

---

## When you're ready to take bookings

The site's current path is waitlist → intro chat → assessment. For online booking, the options that suit allied health in Australia:

- **Halaxy** or **Cliniko** — practice management + booking, handle NDIS invoicing. Best long-term.
- **Calendly** / **Cal.com** — simplest if you just want intro calls booked.

Swap the waitlist button for a "Book a session" link, or embed the widget.

---

## After launch

1. **Google Business Profile** — free, gets you into local search and Maps.
2. **Professional email** on the domain.
3. **A real headshot + an action photo.**
4. **Testimonials** as they come in.
