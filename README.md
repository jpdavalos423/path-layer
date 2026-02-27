# PathLayer

PathLayer is a graph-based referral optimization engine that computes:
- shortest-hop introduction paths (BFS)
- minimum social-friction paths (Dijkstra)

It runs as a static Next.js app with client-side graph computation and a deterministic synthetic dataset.

## User Guide
For product usage and workflow details, see:
- [USER_GUIDE.md](/Users/jpdavalos/Documents/path-layer/USER_GUIDE.md)

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS (dark-mode UI)
- React Flow (interactive path graph)
- Vitest (unit/integration tests)
- Playwright (e2e tests)

## Local Development
```bash
pnpm install
pnpm generate:data
pnpm validate:data
pnpm dev
```

Open `http://localhost:3000`.

## Testing
```bash
pnpm lint
pnpm test:unit
pnpm test:e2e:install
pnpm test:e2e:smoke
pnpm test:e2e
```

- `pnpm test:e2e:install`: installs Playwright Chromium browser/deps for fresh environments.
- `pnpm test:e2e:smoke`: runs only the tagged smoke e2e test(s) for fast validation.
- `pnpm test:e2e`: runs the full end-to-end suite.

## CI
GitHub Actions workflow is defined at:
- `.github/workflows/ci.yml`

Execution policy:
- Pull requests: `quality` + `e2e-smoke`
- `main` branch pushes: `quality` + `e2e-smoke` + `e2e-full`
- Nightly schedule (UTC): `e2e-full`

## Build and Static Export
```bash
pnpm build
```

Static output is generated in `out/`.

## Cloudflare Pages Deployment
- Framework preset: `None` (static site)
- Build command: `pnpm build`
- Build output directory: `out`
- Functions: not required
- Secrets/environment variables: none required

## Data
- Dataset artifact: `public/data/network.json`
- Generator: `scripts/generate-dataset.ts`
- Validator: `scripts/validate-dataset.ts`

The generator is deterministic with a fixed seed (`20260227`) for reproducible graph structure.
