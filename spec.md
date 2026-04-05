# FitCoach AI

## Current State
The Workouts tab shows a menu with 4 sub-pages: Workout History, Nutrition Log, Workout Calendar, and AI Coach Settings. There is no Programs section.

## Requested Changes (Diff)

### Add
- A new "Programs" sub-page accessible from the Workouts menu.
- A Programs page (`ProgramsPage.tsx`) displaying a curated library of pre-built training programs.
- Program data including: name, difficulty level, duration (weeks), goal, frequency (days/week), description, and a list of weekly workout structure.
- Pre-built programs including "Body Recomposition - Extreme Level" and at least 4 other diverse programs (strength, endurance, hypertrophy, beginner, etc.).
- Each program card shows key info (goal, level, weeks, days/week) with an "View Program" expand/details view.
- An "Enroll" button to mark a program as active (stored in localStorage).
- Active program indicator on the Programs page and optionally on the Dashboard.

### Modify
- `App.tsx`: Add `"programs"` to the `SubPage` type, add a Programs menu item to `WorkoutsMenu`, and render `<ProgramsPage />` when `subPage === "programs"`.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/data/programsDb.ts` with typed program data (6+ programs).
2. Create `src/frontend/src/pages/ProgramsPage.tsx` with program cards, detail view, and enroll functionality.
3. Update `src/frontend/src/App.tsx` to add Programs to the Workouts sub-menu.
4. Use localStorage key `fitcoach_active_program` to persist enrollment.
