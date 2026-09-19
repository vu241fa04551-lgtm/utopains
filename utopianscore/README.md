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
    student/                      Student dashboard, catalog, course, lesson
    faculty/                      Faculty dashboard, course authoring
    admin/                        Admin dashboard, users, courses
    actions/                      Server Actions: student.ts, faculty.ts, admin.ts
  components/ui/                  Button, Card, Badge, Input, ProgressBar, EmptyState
  domain/progress.ts               Pure progress-calculation logic (unit tested)
  lib/                             prisma client, auth config, session/RBAC helpers
  middleware.ts                    Route-level RBAC enforcement

tests/progress.test.ts             Unit tests for domain logic
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
