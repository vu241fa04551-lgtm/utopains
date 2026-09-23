# UtopianScore — Phase 1 Foundation

A working learning-platform foundation: real authentication, real
role-based access control, and a real student → faculty → admin
workflow backed by PostgreSQL. This is Phase 1 as scoped in the
project's execution prompt — it is deliberately **not** the full
UtopianScore vision (coding practice, assessments, real-time
collaboration, streaks, etc.). Those are later phases; see
[What's deferred](#whats-deferred) below.

## What actually works end-to-end

- **Auth**: registration (always creates a STUDENT account),
  credentials login/logout, hashed passwords (bcrypt), JWT sessions.
- **RBAC**: enforced in server-side middleware (`src/middleware.ts`)
  and again in every server action / page via `requireRole()` —
  never trusted from the client.
- **Student**: browse published courses, enroll, view modules/lessons,
  mark a lesson complete, see real progress % on the dashboard.
- **Faculty**: create a course (draft by default), add modules, add
  lessons, publish/unpublish — scoped to courses they own.
- **Admin**: live platform counts (users/courses/enrollments, no
  hardcoded numbers), view all users, change a user's role, view all
  courses.
- Every list/detail page reads from the database — nothing is mocked.

## Tech stack

Next.js 14 (App Router) · TypeScript · Prisma + PostgreSQL ·
NextAuth (Credentials provider, JWT sessions) · Tailwind CSS ·
Vitest for unit tests.

Architecture is a **modular monolith** (one Next.js app), not
microservices — that's a deliberate Phase 1 decision. Business logic
lives outside route handlers where it's meaningfully reusable (see
`src/domain/progress.ts`, `src/app/actions/*`), but there's no
speculative CQRS/event-sourcing/hexagonal scaffolding yet — it isn't
earning its complexity at this stage.

## Prerequisites

- Node.js 20+
- A PostgreSQL database (local install, Docker, or a hosted instance)

## Phase 2 — frontend integration (this update)

Phase 2 connected the UI to the existing Phase 1 backend more deeply
and closed real gaps — it did not touch the database schema, auth
system, or RBAC model, and no new API routes were added. Everything
below calls the same Server Actions and Prisma queries Phase 1 already
had (several actions were changed to *return* a real result instead of
throwing, so the UI can show what the server actually did).

**Real, verified-in-code additions:**
- **Genuine per-action feedback** (`useFormState` + `useFormStatus`) on
  enroll, complete-lesson, publish/unpublish, add-module, add-lesson,
  and role-change — every message shown comes from the server's actual
  return value. No `setTimeout`-based fake success anywhere.
- **Loading states** (`loading.tsx`) for the four highest-traffic
  routes: student dashboard, course catalog, course detail, faculty
  dashboard, admin dashboard.
- **A real error boundary** (`error.tsx`) with a working retry button,
  and a proper 404 page (`not-found.tsx`) — no internal error details
  exposed to the user.
- **A real mobile nav** (`RoleNav`): a working hamburger menu with
  `aria-expanded`/`aria-controls`, not a shrunk desktop layout. Active
  link gets `aria-current="page"`.
- **A skip-to-content link** on every role layout.
- **Real search/filter**, both querying Postgres directly (not
  client-side filtering of an already-fetched list): course catalog by
  title/description, admin users by name/email + role. State lives in
  the URL (`?q=...&role=...`), so it's shareable and back-button-safe.
- **A dedicated student progress page** (`/student/progress`) with
  real aggregate stats (courses enrolled/completed, lessons completed)
  and a real recent-activity feed from `Progress.completedAt`.
- **Previous/next lesson navigation** within a module on the lesson
  page, computed from actual sibling lessons — no fabricated sequence.
- **A rebuilt landing page** (hero, learning-experience section,
  for-students/for-faculty, final CTA) — every claim on it describes
  something the app actually does; no invented testimonials or usage
  numbers.
- Two new test files (`tests/slug.test.ts`) covering slug generation
  used by course creation, in addition to Phase 1's progress tests.

**Deliberately not added, and why:**
- **No "Practice" nav item.** Your Phase 2 prompt's suggested student
  nav includes Home/Learn/Practice/Progress, but there's no coding
  practice backend yet (that's explicitly a later phase). Adding a nav
  link with nowhere real to go would be exactly the "dead navigation"
  your own Section 57 rules out — so student nav is Home/Learn/Progress
  until Practice has something behind it.
- **No global toast system.** Built inline, per-form feedback banners
  instead (still real, still server-verified) — a global toast queue
  adds real complexity (portal, timing, stacking, screen-reader
  announcements) that wasn't clearly needed yet for the six actions
  that produce feedback today. Worth revisiting once there are more
  fire-and-forget actions (e.g. notifications) that don't have an
  obvious place to render inline.
- **No notifications, real-time, coding UI, streaks, or focus mode.**
  Same reasoning as Phase 1: these have no backend yet, so building
  their frontend now would mean either fake data or dead buttons, both
  ruled out explicitly by this phase's own instructions.
- **No command palette / global search.** No search backend exists
  beyond the two scoped, real filters above; a fabricated "universal
  search" was explicitly disallowed.
- **Course/module reordering UI** is still absent — noted as a known
  limitation in Phase 1 and still true here.

## Phase 3 — Practice + Interactive Learning

Phase 3 adds a real practice domain (MCQ questions and coding
problems) on top of the existing Phase 1/2 backend. No existing
table, action, or route was removed or renamed. **One capability is
explicitly not implemented: running or grading student code.** Read
that section below before assuming "coding problems" means what it
usually means on other platforms.

### Status key (per the honesty rule this phase was built under)

- **Implemented + tested (unit)**: MCQ grading logic, practice stats
  calculation, slug generation. Covered by `tests/practice.test.ts`.
- **Implemented, not independently verified** (same caveat as Phase
  1/2 — no network/DB in the environment that built this): every
  route, Server Action, and Prisma query below. Written carefully,
  reviewed by hand, not run.
- **Explicitly not implemented**: sandboxed code execution. See below.
- **Deferred** (no backend, so no UI for it either): hints system,
  faculty analytics beyond raw counts, admin queue/execution
  monitoring, visualizations, terminal, projects, AI providers.

### The most important thing to understand: code execution

This environment has no network access and no ability to run
containers, workers, or a job queue. **Student code is never executed
or graded.** Concretely:

- Coding problems have real content: description, starter code,
  constraints, examples, and test cases (including hidden ones that
  are never sent to the client — enforced at the Prisma query level,
  not hidden in React).
- Students can write and **save** code (`saveCodingAttempt`). It's
  persisted to `ProblemAttempt.sourceCode` so work isn't lost.
- There is no "Run" or "Submit" button that produces a pass/fail
  result — the UI says plainly, in a visible banner, that execution
  isn't available in this environment, rather than showing a fake
  spinner-then-checkmark.
- Every coding attempt is stored with `outcome: UNGRADED`. This is a
  real enum value, not a placeholder — it's how the data model
  represents "saved, not graded" without lying about correctness.
- MCQ problems, by contrast, **are** fully real: grading happens
  server-side against the correct option (never sent to the client
  before grading), and the result is genuine.

If/when a real execution backend is added (Section 13–16 of your
prompt describe the right shape — queue + isolated worker + status
polling), the pieces already in place that it would plug into are:
`AttemptOutcome` (extend beyond CORRECT/INCORRECT/UNGRADED with
QUEUED/RUNNING/PASSED/etc.), `ProblemAttempt.sourceCode`/`language`
(already collected), and the `CodingSaveForm` component (replace the
"unavailable" banner and Save-only button with Run/Submit once a real
`executeCode()` server call exists).

### Database changes

New models: `Skill`, `PracticeProblem`, `QuestionOption`, `TestCase`,
`ProblemAttempt`. New enums: `PracticeDifficulty`, `PracticeType`,
`AttemptOutcome`. `User` gained `problemsAuthored` and
`problemAttempts` relations. Full definitions in
`prisma/schema.prisma`.

**You'll need to generate the actual migration yourself** — `prisma
migrate dev` requires a live database connection, which this
environment doesn't have. Run:

```bash
npm run db:migrate    # will prompt for a migration name, e.g. "practice-domain"
npm run db:seed       # adds 2 skills + 1 MCQ problem + 1 coding problem
```

### New routes

```text
/student/practice                          Dashboard: continue, stats, recommended
/student/practice/problems                 Discovery (search + difficulty/type filters)
/student/practice/problems/[slug]          Problem detail — MCQ form or coding save form
/student/practice/history                  Paginated attempt history

/faculty/practice                          List of your own problems
/faculty/practice/new                      Create a problem (MCQ or coding)
/faculty/practice/[id]                     Manage: options/test cases, content, explanation, publish
```

`/admin/dashboard` now also shows real counts for practice problems,
published problems, and total attempts.

### Security model for this phase

- **Hidden test cases**: excluded at the Prisma `select`/`where`
  level in the student problem-detail query — never fetched, so
  never renderable, regardless of what the client does.
- **Correct MCQ answers**: `QuestionOption.isCorrect` is likewise
  never selected in the student-facing query. Grading happens inside
  `submitMcqAttempt`, a Server Action, against a server-side fetch
  that *does* include `isCorrect` — that data never crosses into a
  client component's props.
- **Ownership**: `assertOwnsProblem()` in `faculty-practice.ts` mirrors
  the Phase 2 `assertOwnsCourse()` pattern — a faculty member can only
  edit their own problems; admins can edit any.
- **Attempt privacy**: history and stats queries are always scoped to
  `userId: user.id` from the server session — never from a client-
  supplied ID.

### Testing

`tests/practice.test.ts` (7 cases): MCQ grading for a correct
selection, an incorrect selection, and a nonexistent option id;
practice-stats counting of distinct attempted/solved problems;
accuracy computed only over graded (non-coding) attempts; 0% accuracy
edge case when only coding attempts exist. Run with `npm run test`
alongside the Phase 1/2 tests.

### Known limitations (real ones, not hedging)

- No code execution, as covered above — this is the headline
  limitation of this phase.
- No hint system (`Section 22` of the prompt) — would need its own
  schema (hint text + reveal tracking) and was cut to keep this phase
  reviewable; not started.
- No skill-assignment UI for faculty — skills exist and are seeded,
  and problems *can* be connected to them in the schema, but there's
  no faculty-facing picker yet. A problem's `skills` relation is only
  populated via seed data right now.
- Practice discovery search is title-only (not description) to keep
  the query simple — Phase 2's course search covers both fields,
  practice doesn't yet.
- No admin practice-monitoring page beyond the dashboard counts —
  there's no execution queue to monitor, so a dedicated page would be
  mostly empty.

## Getting started

```bash
npm install
cp .env.example .env
# edit .env: set DATABASE_URL to your Postgres connection string,
# and generate NEXTAUTH_SECRET with: openssl rand -base64 32

npm run db:generate
npm run db:migrate      # creates the schema (prompts for a migration name)
npm run db:seed         # creates admin/faculty/student + sample courses

npm run dev
```

Then open http://localhost:3000.

### Seed accounts (development only — not real credentials)

| Role    | Email                     | Password       |
|---------|---------------------------|----------------|
| Admin   | admin@utopianscore.dev    | Password123!   |
| Faculty | faculty@utopianscore.dev  | Password123!   |
| Student | student@utopianscore.dev  | Password123!   |

## Commands

```bash
npm run dev          # start dev server
npm run build         # production build
npm run start         # run the production build
npm run lint          # ESLint (via Next.js)
npm run typecheck     # tsc --noEmit
npm run test          # vitest — domain logic unit tests
npm run db:migrate    # create/apply a migration
npm run db:seed       # (re)run the seed script
npm run db:studio     # Prisma Studio — browse the database
```

## Verifying it actually works

This project was written and reviewed carefully, but it has **not
been run** in the environment that produced it — that environment has
no network access and no database, so `npm install` and everything
downstream of it could not be executed there. Please run the
following yourself and treat it as the actual Phase 1 "Definition of
Done" check:

```text
[ ] npm install completes
[ ] npm run typecheck passes
[ ] npm run lint passes
[ ] npm run db:migrate succeeds against a real Postgres instance
[ ] npm run db:seed succeeds
[ ] npm run test passes (5 unit tests on progress calculation)
[ ] npm run dev boots and / redirects to /login when signed out
[ ] Register a new account -> lands on /student/dashboard
[ ] Sign in as the seeded student -> dashboard shows real progress
[ ] Browse /student/courses, enroll in "Web Fundamentals", complete a lesson
[ ] Sign in as faculty -> create a course, add a module, add a lesson, publish it
[ ] Sign in as admin -> /admin/users shows real counts; change a role and confirm it persists
[ ] A student visiting /faculty/* or /admin/* is redirected away
[ ] npm run build succeeds
[ ] /student/progress shows correct aggregate numbers and recent activity
[ ] Course catalog search (?q=) actually filters results server-side
[ ] Admin user search + role filter buttons actually filter results
[ ] Enrolling shows a real inline success message (not a redirect-only confirmation)
[ ] Completing a lesson shows a real inline success message and prev/next links work
[ ] Publishing/unpublishing a course shows a real inline message and the badge updates
[ ] Adding a module/lesson shows a real inline success or validation-error message
[ ] Changing a user's role in admin shows a real inline confirmation
[ ] Resizing to mobile width shows a working hamburger menu with all nav links
[ ] Tab-key navigation reveals a visible "Skip to content" link on role pages
[ ] Throwing an error (e.g. temporarily break a query) shows the error boundary with a working "Try again" button, not a blank screen
[ ] Visiting a nonexistent route shows the custom 404 page
[ ] /student/practice shows real stats (0/0/0% on a fresh account)
[ ] Answering the seeded MCQ correctly shows "Correct!" and updates stats
[ ] Answering the seeded MCQ incorrectly shows "Not quite" and the explanation
[ ] Re-visiting a correctly-answered MCQ shows "already answered" instead of the form again
[ ] Opening the seeded coding problem shows the "execution unavailable" banner (not a Run/Submit button)
[ ] Saving code on a coding problem persists it and shows in /student/practice/history as "Saved (not graded)"
[ ] Hidden test case ("[1000000, 2, 3]" in the seed) never appears anywhere in the student-facing page HTML
[ ] Faculty can create an MCQ problem, add options, mark one correct, and publish
[ ] Faculty can create a coding problem, add content + test cases, and publish
[ ] A student cannot see or edit another faculty member's draft (unpublished) problem
[ ] Admin dashboard shows real practice problem/attempt counts
```

If any of these fail, that's expected feedback to fix, not a sign the
whole approach is wrong — please report exact error output and I'll
correct the specific file, rather than a superficial patch.

## Project structure

```
prisma/
  schema.prisma      Phase 1 schema: User, Course, Module, Lesson,
                      Enrollment, Progress (Role is an enum on User)
  seed.ts             Seed script: 3 accounts + 2 courses

src/
  app/
    (marketing)/page.tsx          Landing page, role-aware redirect
    login/, register/             Auth pages
    api/auth/[...nextauth]/       NextAuth route handler
    api/register/                 Public registration endpoint
    student/                      Dashboard, catalog (+search), course,
                                   lesson (+prev/next), progress page,
                                   practice/ (dashboard, catalog, problem
                                   detail, history)
    faculty/                      Dashboard, course authoring,
                                   practice/ (list, new, manage)
    admin/                        Dashboard (+practice counts),
                                   users (+search/filter), courses
    actions/                      Server Actions: student.ts, faculty.ts,
                                   admin.ts, practice.ts, faculty-practice.ts
    error.tsx, not-found.tsx      Real error boundary + 404 page
    */loading.tsx                 Real loading skeletons on high-traffic routes
  components/
    ui/                           Button, Card, Badge, Input, ProgressBar,
                                   EmptyState, Skeleton
    forms/                        FeedbackBanner, SubmitButton (useFormStatus)
    courses/                      EnrollButton (useFormState)
    lessons/                      CompleteLessonButton (useFormState)
    faculty/                      PublishToggle, AddModuleForm, AddLessonForm
    practice/                     McqForm, CodingSaveForm, ProblemPublishToggle,
                                   AddOptionForm, AddTestCaseForm,
                                   CodingContentForm, ExplanationForm
    nav/                          RoleNav (mobile hamburger + active state)
  domain/                          progress.ts, slug.ts, practice.ts — pure,
                                    unit-tested logic
  lib/                             prisma client, auth config, session/RBAC,
                                    action-result.ts (shared feedback type)
  middleware.ts                    Route-level RBAC enforcement

tests/
  progress.test.ts                 Progress-calculation unit tests
  slug.test.ts                     Slug-generation unit tests
  practice.test.ts                 MCQ grading + practice-stats unit tests
```

## What's deferred

These are explicitly **not** part of Phase 1, per the project's own
phasing (see Section 27/Section 7 of the execution prompts). They
have no placeholder pages pretending to work — they simply don't
exist yet, which is the honest state to leave them in:

- Interactive lesson engine (visualizers, in-browser code execution)
- Coding practice + secure sandboxed code execution
- Assessment/quiz engine, question banks, timed exams
- Projects/workspace, in-platform terminal
- Friends, study sessions, presence, real-time collaboration
- Notifications, streaks, achievements, skill graph
- Advanced analytics, multi-tenancy, enterprise admin
- CQRS/event sourcing, microservices, multi-region deployment, GitOps

## Known limitations to be aware of

- No password-reset flow yet (login/register only).
- No rate limiting on `/api/register` or the credentials login route —
  worth adding before any public deployment.
- Course/module/lesson ordering is a plain integer `order` field with
  no reordering UI yet — new items are appended.
- No automated e2e tests yet (Playwright/Cypress) — only unit tests on
  pure domain logic. E2E coverage of the workflows in the checklist
  above is a good next addition.
