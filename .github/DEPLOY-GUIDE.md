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

## Known gotchas

- **Repo must stay public.** Making it private silently disables Pages and the site 404s. GitHub Free does not support Pages on private repos.
- **Deleting `CNAME`** drops the custom domain.
- **Security headers don't apply.** `netlify.toml` defines a CSP and related headers, but GitHub Pages does not support custom headers at all and no config changes that. Those protections are currently inactive. A `<meta http-equiv="Content-Security-Policy">` tag in `index.html` can recover part of it.

---

## Outstanding to-dos

- [ ] **Waitlist form is not connected.** `index.html` still has the placeholder:
      `value="REPLACE_WITH_YOUR_WEB3FORMS_ACCESS_KEY"`
      Get a key from [web3forms.com](https://web3forms.com) and paste it in, or submissions fail silently. **Do this before sharing the link anywhere.**
- [ ] Tick **Enforce HTTPS** once the certificate issues.
- [ ] Confirm the contact email. Currently `louissakrzewski123@gmail.com`; a `hello@prevailep.com.au` address would look more professional.
- [ ] Add a photo in the About section (placeholder marked *"Add a friendly photo of Louis here"*).
- [ ] Set the effective date on `privacy.html`.
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
