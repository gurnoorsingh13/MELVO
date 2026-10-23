# melvo.fun — Build plan

Build in this order. Each chunk is one Claude Code session. Paste only the prompt under the chunk; everything else is read from the repo.

**Tips to save tokens**
- Start a fresh session per chunk. Don't paste the spec; the prompts point to files.
- If a chunk runs long, end the session after a commit and continue with: "Continue chunk N from docs/PLAN.md. Check git log for what's done."
- When a chunk finishes, the session ticks it below and writes a short note. The next session reads only that.

## Status

- [ ] 0 — Project setup
- [ ] 1 — Database schema and DB-level rules
- [ ] 2 — Authentication
- [ ] 3 — Authorization core and audit log
- [ ] 4 — Admin shell, staff, roles, settings
- [ ] 5 — Course builder
- [ ] 6 — Students, groups, enrollment, mode switching
- [ ] 7 — Bulk Excel import
- [ ] 8 — Guests and course requests
- [ ] 9 — Public site and catalogue
- [ ] 10 — Learning player (self-paced) and progress
- [ ] 11 — Tests and quizzes
- [ ] 12 — Assignments
- [ ] 13 — Student home, announcements, notes, tools, mentor and company
- [ ] 14 — Batches and class scheduling
- [ ] 15 — Live class: realtime, presence, attendance
- [ ] 16 — Mentor dashboard and doubts
- [ ] 17 — Certificates and public verification
- [ ] 18 — Payments (Razorpay)
- [ ] 19 — Reports and analytics
- [ ] 20 — Hardening and launch

## Notes from finished chunks

(Each session appends here.)

---

## Prompts

### Chunk 0 — Project setup

```
Read CLAUDE.md and docs/SYSTEM_DESIGN.md (sections 2, 4, 16, 19). Build chunk 0 of docs/PLAN.md.

Set up the melvo.fun repo:
- Next.js 15 App Router, TypeScript strict, pnpm, ESLint + Prettier, path alias @/.
- src/env.ts: Zod-validated env (DATABASE_URL, DIRECT_URL, SESSION_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET, UPSTASH_*, RESEND_API_KEY, RAZORPAY_*, APP_URL, ENCRYPTION_KEY). App fails fast if missing. .env.example committed.
- Drizzle ORM + postgres driver, drizzle.config.ts, empty schema folder, db client using the pooled URL.
- docker-compose.yml with Postgres 16 for local dev and tests.
- Vitest (unit + integration project that uses the docker DB), Playwright configured with one smoke test.
- GitHub Actions: install, lint, typecheck, unit, integration (Postgres service), build.
- vercel.json with functions region bom1 and placeholders for crons.
- Design tokens in src/styles/tokens.css from the MELVO brand (Paper #EEF0EA, Ink #0B1A16, Bottle Green #0B4A44, Firozi #22C4CF, Haldi #E9AE36; Archivo via next/font). Route groups (public), (auth), (learn), (mentor), (admin) with empty layouts.
- /api/health that checks the DB.
- Copy docs/ and CLAUDE.md already in the repo; don't change them except PLAN.md status.

Done when: pnpm dev runs, pnpm lint/typecheck/test pass, CI is green. Tick chunk 0, add notes, commit, push.
```

### Chunk 1 — Database schema and DB-level rules

```
Read CLAUDE.md and docs/SYSTEM_DESIGN.md section 5. Build chunk 1 of docs/PLAN.md.

- Implement every table in section 5 as Drizzle schema files grouped by domain (identity, content, enrollment, guests, progress, assessments, classes, communication, certificates, payments, platform). UUIDv7 ids, timestamptz, enums, FKs, unique constraints and the listed indexes.
- Write a custom SQL migration for the DB-level rules: guest-records trigger on the listed tables, append-only audit_logs trigger, class-mode-needs-batch check plus batch-course match trigger, never-delete certificates.
- Seed script: roles and permissions (permission strings per section 6), one SUPER_ADMIN from env, one demo course with 3 modules and 8 lessons, one group, two students, one guest, one mentor, one batch with 4 sessions.
- Integration tests proving each DB rule: inserting lesson_progress/attempt/certificate for a guest fails; updating or deleting audit_logs fails; class mode without batch fails; duplicate enrollment fails.

Done when: migrations apply cleanly on an empty DB, seed runs, tests pass. Tick, note, commit, push.
```

### Chunk 2 — Authentication

```
Read CLAUDE.md, docs/SYSTEM_DESIGN.md sections 7 and 14, docs/spec/01-access.md (credentials, passwords, login security). Build chunk 2.

- Argon2id hashing, opaque session tokens (hash stored), __Host- cookie, sliding expiry per user kind, last_seen throttle.
- Login by login_id (student ID or email) + password. Status check on login and every request (ACTIVE only, account expiry). Suspension revokes all sessions.
- Rate limits with Upstash; lockout with doubling duration; login_events recorded.
- Forced password change for temporary passwords (blocks all other routes).
- Logout, logout all devices, a "Your sessions" page listing active sessions with revoke.
- Staff TOTP 2FA with recovery codes, required for ADMIN and MENTOR.
- Forgot password: Resend email with single-use 30-minute link (hash stored); "Contact your admin" when no email. Email outbox table processing via /api/cron/outbox. React Email templates for reset and credentials.
- CSRF origin check helper used by all mutations. Security headers in middleware.
- Screens: login, first-login change password, forgot, reset, 2FA setup and verify. Quiet, branded UI.
- Tests: hashing, lockout, suspended user blocked mid-session, temp password gate, reset token single use, rate limit.

Tick, note, commit, push.
```

### Chunk 3 — Authorization core and audit log

```
Read CLAUDE.md, docs/SYSTEM_DESIGN.md section 6, docs/spec/01-access.md (rules), docs/spec/02-learning-modes.md (permissions). Build chunk 3.

- src/server/authz: requireUser, requirePermission, mentor batch scoping helper, getCourseAccess (all reasons in section 6), getLessonGate (unlock strategies + live controlled navigation; class state can be stubbed until chunk 15 but the interface must be final).
- src/server/services/audit.ts: audit(tx, {...}) used inside the caller's transaction; DENIED results logged for blocked admin actions.
- Test file per critical business rule (rules 1–12 in spec 01) that can be tested at this layer, named "rule-NN ...". Cover guest A-not-B, expiry to the second, revoked, suspended, unassigned student, group-assigned student.

Tick, note, commit, push.
```

### Chunk 4 — Admin shell, staff, roles, settings

```
Read CLAUDE.md and docs/spec/01-access.md (admin module structure, roles). Build chunk 4.

- Admin layout: sidebar following the admin module structure, top bar with search and account menu, breadcrumb. Reusable data table (server-side keyset pagination, sort, filters, CSV export), form, dialog, toast, empty and error states.
- Dashboard with real counts (students, guests, pending requests, live/upcoming classes, revenue this month placeholder until chunk 18).
- Staff management: create staff, assign roles, deactivate, reset 2FA. Roles & permissions view (read-only matrix + assign).
- Settings: guest default durations, lockout thresholds, session lengths, student ID prefix, company profile, maintenance mode.
- Security: login activity, active sessions (revoke), audit log viewer with filters.
- Everything audited and permission-checked server-side.

Tick, note, commit, push.
```

### Chunk 5 — Course builder

```
Read CLAUDE.md, docs/SYSTEM_DESIGN.md (content tables, section 10), docs/spec/02-learning-modes.md (course configuration, unlock strategy). Build chunk 5.

- Admin: create/edit courses (info, thumbnail upload to Supabase Storage, price, listed, status), mode toggles, unlock strategy and its settings (module dates, gate quizzes), certificate rule.
- Modules and lessons with drag-to-reorder; lesson types VIDEO (YouTube URL → id, duration fetched or entered), TEXT (sanitized rich text editor), RESOURCE. Free preview flag.
- Resources (file upload via signed URL, or link). Learning tools CRUD.
- Admin preview of a course as a student would see it.
- Publishing revalidates public pages.
- Tests: reorder integrity, unlock config validation, a course can't be published with zero lessons, class mode can't be disabled while active class enrollments exist.

Tick, note, commit, push.
```

### Chunk 6 — Students, groups, enrollment, mode switching

```
Read CLAUDE.md, docs/spec/01-access.md (student, groups, statuses), docs/spec/02-learning-modes.md (mode per enrollment, switching). Build chunk 6.

- Admin students: list with filters (status, group, course), create one, profile page (details, enrollments, progress summary, sessions, audit trail), status changes (activate, deactivate, suspend, expire), password reset (new temporary password shown once, emailed if email exists), unlock, convert guest to student.
- Groups: CRUD, members, assign courses to group with mode/batch → creates enrollments for members; adding/removing members updates enrollments.
- Individual course assignment with mode and batch.
- Mode switching with effective date; history recorded; progress untouched.
- Tests: rules 7 and 8, group enrollment fan-out, mode switch keeps progress, mentor cannot do any of this.

Tick, note, commit, push.
```

### Chunk 7 — Bulk Excel import

```
Read CLAUDE.md, docs/SYSTEM_DESIGN.md section 13, docs/spec/01-access.md (bulk sections). Build chunk 7.

- Template download (exceljs) with dropdown lists from a hidden sheet.
- Upload via signed URL → import_jobs. Validation pass with every check in section 13; preview summary; import valid rows or cancel.
- Write pass in transactions of 100; inline below 2,000 rows, QStash worker above with progress polling.
- Error report xlsx (row, field, value, reason, fix). Credentials xlsx encrypted with AES-256-GCM, downloadable 24 h, then deleted by cron.
- Works for students and guests.
- Tests: the example summary in the spec (duplicates, invalid email, missing course), re-running the same file creates nothing new, credentials file expires.

Tick, note, commit, push.
```

### Chunk 8 — Guests and course requests

```
Read CLAUDE.md, docs/SYSTEM_DESIGN.md section 8, docs/spec/01-access.md (guest sections). Build chunk 8.

- Guest side: catalogue with Request access, request status per course, approved courses with expiry shown.
- Admin: guest users list, Course requests dashboard (tabs pending/approved/rejected/expired/revoked), approve with duration presets or custom or none, reject with note, revoke, extend, request history. Emails on decision.
- Cron: mark expired, send "expires tomorrow".
- Tests: rules 2, 3, 4; revoke takes effect on next request; one request per course at a time.

Tick, note, commit, push.
```

### Chunk 9 — Public site and catalogue

```
Read CLAUDE.md, docs/SYSTEM_DESIGN.md sections 15 and 19, docs/spec/04-certificates-payments.md (required public pages). Build chunk 9.

- Landing page using the MELVO motion system (GSAP + Lenis, theme swap on scroll, line reveals, stacking cards). Content from src/content/site.ts so it's easy to edit.
- Catalogue and course detail pages (statically generated, revalidated on publish): outline, free preview lessons playable without login, price and Buy button placeholder, Request access for guests, Login for others.
- Free resources page. Privacy, terms, refund policy, contact pages.
- Login entry points, SEO metadata, sitemap, Open Graph images.
- Performance budget check in CI (Lighthouse CI on landing and a course page).

Tick, note, commit, push.
```

### Chunk 10 — Learning player and progress

```
Read CLAUDE.md, docs/SYSTEM_DESIGN.md sections 5 (progress), 6, 8 (guest), 10, docs/spec/02-learning-modes.md (self-paced). Build chunk 10.

- Course page for learners: modules/lessons with lock states and reasons from getLessonGate.
- Lesson player: YouTube IFrame API, resume position, mark complete at 90% watched or manual for text; notes and resources panel; previous/next respecting locks.
- Student progress: lesson_progress + course_progress in one transaction, throttled position saves (every 15 s and on pause/leave via sendBeacon), activity events.
- Guest mode: same UI, progress only in memory, no writes; banner explaining progress isn't saved and when access expires.
- Tests: each unlock strategy, resume, guest writes rejected (rule 5), student progress survives logout (rule 6), locked lesson never returns video id.

Tick, note, commit, push.
```

### Chunk 11 — Tests and quizzes

```
Read CLAUDE.md, docs/SYSTEM_DESIGN.md (assessment tables), docs/spec/03-student-home.md (tests, results). Build chunk 11.

- Admin/mentor: create quizzes and tests (MCQ single, MCQ multi, short answer), timing, windows, attempts, pass mark, reveal policy, publish results.
- Student: test intro, timed attempt with server deadline, autosave answers, submit, result page per reveal policy; short answers graded manually by mentor.
- Guest: can attempt, graded on server, nothing stored.
- QUIZ_BASED unlock wired to pass results.
- Tests: answers never sent to client, late submission rejected, max attempts, reveal policy, guest attempt not stored.

Tick, note, commit, push.
```

### Chunk 12 — Assignments

```
Read CLAUDE.md and docs/spec/03-student-home.md (assignments). Build chunk 12.

- Admin/mentor create assignments (course, module, optional batch), due dates.
- Student submission with text and file uploads (signed URLs, size and type limits), statuses including OVERDUE computed from due date.
- Mentor grading queue with points and feedback; student sees evaluation.
- Emails: due tomorrow, evaluated.
- Tests: status transitions, mentor can only grade own batches, guests cannot submit.

Tick, note, commit, push.
```

### Chunk 13 — Student home and communication

```
Read CLAUDE.md, docs/spec/03-student-home.md, docs/SYSTEM_DESIGN.md section 15. Build chunk 13.

- Student home in the spec's priority order, one Server Component with parallel indexed queries, under 150 ms server time with seed data ×100.
- Mobile bottom navigation: Home, Courses, Classes, Tests, More.
- Announcements (scopes, read state, View all), Notes page, Learning tools, Mentor & company page, Progress overview, Recent activity.
- Reduced guest home.
- Tests: home shows only the student's own data; announcement scoping.

Tick, note, commit, push.
```

### Chunk 14 — Batches and class scheduling

```
Read CLAUDE.md, docs/spec/02-learning-modes.md (class mode, batch, sessions, student class view), docs/SYSTEM_DESIGN.md (class tables). Build chunk 14.

- Admin: batches CRUD (course, mentors, students, dates, weekdays, time, navigation mode, capacity), generate sessions from the schedule, edit/cancel/reschedule single sessions, Meet link per session.
- Student: My class page (next class with Join, upcoming, completed, attendance summary, class progress, batch announcements).
- Emails: class in 30 minutes, schedule changed.
- Tests: session generation across weeks in IST, capacity, student sees only own batch.

Tick, note, commit, push.
```

### Chunk 15 — Live class

```
Read CLAUDE.md, docs/SYSTEM_DESIGN.md section 9, docs/spec/02-learning-modes.md (live panel, navigation modes, presence, attendance, class vs course progress). Build chunk 15.

- /api/realtime/token minting Supabase JWTs; Realtime authorization policy for private class channels.
- Mentor live panel: start class, push lesson, lock navigation, unlock next, start quiz, give assignment, announcement, end class. Each is an API call that persists state, audits, then broadcasts.
- Student live view: follows pushed lesson, refetches state on event and reconnect, controlled vs flexible navigation enforced by getLessonGate.
- Presence counts via Realtime Presence; heartbeat endpoint writing presence_intervals; attendance computed at end; manual correction with reason and history.
- batch_progress updated by the mentor's flow; course progress untouched by it.
- E2E: mentor in one browser pushes a lesson and the student in another follows; locked lesson refused by API; attendance computed from heartbeats.

Tick, note, commit, push.
```

### Chunk 16 — Mentor dashboard and doubts

```
Read CLAUDE.md, docs/spec/02-learning-modes.md (mentor dashboard), docs/spec/03-student-home.md (doubts). Build chunk 16.

- Mentor dashboard: my classes, today, upcoming, students per batch with progress and attendance, grading queue, announcements, class reports.
- Doubts: student creates a doubt tied to course/module/lesson with text, images and files; mentor inbox; replies; resolve. Live updates via Realtime. Emails on reply.
- Mentor profile editing.
- Tests: mentor scoping everywhere, student sees only own doubts.

Tick, note, commit, push.
```

### Chunk 17 — Certificates

```
Read CLAUDE.md, docs/SYSTEM_DESIGN.md section 12, docs/spec/04-certificates-payments.md. Build chunk 17.

- Eligibility check on progress/result changes; manual issue and revoke with reason.
- Code generation, branded PDF with QR (pdf-lib), private storage, student download.
- Public /verify and /verify/[code] pages, rate-limited, no login.
- Tests: guest never eligible, revoked shows revoked, renamed course still verifies with original title, code uniqueness under concurrent issue.

Tick, note, commit, push.
```

### Chunk 18 — Payments

```
Read CLAUDE.md, docs/SYSTEM_DESIGN.md section 11, docs/spec/04-certificates-payments.md. Build chunk 18.

- Buy flow on course page: buyer details, coupon, server-created Razorpay order, Checkout, signature verification, "confirming" screen.
- Webhook with signature check, webhook_events idempotency, single transaction granting the student account + enrollment, outbox email with credentials and receipt.
- Reconciliation cron for stuck orders. Invoice numbering per financial year with locked counter; receipt/GST invoice PDF.
- Admin: orders, refunds (optional revoke), coupons. Dashboard revenue.
- Tests with mocked Razorpay: duplicate webhook grants once, tampered amount rejected, lost webhook recovered by reconciliation, existing student gets course added.

Tick, note, commit, push.
```

### Chunk 19 — Reports and analytics

```
Read CLAUDE.md, docs/spec/02-learning-modes.md (reports). Build chunk 19.

- Course report, batch report, student report, attendance report, results report, revenue report. Filters by date range, course, batch, group. CSV/XLSX export.
- Charts kept simple and accessible. Queries indexed; heavy ones use materialized views refreshed by cron if needed.
- Mentors see only their batches.

Tick, note, commit, push.
```

### Chunk 20 — Hardening and launch

```
Read CLAUDE.md and docs/SYSTEM_DESIGN.md sections 15–18. Build chunk 20.

- Security review of every route and action against authz; CSP final; dependency audit.
- Load test (k6) of login, home, lesson and a 100-student live class; fix anything over budget.
- Sentry, uptime checks, weekly pg_dump workflow, restore drill documented.
- Accessibility pass (axe in Playwright) on key screens.
- Data export and deletion (DPDP) for students.
- docs/RUNBOOK.md: deploy, rollback, rotate secrets, restore backup, common admin tasks.
- Production checklist: Supabase Pro + region, Vercel Pro + bom1, domains, Razorpay live keys and webhook, Resend domain verified.

Tick, note, commit, push.
```
