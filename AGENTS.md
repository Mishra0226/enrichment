## Cursor Cloud specific instructions

This is a React SPA (Vite + React 19 + TypeScript + Tailwind CSS 4) for B2B contact enrichment using Exa AI People Search and Google Gemini.

### Services

| Service | Command | Port |
|---------|---------|------|
| Vite dev server | `npm run dev` | 3000 |

### Key commands

- **Lint**: `npm run lint` (runs `tsc --noEmit`)
- **Build**: `npm run build`
- **Dev**: `npm run dev` (Vite on port 3000)

### Environment variables

Set in `.env.local`:
- `EXA_API_KEY` — primary enrichment via Exa People Search
- `GEMINI_API_KEY` — fallback enrichment via Google Gemini

### Architecture notes

- Client-side SPA — no backend server. API keys are injected at build time via Vite `define`.
- Exa API calls are proxied through Vite dev server (`/api/exa` → `https://api.exa.ai`) to avoid CORS issues.
- Enrichment uses Exa as primary source, falls back to Gemini if Exa key is missing or returns no results.
- `better-sqlite3`, `express`, and `dotenv` are listed in `package.json` but unused in source code.
