# Salon Poke — Static Site

Bristol's home for sealed Japanese Pokemon TCG. Pure static HTML/CSS/JS — no build step required.

## Stack
- HTML5 / CSS3 / Vanilla JS
- Central `data.json` config + `localStorage` admin override
- `admin.html` password-protected dashboard (default: `salonpoke2026`)

## Files
```
index.html          Public site (18 sections)
admin.html          Admin dashboard
admin.css / admin.js Admin styling & logic
data.json           Central editable config
script.js           Public site JS
styles.css          Public site styles
robots.txt / sitemap.xml  SEO
404.html            Custom 404
imgs/               Product + hero box photos
```

## Deploy to Vercel

### Option 1 — Drag and Drop (easiest)
1. Go to https://vercel.com/new
2. Drag this folder onto the upload area
3. Vercel auto-detects static site → click **Deploy**
4. Get URL like `salon-poke.vercel.app`

### Option 2 — Vercel CLI
```bash
npm i -g vercel
cd this-folder
vercel login
vercel --prod
```

### Option 3 — GitHub auto-deploy
1. Push this folder to a GitHub repo
2. Go to https://vercel.com/new → Import the repo
3. Framework preset: **Other**
4. Click **Deploy**
5. Every `git push` → auto-deploy

## Admin
- Public: `https://your-domain.vercel.app/`
- Admin: `https://your-domain.vercel.app/admin.html`
- Default password: `salonpoke2026` (change inside)

## Custom Domain
In Vercel dashboard → Project → Settings → Domains → add `salonpoke.co.uk`

## Local Preview
```bash
python -m http.server 8000
# or
npx serve .
```
Then open http://localhost:8000

## Updates
- Edit content via `/admin.html` (saves to browser `localStorage`)
- Click **Export JSON** to backup
- For site-wide permanent change, replace `data.json` and re-deploy
