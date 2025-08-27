
# Documentation for `pages/AssignmentSubmissionPage.tsx`

## 1. Purpose

This page is the primary interface for students to view, work on, and submit their answers for a specific assignment. It also provides a unique, on-demand AI help feature for each question.

## 2. Key Functionality

- **Assignment Display**:
  - Fetches the correct assignment based on the URL parameters.
  - Displays the assignment's title, description, and any attached files.
  - Renders a list of all questions for the assignment.

- **Answer Input**:
  - For each question, it provides the appropriate input field (e.g., radio buttons for multiple-choice, a textarea for open-ended).
  - All answers are managed in a single `answers` state object, which maps a `questionId` to the student's answer string.

- **Submission Logic**:
  - The `handleSubmit` function collects all the answers from the state.
  - It calls the `addSubmission` function from the context to save the student's work.
  - After submission, it shows an alert and navigates the student back to the homework page.

- **Locked State**:
  - The page has a "locked" state that disables all input fields. This state is triggered if:
    - The student has already submitted the assignment (`existingSubmission` is found).
    - The assignment's due date has passed and the student has not yet submitted.
  - This prevents students from editing work after submission or submitting work after the deadline.
  - When locked, it displays a clear message explaining why.

- **On-Demand AI Helper (`AIHelperModal`)**:
  - Each question has a "Get Help" button.
  - Clicking this button opens a modal window containing a dedicated AI chat session.
  - **Crucially, this chat is contextualized specifically for the question the student asked for help on.** The `AIHelperModal` component is passed the `question` object, and it uses the `questionText` to create a highly specific system prompt for the AI (e.g., "You are a tutor helping with the question: 'What is photosynthesis?'...").
  - This provides focused, relevant guidance without the student needing to re-type the question.

## 3. Connections & Dependencies

- **`react-router-dom`**: Uses `useParams` to get IDs and `useNavigate` to redirect after submission.
- **`../hooks/useAppContext`**:
  - Fetches `classrooms`, `user`, and `submissions` data.
  - Calls `addSubmission` to save the completed assignment.
- **`../services/aiService`**: The `AIHelperModal` uses the `getAIHelperChat` function.
- **`../locales/prompts`**: The `AIHelperModal` gets its specific system instruction from the prompts file.

## 4. For Backend/Porting

- **Fetching Data**: On load, this page would fetch the specific assignment details from an endpoint like `GET /api/assignments/{id}`. It would also check for an existing submission via an endpoint like `GET /api/assignments/{id}/my-submission`.
- **Submitting Data**: The `handleSubmit` function would be replaced with a `POST` request to an endpoint like `/api/assignments/{id}/submit`. The request body would contain the `answers` object. The backend would be responsible for creating the `submission` record in the database.
- **AI Helper**: The chat logic within the `AIHelperModal` would be moved to the backend as described in the `AIHelperPage.tsx.md` documentation, with the backend managing the chat session and proxying calls to the AI provider.
