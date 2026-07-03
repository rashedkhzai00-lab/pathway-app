# ADHDrive

An ADHD-friendly study companion with four modules: Focus (Pomodoro timer), Study (quiz engine), Plan (task manager), and Create (question bank builder). The app is subject-agnostic — the question bank works for any topic, not just driving theory.

## Run & Operate

- `pnpm --filter @workspace/pathway run dev` — run the ADHDrive app (port 25088)
- `pnpm --filter @workspace/pathway run typecheck` — typecheck the app
- Workflow name: `artifacts/pathway: web`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- React 19 + Vite, wouter routing, Tailwind CSS v4
- All state in localStorage — no backend, no database

## Where things live

- `artifacts/pathway/src/pages/` — all four module pages + Home + Hub
- `artifacts/pathway/src/index.css` — full design system (palette, utilities)
- `artifacts/pathway/src/App.tsx` — wouter router

## Architecture decisions

- All data is localStorage-only; no API or database needed
- Focus timer uses `Date.now()` + `endTimestampRef` for drift-free countdown
- Study module reads from `pathway:questionBank` written by Create module
- Session state (`pathway:activeSession`) persists mid-quiz for resume support
- Weak spots (`pathway:weakSpots`) track per-question miss counts

## Product

- **Focus** — Pomodoro timer (15/25/50 min), work/break cycles, daily streak
- **Study** — Quiz engine with 4 modes: drill weak spots, quick practice, by category, timed mock exam
- **Plan** — Task manager with today/week toggle, date+time scheduling, localStorage persistence
- **Create** — Question bank builder: add/edit form, from-notes splitter, export/import JSON

## User preferences

- App name: ADHDrive

## Gotchas

- Workflow must be restarted after code changes: `restartWorkflow({ workflowName: "artifacts/pathway: web" })`
- `pnpm run build` needs `PORT`/`BASE_PATH` env vars; use `typecheck` for verification instead
- Do not add this artifact to root `tsconfig.json` references (leaf package)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
