# RunQ

A CPU scheduling algorithm simulator and visualizer — React + Vite frontend, with
AI-powered step-by-step explanations via [Groq](https://groq.com).

Four algorithms, each with its own full workbench: **FCFS**, **SJF**, **SRTF**, and
**Round Robin**. Edit the process table or load a demo preset, step through the
simulation tick by tick (or autoplay it), watch the CPU core and Gantt chart update
live, and ask an AI tutor why the scheduler made each decision.

## Pages

| Route                        | Purpose                                                        |
|-------------------------------|-----------------------------------------------------------------|
| `/`                            | Landing page — info only, links out to the dashboard and algorithm pages |
| `/dashboard`                   | Battle Mode: all four algorithms compared side by side, plus Groq API key settings |
| `/algorithms/fcfs`             | First Come First Serve workbench                                |
| `/algorithms/sjf`              | Shortest Job First workbench                                    |
| `/algorithms/srtf`             | Shortest Remaining Time First workbench                         |
| `/algorithms/round-robin`      | Round Robin workbench (adjustable quantum)                      |

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

## AI explanations (Groq)

The AI panel on each algorithm page calls Groq's chat completions API directly from
the browser. You need a free API key:

1. Create one at **https://console.groq.com/keys**
2. Paste it into the "AI Explain" panel on any algorithm page, or once on the
   Dashboard's AI Settings panel — it's shared across all pages.
3. The key is stored only in your browser's `localStorage` (`runq_groq_api_key`)
   and sent only to `api.groq.com`. It is never bundled into the build.

For local development you can instead pre-fill a key via environment variable:

```bash
cp .env.example .env
# edit .env and set VITE_GROQ_API_KEY=gsk_...
```

> **Note on production security:** this demo calls Groq directly from the client,
> which is simplest for a hackathon/demo deployment but exposes whatever key the
> *user* pastes in to their own browser only (each visitor uses their own key —
> nothing is shared). If you want to ship a single shared key without exposing it
> in client code, add a small serverless function (Vercel/Netlify function or any
> tiny backend) that proxies `src/lib/groq.js`'s request server-side, and update
> `GROQ_ENDPOINT` there accordingly.

## Building for production

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

Output goes to `dist/`.

## Deploying

**Vercel** — import the repo, framework preset "Vite", build command
`npm run build`, output directory `dist`. `vercel.json` is already included for
SPA client-side routing.

**Netlify** — `netlify.toml` is already included (`npm run build`, publish `dist`,
with the SPA redirect rule). Import the repo or drag-and-drop the `dist/` folder.

**Any static host** — run `npm run build` and upload the contents of `dist/`.
Since this is a single-page app with client-side routing, make sure your host
rewrites all unknown paths to `index.html`.

## Project structure

```
src/
  components/       Reusable UI: Navbar, ProcessTable, GanttChart, CpuCore,
                     MetricsPanel, StepControls, AIExplain, AlgoWorkbench
  pages/
    Landing.jsx      Info-only landing page
    Dashboard.jsx     Battle Mode + AI settings
    algorithms/       One page per algorithm (thin wrappers around AlgoWorkbench)
  lib/
    scheduler.js      Pure scheduling algorithms (FCFS, SJF, SRTF, RR) — no UI deps
    useSimulator.js    Shared React hook: playback state, ticking, derived values
    groq.js            Groq API client for AI explanations
  data/
    presets.js         Demo workload presets (classic mix, convoy effect, starvation, etc.)
  theme.css            Design tokens (colors, fonts, shadows)
  index.css            Global styles and component classes
```

The scheduling engine in `lib/scheduler.js` is pure and framework-independent —
it can be unit tested or reused outside React with no changes.

## Tech stack

- React 18 + React Router 6
- Vite 5
- Plain CSS with custom properties (no framework) — see `theme.css`
- Groq (`llama-3.3-70b-versatile`) for AI explanations, called directly from the browser

## License

MIT — do whatever you like with it.
