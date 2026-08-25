# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Automated Medical Charting and Patient Medication Tracking with an STT-AI Agent.**

The repository has two apps: `frontend/`, a psychiatric outpatient EMR (electronic medical record) UI called "PsyChart" — patient list, visit charting (SOAP-style notes with a mental status exam), prescriptions, psychometric assessment scores, and a mock AI chat assistant; and `backend/`, a FastAPI service implementing the voice-to-chart pipeline (STT → NER → LLM) behind a WebSocket. Most frontend data is still in-memory mock data (`frontend/src/app/components/chart/data.ts`); the pipeline itself is wired end-to-end but every stage is a `Mock*` implementation — no real speech/NLP/LLM model is integrated yet (see Backend section below).

## Commands

Frontend (run from `frontend/`):

```
npm install     # install dependencies (no lockfile committed; node_modules/dist are gitignored)
npm run dev     # start Vite dev server
npm run build   # production build (vite build) — also the closest thing to a typecheck/lint gate
```

There is no test runner, linter, or `tsc` script configured in `package.json`. To typecheck manually: `npx tsc --noEmit -p tsconfig.json`.

Backend (run from `backend/`, using the repo-root `.venv`):

```
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

No test runner is configured. There is no separate backend `.venv`; it shares the one at the repo root.

## Architecture

Entry point: `frontend/index.html` → `frontend/src/main.tsx` → `frontend/src/app/App.tsx`.

`App.tsx` is a thin state-owning shell (patient selection, active tab, search, AI panel open/closed, the in-memory `visits` map) that composes everything from `frontend/src/app/components/chart/`:

- `types.ts` — domain types (`Patient`, `Visit`, `Assessment`, `MSE`, `Tab`, `PatientStatus`, `ChatMessage`)
- `data.ts` — all mock data (`PATIENTS`, `VISITS`, `ASSESSMENTS`, `AI_INTROS`, `AI_RESPONSES`) plus `getAIResponse()`, a keyword-matching stub for the mock AI assistant
- `Sidebar.tsx` — patient search/list (진료대기/진료완료 status tabs)
- `PatientHeader.tsx` — patient banner + the 4 content-tab nav (기본정보/진료기록/처방전/심리평가)
- `tabs/*.tsx` — one component per content tab (`PatientInfoTab`, `ChartTab`, `PrescriptionTab`, `AssessmentTab`)
- `ChartTab.tsx` composes `VisitCard.tsx` (a collapsible SOAP-note card: S + MSE on the left, A + P + meds + notes on the right) and `NewVisitForm.tsx` (self-contained form with its own local state; calls `onSave(visit)` up to `App.tsx`, which prepends into `visits[patientId]`)
- `NewVisitForm.tsx` has two tabs: `[SOAP 진료 차트]` (the form fields) and `[실시간 기록]` (read-only live STT transcript, rendered by `RealtimeSttPanel.tsx`). The recording session (MediaRecorder + WebSocket, via the `useVoiceChartSocket()` hook in `frontend/src/app/lib/`) is owned by `NewVisitForm.tsx` itself rather than by the tab content, so switching tabs mid-recording doesn't unmount and kill it. The header's `🎙️ AI Scribe` button toggles to `🔴 기록 종료` while recording and works from either tab; stopping sends the transcript to the backend pipeline and merges the returned SOAP chart into the form via `mergeAiChart.ts`'s `mergeAiChartIntoForm()` — this **appends** AI output below any text the doctor already typed (a `--- [AI 음성 분석] ---` separator for multiline fields, concatenation for list fields, `risk` only filled in if still unset) rather than overwriting it, then switches back to `[SOAP 진료 차트]`.
- `AIPanelColumn.tsx` / `AIChatPanel.tsx` — the collapsible right-hand AI assistant column; resets its conversation whenever the selected patient changes
- `RiskBadge.tsx`, `TrendIcon.tsx`, `ScoreBar.tsx`, `Section.tsx`, `medUtils.ts` — small shared display/formatting helpers (e.g. `RISK_LABELS` for suicide-risk level text, `parseMed()` for splitting a "약물명 용량" string)

`frontend/src/app/components/ui/` is the shadcn/Radix UI primitive library from the original Figma Make export — available but not yet wired into the chart feature above, which currently hand-rolls markup with Tailwind classes directly. Components are grouped into category subfolders rather than one flat directory: `form/` (button, input, select, checkbox, textarea, etc.), `overlay/` (dialog, sheet, popover, tooltip, dropdown-menu, etc.), `navigation/` (tabs, sidebar, breadcrumb, pagination, navigation-menu), `layout/` (card, accordion, table, separator, scroll-area, etc.), `feedback/` (alert, badge, progress, skeleton, sonner), `data-display/` (avatar, carousel, chart); `utils.ts` (`cn()`) and `use-mobile.ts` stay at the `ui/` root since nearly every component depends on them. Each category folder (and `ui/index.ts` itself) has an `index.ts` barrel (`export * from "./x"`) for convenient imports, e.g. `import { Button } from "@/components/ui/form"`.

### Styling

Tailwind v4 (`@tailwindcss/vite` plugin, no `tailwind.config.js` — config lives in CSS via `@theme`). Style entry chain: `main.tsx` imports `src/styles/index.css`, which imports `fonts.css` → `tailwind.css` → `theme.css`. `theme.css` defines the color system as CSS custom properties (`--background`, `--primary`, `--muted`, etc., with `.dark` overrides) consumed through Tailwind utility classes like `bg-primary`, `text-muted-foreground`, `border-border`. Prefer these semantic tokens over raw Tailwind colors to stay consistent with the existing UI.

### Vite config notes (`frontend/vite.config.ts`)

- `@` is aliased to `frontend/src`
- A custom `figma-asset-resolver` plugin resolves `figma:asset/*` imports to `src/assets/` (leftover from the Figma Make export)
- Comment in the config warns not to remove the React/Tailwind plugins even if Tailwind looks unused

### Backend (`backend/app/`)

FastAPI app implementing the voice-chart pipeline behind one WebSocket route:

- `main.py` — app instance, CORS (allows the Vite dev origin), registers the router
- `api/websocket.py` — the `/ws/voice-chart` route: reads a `start` message, drives `reader()`/`writer()` tasks concurrently (pushing incoming audio chunks into the pipeline, streaming `partial_transcript` events back out) until a `stop` message, then finalizes and sends `chart_result`. **Known gap**: an abrupt client disconnect is not handled the same way as an explicit `stop` — `reader()` returns without calling `pipeline.stt.request_stop()`, so `writer()` can still be mid-loop and throw trying to send on the now-closed socket. Needs a fix before relying on this in anything but the happy path.
- `schemas/chart.py` — Pydantic models for every WS message and pipeline stage (`STTResult`, `NERResult`, `SoapChart`, etc.); `SoapChart`'s field names match the frontend `Visit`/`NewVisitForm` fields 1:1 by design
- `services/{stt,ner,llm}/` — each stage is a `Protocol` (`base.py`) with a `Mock*` implementation (`mock.py`). `services/orchestrator.py`'s `StreamingChartPipeline` is the single place the three engines are wired together — swapping in a real engine later means adding a new class implementing the same Protocol and changing the three assignments in `StreamingChartPipeline.__init__`
- STT and the LLM are both intended to eventually run **local** models (a Whisper-family model, a local LLM — not external APIs). Local inference is a blocking CPU/GPU operation, so a real implementation must run it in a thread pool (`run_in_executor`) rather than directly in the async WS handler, to avoid blocking the event loop for other connections

**Suicidal-ideation handling**: the LLM stage must never fabricate suicide/self-harm content — not even a denial phrase like "자살사고 부인함" — when the source transcript doesn't actually mention the topic; that's a hallucination, not a safe default. Only reflect it in `s`/`risk` when the transcript explicitly references it. `services/llm/mock.py` enforces this today via a keyword check (`_SUICIDE_KEYWORDS`); any real LLM's system prompt must carry the same rule.
