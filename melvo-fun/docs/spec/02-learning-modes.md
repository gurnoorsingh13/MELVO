# Spec 02 — Learning Modes: Self-Paced and Class Mode

## Core rule

**One course, one copy of content.** Self-Paced and Class Mode are two ways to deliver the same modules, lessons, videos, notes, resources, quizzes and assignments. Never duplicate a course for a mode.

- The **Course** is the source of truth for content.
- The **Learning mode** decides how content is delivered.
- The **Enrollment** decides who learns it and in which mode.
- The **Batch** is the classroom context for Class Mode.
- The **Session** is what happens in one class.

## Course configuration

Each course has: basic info, content, Self-Paced on/off, Class Mode on/off, and access settings. A course can be self-paced only, class only, or both. Only the admin changes this.

## Mode per enrollment

Mode is set on the student–course enrollment. Class Mode enrollments must have a batch. **Students cannot switch mode; only the admin can.**

## Self-Paced

The student starts and stops lessons, navigates unlocked lessons, rewatches, reads notes, opens resources, attempts quizzes, submits assignments, tracks progress and resumes where they left off.

**Unlock strategy** (chosen by admin per course, configuration-driven):

- `ALL_AT_ONCE` — everything open.
- `SEQUENTIAL` — complete a chapter to open the next.
- `QUIZ_BASED` — pass the chapter's quiz to open the next.
- `DATE_BASED` — each chapter opens on a set date.

## Class Mode

A course can have many batches (e.g. Morning, Evening, Weekend).

**Batch:** course, name, mentor(s), students, start and end dates, schedule (days and time), navigation mode, attendance, class progress.

**Session:** date, start and end time, topic, module, lesson(s), mentor, status (`SCHEDULED`, `LIVE`, `COMPLETED`, `CANCELLED`), Google Meet link.

**Student class view:** next class with a Join button (opens Meet and our class panel), upcoming and completed sessions, attendance, class progress, assignments, assessments, announcements.

## Mentor

A separate role with explicit, limited permissions, scoped to their own batches. Not an admin.

**Mentor dashboard:** my classes, today's classes, upcoming, students, attendance, assignments, assessments, announcements, reports, doubts.

**Live class panel:** course, batch, current module and lesson, students online (e.g. 27/30). Actions: Push lesson, Lock navigation, Unlock next, Start quiz, Give assignment, Announcement, End class.

**Navigation modes:**

- `CONTROLLED` — students see the lesson the mentor pushes; earlier lessons are available, later ones locked.
- `FLEXIBLE` — students follow along but can review earlier lessons and explore allowed content.

## Presence and attendance

- Live presence states: online, idle, offline, late, disconnected, tied to the session.
- Attendance is generated automatically from presence: joined at, left at, total duration, percentage, status.
- Admin or the batch's mentor can correct attendance. Each correction records who, when, previous value, new value and reason.

## Two kinds of progress

- **Course progress** — the student's own learning through the course.
- **Class progress** — where the batch is (current module, modules completed).

Neither ever overwrites the other.

## Assessments in class

Mentor creates or picks an assessment (quiz, poll, MCQ, short answer, assignment; coding task in phase 2), launches it, students submit, the system grades where possible, and the mentor sees results (participants, submitted, average).

## Announcements

Mentor or admin sends to a batch, course, session or the whole platform. Stored against that scope. Shown live during class and on the student home.

## Session history

Each completed session keeps: details, attendance, assessments, assignments, class notes, and (phase 2) recording, chat and questions.

## Switching mode

Admin only. Choose new mode, batch (for class mode) and effective date. **Existing progress is kept.** The change is recorded: from, to, changed by, changed at, effective from.

## Reports

- Course: total students, self-paced vs class, average progress, completion rate.
- Batch: students, average attendance, average progress, average quiz score.
All built from enrollment, progress, batch, attendance and assessment data.

## Permissions

- **Admin:** create and edit courses, configure modes, create batches, assign mentors and students, switch modes, manage sessions and attendance, view reports.
- **Mentor:** view own batches, start classes, control lessons, view students, track presence, manage attendance, launch assessments, send announcements, view class reports.
- **Student:** view assigned courses, learn, complete lessons, attempt assessments, submit assignments, view progress, attend assigned classes.

## MVP must include

1. Batch management (course → batch → students → mentor)
2. Class scheduling (sessions with date, time, topic)
3. Mentor control panel (start, push lesson, control navigation, launch activity, end)
4. Attendance and presence
5. Admin-controlled mode switching that preserves progress

## Phase 2

Live polls, raise hand, live questions, live quiz results, class chat, live coding, recordings, advanced analytics, performance reports, automated notifications. These are added without changing Course → Mode → Enrollment.
