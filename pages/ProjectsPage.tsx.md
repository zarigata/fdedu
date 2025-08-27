
# Documentation for `pages/ProjectsPage.tsx`

## 1. Purpose

This page serves as the main dashboard for group projects within a specific classroom. For teachers, it's where they can create and manage projects. For students, it's where they can see the project they have been assigned to.

## 2. Key Functionality

### For Teachers
-   **Project Creation**: A "Create Project" button opens a detailed modal (`CreateProjectModal`).
-   **Creation Modal**: This modal allows teachers to:
    -   Define a project title, description, and due date.
    -   Use an **AI Helper** to generate project ideas based on a topic.
    -   Create student groups (`Group 1`, `Group 2`, etc.).
    -   Use a **drag-and-drop interface** to assign students from the "Unassigned" pool into the different groups.
-   **Project Management**: Teachers can see all projects in the class and have a button to delete them.

### For Students
-   **Project Viewing**: Students see only the specific project their group has been assigned to.
-   **Access to Hub**: A button links them directly to the `ProjectHubPage`, which is the dedicated workspace for their project.

## 3. State Management

-   **Global State (from `useAppContext`)**:
    -   Reads `user`, `classrooms`, and `users` to determine roles and display project/student information.
    -   Calls `createProject` and `deleteProject` to modify the global state.
-   **Local State (`useState`)**:
    -   `isCreateModalOpen`: Controls the visibility of the creation modal.
    -   The `CreateProjectModal` itself heavily uses local state to manage the form inputs, the list of groups, and the drag-and-drop functionality.

## 4. For Backend/Porting

-   **Data Fetching**: The page would fetch project data from an endpoint like `GET /api/classrooms/{id}/projects`. A student's request to this endpoint should return only the project they are assigned to.
-   **Project Creation**: The `CreateProjectModal` would submit its data to a `POST /api/classrooms/{id}/projects` endpoint. The request body would contain the project details and the group structure, including which students are in which group.
-   **Project Deletion**: The delete button would trigger a `DELETE /api/projects/{id}` request.
-   **AI Idea Generation**: The AI Helper would call a backend endpoint like `POST /api/ai/generate-project-ideas`, which would then securely call the AI service.
-   The drag-and-drop logic for assigning students would remain on the client-side within the modal, but the final group structure would be sent to the backend upon creation.
