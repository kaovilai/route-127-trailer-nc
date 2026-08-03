# Route 127 Trailer Strategy

A single-page calculator that compares the cheapest way to tackle a
[Route 127 "World's Longest Yard Sale"](https://en.wikipedia.org/wiki/The_Longest_Yard_Sale)
trailer trip:

- **Option 1 – Rent local & tow round-trip:** rent a trailer in NC and tow it the whole way.
- **Option 2 – Drive empty & rent one-way:** drive to the start empty and grab a one-way trailer.

It also estimates fuel cost (with separate empty/towing MPG), applies one-way rental
overage penalties, and checks whether your daily pace is feasible.

The app is a static React site (originally a Gemini-generated component) and is
deployed to **GitHub Pages**.

## Live site

Once GitHub Pages is enabled for this repository, the app is served at:

```
https://<owner>.github.io/route-127-trailer-nc/
```

## Tech stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) for styling

## Local development

```bash
npm install
npm run dev
```

Then open the printed local URL (Vite serves the app under the `/route-127-trailer-nc/` base path).

## Production build

```bash
npm run build     # type-checks and outputs static files to dist/
npm run preview   # serve the built dist/ locally
```

## Deployment

Pushing to the `main` branch triggers the
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) workflow, which builds
the site and publishes `dist/` to GitHub Pages.

To enable it once: in the repository settings, go to **Settings → Pages** and set
**Source** to **GitHub Actions**.

### Base path

The site is built for a GitHub Pages *project* site, so the base path defaults to
`/route-127-trailer-nc/`. If you fork/rename the repo or use a custom domain, override
it at build time:

```bash
BASE_PATH=/ npm run build
```
