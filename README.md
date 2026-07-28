# Matthew Tanzer Realty — matthewtanzer.com

Real estate site for Matthew Tanzer, REALTOR® (Coldwell Banker Realty, Monterey Peninsula).
Next.js 16 · React 19 · Tailwind CSS v4 · TypeScript.

**Live:** https://miketanzer.github.io/MatthewTanzer/

## Pages

- `/` — hero, featured listings, area overview
- `/listings` — all active listings with city filter + price sort
- `/listings/[id]` — photo gallery, facts, description, virtual tour, inquiry form
- `/guides` + `/guides/[slug]` — homebuyer guides & resources (5 long-form guides)
- `/contact` — contact form

## Deployment

```bash
npm run deploy:pages
```

Builds the static export and publishes `out/` to the `gh-pages` branch, which GitHub
Pages serves at https://miketanzer.github.io/MatthewTanzer/. Re-run it after
`npm run sync-listings` to push fresh listings live.

`GITHUB_PAGES=true` (set by that script) switches on `output: 'export'`, the
`/MatthewTanzer` base path, and unoptimized images (Pages has no image optimizer);
`next dev` is unaffected and stays at the root.

**Automating it:** deploys are manual because the local `gh` OAuth token lacks the
`workflow` scope and so cannot push `.github/workflows/*`. To switch to deploy-on-push,
run `gh auth refresh -s workflow`, copy `deploy/github-pages-workflow.yml` to
`.github/workflows/deploy.yml`, push, and set the Pages source to "GitHub Actions".

### Contact form

Static hosting has no server, so the form composes a prefilled email via `mailto:`
to matthew.tanzer@cbrealty.com. To capture submissions instead, set
`NEXT_PUBLIC_FORM_ENDPOINT` to a form service (Formspree et al.) — the form will POST
JSON to it rather than opening a mail client. On a server host like Vercel, restore a
`src/app/api/contact/route.ts` handler and point that env var at `/api/contact`.

## Listings data pipeline

Listings are pulled from the live matthewtanzer.com site (MoxiWorks / Coldwell Banker
platform). The **source page** is the homepage "Featured Properties → Active Properties"
widget (MoxiWorks curated list `907171`, agent UUID `8204749c-b0a2-4453-bf84-00269fbd80b7`).
Its `<noscript>` fallback lists every listing; each detail page embeds the full record as
`Wx = {data: {listing_detail: {...}}}`.

```bash
npm run sync-listings
```

writes `src/data/listings.json` (address, price, beds/baths, sqft, acreage, description,
up to 16 photos, MLS #, virtual tour, attribution). Re-run any time; commit the JSON.

When the domain is switched to this site later, keep the sync working by pointing it at
wherever the Moxi site remains reachable:

```bash
LISTINGS_SOURCE_URL=https://<moxi-hosted-url>/ npm run sync-listings
```

## Development

```bash
npm install
npm run dev
```

## Before launch

- Wire `/api/contact` to a real email service (Resend/SendGrid) or CRM webhook.
- Schedule `sync-listings` (cron / GitHub Action) so listings stay fresh.
- Confirm MLS/IDX display compliance with Coldwell Banker marketing.
