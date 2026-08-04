# orvix-frontend

Frontend for **Orvix** — a decentralized AI compute network. OpenAI-compatible
inference on a permissionless GPU network, settled in USDC on Solana.

## Stack

- Next.js 14 (App Router) + TypeScript (strict)
- Tailwind CSS with custom design tokens
- Redux Toolkit + RTK Query
- Solana wallet adapters (Phantom, Solflare, Coinbase, Ledger, Torus + Standard Wallet auto-detect)
- Geist Sans + Geist Mono (via `geist`)

## Design

Minimalist dev-tool aesthetic: dark mode forced (`#030303`),
text-driven layout, mono fonts for technical strings, terminal/CLI blocks, a
single accent (`#9945ff`) used sparingly. No gradients, glassmorphism, or glow.

## Getting started

```bash
cp .env.local.example .env.local   # adjust as needed
npm install
npm run dev                         # http://localhost:3000
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint
- `npm run format` — Prettier

## Structure

```
src/
├── app/                 # App Router (layout, landing page)
├── components/
│   ├── ui/              # Button, Card, CodeBlock, Terminal, InlineNav, ...
│   ├── layout/          # Header, Footer
│   ├── landing/         # Hero, NetworkFeed, NetworkStats, CodeExample, ...
│   ├── wallet/          # WalletProvider, ConnectButton, WalletStatus
│   └── providers/       # ReduxProvider
├── lib/
│   ├── store/           # Redux store, RTK Query api + slices
│   ├── constants/       # config, routes
│   ├── utils/           # cn, format, solana helpers
│   └── types/
└── styles/              # globals.css (+ wallet-adapter dark overrides)
```

## Environment

See `.env.local.example`. The backend orchestrator API base is
`NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).

## Deploy

Self-hosted on a VPS, live at https://orvix.network. `scripts/deploy.sh` builds
locally, rsyncs the build output, installs production dependencies on the
server, and (re)starts the app under pm2:

```bash
DEPLOY_HOST=<ssh-target> ./scripts/deploy.sh
```

Server layout:

- App directory `/opt/orvix/frontend`, pm2 process `orvix-frontend` on port
  3003 (`pm2 save` + `pm2-<user>.service` keep it alive across reboots).
- nginx terminates TLS (certbot) and proxies `/` to `127.0.0.1:3003`, `/v1/` to
  the orchestrator on `127.0.0.1:8000`, and `/images/` to `/var/orvix`.
- `NEXT_PUBLIC_*` values are baked in at build time from `.env.production`, so
  the API must be same-origin HTTPS — see that file for why.

Notes:

- The server runs `npm install --omit=dev`, not `npm ci`: its npm major can
  differ from the one that generated `package-lock.json`, and `npm ci`'s strict
  lockfile check rejects that.
- Locally the build skips `npm ci` when `package-lock.json` is unchanged since
  the last install. Pass `FORCE_INSTALL=1` to reinstall anyway.
- If the remote install fails with `451 Unavailable For Legal Reasons`, the
  server is using a cloud-provider npm mirror that blocks some tarballs. Point
  it back at the official registry:
  `npm config set registry https://registry.npmjs.org/`.
