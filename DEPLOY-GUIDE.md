# Prevail Website — Launch Guide

Everything you need to take this from files on your computer to a live, trusted site at **prevailep.com.au** with a working waitlist. Total time: about **30–45 minutes**, most of it waiting for DNS.

Work through it top to bottom. Each step says exactly what to click.

---

## What's in this folder

| File | What it is |
|------|------------|
| `index.html` | The homepage (hero, services, funding, FAQ, waitlist) |
| `privacy.html` | Privacy policy page |
| `styles.css` | All the styling / design |
| `script.js` | Mobile menu + waitlist form logic |
| `favicon.svg`, `apple-touch-icon.png` | Browser tab + phone icons |
| `og-image.png` | The preview image shown when the link is shared |
| `netlify.toml`, `robots.txt`, `sitemap.xml` | Hosting config + SEO |

You only ever **edit `index.html`** for content changes. Everything else can stay as-is.

---

## Step 0 — Preview it right now (2 min)

Double-click **`index.html`**. It opens in your browser and works fully offline (except the waitlist send, which needs Step 1).

Click around, read the copy, test the mobile menu by making the window narrow. Note anything you want changed — you can tell me and I'll edit it.

---

## Step 1 — Connect the waitlist (5 min)  ⚠️ Required

The form is built but not yet wired to your inbox. You'll connect it with **Web3Forms** (free, no account dashboard needed — signups just land in your email).

1. Go to **[web3forms.com](https://web3forms.com)**.
2. Enter the email you want signups sent to → click **Create Access Key**.
3. Check that inbox for the **Access Key** (a string like `a1b2c3d4-...`).
4. Open **`index.html`** in any text editor. Find this line (near the waitlist form, ~line 365):

   ```html
   <input type="hidden" name="access_key" value="REPLACE_WITH_YOUR_WEB3FORMS_ACCESS_KEY" />
   ```

5. Replace `REPLACE_WITH_YOUR_WEB3FORMS_ACCESS_KEY` with your key. Save.

That's it — every waitlist submission now emails you the person's details.

> **Tip:** Use a dedicated inbox if you can (e.g. a future `hello@prevailep.com.au`). Signups contain personal info, so keep that inbox private.

---

## Step 2 — Put it online with Netlify (10 min)

**The fast way (drag-and-drop):**

1. Go to **[netlify.com](https://www.netlify.com)** → **Sign up** (free). Use email or a Google/GitHub login.
2. On your dashboard, find **"Add new site" → "Deploy manually"** (also called *Drag and drop your site folder*).
3. Drag this entire **`Website`** folder onto the drop zone.
4. Netlify uploads it and gives you a live URL like `https://calm-otter-12345.netlify.app`. **Your site is now on the internet.** Open it and test.

> To update the site later, just drag the folder onto the same box again (Netlify → your site → **Deploys** → drag to redeploy). If you'd rather have edits deploy automatically, ask me and I'll set up the Git-connected method instead.

---

## Step 3 — Point prevailep.com.au at it (10 min + wait)

Right now the site lives at a `.netlify.app` address. Let's put your real domain on it.

1. In Netlify: your site → **Domain management** (or **Domains**) → **Add a domain** → type `prevailep.com.au` → **Verify** → **Add**.
2. Netlify will ask how you want DNS handled. Pick **one** option:

### Option A — Let Netlify run your DNS (simplest, recommended)
1. Netlify shows you **4 nameservers** (like `dns1.p01.nsone.net`, …).
2. Log in to **wherever you bought prevailep.com.au** (your domain registrar).
3. Find the domain's **Nameserver** settings → replace the existing nameservers with Netlify's four.
4. Save. Done — Netlify now handles everything, including the free HTTPS certificate automatically.

### Option B — Keep your current DNS, add records
If you'd rather not move nameservers, add these records at your registrar's DNS settings:

| Type | Host / Name | Value |
|------|-------------|-------|
| `A` | `@` (root) | `75.2.60.5` |
| `CNAME` | `www` | `your-site-name.netlify.app` |

*(If your registrar offers `ALIAS` or `ANAME` instead of a root `A` record, point `@` to `apex-loadbalancer.netlify.com` — it's more resilient.)*

3. **Wait for DNS to propagate** — usually 15–60 minutes, occasionally up to 24 hours.
4. Back in Netlify → Domain management, set **prevailep.com.au** as the **primary domain** and enable **HTTPS** (Netlify auto-issues a free Let's Encrypt certificate once DNS resolves). The padlock is essential for a health site — don't skip it.

---

## Step 4 — Test before you share it (5 min)

- [ ] Visit **https://prevailep.com.au** — padlock showing, no "not secure" warning.
- [ ] Submit a **test waitlist entry** → confirm the email lands in your inbox.
- [ ] Open it on your **phone** — menu, layout and form all work.
- [ ] Click the **Privacy Policy** link.
- [ ] Share the link in a message to yourself and check the **preview image** appears.

---

## Step 5 — When you're ready to take bookings (later)

The site already has a clear path (waitlist → intro chat → assessment). When you want online booking, the cleanest options for allied health in Australia are:

- **Halaxy** or **Cliniko** — practice-management + online booking, built for allied health, handle NDIS invoicing too. Best long-term.
- **Calendly** (or Cal.com) — simplest if you just want people to book an intro call.

To add it, you'd swap the waitlist button for a **"Book a session"** button that links to your booking page, or embed the booking widget. Send me the booking link when you have one and I'll wire it in — it's a 10-minute change.

---

## Editing content yourself

All the words live in **`index.html`**. Open it in a text editor, use Find (Ctrl/Cmd-F) to locate the text, change it, save, and redeploy (Step 2). The design (`styles.css`) doesn't need touching.

If you'd rather not touch code at all, just tell me what to change and I'll update the files for you.

---

## Before-launch checklist (things only you can fill in)

- [ ] **Web3Forms access key** added (Step 1) — *required, or the form won't send.*
- [ ] Confirm the **contact email** shown on the site — currently `louissakrzewski123@gmail.com`. Recommend setting up **hello@prevailep.com.au** for a more professional look (most registrars/hosts offer email; I can update the site once it exists).
- [ ] Add a **friendly photo of you** in the About section (there's a placeholder marked *"Add a friendly photo of Louis here"*).
- [ ] Set the **effective date** on `privacy.html` and confirm you're happy with the policy wording.
- [ ] *(Optional)* Add your **ESSA / AEP registration number** as an extra trust signal.
- [ ] *(Optional but powerful)* Add **2–3 client testimonials** once you have written, de-identified consent — social proof strongly boosts trust. I can design a testimonials section when you're ready.

---

## Recommended "trust" boosters after launch

1. **Google Business Profile** — free; makes you show up in local searches and Maps with reviews.
2. **Professional email** on your domain (as above).
3. **A real headshot + one action photo** — nothing builds trust like a face.
4. **Testimonials** as they come in.

---

*Questions at any step? Just ask — I can make edits, wire up booking, or walk you through the Netlify screens.*
