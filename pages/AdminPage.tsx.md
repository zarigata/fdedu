
# Documentation for `pages/AdminPage.tsx`

## 1. Purpose

The `AdminPage.tsx` component is the main control panel for users with the **ADMIN** role. It provides a comprehensive set of tools for managing users, classrooms, AI settings, and viewing high-level platform analytics.

## 2. Key Functionality & Tabs

The page is organized into a tabbed interface, with each tab focusing on a different aspect of platform management.

### Overview Tab
- **At-a-Glance Stats**: Displays key metrics like the total number of users and classrooms, and shows the currently active AI Provider.
- **AI Configuration**:
  - Allows the admin to switch the global `aiProvider` between Google Gemini and OpenRouter.
  - Displays the status of the required API keys by calling the `isProviderConfigured` utility from `aiService`. This provides immediate feedback on whether the backend environment variables are set correctly.

### Users Tab
- **User Lists**: Displays separate lists for all registered Teachers and Students.
- **User Creation**: A form allows the admin to create new users by providing a name, email, password, and role. It includes client-side validation to prevent duplicate emails.
- **User Details & Editing**:
  - Clicking on any user in the list opens the `UserDetailModal`.
  - The modal allows the admin to:
    - Edit the user's name, email, and role.
    - View which classes the user is enrolled in.
    - Generate a new random avatar for the user.
    - Delete the user from the system (with a confirmation prompt).

### Classrooms Tab (Classroom Manager)
- This is a highly interactive panel for managing class enrollments.
- **Drag-and-Drop Interface**:
  - It displays a list of all students on the left and a list of all classrooms on the right.
  - The admin can **drag** a student from the list and **drop** them onto a classroom card to enroll them. This is implemented using the HTML Drag and Drop API (`onDragStart`, `onDragOver`, `onDrop`).
- **Classroom Management**:
  - Each classroom card has buttons to **delete** the classroom or **edit** its name and subject via a modal (`EditClassroomModal`).
  - Admins can un-enroll a student by clicking a remove icon next to their name within a classroom card.
- **Classroom Access**: Each card has "View Classroom" and "View Homework" links, allowing the admin to enter any class in a read-only "Spectator Mode" (`ClassroomPage`) or view its assignments (`HomeworkPage`).

### FeVe-Verse Tab
- **Knowledge Graph**: This tab displays the "Living Knowledge Graph."
- It renders a live feed of all the "helpful learning moments" that were created when students "liked" an AI response in the `AIHelperPage`.
- It shows the context of the interaction (persona, assignment) and the question/answer pair, providing valuable insight into how the AI tutors are being used successfully.

## 3. Connections & Dependencies

- **`../hooks/useAppContext`**: This component is a power-user of the global context. It calls a wide range of state values and functions, including `users`, `classrooms`, `knowledgeGraph`, `addUser`, `updateUser`, `deleteUser`, `updateClassroom`, `assignStudentToClassroom`, etc.
- **`../services/aiService`**: Uses `isProviderConfigured` to check API key status.
- **`../components/Card`**, **`../components/Icons`**: Used extensively for UI structure and decoration.

## 4. For Backend/Porting

- This page demonstrates many actions that would translate directly to API endpoints.
- **User Management**: `POST /api/users`, `PUT /api/users/{id}`, `DELETE /api/users/{id}`.
- **Classroom Management**: `POST /api/classrooms`, `PUT /api/classrooms/{id}`, `DELETE /api/classrooms/{id}`.
- **Enrollment**: The drag-and-drop actions would trigger API calls like `POST /api/classrooms/{classId}/students` (with a body of `{ studentId }`) and `DELETE /api/classrooms/{classId}/students/{studentId}`.
- **Knowledge Graph**: The data would be fetched from a `/api/knowledge-graph` endpoint.
- All data fetching would be replaced with authenticated API calls, and all state modifications would be sent to the backend to be persisted in the database.
