# melvo.fun — working rules

Read before any task:
- `docs/PLAN.md` — the chunk you are building and what is already done.
- `docs/SYSTEM_DESIGN.md` — stack, data model, authorization, flows. Follow it; if you must deviate, update it in the same commit and say why.
- `docs/spec/` — product rules. Only the files the chunk names.

## Non-negotiables

- Every protected read and write goes through `src/server/services/*` and is authorized there via `src/server/authz/*`. Pages and route handlers never query the database directly.
- Course access is decided only by `getCourseAccess` and `getLessonGate`.
- Guests never get durable learning records. The DB trigger is the last line of defence, not the first.
- Every admin or mentor mutation writes an audit log entry in the same transaction.
- Validate all input with Zod at the boundary. Never trust prices, scores, deadlines or IDs from the browser.
- Passwords, tokens and reset links are stored only as hashes. Secrets come from validated env (`src/env.ts`).
- Money is integer paise. Times are stored UTC, shown in Asia/Kolkata.
- Every business rule touched gets a test named after the rule.

## Code style

- TypeScript strict. No `any`, no `@ts-ignore` without a reason in the same line.
- Small modules, named exports, plain functions. Server Components by default; `"use client"` only where interaction needs it.
- Comments explain *why*, not *what*. No commented-out code, no TODOs without an issue reference.
- No new dependency without a one-line justification in the commit message.

## Product and UI

- No AI features and no generic template look: no emoji in the UI, no sparkle icons, no gradient blobs, no filler or hype copy. Plain, specific words.
- Follow the MELVO design tokens in `src/styles/tokens.css`. Public pages use the full motion system; app screens use quiet, short transitions only.
- Mobile first for students. Dense, sortable, paginated tables for admin.
- WCAG 2.2 AA: contrast, keyboard, focus, reduced motion.

## Before you finish a chunk

1. `pnpm lint && pnpm typecheck && pnpm test` all pass (and `pnpm test:e2e` when the chunk says so).
2. Migrations generated and committed if the schema changed.
3. Tick the chunk in `docs/PLAN.md` and add a 3–5 line note of what was built and anything left for later.
4. Commit with a clear message and push.
