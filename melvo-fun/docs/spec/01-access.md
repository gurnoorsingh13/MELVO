# Spec 01 — Authentication, Access and User Management

## User types

| Type | Login | Course access | Approval | Progress saved |
|---|---|---|---|---|
| Visitor (no login) | No | Public and free content only | — | No |
| Guest | Yes (account issued by admin) | Approved courses only | Per course | **Never** |
| Student | Yes (account issued by admin, or created by purchase) | Assigned or purchased courses | Admin-controlled | Yes |
| Mentor | Yes (staff) | Assigned batches | — | — |
| Admin | Yes (staff, 2FA) | Everything | — | — |

Identity, authentication, account status, course authorization, learning access and progress persistence are separate concepts, checked in that order.

## Visitor

Can see the landing page, marketing pages, the catalogue, public course information, free lessons and free resources, and the certificate verification page. Can buy a paid course. Cannot open protected content, see dashboards, request a course or save progress.

## Guest

- Guest accounts are **created by the admin** (single or bulk), with credentials and forced password change at first login.
- A guest browses the catalogue and **requests access per course**.
- Admin approves or rejects. **Approving course A never approves course B.** Each course needs its own request.
- Each approval has an access period: 1 day, 7 days, 30 days, custom, or no expiry.
- Request statuses: `PENDING`, `APPROVED`, `REJECTED`, `EXPIRED`, `REVOKED`. Admin actions: approve, reject, revoke, set expiry, extend, view history.
- After expiry or revoke, access ends immediately, enforced by the backend.
- **Guest progress is never stored**, enforced at the database level. Lessons and quizzes work during the session; reload or logout restores nothing.
- Guests never receive certificates.

## Student

- Created by admin (single, bulk Excel) or automatically when someone buys a course.
- Structure: Student → Group/Batch → Assigned courses → Modules → Lessons → Progress.
- No automatic access to all courses. Courses are assigned **individually** or **through a group** (every member gets it).
- Statuses: `ACTIVE` (normal), `INACTIVE` (exists, access disabled), `SUSPENDED` (blocked immediately, data kept), `EXPIRED` (expiry reached).
- Tracked: completion %, lessons completed, last lesson, quiz scores, assignments, certificates, completion date. Progress survives logout.

## Groups

Named groups (e.g. `AI-2026-A`) of students. A group can have several courses assigned. Adding a student to a group gives them the group's courses.

## Bulk student creation (Excel)

- Downloadable standard template: Name, Student ID, Email, Phone, Group, Course, Mode, Batch.
- Supports ID generation, account creation, group and course assignment, credential generation, validation and duplicate detection. Guests can be imported the same way.
- Every row is validated **before** anything is written. Summary example: 342 rows, 337 created, 330 courses assigned, 5 duplicate IDs, 4 invalid emails, 1 missing course.
- **Error report** download: row number, field, reason, recommended fix.
- **Credentials** download: Name, Student ID, Login ID, temporary password.

## Credentials and passwords

- Passwords are never stored or shown in plain text. Admin cannot view a password, only reset it.
- Temporary password → forced change at first login → dashboard.
- Forgot password: reset link by email (Resend). Users without email: "Contact your admin", and admin resets.

## Login security

Secure hashing, HTTPS, rate limiting, failed-login detection, temporary lockout, secure sessions with expiry, logout, logout from all devices, staff 2FA. All authentication and authorization happens on the backend.

## Audit logs

Recorded for important admin actions: created student, assigned course, approved guest, suspended, bulk generated IDs, reset password, revoked access, mode switch, attendance correction, refund, certificate issue or revoke. Each has timestamp, actor, action, affected user, affected course, result. Audit logs are append-only and visible only to permitted staff.

## Roles

Minimum: `ADMIN`, `MENTOR`, `STUDENT`, `GUEST`, plus `SUPER_ADMIN`. Designed to add `INSTRUCTOR`, `CONTENT_MANAGER`, `SUPPORT` later. Permissions are explicit and enforced on the backend.

## Admin module structure

- **Dashboard**
- **Students:** all, create, bulk import, validation results, groups, course assignment, activate/deactivate, suspend, password reset, mode switching
- **Guests:** guest users, course requests (pending, approved, rejected, expired), revoke, extend
- **Courses:** courses, modules, lessons, quizzes and tests, assignments, certificates, learning tools
- **Classes:** batches, mentors, sessions, attendance
- **Payments:** orders, refunds, coupons, invoices
- **Progress and analytics:** student progress, completion, results, certificates, attendance
- **Security:** staff and roles, sessions, login activity, audit logs
- **Settings:** guest access durations, authentication, company profile, platform

## Critical business rules

1. No login = public content only.
2. Guest access is course-specific.
3. Approval for course A does not grant course B.
4. Expired guest access = no course access.
5. Guest progress is never persisted.
6. Student progress is always persisted.
7. Students access only courses assigned to them, their group, or purchased by them.
8. Suspended student = login blocked immediately; history kept.
9. Passwords never stored or displayed in plain text.
10. Every protected resource is authorized by the backend.
11. Important admin actions are audit-logged.
12. Bulk uploads validate every record and give detailed error reports.
