
# Documentation for `pages/LoginPage.tsx`

## 1. Purpose

`LoginPage.tsx` provides the user interface for both **logging in** existing users and **signing up** new users. It's a crucial entry point for authenticated sessions in the application.

## 2. Key Functionality

- **Tabbed Interface**: The component uses a simple tabbed design to switch between the "Login" form and the "Sign Up" form. The active form is controlled by the `activeTab` local state variable.

- **Login Form**:
  - Collects `email` and `password`.
  - On submission, it calls the `login` function from `useAppContext`.
  - If `login` returns `true`, it uses `useNavigate` to redirect the user to their appropriate dashboard (this redirect is handled by the logic in `App.tsx`).
  - If `login` returns `false`, it displays an "Invalid email or password" error message.

- **Sign-Up Form**:
  - Collects `name`, `email`, `password`, and `role` (`Student` or `Teacher`).
  - Performs client-side validation to check for empty fields and to see if the email is already in use by another user.
  - If validation passes, it calls the `addUser` function from `useAppContext` to create the new user account.
  - After successfully creating the account, it immediately calls `login` to sign the new user in and redirect them.

- **Error Handling**: A single `error` state variable is used to display feedback to the user, such as "Invalid password," "All fields are required," or "Email already exists."

## 3. Connections & Dependencies

- **`react-router-dom`**: Uses `useNavigate` to programmatically redirect the user after a successful login or sign-up.
- **`../hooks/useAppContext`**: This is the most critical dependency. It's used to access:
  - `login`: The function to authenticate a user.
  - `addUser`: The function to create a new user.
  - `users`: The array of all existing users, used to check for duplicate emails during sign-up.
- **`../types`**: Imports the `UserRole` enum for the role selection dropdown.
- **`../components/Card`**: The entire form is wrapped in a `Card` component for consistent styling.

## 4. For Backend/Porting

- In a real application, the logic in this component would be replaced with API calls to a backend.
- **Login**: The `handleLogin` function would make a `POST` request to an `/api/login` endpoint, sending the email and password.
  - The backend would validate the credentials against the database.
  - On success, the backend would return a session token (e.g., a JWT), which the frontend would store (e.g., in an `HttpOnly` cookie or `localStorage`) and use to authenticate future API requests. The `login` function in the context would be updated to handle this token storage.
- **Sign-Up**: The `handleSignup` function would make a `POST` request to an `/api/register` or `/api/users` endpoint.
  - All validation (like checking for duplicate emails) should be performed on the backend to be secure. The client-side check is a UX convenience.
  - The backend would hash the user's password before storing it in the database. **Never store passwords in plain text.**
- The `users` array would no longer be fetched from the context for validation; this would be handled entirely by the backend API.
