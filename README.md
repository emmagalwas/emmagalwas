# Emma Galwas

Portfolio site for Emma Galwas, built with Next.js and deployed to Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare).

## Develop

```bash
npm install
npm run dev
```

Projects, captions and images live in `app/projects.ts`; image files go in `public/work/`.

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

Image optimization uses the Cloudflare Images binding (`IMAGES` in `wrangler.jsonc`); without it, original images are served.
