
# Documentation for `pages/SchoolManagerDashboard.tsx`

## 1. Purpose

This page is the central administrative hub for users with the **School Manager** role. It provides tools to manage all users (teachers and students) associated with their specific school and to oversee the school's allocation of AI resources.

## 2. Key Functionality

-   **School-Scoped Data**: The component filters the global `users` list to display only those who share the same `schoolId` as the logged-in manager.

-   **High-Level Statistics**: Displays key metrics in `Card` components:
    -   Total number of teachers.
    -   Total number of students.
    -   Total remaining AI tokens pooled across all users in the school.

-   **User Management Table**:
    -   Lists all teachers and students in the school.
    -   For each user, it displays their name, role, and current AI token balance.
    -   Provides action buttons for each user:
        -   **Refill Tokens**: Opens a modal (`RefillModal`) to add a specified number of AI tokens to the user's balance.
        -   **Edit**: Opens a modal (`UserModal`) to change the user's name, email, password, or role.
        -   **Delete**: Removes the user from the system.

-   **User Creation**: A main "Create New User" button opens the `UserModal`, allowing the manager to add new teachers or students directly to their school. The `schoolId` is automatically assigned.

-   **AI Usage Visualization**:
    -   It renders a `BarChart` component to provide a simple, visual overview of how AI tokens are distributed among the users. This helps the manager quickly identify who is using the most resources.

## 3. Connections & Dependencies

-   **`../hooks/useAppContext`**: Heavily relies on the context for:
    -   `user`: To get the manager's `schoolId`.
    -   `users`: To get the list of all users to filter.
    -   `addUser`, `updateUser`, `deleteUser`, `refillAITokens`: The functions to call to perform management actions.
-   **`../components/Card`**, **`../components/Avatar`**, **`../components/BarChart`**: For UI structure and data visualization.

## 4. For Backend/Porting

-   This page's functionality would be entirely driven by a set of secure, role-protected API endpoints. A regular user should not be able to access these.

-   **Data Fetching**: On page load, it would call an endpoint like `GET /api/school/dashboard`. The backend would use the manager's `schoolId` from their session to fetch all associated users and calculate the stats.

-   **User Management API**:
    -   **Create**: `POST /api/school/users`. The backend would automatically associate the new user with the manager's `schoolId`.
    -   **Update**: `PUT /api/school/users/{userId}`.
    -   **Delete**: `DELETE /api/school/users/{userId}`.

-   **Token Management API**:
    -   `POST /api/school/users/{userId}/refill-tokens`.
    -   **Request Body**: `{ "amount": 100 }`.
    -   The backend should have logic to ensure a manager cannot allocate more tokens than the school possesses (if such a system is implemented).
