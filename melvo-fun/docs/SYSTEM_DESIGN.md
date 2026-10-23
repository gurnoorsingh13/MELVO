# melvo.fun — System Design

The learning portal for MELVO. This document is the technical source of truth. The product rules live in `docs/spec/`. Where the two disagree, the spec wins and this document gets fixed.

Scale target: hundreds of users now, built so tens of thousands need only bigger machines, not a rewrite.

---

## 1. Goals, in order

1. **Correct access.** Nobody sees a course they are not entitled to. Every check happens on the server.
2. **Never lose a student's work.** Progress, attempts, submissions, attendance and certificates are durable.
3. **Fast in India.** Server and database both in Mumbai. Pages feel instant on a mid-range phone on 4G.
4. **Cheap to run.** About ₹4,000 a month at launch, with no per-user fees.
5. **Boring to operate.** Managed services, one deployable app, no servers to patch.

## 2. Stack

| Concern | Choice | Why |
|---|---|---|
| App | **Next.js 15 (App Router) + TypeScript (strict)** | One codebase for the public site, student app, mentor app and admin. Server Components keep JS small. |
| Hosting | **Vercel Pro**, functions pinned to `bom1` (Mumbai) | Zero-ops deploys, preview URL per branch, global CDN. Pro is required for commercial use. |
| Database | **PostgreSQL on Supabase Pro**, region `ap-south-1` (Mumbai) | Same city as the functions: ~2 ms queries. Daily backups. Also provides Realtime and Storage, so one vendor covers three needs. |
| DB access | **Drizzle ORM** + `postgres` driver through Supabase's pooler (transaction mode) | Thin, typed SQL, no heavy runtime, works well with serverless connection limits. |
| Auth | **Built in-house**: Argon2id hashes, opaque session tokens in DB | The spec needs student IDs as logins, admin-issued accounts, instant suspension, lockout and "log out all devices". Hosted auth products fight these rules. |
| Realtime | **Supabase Realtime** (Broadcast + Presence), private channels | Live class push, lock and presence. Included in Supabase Pro (500 concurrent connections). |
| Files | **Supabase Storage**, private buckets, signed URLs | Notes, PDFs, assignment uploads, certificate PDFs. 100 GB included. |
| Video | **YouTube unlisted**, embedded with the IFrame API | Free and fast everywhere. See the caveat in §10. |
| Live class video | **Google Meet** link per session | Free. Our own class panel runs alongside Meet. |
| Email | **Resend** + React Email templates | 3,000 emails/month free. Sent through an outbox table so nothing is lost. |
| Payments | **Razorpay** Orders API + Checkout + webhooks | Indian methods (UPI, cards, netbanking). No monthly fee. |
| Rate limiting, short cache | **Upstash Redis** (Mumbai region) | Free tier covers login rate limits and lockout counters. |
| Background jobs | **Vercel Cron** + Postgres outbox; **Upstash QStash** for long jobs | Expiry sweeps, reminder emails, large imports. |
| Excel | **exceljs** | Template download, import parsing, error reports, credential sheets. |
| PDFs | **pdf-lib** + `qrcode` | Certificates and invoices generated on the server. |
| Validation | **Zod** | Every input at every boundary. |
| Errors / uptime | **Sentry** (free), **Better Stack** uptime (free) | Know about failures before users report them. |
| Tests | **Vitest** (unit + DB integration against real Postgres), **Playwright** (end to end) | Every business rule in the spec has a test. |
| CI | **GitHub Actions** | Lint, typecheck, tests, migrations check on every push. |

### Monthly cost at launch

| Item | Cost |
|---|---|
| Vercel Pro | $20 |
| Supabase Pro (Micro compute, 8 GB DB, 100 GB storage) | $25 |
| Upstash, Resend, Sentry, Better Stack, YouTube, Google Meet | Free tiers |
| Razorpay | ~2% per successful payment only |
| **Total fixed** | **~$45 (~₹3,900) a month** |

During development, use Supabase Free and Vercel Hobby. Switch both to paid before taking real users or payments: Supabase Free pauses idle projects, and Vercel Hobby forbids commercial use.

**When to spend more:** Supabase Small compute (+$15) above ~1,000 daily active users; Resend Pro ($20) above 3,000 emails a month; Bunny Stream for protected video (§10).

## 3. Architecture

```
Browser ──HTTPS──> Vercel CDN ──> Next.js (bom1)
                                   ├─ Server Components / Server Actions / Route Handlers
                                   │     └─ services/  (all business logic)
                                   │           └─ authz/ (every permission decision)
                                   ├─ Postgres  (Supabase, Mumbai)  ← source of truth
                                   ├─ Storage   (Supabase, signed URLs)
                                   ├─ Redis     (Upstash: rate limits)
                                   └─ Resend / Razorpay / QStash
Browser <──WebSocket── Supabase Realtime  (live class channels, JWT minted by our server)
Razorpay ──webhook──> /api/webhooks/razorpay
Vercel Cron ──> /api/cron/*  (expiry sweep, outbox, reminders)
```

Rules that keep it reliable:

- **The app is stateless.** All state is in Postgres. Any function instance can serve any request.
- **The database is the source of truth.** Realtime only *announces* changes; clients re-read state from the API after reconnecting.
- **Every write goes through `services/`.** Pages, actions and route handlers never touch the database directly.
- **Every permission decision goes through `authz/`.** One function decides course access (§6).
- **Side effects go through an outbox.** Emails and webhooks-to-process are rows in a table, retried by cron, so a crash never loses them.

## 4. Code layout

```
src/
  app/
    (public)/            landing, catalogue, course pages, free content, verify, legal
    (auth)/              login, first-login password change, forgot/reset password
    (learn)/learn/       student + guest app: home, courses, player, tests, class, doubts
    (mentor)/mentor/     mentor app: classes, live panel, attendance, grading, doubts
    (admin)/admin/       admin app (structure follows spec 01 §23)
    api/
      webhooks/razorpay/
      cron/              expire-access, outbox, reminders
      realtime/token/    mints short-lived Realtime JWTs
  server/
    db/                  schema/*.ts, migrations/, client.ts, seed.ts
    authz/               permissions.ts, course-access.ts, guards.ts
    services/            one file per domain: users, auth, courses, enrollments, guests,
                         progress, assessments, assignments, batches, sessions, attendance,
                         certificates, payments, imports, announcements, doubts, audit
    jobs/                outbox processor, expiry sweep, import worker
    email/               Resend client + React Email templates
    realtime/            channel names, server-side broadcast
  lib/                   pure helpers (dates in IST, ids, money in paise, zod schemas)
  components/
    ui/                  design-system primitives
    learn/ mentor/ admin/ public/
tests/
  unit/ integration/ e2e/
docs/
```

## 5. Data model

All primary keys are UUIDv7 (sortable, safe to expose). All times are `timestamptz`, stored in UTC and shown in IST. Money is integer paise. Soft deletes only where history matters (`deleted_at`).

### Identity and access

| Table | Key columns |
|---|---|
| `users` | `id`, `kind` (`STUDENT`, `GUEST`, `STAFF`), `login_id` (unique, case-insensitive: student ID or email), `email`, `phone`, `name`, `password_hash`, `password_temporary` (bool), `status` (`ACTIVE`, `INACTIVE`, `SUSPENDED`, `EXPIRED`), `account_expires_at`, `failed_logins`, `locked_until`, `totp_secret_enc`, `created_by`, timestamps |
| `roles`, `permissions`, `role_permissions`, `user_roles` | RBAC. Seeded roles: `SUPER_ADMIN`, `ADMIN`, `MENTOR`, `STUDENT`, `GUEST`. Ready for `INSTRUCTOR`, `CONTENT_MANAGER`, `SUPPORT`. |
| `sessions` | `id`, `user_id`, `token_hash` (SHA-256 of the cookie token), `created_at`, `last_seen_at`, `expires_at`, `ip`, `user_agent`, `revoked_at` |
| `password_reset_tokens` | `token_hash`, `user_id`, `expires_at`, `used_at` |
| `login_events` | `login_id_tried`, `user_id?`, `ip`, `success`, `reason`, `at` — for failed-login detection and the security screen |

`kind` is the **identity type** and never changes casually. Roles are **permissions**. A staff user can be both ADMIN and MENTOR. Converting a guest to a student is an explicit, audited operation.

### Content (one copy per course)

| Table | Key columns |
|---|---|
| `courses` | `slug`, `title`, `summary`, `description`, `thumbnail_key`, `status` (`DRAFT`, `PUBLISHED`, `ARCHIVED`), `listed` (shown in catalogue), `price_paise` (0 = free), `self_paced_enabled`, `class_mode_enabled`, `unlock_strategy` (`ALL_AT_ONCE`, `SEQUENTIAL`, `QUIZ_BASED`, `DATE_BASED`), `certificate_rule` (jsonb: min progress %, required assessments, min score) |
| `modules` | `course_id`, `position`, `title`, `unlock_at` (for `DATE_BASED`), `gate_assessment_id` (for `QUIZ_BASED`) |
| `lessons` | `module_id`, `position`, `title`, `kind` (`VIDEO`, `TEXT`, `RESOURCE`), `youtube_id`, `body` (sanitized rich text), `duration_seconds`, `free_preview` (visible to visitors) |
| `resources` | `course_id`, `lesson_id?`, `title`, `kind` (`FILE`, `LINK`), `storage_key` or `url` |
| `learning_tools` | `course_id?` (null = all courses), `title`, `url`, `description`, `position` |

### Enrollment and modes

| Table | Key columns |
|---|---|
| `groups` | `code` (e.g. `AI-2026-A`), `name` |
| `group_members` | `group_id`, `user_id` |
| `group_courses` | `group_id`, `course_id`, `mode`, `batch_id?` |
| `enrollments` | `user_id`, `course_id` (**unique pair**), `mode` (`SELF_PACED`, `CLASS_MODE`), `batch_id?`, `source` (`ADMIN`, `GROUP`, `PURCHASE`), `status` (`ACTIVE`, `COMPLETED`, `EXPIRED`, `REVOKED`), `starts_at`, `expires_at?` |
| `enrollment_mode_changes` | `enrollment_id`, `from_mode`, `to_mode`, `from_batch?`, `to_batch?`, `effective_from`, `changed_by`, `reason`, `at` |

Assigning a course to a group **creates one enrollment per member** (`source = GROUP`). Adding someone to the group later creates theirs. This keeps every access check a single indexed lookup.

### Guests

| Table | Key columns |
|---|---|
| `guest_requests` | `user_id`, `course_id`, `status` (`PENDING`, `APPROVED`, `REJECTED`, `EXPIRED`, `REVOKED`), `requested_at`, `decided_by`, `decided_at`, `access_starts_at`, `access_expires_at?` (null = no expiry), `note` |
| `guest_request_events` | full history of every change to a request |

Guests never get `enrollments`. Their access comes only from an `APPROVED` request whose window contains *now*.

### Progress (students only)

| Table | Key columns |
|---|---|
| `lesson_progress` | `enrollment_id`, `user_id`, `lesson_id`, `position_seconds`, `watched_seconds`, `completed_at` — unique (`user_id`, `lesson_id`) |
| `course_progress` | `enrollment_id` (PK), `percent`, `lessons_done`, `last_lesson_id`, `last_accessed_at`, `completed_at` — kept up to date in the same transaction as `lesson_progress`, so dashboards read one row |
| `activity_events` | `user_id`, `type`, `ref_type`, `ref_id`, `at` — the "Recent activity" feed |

### Assessments and assignments

| Table | Key columns |
|---|---|
| `assessments` | `course_id`, `module_id?`, `batch_id?` (batch-only tests), `kind` (`QUIZ`, `TEST`, `POLL`), `title`, `duration_seconds?`, `pass_percent`, `max_attempts`, `opens_at?`, `closes_at?`, `reveal` (`NEVER`, `AFTER_SUBMIT`, `AFTER_PUBLISH`), `results_published_at?` |
| `questions` | `assessment_id`, `position`, `type` (`MCQ_SINGLE`, `MCQ_MULTI`, `SHORT_ANSWER`), `prompt`, `options` (jsonb), `answer` (jsonb, **never sent to the browser**), `points` |
| `attempts` | `assessment_id`, `user_id`, `started_at`, `deadline_at`, `submitted_at`, `score`, `max_score`, `status` (`IN_PROGRESS`, `SUBMITTED`, `EVALUATED`) |
| `attempt_answers` | `attempt_id`, `question_id`, `response` (jsonb), `correct`, `points_awarded`, `feedback` |
| `assignments` | `course_id`, `module_id?`, `batch_id?`, `title`, `brief`, `due_at`, `max_points` |
| `submissions` | `assignment_id`, `user_id`, `text`, `files` (storage keys), `status` (`IN_PROGRESS`, `SUBMITTED`, `EVALUATED`), `submitted_at`, `points`, `feedback`, `graded_by` |

The deadline of a timed test is checked on the server (`deadline_at`). The browser timer is only a display.

### Class mode

| Table | Key columns |
|---|---|
| `batches` | `course_id`, `name`, `starts_on`, `ends_on`, `weekdays`, `start_time`, `timezone`, `navigation` (`CONTROLLED`, `FLEXIBLE`), `capacity`, `status` |
| `batch_mentors` | `batch_id`, `user_id` |
| `class_sessions` | `batch_id`, `starts_at`, `ends_at`, `topic`, `module_id?`, `lesson_ids` (array), `mentor_id`, `status` (`SCHEDULED`, `LIVE`, `COMPLETED`, `CANCELLED`), `meet_url`, `current_lesson_id`, `navigation_locked`, `unlocked_through_lesson_id`, `started_at`, `ended_at`, `notes` |
| `batch_progress` | `batch_id` (PK), `current_module_id`, `current_lesson_id`, `modules_completed` |
| `presence_intervals` | `session_id`, `user_id`, `joined_at`, `last_seen_at`, `left_at?` |
| `attendance` | `session_id`, `user_id` (unique pair), `first_joined_at`, `last_left_at`, `duration_seconds`, `percent`, `status` (`PRESENT`, `LATE`, `ABSENT`, `EXCUSED`), `source` (`AUTO`, `MANUAL`) |
| `attendance_changes` | `attendance_id`, `changed_by`, `at`, `previous`, `new`, `reason` |

### Communication

| Table | Key columns |
|---|---|
| `announcements` | `scope` (`PLATFORM`, `COURSE`, `BATCH`, `SESSION`), `scope_id?`, `author_id`, `title`, `body`, `published_at`, `pinned` |
| `announcement_reads` | `announcement_id`, `user_id`, `read_at` |
| `doubts` | `user_id`, `course_id`, `module_id?`, `lesson_id?`, `title`, `status` (`OPEN`, `ANSWERED`, `RESOLVED`), `assigned_mentor_id?` |
| `doubt_messages` | `doubt_id`, `author_id`, `body`, `attachments`, `at` |
| `hand_raises`, `session_questions` | Phase 2 (live raise hand, live Q&A). Tables reserved, not built in MVP. |
| `mentor_profiles` | `user_id`, `photo_key`, `bio`, `expertise`, `experience` |

### Certificates

| Table | Key columns |
|---|---|
| `certificates` | `code` (unique, e.g. `MF-7K3Q-9XPA`, no ambiguous characters), `user_id`, `enrollment_id`, `course_id`, snapshot of `student_name`, `student_login_id`, `course_title`, `completed_on`, `issued_at`, `status` (`VALID`, `REVOKED`), `revoked_reason`, `pdf_key` |

The snapshot means a certificate still verifies correctly if the course is renamed later.

### Payments

| Table | Key columns |
|---|---|
| `orders` | `user_id?`, `buyer_email`, `buyer_name`, `buyer_phone`, `course_id`, `amount_paise`, `discount_paise`, `coupon_id?`, `razorpay_order_id` (unique), `status` (`CREATED`, `PAID`, `FAILED`, `REFUNDED`), timestamps |
| `payments` | `order_id`, `razorpay_payment_id` (unique), `method`, `amount_paise`, `status`, `captured_at` |
| `refunds` | `payment_id`, `razorpay_refund_id`, `amount_paise`, `reason`, `by` |
| `coupons` | `code`, `percent_off` or `amount_off_paise`, `course_id?`, `max_redemptions`, `valid_until` |
| `invoices` | `order_id`, `number` (sequential per financial year, e.g. `MF/2026-27/000123`), `gstin?`, `tax_paise`, `pdf_key` |
| `webhook_events` | `provider`, `event_id` (**unique**, gives idempotency), `type`, `payload`, `processed_at`, `error` |

### Platform

| Table | Key columns |
|---|---|
| `audit_logs` | `at`, `actor_id`, `action`, `target_user_id?`, `target_course_id?`, `target_type`, `target_id`, `result` (`SUCCESS`, `DENIED`, `FAILED`), `metadata` (jsonb), `ip` — **append only** |
| `import_jobs` | `created_by`, `file_key`, `status`, `total_rows`, `created`, `assigned`, `errors`, `error_report_key`, `credentials_key_enc`, `credentials_expire_at` |
| `outbox` | `kind` (`EMAIL`, …), `payload`, `attempts`, `next_attempt_at`, `sent_at`, `last_error` |
| `settings` | key/value: default guest durations, lockout thresholds, session lengths, company profile, maintenance mode |

### Rules enforced by the database itself

These hold even if application code has a bug.

1. **Guests cannot have durable learning records.** A trigger on `lesson_progress`, `course_progress`, `attempts`, `attempt_answers`, `submissions`, `attendance` and `certificates` raises an error when the row's user has `kind = 'GUEST'`.
2. **Audit logs cannot be changed.** A trigger rejects `UPDATE` and `DELETE` on `audit_logs`, and the app's database role has only `INSERT`/`SELECT` on it.
3. **One enrollment per student per course.** Unique (`user_id`, `course_id`).
4. **Class mode needs a batch.** Check constraint: `mode = 'CLASS_MODE'` ⇔ `batch_id IS NOT NULL`, and the batch's course must match (trigger).
5. **Paid once.** Unique `razorpay_order_id`, `razorpay_payment_id`, `webhook_events.event_id`.
6. **Certificate codes are unique**, and a certificate is never deleted, only revoked.

### Indexes that matter

`users(lower(login_id))`, `sessions(token_hash)`, `enrollments(user_id, status)`, `guest_requests(user_id, course_id, status)`, `lesson_progress(user_id, lesson_id)`, `class_sessions(batch_id, starts_at)`, `attendance(session_id)`, `certificates(code)`, `audit_logs(at desc)`, `audit_logs(target_user_id, at desc)`, `outbox(next_attempt_at) where sent_at is null`.

## 6. Authorization

### The one access function

```ts
getCourseAccess(user | null, courseId): Promise<CourseAccess>

type CourseAccess =
  | { allowed: false; reason: "LOGIN_REQUIRED" | "NOT_ENROLLED" | "REQUEST_PENDING"
      | "REQUEST_REJECTED" | "ACCESS_EXPIRED" | "ACCESS_REVOKED" | "ACCOUNT_INACTIVE"
      | "ACCOUNT_SUSPENDED" | "ACCOUNT_EXPIRED" | "COURSE_UNAVAILABLE" }
  | { allowed: true; as: "GUEST"; persistProgress: false; expiresAt: Date | null }
  | { allowed: true; as: "STUDENT"; persistProgress: true; enrollmentId: string;
      mode: "SELF_PACED" | "CLASS_MODE"; batchId: string | null }
  | { allowed: true; as: "STAFF"; persistProgress: false }   // preview as admin/mentor
```

Every lesson, resource, assessment, assignment, class and certificate endpoint calls this first. Then a second function decides whether a **specific lesson** is reachable:

```ts
getLessonGate(access, lessonId): Promise<{ open: true } | { open: false; reason; opensAt? }>
```

It applies the unlock strategy for self-paced, and the mentor's lock state for a live controlled class. Locked lessons never send their video ID, body or resources to the browser.

### Permissions

Permissions are strings like `students.create`, `guests.approve`, `courses.edit`, `batches.manage`, `attendance.correct`, `audit.view`. Roles map to permissions in seed data. Server code calls `requirePermission(actor, "guests.approve")`. Mentors get extra **scoping**: a mentor may only act on batches listed in `batch_mentors` for them. Scoping is checked in the service, not just the page.

### Status checks on every request

Session lookup joins `users` and rejects any user who is not `ACTIVE` or whose `account_expires_at` has passed. Suspending a user also revokes all their sessions in the same transaction, so access ends on the very next request.

### Expiry

Expiry is checked **at the moment of access** (`access_expires_at > now()`), so it is exact to the second and never depends on a job running. A cron job every 15 minutes also flips stored statuses to `EXPIRED` (for lists and reports) and queues reminder emails one day before expiry.

## 7. Authentication

- **Passwords:** Argon2id via `@node-rs/argon2` (memory 19 MiB, 2 iterations, parallelism 1, the OWASP baseline). Minimum 10 characters, checked against a small list of very common passwords. No composition rules.
- **Temporary passwords:** 12 random characters from an unambiguous alphabet. `password_temporary = true` forces the change screen before anything else; every other route refuses until it's done.
- **Sessions:** a 256-bit random token in a `__Host-mf_session` cookie (`HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`). Only its SHA-256 hash is stored. Sliding expiry: students and guests 14 days idle and 60 days absolute; staff 12 hours. `last_seen_at` is written at most once every 5 minutes, which keeps database writes low.
- **Logout all devices:** set `revoked_at` on every session of the user.
- **Staff two-factor:** TOTP (authenticator app) is required for ADMIN and MENTOR, with one-time recovery codes.
- **Rate limits** (Upstash): login 10 per minute per IP and 5 per minute per login ID; password reset 3 per hour per account.
- **Lockout:** after 8 consecutive failures, the account locks for 15 minutes and doubles each time up to 24 hours. The admin can unlock it. Failures are logged in `login_events`, and a spike raises an alert in the Security screen.
- **Forgot password:** a reset link by email through Resend (a single-use token valid 30 minutes; only its hash is stored). Students without an email see "Contact your admin". The admin reset generates a new temporary password; the old password is never shown, because it is never stored.
- **CSRF:** `SameSite=Lax` cookies plus an `Origin` check on every mutating request. Server Actions also verify the origin.
- **Headers:** strict CSP (YouTube, Razorpay and Supabase allowed explicitly), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `frame-ancestors 'none'`.

## 8. Guest flow

1. The admin creates guest accounts, one at a time or in bulk with the same Excel importer (`kind = GUEST`). The guest gets credentials and must change the password at first login.
2. The guest browses the catalogue and taps **Request access** on a course. This creates a `guest_requests` row, one per course.
3. The admin opens **Course requests** and approves with a duration (1 day, 7 days, 30 days, custom, no expiry), rejects, revokes or extends. Every action is audited and kept in `guest_request_events`.
4. The guest learns. **Progress lives only in the browser tab's memory** (React state, not `localStorage`). Quiz answers are graded by the server and returned, but nothing is stored. Reloading starts fresh, as the spec requires.
5. When the access window ends or is revoked, the very next request is refused.

## 9. Live class (class mode)

### Channels

- One private Supabase Realtime channel per live session: `class:{sessionId}`.
- `/api/realtime/token` mints a JWT valid for 1 hour, signed with the Supabase JWT secret. It holds the user ID and the session IDs they may join. A Realtime authorization policy on `realtime.messages` checks that claim, so a student cannot listen to another batch's class.

### Who does what

- **The mentor never broadcasts directly.** "Push lesson", "Lock navigation", "Unlock next", "Start quiz", "Announcement" and "End class" each call our API. The API checks the mentor is assigned to the batch, writes the new state to `class_sessions` (and `announcements` or `assessments`), writes the audit log, and then broadcasts a small event like `{ type: "lesson.pushed", lessonId, version }`.
- **Students follow events, but trust the database.** On every event and on every reconnect, the student's page re-reads `GET /api/class/{id}/state`. A missed WebSocket message can therefore never leave a student on the wrong lesson.
- **Controlled navigation is enforced on the server.** While a session is `LIVE` and `navigation_locked`, `getLessonGate` refuses lessons after `unlocked_through_lesson_id` for students in that batch.

### Presence and attendance

- The live panel shows online, idle and offline counts from **Realtime Presence**: instant, but not stored.
- Attendance comes from a **heartbeat**: the student's class page calls `POST /api/class/{id}/heartbeat` every 30 seconds while visible. This extends their open `presence_intervals` row or opens a new one. A gap of more than 90 seconds closes the interval, which counts as disconnected.
- When the class ends, attendance is computed from the intervals: first join, last leave, total minutes, percentage of the session, and status (`PRESENT` at 75% or more, `LATE` if they joined more than 10 minutes after start; both thresholds are settings). Mentors can correct a record; each correction stores the previous value, the new value, who changed it and why.
- **Load at 100 students:** about 200 small writes a minute. Postgres handles that easily.

Google Meet runs in its own tab. Our panel is what controls lessons, presence and attendance, so attendance means "was on the class page", not "was in the Meet call". Meet's own attendance reports need a paid Google Workspace plan, and they can be added later.

## 10. Video

Lessons store a YouTube video ID. The ID is only sent to users who pass `getCourseAccess` and `getLessonGate`. Playback uses the YouTube IFrame API, so the player can report watch time and position for progress and resume.

**Be aware:** unlisted YouTube is *not* protected. Anyone who receives the link can watch and share it. That is acceptable at launch. If paid content needs real protection later, switch lessons to **Bunny Stream** (about $5 per month at this scale, with signed URLs). The `lessons` table already allows a different video provider without changing anything else.

## 11. Payments (Razorpay)

**Who can buy:** paid courses show a **Buy** button to visitors and logged-in users.

1. The buyer enters name, email and phone (prefilled when logged in) and an optional coupon. The server creates an `orders` row and a Razorpay Order for the exact amount computed on the server. The browser never sends a price.
2. Razorpay Checkout opens. On success, the browser posts the payment ID, order ID and signature to our server, which verifies the HMAC signature and shows a "confirming your payment" screen.
3. **The webhook is what grants access.** `payment.captured` arrives at `/api/webhooks/razorpay`. We verify the webhook signature, insert into `webhook_events` (a duplicate event ID ends here, giving idempotency), and then in one transaction: mark the order `PAID`, record the payment, and create or find the buyer's **student account** (`kind = STUDENT`, with a temporary password emailed through the outbox). We then create a `SELF_PACED` enrollment with `source = PURCHASE`, issue the invoice number, and write the audit log.
4. A reconciliation cron runs every 30 minutes. It asks Razorpay about orders stuck in `CREATED` for more than 15 minutes, so a lost webhook never means a paid student without access.
5. Refunds are started by the admin through the Razorpay API. A refund can optionally revoke the enrollment, and it is audited.

GST invoices: if MELVO is GST-registered, invoices carry the GSTIN and tax breakdown. Otherwise they are plain receipts. Either way, numbering is sequential per financial year with no gaps (a dedicated counter row, locked with `SELECT … FOR UPDATE`).

## 12. Certificates

- **Eligibility** comes from `courses.certificate_rule`: for example, progress of 100%, all required assessments passed, and an average of at least 60%. It is checked automatically when progress or results change, and admins can also issue certificates manually.
- **Issuing** inserts the row with a unique code (8 characters from `ABCDEFGHJKMNPQRSTUVWXYZ23456789`, formatted `MF-XXXX-XXXX`), generates the PDF with pdf-lib, stores it privately, and notifies the student.
- **Verification** is a public page at `melvo.fun/verify` (enter a code) and `melvo.fun/verify/MF-XXXX-XXXX` (the QR code on the PDF points here). It shows the name, student ID with the middle masked, the course, the completion date, the issue date and the status (valid or revoked). No login is needed. Lookups are rate-limited to stop people guessing codes.
- Guests never get certificates, and the database trigger enforces that.

## 13. Bulk import

1. The admin downloads `students-template.xlsx` with columns Name, Student ID (optional: generated if blank, from a settings prefix such as `STU` plus a running number), Email, Phone, Group, Course, Mode, Batch. It includes a hidden sheet of valid group, course and batch codes for dropdowns.
2. Upload goes straight to Storage with a signed upload URL, then `import_jobs` is created.
3. **Validation pass** (nothing written yet): required fields, email format, duplicate IDs inside the file, IDs that already exist, unknown groups, courses or batches, a mode the course doesn't support, and class mode without a batch. Each problem becomes a row in the error report: row number, field, value, reason and suggested fix.
4. The admin sees a preview ("337 will be created, 5 have errors") and chooses **Import valid rows** or **Cancel**.
5. **Write pass** in transactions of 100 rows. Up to about 2,000 rows runs inline; above that it runs through QStash in the background with a progress bar.
6. Results offer **Download error report** (xlsx) and **Download credentials** (xlsx). The credentials file is encrypted at rest with AES-256-GCM, can be downloaded for 24 hours, and is then deleted automatically. Temporary passwords exist only in that file; the database stores only their hashes.
7. The whole import writes one audit entry plus per-account entries.

## 14. Email (Resend)

Templates: credentials (welcome), password reset, guest request approved or rejected, access expiring tomorrow, test published, result published, assignment due tomorrow, class starting in 30 minutes, certificate issued, payment receipt.

Every email is written to `outbox` inside the same transaction as the change that caused it. A cron job every minute sends pending emails with retry and backoff. Users can turn off non-essential emails. Security emails (credentials, reset, lockout) cannot be turned off.

## 15. Performance

- Functions in `bom1` and the database in `ap-south-1`, so every query is a same-city round trip.
- Public pages (landing, catalogue, course pages, verify) are statically generated, refreshed on publish with `revalidateTag`, and served from the CDN.
- The student home page is one Server Component. It makes about 6 parallel, indexed queries against denormalized rows (`course_progress`, upcoming `class_sessions`, open `assessments`, due `assignments`, latest `announcements`). Target: under 150 ms on the server.
- Lists are paginated with keyset pagination, never `OFFSET` on big tables.
- Client JavaScript stays small: Server Components by default, client components only for the player, live panel, forms and charts.
- Images go through `next/image`; thumbnails are stored at their display size.
- Budgets checked in CI: largest contentful paint under 2.0 s on a mid-range Android over 4G for the landing page and student home; 170 kB maximum of first-load JS on student routes.

## 16. Reliability and operations

- **Backups:** Supabase daily backups, kept 7 days on Pro, plus a weekly `pg_dump` to separate storage through a GitHub Action. Point-in-time recovery is an add-on to buy once revenue justifies it.
- **Migrations:** Drizzle Kit. Every migration is committed and reviewed, and CI checks the schema matches. Migrations are expand-then-contract, so deploys never need downtime.
- **Environments:** local (Docker Postgres), staging (a separate Supabase Free project plus Vercel preview), production. Production secrets exist only in Vercel.
- **Monitoring:** Sentry for errors in server and browser; Better Stack pings `/api/health` (which checks the database) every minute; a Vercel log drain for audit-adjacent events.
- **Idempotency:** webhook events, imports and certificate issuance can all be safely retried.
- **Time:** all scheduling is done in `Asia/Kolkata` with `date-fns-tz`. All storage is UTC.

## 17. Privacy and legal (India, DPDP Act 2023)

- Privacy policy, terms and refund policy pages, required by Razorpay too.
- Only data that's needed is collected. Phone is optional unless payment needs it.
- A student can request an export of their data, or deletion. Deletion anonymizes personal fields but keeps certificate verification and financial records, which the law requires.
- Admin views mask phone numbers and emails in lists. They are shown in full only on the detail page, which needs a permission.

## 18. Testing strategy

- **Every business rule in `docs/spec/` has a test named after it**, for example `rule-03 guest approval for course A does not grant course B`.
- **Integration tests** run against a real Postgres (Docker in CI) and call `services/` directly. That covers authorization, the database triggers, imports, payments (with a mocked Razorpay) and attendance computation.
- **End-to-end (Playwright):** login and forced change, guest request through approval and expiry, student learning and resume, a mentor pushing a lesson to a student in another browser, Razorpay test-mode checkout, certificate verification.
- CI blocks a merge on lint, typecheck, unit, integration or e2e failure.

## 19. Design

Follows the MELVO brand system (`brand/BRAND.md` in the melvo.in repo). melvo.fun is the louder sibling: Firozi on Ink, with Haldi for tags.

- **Public pages** (landing, catalogue, course page, verify) reuse the melvo.in motion system: GSAP and Lenis, theme swap on scroll, line reveals and stacking cards.
- **Inside the app** (student, mentor, admin) the same tokens, type and radius apply, but motion is quiet: short fades only, nothing that delays a task. Dense, readable tables for admins. Large tap targets and a bottom navigation bar for students on phones.
- No AI features, no chatbot, and no generic template look: no emoji in the interface, no gradient blobs, no sparkle icons, no filler copy. Copy is plain and specific: "3 lessons left in Module 2", not "You're on fire!"
- Accessibility: WCAG 2.2 AA contrast, full keyboard use, visible focus, captions on YouTube where available, and reduced-motion support.

## 20. Phase 2 (designed for, not built in MVP)

Live polls, raise hand, live questions, live quiz results, class chat, live coding tasks, session recordings, advanced analytics, automated notifications (WhatsApp/SMS), Bunny Stream video, Meet attendance import, more roles (Instructor, Content manager, Support). Each adds tables and screens alongside the existing ones. None changes Course → Mode → Enrollment.
