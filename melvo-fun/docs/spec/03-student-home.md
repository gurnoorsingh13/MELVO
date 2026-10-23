# Spec 03 — Student Home

The student's central dashboard. Shows summaries and actions; details open on their own pages.

**Priority order:** Continue learning → Upcoming class → Upcoming test → Upcoming assignment → My courses → Announcements → Results and progress → Resources.

## Sections

1. **Continue learning** (most prominent). Last course and lesson, progress, Continue button. Resumes the exact lesson and video position.
2. **My courses.** Card per enrolled course: name, thumbnail, mode, progress, next lesson, status. Class mode cards show the batch and next class time.
3. **Upcoming classes** (class mode). Course, batch, topic, date, time, mentor, status, View class.
4. **Upcoming tests.** Course, test name, number of questions, duration, date and time, attempt status, deadline.
5. **Test results.** Test, score, percentage, pass or fail. Detail: score, percentage, correct, incorrect, time taken, attempt date, status, mentor feedback. Whether correct answers are shown is set by admin or mentor. Lifecycle: Upcoming → Available → Attempted → Evaluated → Result published.
6. **Assignments.** Title, course, due date, status (`NOT_STARTED`, `IN_PROGRESS`, `SUBMITTED`, `EVALUATED`, `OVERDUE`).
7. **Announcements.** Latest from admin and mentors, with View all.
8. **Progress overview.** Courses, in progress, completed, overall progress, tests attempted, average score.
9. **Recent activity.** Completed module, submitted assignment, attempted quiz, joined class, result published, mentor replied to doubt.
10. **Notes.** Course notes, study material, PDFs, references, downloads.
11. **Mentor and company.** Mentor profile (about, expertise, experience) and company info (about, programs, services, contact, links).
12. **Doubts / mentor chat.** A doubt is tied to course → module → lesson. Text, images, files. Mentor replies and resolves.
13. **Learning tools.** Admin-managed links (Google Colab, Teachable Machine, MIT App Inventor, simulators, course-specific tools).

## Guests

Guests get a reduced home: their approved courses with access expiry dates, pending requests, the catalogue and announcements. No progress, results, certificates or activity history, because nothing is stored for them.
