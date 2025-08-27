
# Documentation for `pages/CreateClassroomPage.tsx`

## 1. Purpose

This page provides a simple and focused interface for teachers to create a new classroom. This component has been intentionally streamlined to only handle the initial creation of a classroom "shell." All content, such as assignments, is added later from within the classroom's `HomeworkPage`.

## 2. Key Functionality

- **Simple Form**: The UI consists of a straightforward form with two required fields:
  - **Class Name**: The name of the classroom (e.g., "Grade 10 History").
  - **Subject**: The subject matter of the class (e.g., "History").

- **Form Submission**:
  - On submission, the `handleSubmit` function is triggered.
  - It performs basic validation to ensure the fields are not empty.
  - It constructs a `newClassroom` object, adhering to the `Classroom` type structure.
    - It sets the `teacherId` to the ID of the currently logged-in `user`.
    - It initializes `studentIds` and `assignments` as empty arrays.
    - It randomly assigns a `color` and `pattern` for visual distinction on the dashboard.
  - It calls the `addClassroom` function from the `useAppContext` to save the new classroom to the global state.
  - Finally, it uses `useNavigate` to redirect the teacher back to their dashboard, where they will see the newly created class.

## 3. Connections & Dependencies

- **`react-router-dom`**: Uses `useNavigate` to redirect the teacher after successful creation.
- **`../hooks/useAppContext`**: A critical dependency for:
  - `user`: To get the `id` of the teacher creating the class.
  - `addClassroom`: The function to call to persist the new classroom data.
- **`../components/Card`**: The form is wrapped in a `Card` for consistent UI styling.
- **`../components/Icons`**: Uses `IconPlus` on the submit button.
- **`../types`**: Imports the `Classroom` type.

## 4. For Backend/Porting

- The logic in this component would be replaced by a single API call.
- **API Design**: The `handleSubmit` function would make an authenticated `POST` request to an endpoint like `/api/classrooms`.
  - The request body would contain the `name` and `subject`:
    ```json
    {
      "name": "Grade 10 History",
      "subject": "History"
    }
    ```
- **Backend Logic**:
  - The backend endpoint would receive the request.
  - The `teacherId` would be extracted from the user's authenticated session token on the server, not sent from the client.
  - The backend would then insert a new record into the `classrooms` table in the database.
  - It would return the newly created classroom object (including its new database ID) to the frontend.
- The frontend would then use this response to update its local state and redirect the user.
