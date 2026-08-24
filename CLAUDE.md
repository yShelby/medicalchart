# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Automated Medical Charting and Patient Medication Tracking with an STT-AI Agent.**

Currently the repository contains only the `front/` app: a psychiatric outpatient EMR (electronic medical record) UI called "PsyChart" — patient list, visit charting (SOAP-style notes with a mental status exam), prescriptions, psychometric assessment scores, and a mock AI chat assistant. All data is in-memory mock data (`front/src/app/components/chart/data.ts`); there is no backend/API integration yet. The STT (speech-to-text) agent implied by the repo name is not yet implemented.

## Commands

All commands run from `front/`:

```
npm install     # install dependencies (no lockfile committed; node_modules/dist are gitignored)
npm run dev     # start Vite dev server
npm run build   # production build (vite build) — also the closest thing to a typecheck/lint gate
```

There is no test runner, linter, or `tsc` script configured in `package.json`. To typecheck manually: `npx tsc --noEmit -p tsconfig.json`.

## Architecture

Entry point: `front/index.html` → `front/src/main.tsx` → `front/src/app/App.tsx`.

`App.tsx` is a thin state-owning shell (patient selection, active tab, search, AI panel open/closed, the in-memory `visits` map) that composes everything from `front/src/app/components/chart/`:

- `types.ts` — domain types (`Patient`, `Visit`, `Assessment`, `MSE`, `Tab`, `PatientStatus`, `ChatMessage`)
- `data.ts` — all mock data (`PATIENTS`, `VISITS`, `ASSESSMENTS`, `AI_INTROS`, `AI_RESPONSES`) plus `getAIResponse()`, a keyword-matching stub for the mock AI assistant
- `Sidebar.tsx` — patient search/list (진료대기/진료완료 status tabs)
- `PatientHeader.tsx` — patient banner + the 4 content-tab nav (기본정보/진료기록/처방전/심리평가)
- `tabs/*.tsx` — one component per content tab (`PatientInfoTab`, `ChartTab`, `PrescriptionTab`, `AssessmentTab`)
- `ChartTab.tsx` composes `VisitCard.tsx` (a collapsible SOAP-note card: S + MSE on the left, A + P + meds + notes on the right) and `NewVisitForm.tsx` (self-contained form with its own local state; calls `onSave(visit)` up to `App.tsx`, which prepends into `visits[patientId]`)
- `AIPanelColumn.tsx` / `AIChatPanel.tsx` — the collapsible right-hand AI assistant column; resets its conversation whenever the selected patient changes
- `RiskBadge.tsx`, `TrendIcon.tsx`, `ScoreBar.tsx`, `Section.tsx`, `medUtils.ts` — small shared display/formatting helpers (e.g. `RISK_LABELS` for suicide-risk level text, `parseMed()` for splitting a "약물명 용량" string)

`front/src/app/components/ui/` is the shadcn/Radix UI primitive library from the original Figma Make export — available but not yet wired into the chart feature above, which currently hand-rolls markup with Tailwind classes directly. Components are grouped into category subfolders rather than one flat directory: `form/` (button, input, select, checkbox, textarea, etc.), `overlay/` (dialog, sheet, popover, tooltip, dropdown-menu, etc.), `navigation/` (tabs, sidebar, breadcrumb, pagination, navigation-menu), `layout/` (card, accordion, table, separator, scroll-area, etc.), `feedback/` (alert, badge, progress, skeleton, sonner), `data-display/` (avatar, carousel, chart); `utils.ts` (`cn()`) and `use-mobile.ts` stay at the `ui/` root since nearly every component depends on them. Each category folder (and `ui/index.ts` itself) has an `index.ts` barrel (`export * from "./x"`) for convenient imports, e.g. `import { Button } from "@/components/ui/form"`.

### Styling

Tailwind v4 (`@tailwindcss/vite` plugin, no `tailwind.config.js` — config lives in CSS via `@theme`). Style entry chain: `main.tsx` imports `src/styles/index.css`, which imports `fonts.css` → `tailwind.css` → `theme.css`. `theme.css` defines the color system as CSS custom properties (`--background`, `--primary`, `--muted`, etc., with `.dark` overrides) consumed through Tailwind utility classes like `bg-primary`, `text-muted-foreground`, `border-border`. Prefer these semantic tokens over raw Tailwind colors to stay consistent with the existing UI.

### Vite config notes (`front/vite.config.ts`)

- `@` is aliased to `front/src`
- A custom `figma-asset-resolver` plugin resolves `figma:asset/*` imports to `src/assets/` (leftover from the Figma Make export)
- Comment in the config warns not to remove the React/Tailwind plugins even if Tailwind looks unused
