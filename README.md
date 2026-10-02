# Emma Galwas

Portfolio site for Emma Galwas, built with Next.js, deployed to Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare), with content managed in [Sanity](https://www.sanity.io).

## Content

All content lives in the hosted Sanity Studio: **https://emmagalwas.sanity.studio**

- **Projects** — drag projects in the list to set their order on the site. Each project has a title, a role and images; drag images to reorder them, and use “Upload multiple images” to add several at once.
- **Site settings** — header text, clients, contact links, and the page title and description used by search engines.
- **Media** — browse, tag and reuse every uploaded image.

Published changes appear on the site within a few seconds; no redeploy needed.

## Develop

```bash
npm install
npm run dev
```

The Studio lives in `studio/`:

```bash
cd studio
npm install
npm run dev
npm run deploy
```

## Preview on the Workers runtime

```bash
npm run preview
```

## Deploy

```bash
npx wrangler login
npm run deploy
```

Or connect this repository in the Cloudflare dashboard (Workers & Pages → Create → Import a repository) with:

- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `npx opennextjs-cloudflare deploy`
- Non-production branch deploy command: `npx opennextjs-cloudflare upload`

Set `NEXT_PUBLIC_SITE_URL` if the site is not served from `https://emmagalwasstudio.com`.
