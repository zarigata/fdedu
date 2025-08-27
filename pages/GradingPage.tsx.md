
# Documentation for `pages/GradingPage.tsx`

## 1. Purpose

This page provides teachers with a dedicated interface for grading student submissions for a specific assignment. It streamlines the grading process by displaying each student's work alongside input fields for their score and written feedback.

## 2. Key Functionality

- **Data Fetching and Scoping**:
  - It uses `useParams` to get the `classroomId` and `assignmentId` from the URL.
  - It then uses `useMemo` hooks to efficiently find and memoize the relevant classroom, assignment, and list of students from the global state.

- **Student-by-Student Layout**:
  - The page maps over the list of students in the class, creating a distinct `Card` for each one. This organizes the grading work clearly.

- **Submission Display**:
  - For each student, it finds their specific `Submission` for the current assignment.
  - If a submission exists and has answers, it displays the questions from the assignment along with the student's corresponding answers.
  - If no submission was made, it displays a clear "No submission was made by the student" message.

- **Grading and Feedback Inputs**:
  - Each student card has input fields for a numerical grade (0-100) and a textarea for qualitative feedback.
  - The component uses a local `grades` state object to manage the input values for all students, initialized from any existing grades in the global state.
  - This allows the teacher to see and edit all grades on one screen.

- **Updating Grades**:
  - Each student card has an "Update" button.
  - When clicked, `handleUpdateGrade` is called for that specific student.
  - It performs basic validation to ensure the grade is a number between 0 and 100.
  - It then calls the `gradeSubmission` function from `useAppContext`, which handles either updating an existing submission record or creating a new one if the teacher is grading an assignment the student didn't formally submit through the app.

## 3. Connections & Dependencies

- **`react-router-dom`**: Uses `useParams` to identify the assignment and `Link` to navigate back to the homework page.
- **`../hooks/useAppContext`**: A core dependency for fetching `classrooms`, `users`, and `submissions`, and for calling the `gradeSubmission` function to save the data.
- **`../components/Card`** and **`../components/Avatar`**: Used for structuring the UI.

## 4. For Backend/Porting

- **Data Fetching**: The component would fetch the assignment details and a list of all submissions for that assignment from an endpoint like `GET /api/assignments/{id}/submissions`.
- **Updating a Grade**: The `handleUpdateGrade` function would be replaced with an API call, for example `PUT /api/submissions/{submissionId}` or `POST /api/assignments/{assignmentId}/students/{studentId}/grade`.
- **Backend Logic**:
  - The backend endpoint would receive the grade and feedback.
  - It would find the corresponding submission record in the database and update its `grade` and `feedback` fields.
  - If no submission record exists, it should create one, associating it with the correct student and assignment. This is important for handling offline work or assignments completed outside the app.
