# NetMap AI

AI-powered network reconnaissance workspace. Upload Nmap scan results to generate interactive topology graphs with AI-driven security analysis, CVE lookup, port filtering, and scan comparison.

Built with [Next.js 16](https://nextjs.org) (App Router), [Supabase](https://supabase.com) (Postgres + Auth), [React Flow](https://reactflow.dev), [Groq AI](https://groq.com), and [Tailwind CSS](https://tailwindcss.com).

## Features

- **Scan Import** — paste raw Nmap output or upload XML files
- **Topology Visualization** — interactive graph with port filtering and collapsible IP nodes
- **AI Analysis** — automatic security assessment with remediation commands (iptables, UFW, AWS SG)
- **CVE Lookup** — check discovered services against the NVD database
- **Scan Comparison** — side-by-side diff of any two scans
- **AI Chat** — ask questions about scan results conversationally
- **Tags & Webhooks** — organize scans and get notified on new results
- **Theme** — dark/light brutalist terminal aesthetic

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth (SSR) |
| AI | Groq via `@ai-sdk/openai` |
| Topology | `@xyflow/react` (React Flow) |
| Rate Limiting | Upstash Redis |
| Styling | Tailwind CSS v4 |
| Testing | Vitest + React Testing Library + Playwright |

## Getting Started

```bash
git clone https://github.com/rvx05/netmap.git
cd netmap
cp .env.local.example .env.local
npm install
npm run dev
```

Fill in all required environment variables in `.env.local` before running.

### Running Tests

```bash
npm test            # unit tests (Vitest)
npm run test:e2e    # E2E tests (Playwright — requires dev server)
```

