# B2B Contact Enrichment

A React-based web application for enriching B2B contact data using Exa AI People Search with Google Gemini as a fallback.

## Features

- **CSV Upload**: Import contact lists via CSV files
- **Persona-based Search**: Target specific job titles and roles (CTOs, VPs, Directors, etc.)
- **Region Filtering**: Scope searches by geographic region
- **Enrichment Engine**: Uses Exa AI as the primary source, falls back to Gemini if needed
- **Email Verification**: Simulated verification with confidence scores
- **Export**: Download enriched contacts as CSV

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **APIs**: Exa AI People Search, Google Gemini
- **Data Parsing**: PapaParse

## Prerequisites

- Node.js 18+
- Exa API Key (primary)
- Gemini API Key (fallback)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   
   Copy `.env.example` to `.env.local` and add your API keys:
   ```bash
   EXA_API_KEY=your_exa_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:3000`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run TypeScript type checking |

## API Configuration

- **Exa API**: Primary source for people search. Configure via `EXA_API_KEY`
- **Gemini API**: Fallback when Exa is unavailable or returns no results. Configure via `GEMINI_API_KEY`

API keys are injected at build time via Vite's `define` configuration.

## License

MIT
