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
`NEXT_PUBLIC_API_URL` (default `http://187.127.118.174`).

## Deploy

Self-hosted on a VPS via pm2 on port 3000 (`http://<ip>:3000`) until a domain is
attached.
