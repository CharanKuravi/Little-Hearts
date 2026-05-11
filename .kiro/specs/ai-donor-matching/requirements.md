# Requirements Document

## Introduction

This document defines requirements for five AI-powered features added to **Little Hearts**, a MERN-stack blood bank management platform. The features are: Smart Donor Matching Score, Thalassemia Patient Mode, Donor Engagement & Badges System, Blood Compatibility Chart, and an AI Chat Assistant powered by the Gemini API.

The platform already supports donor/recipient registration with Aadhar verification, blood requests with urgency levels, an Instagram-style connection system, and an admin panel. All new features must integrate with the existing JWT-based auth system, MongoDB data layer, and macOS/iOS design language (SF Pro, Apple system colors, Lucide React icons, no emojis).

---

## Glossary

- **Matching_Engine**: The server-side service that computes donor match scores for a given blood request.
- **Match_Score**: A numeric value between 0 and 100 representing how well a donor fits a specific blood request.
- **Compatibility_Matrix**: The full ABO/Rh blood type compatibility table defining which donor types can give to which recipient types.
- **Thalassemia_Patient**: A registered user with the `thalassemia` profile type who requires recurring blood transfusions.
- **Transfusion_Schedule**: A recurring schedule stored per Thalassemia_Patient defining frequency and next transfusion date.
- **Badge**: A visual achievement awarded to a donor upon reaching a defined donation milestone.
- **Karma_Score**: A cumulative numeric score reflecting a donor's total impact, calculated from donation count, streak, and recency.
- **Donation_Streak**: The count of consecutive calendar months in which a donor has completed at least one donation.
- **Chat_Assistant**: The floating AI chat widget powered by the Gemini API that answers platform-related questions.
- **Gemini_API**: Google's generative AI API used to power the Chat_Assistant.
- **System**: The Little Hearts platform as a whole, encompassing both the React/Vite frontend and the Express/MongoDB backend.
- **API**: The Express backend REST API.
- **UI**: The React/Vite frontend application.

---

## Requirements

### Requirement 1: Smart Donor Matching Score

**User Story:** As a recipient, I want to see a ranked list of compatible donors when I post a blood request, so that I can contact the most suitable donor quickly.

#### Acceptance Criteria

1. WHEN a blood request is created or viewed, THE Matching_Engine SHALL compute a Match_Score for every registered donor whose blood type is compatible with the request's required blood type according to the Compatibility_Matrix.

2. THE Matching_Engine SHALL compute the Match_Score using the following weighted factors:
   - Blood type compatibility: 40 points (exact match scores 40; compatible-but-not-exact scores 20)
   - Same city as the request: 25 points
   - Availability status (`isAvailable: true`): 20 points
   - Last donation date at least 60 days before the current date: 10 points
   - Total donations (1 point per donation, capped at 5 points): 5 points

3. WHEN the request detail page is loaded, THE UI SHALL display the top 10 donors ranked by Match_Score in descending order, each showing the donor's name, blood type badge, city (if visible per privacy rules), Match_Score as a percentage, and availability status.

4. WHEN a donor's phone is hidden due to the connection privacy system, THE UI SHALL display the donor's Match_Score and a "Request to Connect" button instead of a phone number on the matched donors list.

5. THE UI SHALL display a "Find Matching Donors" button on each blood request card in the requests list page.

6. WHEN the "Find Matching Donors" button is clicked, THE UI SHALL navigate to the request detail page and scroll to the matched donors section.

7. IF no compatible donors are found for a request, THEN THE UI SHALL display a message stating "No compatible donors found" in the matched donors section.

8. WHILE a blood request has status `fulfilled` or `cancelled`, THE UI SHALL NOT display the matched donors section on the request detail page.

9. THE API SHALL expose a `GET /api/requests/:id/matches` endpoint that returns the ranked list of matched donors for a given request, accessible to authenticated users only.

---

### Requirement 2: Thalassemia Patient Mode

**User Story:** As a Thalassemia patient, I want a dedicated profile type with a recurring transfusion schedule, so that the system can surface compatible donors automatically before each transfusion.

#### Acceptance Criteria

1. THE System SHALL support a `thalassemia` value in the user `role` field (in addition to the existing `donor`, `recipient`, `both`, and `admin` values).

2. WHEN a user registers or edits their profile, THE UI SHALL present a "Thalassemia Patient" option in the role selector.

3. WHEN a user's role is `thalassemia`, THE System SHALL store a Transfusion_Schedule containing: next transfusion date, frequency in weeks (minimum 2, maximum 4), and required blood type.

4. WHEN a Thalassemia_Patient views their dashboard, THE UI SHALL display a countdown in days to the next transfusion date.

5. WHEN the next transfusion date is 7 days or fewer away, THE UI SHALL highlight the countdown with a visual urgency indicator using the system's red color (`var(--red)`).

6. WHEN a Thalassemia_Patient views their dashboard, THE UI SHALL display a list of up to 10 compatible donors ranked by Match_Score for the patient's required blood type and city.

7. THE UI SHALL include a dedicated "Thalassemia Patients" section accessible from the navbar, listing registered Thalassemia_Patients with their next transfusion date and required blood type, visible to all authenticated users.

8. IF a Thalassemia_Patient's next transfusion date has passed without being updated, THEN THE System SHALL automatically advance the next transfusion date by the stored frequency in weeks.

9. THE API SHALL expose a `PUT /api/auth/profile/transfusion-schedule` endpoint that allows a Thalassemia_Patient to update their Transfusion_Schedule, protected by JWT authentication.

---

### Requirement 3: Donor Engagement & Badges System

**User Story:** As a donor, I want to earn badges and see my impact score on my profile, so that I feel recognized for my contributions and am motivated to donate regularly.

#### Acceptance Criteria

1. THE System SHALL define the following donation milestone badges:
   - **First Drop**: awarded when `totalDonations` reaches 1
   - **Regular Hero**: awarded when `totalDonations` reaches 5
   - **Lifesaver**: awarded when `totalDonations` reaches 10
   - **Legend**: awarded when `totalDonations` reaches 25

2. WHEN a donation is recorded and the donor's `totalDonations` crosses a milestone threshold, THE System SHALL add the corresponding Badge to the donor's profile.

3. THE System SHALL compute the Karma_Score for each donor using the formula: `(totalDonations × 10) + (Donation_Streak × 5)`, with a maximum value of 500.

4. WHEN a donation is recorded in a calendar month that is consecutive with the donor's previous donation month, THE System SHALL increment the donor's Donation_Streak by 1.

5. IF a donor has no donation recorded in a calendar month that follows their last donation month, THEN THE System SHALL reset the donor's Donation_Streak to 0.

6. WHEN a donor's profile page is viewed, THE UI SHALL display all earned badges, the Karma_Score, and the current Donation_Streak.

7. WHEN a donor card is displayed in the search results on the donors page, THE UI SHALL display up to 3 of the donor's highest-tier earned badges below the blood type badge.

8. WHEN a logged-in donor views their dashboard, THE UI SHALL display a "My Achievements" section showing all earned badges, Karma_Score, Donation_Streak, and the next milestone badge with the number of donations remaining to earn it.

9. THE API SHALL expose a `GET /api/users/:id/badges` endpoint that returns the badge list, Karma_Score, and Donation_Streak for a given user, accessible without authentication.

---

### Requirement 4: Blood Compatibility Chart

**User Story:** As a user, I want to view a full interactive blood compatibility chart, so that I can understand which blood types are compatible for donation and transfusion.

#### Acceptance Criteria

1. THE System SHALL provide a dedicated `/compatibility` route rendering a full-page Blood Compatibility Chart.

2. THE UI SHALL display the Compatibility_Matrix as an 8×8 grid with donor blood types on one axis and recipient blood types on the other axis, using visual indicators to mark compatible and incompatible pairings.

3. WHEN a user clicks a blood type cell in the Compatibility_Matrix, THE UI SHALL highlight all compatible donor columns and recipient rows for that blood type.

4. WHEN a blood type is selected in the Compatibility_Matrix, THE UI SHALL display a summary panel listing: which types the selected type can donate to, and which types can donate to the selected type.

5. THE UI SHALL include a "Compatibility Chart" link in the navbar, visible to all users (authenticated and unauthenticated).

6. THE UI SHALL include a "Compatibility Chart" link or button on the homepage, accessible without login.

7. THE UI SHALL include an educational section on the compatibility page covering: an explanation of ABO and Rh blood group systems, a brief description of Thalassemia and its transfusion requirements, and general blood donation eligibility guidelines.

8. WHEN a user navigates to the compatibility page with a `?highlight=<bloodType>` query parameter, THE UI SHALL pre-select and highlight that blood type in the Compatibility_Matrix.

---

### Requirement 5: AI Chat Assistant (Gemini API)

**User Story:** As a user, I want a floating chat assistant on every page, so that I can get instant answers about blood compatibility, donation eligibility, and how to use the Little Hearts platform.

#### Acceptance Criteria

1. THE UI SHALL render a floating chat button fixed to the bottom-right corner of every page, using a Lucide React icon and the system's red color scheme.

2. WHEN the floating chat button is clicked, THE UI SHALL open a chat panel displaying the conversation history and a text input field.

3. WHEN a user submits a message in the chat panel, THE Chat_Assistant SHALL send the message along with a system prompt describing the Little Hearts platform context to the Gemini_API and display the response.

4. THE Chat_Assistant system prompt SHALL include: the platform name (Little Hearts), its purpose (connecting blood donors with recipients, with a focus on Thalassemia patients), the list of supported blood types, the 60-day donation gap rule, and a directive to answer only blood donation and platform-related questions.

5. WHEN the Gemini_API returns a response, THE UI SHALL display the response text in the chat panel within 10 seconds of the user submitting the message.

6. IF the Gemini_API key is not configured in the server environment, THEN THE Chat_Assistant SHALL respond with a predefined fallback message: "The AI assistant is currently unavailable. Please use the Compatibility Chart or contact a donor directly."

7. IF the Gemini_API returns an error response, THEN THE Chat_Assistant SHALL display the message: "Something went wrong. Please try again." without exposing API error details to the user.

8. THE API SHALL expose a `POST /api/chat/message` endpoint that accepts a `{ message: string }` body, forwards the message to the Gemini_API with the platform context prompt, and returns the response text, protected by JWT authentication.

9. WHEN the chat panel is open, THE UI SHALL display a disclaimer: "AI responses are for guidance only. Always verify with a medical professional."

10. THE Chat_Assistant SHALL retain conversation history within a single browser session so that follow-up questions have context from earlier messages in the same session.

11. WHERE the user has not yet sent any message, THE UI SHALL display three suggested starter questions: "Which blood types are compatible with O+?", "How do I find a donor in my city?", and "What is the 60-day donation rule?"
