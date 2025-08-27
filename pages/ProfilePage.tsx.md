
# Documentation for `pages/ProfilePage.tsx`

## 1. Purpose

This page allows logged-in users to view and update their own profile information. It provides a user-friendly interface for managing personal details, passwords, and social links.

## 2. Key Functionality

- **Data Pre-population**:
  - A `useEffect` hook runs when the component mounts. It populates the form fields with the current user's data, which is retrieved from the `user` object in the `AppContext`.
  - This ensures that when users visit the page, they see their current information ready to be edited.

- **Profile Form**:
  - The form is divided into sections for clarity:
    - **Avatar**: Displays the user's current avatar and a button to generate a new one by calling `updateUserAvatar`.
    - **Core Info**: Fields for `Name` and `Email`.
    - **Password**: An input for setting a *new* password. It is designed to be left blank if the user does not wish to change their password.
    - **Personalization**: "Likes" and "Dislikes" fields.
    - **Social Links**: Inputs for a personal website, Discord handle, and X (Twitter) handle.

- **Form Submission**:
  - The `handleSubmit` function is called on form submission.
  - It constructs an `updatedData` object with all the new values from the form's state.
  - It conditionally adds the `password` to the object only if the user has typed something into the password field.
  - It then calls the `updateUser` function from the `useAppContext` to save the changes to the global state (and `localStorage`).
  - It provides user feedback by displaying a "Profile updated successfully!" message for a few seconds.

## 3. Connections & Dependencies

- **`../hooks/useAppContext`**: This is a critical dependency. The page uses it to:
  - `user`: Get the current user's data to display and edit.
  - `updateUser`: The function to call to save all profile changes.
  - `updateUserAvatar`: The function to call to generate a new random avatar.
- **`../components/Card`**: The form and avatar sections are wrapped in `Card` components for consistent styling.
- **`../components/Icons`**: Imports various icons to be displayed next to input fields and on buttons.

## 4. For Backend/Porting

- This component's logic would be entirely backed by API calls in a production environment.
- **Data Fetching**: On page load, instead of getting the user from context, it would make an authenticated request to an endpoint like `GET /api/profile/me` to fetch the current user's data.
- **Data Updating**: The `handleSubmit` function would not call a context function. Instead, it would make a `PUT` or `PATCH` request to an endpoint like `/api/profile/me`, sending the `updatedData` object in the request body.
- **Password Handling**: The backend must handle password updates securely by hashing the new password before saving it to the database.
- The `updateUserAvatar` function might call a separate endpoint like `POST /api/profile/avatar` that would handle the avatar generation logic and update the user's record.
