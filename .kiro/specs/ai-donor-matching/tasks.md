# Implementation Plan: AI Donor Matching Feature Set

## Overview

Five features are added to the Little Hearts MERN platform in a strict dependency order:
1. **Smart Donor Matching Score** — backend engine already exists; wire up the route and frontend section
2. **Thalassemia Patient Mode** — extend User model (already done), add route, page, and dashboard section
3. **Donor Engagement & Badges System** — add `badgeService.js`, hook into donations route, add UI sections
4. **Blood Compatibility Chart** — static client-side page + navbar link
5. **AI Chat Assistant** — `chatService.js`, `/api/chat` route, floating `ChatWidget` component

Each task builds on the previous ones. No task leaves orphaned code.

---

## Tasks

- [ ] 1. Environment setup — add GEMINI_API_KEY to server
  - Open `server/.env` and add the line `GEMINI_API_KEY=your_key_here`
  - Document the variable in `README.md` under a "Environment Variables" section
  - The chat route will read `process.env.GEMINI_API_KEY` and return a graceful fallback when absent
  - _Requirements: 5.6, 5.8_

---

### Feature 1 — Smart Donor Matching Score

- [ ] 2. Add `GET /api/requests/:id/matches` route to `server/routes/requests.js`
  - Import `getMatchesForRequest` from `../services/matchingEngine`
  - Add the route **before** the existing `GET /:id` route (Express matches in order)
  - Wrap with `protect` middleware — return `401` if unauthenticated
  - Call `getMatchesForRequest(req.params.id, req.user._id)` and return `{ matches, total }`
  - Propagate `statusCode` from thrown errors (404 for missing request, 500 for DB errors)
  - _Requirements: 1.9_

- [ ] 3. Add `MatchedDonorsSection` component to `RequestDetailPage`
  - Create `client/src/components/ui/MatchedDonorsSection.jsx`
  - Accept props: `requestId`, `requestStatus`, `viewerId`
  - On mount, call `GET /api/requests/:id/matches`; store results in local state
  - Render a ranked list: donor avatar initial, name, `BloodTypeBadge`, city (if visible), match score as `XX%` pill, availability dot
  - If `phoneHidden` is true on a donor, show a "Request to Connect" button (links to `/connections`) instead of a phone number
  - Show "No compatible donors found" empty state when `matches` is empty
  - Do **not** render the section when `requestStatus` is `fulfilled` or `cancelled`
  - _Requirements: 1.3, 1.4, 1.7, 1.8_

  - [ ]* 3.1 Write property test for match score bounds and sort order
    - **Property 2: Match score is a bounded weighted sum in [0, 100]**
    - **Property 3: Results sorted descending, length ≤ 10**
    - **Validates: Requirements 1.2, 1.3**
    - File: `server/__tests__/properties/matchingEngine.property.test.js`
    - Use `fast-check`; tag: `// Feature: ai-donor-matching, Property 2` and `Property 3`

  - [ ]* 3.2 Write property test for blood type compatibility filter
    - **Property 1: All returned donors have compatible blood types**
    - **Validates: Requirements 1.1**
    - File: `server/__tests__/properties/matchingEngine.property.test.js`

- [ ] 4. Wire `MatchedDonorsSection` into `RequestDetailPage`
  - Import and render `<MatchedDonorsSection>` below the existing "Responded donors" card
  - Pass `requestId` from `useParams()`, `requestStatus` from `request.status`, `viewerId` from `useAuth()`
  - _Requirements: 1.3, 1.8_

- [ ] 5. Add "Find Matching Donors" button to `RequestsPage` donor cards
  - In `client/src/pages/RequestsPage.jsx`, add a "Find Matching Donors" button on each request card
  - On click, navigate to `/requests/:id` with `?scroll=matches` query param
  - In `RequestDetailPage`, read the query param on mount and scroll to the matched donors section using a `ref`
  - _Requirements: 1.5, 1.6_

- [ ] 6. Checkpoint — Feature 1 complete
  - Ensure all tests pass, ask the user if questions arise.

---

### Feature 2 — Thalassemia Patient Mode

- [ ] 7. Add `PUT /api/auth/profile/transfusion-schedule` route to `server/routes/auth.js`
  - Add the route **before** the existing `PUT /profile` route
  - Wrap with `protect`
  - Validate: `frequencyWeeks` must be an integer in [2, 4]; `requiredBloodType` must be a valid enum value; user role must be `thalassemia` — return appropriate 400/403 errors per the design's error handling spec
  - On success, update `user.transfusionSchedule` with `{ nextTransfusionDate, frequencyWeeks, requiredBloodType }` and return the updated user
  - _Requirements: 2.3, 2.9_

  - [ ]* 7.1 Write property test for transfusion schedule frequency validation
    - **Property 4: Frequency validated in [2, 4]**
    - **Validates: Requirements 2.3**
    - File: `server/__tests__/properties/transfusionSchedule.property.test.js`

- [ ] 8. Add auto-advance logic for past transfusion dates
  - In `server/services/transfusionService.js` (new file), export `advanceTransfusionDate(user)`:
    - If `user.transfusionSchedule.nextTransfusionDate` is in the past, add `frequencyWeeks × 7` days until the date is in the future
    - Return the new date
  - Call this function inside `GET /api/users/thalassemia` (task 9) and inside the dashboard data endpoint so the date is always current when read
  - _Requirements: 2.8_

  - [ ]* 8.1 Write property test for auto-advance produces a future date
    - **Property 6: Auto-advance produces a future date**
    - **Validates: Requirements 2.8**
    - File: `server/__tests__/properties/transfusionSchedule.property.test.js`

  - [ ]* 8.2 Write property test for countdown accuracy
    - **Property 5: Countdown = ceil((nextDate - now) / msPerDay)**
    - **Validates: Requirements 2.4**
    - File: `server/__tests__/properties/transfusionSchedule.property.test.js`

- [ ] 9. Add `GET /api/users/thalassemia` route to `server/routes/users.js`
  - Add the route **before** the existing `GET /:id` route
  - Wrap with `protect`
  - Query users where `role === 'thalassemia'`; select `name`, `bloodType`, `city`, `transfusionSchedule`, `karmaScore`
  - Call `advanceTransfusionDate` on each result before returning
  - Return `{ patients: [...] }`
  - _Requirements: 2.7_

- [ ] 10. Add `GET /api/users/:id/badges` route to `server/routes/users.js`
  - Add the route **before** the existing `GET /:id` route (more specific path first)
  - No auth required
  - Return `{ badges, karmaScore, donationStreak, totalDonations }` for the given user
  - Return `404` if user not found
  - _Requirements: 3.9_

- [ ] 11. Add "Thalassemia Patient" option to role selector in `RegisterPage` and `ProfilePage`
  - In `client/src/pages/RegisterPage.jsx`, add `{ value: 'thalassemia', label: '🩺 Thalassemia Patient' }` to the roles array
  - In `client/src/pages/ProfilePage.jsx`, add the same option to the `ROLES` array
  - When `role === 'thalassemia'` is selected in `ProfilePage` edit form, show a collapsible "Transfusion Schedule" sub-form with fields: `nextTransfusionDate` (date input), `frequencyWeeks` (select: 2, 3, 4), `requiredBloodType` (blood type select)
  - On save, call `PUT /api/auth/profile/transfusion-schedule` with the schedule data in addition to the regular profile update
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 12. Create `ThalassemiaPage` at `client/src/pages/ThalassemiaPage.jsx`
  - Fetch `GET /api/users/thalassemia` on mount
  - Render a list of patient cards: name, blood type badge, city, next transfusion date, days countdown
  - Highlight countdown in `var(--red)` when ≤ 7 days away
  - Show loading and empty states
  - _Requirements: 2.4, 2.5, 2.7_

- [ ] 13. Add thalassemia countdown and donor list to `DashboardPage` for thalassemia users
  - In `DashboardPage.jsx`, detect `user.role === 'thalassemia'`
  - Add a new "Transfusion" tab (alongside Overview / Requests / Donations)
  - In the Transfusion tab, show:
    - Countdown card: days to next transfusion, highlighted red when ≤ 7 days
    - Top-10 matched donors for `user.transfusionSchedule.requiredBloodType` and `user.city` — reuse `MatchedDonorsSection` with a synthetic request object or a dedicated API call to `/api/requests/:id/matches` if a request exists
  - _Requirements: 2.4, 2.5, 2.6_

- [ ] 14. Register `ThalassemiaPage` route and add navbar link
  - In `client/src/App.jsx`, add `<Route path="/thalassemia" element={<ProtectedRoute><ThalassemiaPage /></ProtectedRoute>} />`
  - In `client/src/components/layout/Navbar.jsx`, add `{ path: '/thalassemia', label: 'Thalassemia', authRequired: true }` to `navLinks`
  - _Requirements: 2.7_

- [ ] 15. Checkpoint — Feature 2 complete
  - Ensure all tests pass, ask the user if questions arise.

---

### Feature 3 — Donor Engagement & Badges System

- [ ] 16. Create `server/services/badgeService.js`
  - Export `BADGE_THRESHOLDS`: `{ 'First Drop': 1, 'Regular Hero': 5, 'Lifesaver': 10, 'Legend': 25 }`
  - Export `BADGE_TIER_ORDER`: `['First Drop', 'Regular Hero', 'Lifesaver', 'Legend']`
  - Export `checkAndAwardBadges(user)`: iterate thresholds; for each badge whose threshold ≤ `user.totalDonations` and not already in `user.badges`, push `{ name, awardedAt: new Date() }` — return the array of newly awarded badges
  - Export `computeKarmaScore(totalDonations, streak)`: return `Math.min(500, totalDonations * 10 + streak * 5)`
  - Export `updateStreak(user, donationDate)`: compare `donationDate` month (`YYYY-MM`) with `user.lastDonationMonth`; if consecutive calendar month, increment `user.donationStreak`; if same month, no change; if gap, reset to 0; update `user.lastDonationMonth`; return new streak value
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 16.1 Write property test for badge monotonicity and threshold correctness
    - **Property 7: Badge set is monotonic and threshold-correct**
    - **Validates: Requirements 3.1, 3.2**
    - File: `server/__tests__/properties/badgeService.property.test.js`

  - [ ]* 16.2 Write property test for Karma_Score formula bounds
    - **Property 8: Karma_Score = min(500, D×10 + S×5)**
    - **Validates: Requirements 3.3**
    - File: `server/__tests__/properties/badgeService.property.test.js`

  - [ ]* 16.3 Write property test for streak tracking across donation sequences
    - **Property 9: Streak increments on consecutive months, resets on gap**
    - **Validates: Requirements 3.4, 3.5**
    - File: `server/__tests__/properties/badgeService.property.test.js`

- [ ] 17. Hook badge service into `server/routes/donations.js`
  - Import `checkAndAwardBadges`, `computeKarmaScore`, `updateStreak` from `../services/badgeService`
  - After the existing `User.findByIdAndUpdate` call in `POST /api/donations`, re-fetch the updated user document
  - Call `updateStreak(user, new Date())` to get the new streak
  - Call `checkAndAwardBadges(user)` to get newly awarded badges; push them to `user.badges`
  - Recompute `user.karmaScore = computeKarmaScore(user.totalDonations, user.donationStreak)`
  - Save the user; wrap in try/catch — badge failures must not fail the donation response (log error only)
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

- [ ] 18. Create `BadgeDisplay` reusable UI component
  - Create `client/src/components/ui/BadgeDisplay.jsx`
  - Accept props: `badge` (object with `name`, `awardedAt`), `size` (`sm` | `md`)
  - Render a pill with an emoji icon per badge name: First Drop 🩸, Regular Hero 🦸, Lifesaver 💉, Legend 🏆
  - Use the system's color tokens (red for First Drop, blue for Regular Hero, green for Lifesaver, purple for Legend)
  - _Requirements: 3.6, 3.7_

- [ ] 19. Add badges to `DonorsPage` donor cards
  - In `client/src/pages/DonorsPage.jsx`, for each donor card, display up to 3 highest-tier badges using `BadgeDisplay` (size `sm`)
  - Sort badges by `BADGE_TIER_ORDER` descending before slicing to 3
  - _Requirements: 3.7_

  - [ ]* 19.1 Write property test for top-tier badge display
    - **Property 10: Badge display shows top-3 highest-tier badges**
    - **Validates: Requirements 3.7**
    - File: `client/src/__tests__/properties/donorCard.property.test.js`

- [ ] 20. Add `AchievementsSection` to `DashboardPage`
  - Create `client/src/components/ui/AchievementsSection.jsx`
  - Fetch `GET /api/users/:id/badges` for the logged-in user on mount
  - Display: all earned badges (using `BadgeDisplay` size `md`), Karma_Score as a progress bar toward 500, Donation_Streak with a flame icon, next milestone badge name and donations remaining
  - If no badges earned, show an encouraging empty state
  - _Requirements: 3.8_

- [ ] 21. Wire `AchievementsSection` into `DashboardPage` and `ProfilePage`
  - In `DashboardPage.jsx`, add an "Achievements" tab and render `<AchievementsSection userId={user._id} />`
  - In `ProfilePage.jsx`, render `<AchievementsSection userId={user._id} />` below the stats grid (visible in view mode only)
  - _Requirements: 3.6, 3.8_

- [ ] 22. Checkpoint — Feature 3 complete
  - Ensure all tests pass, ask the user if questions arise.

---

### Feature 4 — Blood Compatibility Chart

- [ ] 23. Create compatibility matrix data file
  - Create `client/src/data/compatibilityMatrix.js`
  - Export `COMPATIBILITY_MATRIX` (the full 8×8 object from the design document)
  - Export `BLOOD_TYPES` array: `['O-','O+','A-','A+','B-','B+','AB-','AB+']`
  - This file is the single source of truth used by both `CompatibilityPage` and any client-side logic
  - _Requirements: 4.2_

- [ ] 24. Create `CompatibilityPage` at `client/src/pages/CompatibilityPage.jsx`
  - Read `?highlight=` query param via `useSearchParams()`; validate it is a known blood type — silently ignore invalid values
  - Render an 8×8 grid: donor types as rows, recipient types as columns; each cell shows ✓ or ✗ with color coding
  - On cell click, set selected blood type in local state; highlight all compatible cells for that type
  - Render a summary panel below the grid: "Can donate to: …" and "Can receive from: …" lists
  - Render an educational section with three sub-sections: ABO/Rh explanation, Thalassemia and transfusion needs, donation eligibility guidelines
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7, 4.8_

  - [ ]* 24.1 Write property test for compatibility matrix highlight exactness
    - **Property 11: Highlighted cells exactly match the compatibility matrix**
    - **Validates: Requirements 4.3**
    - File: `client/src/__tests__/properties/compatibilityMatrix.property.test.js`

  - [ ]* 24.2 Write property test for URL query param pre-selection
    - **Property 12: `?highlight=` pre-selects the correct blood type**
    - **Validates: Requirements 4.8**
    - File: `client/src/__tests__/properties/compatibilityMatrix.property.test.js`

- [ ] 25. Register `CompatibilityPage` route and add navbar + homepage links
  - In `client/src/App.jsx`, add `<Route path="/compatibility" element={<CompatibilityPage />} />` (no auth required)
  - In `client/src/components/layout/Navbar.jsx`, add `{ path: '/compatibility', label: 'Compatibility' }` (no `authRequired`) to `navLinks`
  - In `client/src/pages/HomePage.jsx`, add a "Compatibility Chart" button/link in the hero or features section
  - _Requirements: 4.5, 4.6_

- [ ] 26. Checkpoint — Feature 4 complete
  - Ensure all tests pass, ask the user if questions arise.

---

### Feature 5 — AI Chat Assistant (Gemini API)

- [ ] 27. Create `server/services/chatService.js`
  - Export `buildSystemPrompt()`: returns a string describing Little Hearts, its purpose, supported blood types, the 60-day donation gap rule, and a directive to answer only blood donation and platform-related questions
  - Export `sendMessage(message, history)`:
    - If `process.env.GEMINI_API_KEY` is absent, return the fallback string from the design spec
    - Build the Gemini API request body with `systemInstruction` and `contents` (history + new message)
    - Call `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent` via `node-fetch` or the `@google/generative-ai` SDK
    - On HTTP error, return `'Something went wrong. Please try again.'` — never throw to the caller
    - Return the response text string
  - _Requirements: 5.3, 5.4, 5.6, 5.7_

- [ ] 28. Add `POST /api/chat/message` route in new file `server/routes/chat.js`
  - Import `sendMessage` from `../services/chatService`
  - Wrap with `protect`
  - Validate: `message` body field must be present and non-empty (400); must be ≤ 1000 characters (400)
  - Call `sendMessage(message, history || [])` and return `{ response: text }`
  - _Requirements: 5.8_

- [ ] 29. Register chat route in `server/index.js`
  - Add `app.use('/api/chat', require('./routes/chat'));` after the existing route registrations
  - _Requirements: 5.8_

- [ ] 30. Create `ChatWidget` component at `client/src/components/ui/ChatWidget.jsx`
  - Render a fixed bottom-right floating button (Lucide `MessageCircle` icon, `var(--red)` background)
  - On click, toggle a chat panel open/closed
  - Panel contains: conversation history list, disclaimer text ("AI responses are for guidance only. Always verify with a medical professional."), text input + send button
  - When history is empty, show three starter question buttons: "Which blood types are compatible with O+?", "How do I find a donor in my city?", "What is the 60-day donation rule?"
  - On send, append the user message to history state, call `POST /api/chat/message`, append the response; show a loading indicator while waiting
  - Persist history to `sessionStorage` under key `chat_history` so it survives soft navigations
  - If user is not authenticated, show a "Sign in to use the AI assistant" prompt instead of the input
  - _Requirements: 5.1, 5.2, 5.5, 5.9, 5.10, 5.11_

  - [ ]* 30.1 Write property test for chat session history monotonic growth
    - **Property 13: Session history grows monotonically**
    - **Validates: Requirements 5.10**
    - File: `client/src/__tests__/properties/chatHistory.property.test.js`

- [ ] 31. Mount `ChatWidget` globally in `client/src/App.jsx`
  - Import `ChatWidget` and render it inside `AppLayout`, after `<Footer />` and outside `<main>`
  - The widget must appear on every page without re-mounting on route changes
  - _Requirements: 5.1_

- [ ] 32. Install Gemini SDK dependency on the server
  - Run `npm install @google/generative-ai` in the `server/` directory
  - Pin the version in `server/package.json` (exact version, no `^`)
  - Update `chatService.js` to use the SDK's `GoogleGenerativeAI` client instead of raw fetch if the SDK is available
  - _Requirements: 5.3_

- [ ] 33. Final checkpoint — all features complete
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests use `fast-check` and run a minimum of 100 iterations each
- Each property test file must include the tag comment `// Feature: ai-donor-matching, Property N: <text>`
- The `COMPATIBILITY_MATRIX` in `client/src/data/compatibilityMatrix.js` is the client-side source of truth; `server/services/matchingEngine.js` maintains its own copy (already present)
- The `thalassemia` role value is already present in `server/models/User.js` — no model migration needed
- Badge fields (`badges`, `donationStreak`, `karmaScore`, `lastDonationMonth`) are already present in `server/models/User.js` — no model migration needed
- The `transfusionSchedule` sub-document is already present in `server/models/User.js` — no model migration needed
- The matching engine (`server/services/matchingEngine.js`) is already fully implemented — tasks only wire it to a route and frontend component
