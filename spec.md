# FitCoach AI — Update 3

## Current State
- Programs page exists with 6 programs (ProgramsPage.tsx, programsDb.ts). Users can enroll in a program which saves to localStorage via AppContext.
- Dashboard (DashboardPage.tsx) shows stats, recent workouts, and AI suggestions but has no active program widget.
- ActiveWorkoutSession.tsx shows exercises step-by-step with sets/reps/weight logging. No exercise tutorial/demo media shown.
- App.tsx uses a tab-based SPA with React state for navigation — no browser history API integration, so the device back button exits the app entirely.
- exerciseDb.ts has 55+ exercises with name, description, primaryMuscle, equipment fields but no tutorial media URLs.

## Requested Changes (Diff)

### Add
- **Active Program Widget on Dashboard**: A card at the top of DashboardPage that appears only when the user is enrolled in a program. Shows program name, current week (calculated from enrollment date), current day within the week, a progress bar (weeks completed / total weeks), and a "View Program" button that navigates to ProgramsPage.
- **Exercise Tutorial Panel in ActiveWorkoutSession**: Below the exercise header card, show a collapsible or always-visible tutorial section. Each exercise gets a short tutorial using an embedded YouTube iframe (using YouTube's no-cookie embed) or a static animated GIF-style description. Since we cannot generate real media, use a reliable embed approach: embed a YouTube search/tutorial link rendered as an iframe for each exercise, using a curated per-exercise YouTube embed ID from exerciseDb or a fallback search URL. A simpler approach: add a `tutorialUrl` field to each exercise in exerciseDb.ts pointing to a real, embeddable YouTube tutorial URL for each of the 55+ exercises. Render it as a collapsed "Watch Tutorial" accordion that expands to show the iframe.
- **Browser History / Back Button Fix**: Integrate the browser History API (`window.history.pushState`) into App.tsx navigation so that navigating between tabs pushes a history entry. A `popstate` event listener intercepts the back button and navigates within the app instead of exiting.

### Modify
- **exerciseDb.ts**: Add `tutorialUrl` (YouTube embed URL string) to each exercise object for the tutorial feature.
- **DashboardPage.tsx**: Add the active program widget as the topmost content section, reading enrolled program + enrollment date from AppContext/localStorage.
- **ActiveWorkoutSession.tsx**: Add a collapsible tutorial section per exercise using the `tutorialUrl` from exerciseDb.
- **App.tsx**: Replace or augment current tab navigation with `window.history.pushState` so the back button works correctly within the app.
- **AppContext.tsx**: Expose enrolled program data (programId + enrollmentDate) so Dashboard can compute current week/day.

### Remove
- Nothing removed.

## Implementation Plan
1. **exerciseDb.ts** — Add `tutorialUrl` field to all 55+ exercises. Use real YouTube embed URLs (e.g. `https://www.youtube.com/embed/VIDEO_ID`) with well-known exercise tutorial videos.
2. **AppContext.tsx** — Ensure `enrolledProgram` and `enrollmentDate` (timestamp) are stored in localStorage and exposed via context. Add helper to compute current week number from enrollment date.
3. **DashboardPage.tsx** — Insert `<ActiveProgramCard>` component at top of dashboard. Reads from context. Shows program name, week X of Y, day, progress bar, and link to Programs page. Only renders if enrolled.
4. **ActiveWorkoutSession.tsx** — Add a `<TutorialPanel>` below the exercise header. Uses Accordion/Collapsible (shadcn). Renders YouTube iframe embed inside. Lazy-loads (only renders iframe when expanded to avoid performance hit).
5. **App.tsx** — On tab change, call `window.history.pushState({ tab }, '', '#' + tab)`. Add `window.addEventListener('popstate', ...)` to navigate back to the previous tab. On mount, read `location.hash` to restore the correct tab.
