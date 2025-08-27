
# Documentation for `components/Header.tsx`

## 1. Purpose

The `Header` component is a shared UI component that appears at the top of every page in the application. It provides the main site navigation, branding, and user-specific actions like logging in, logging out, and accessing the profile or dashboard.

## 2. Key Functionality

- **Branding**: Displays the "FeVeDucation" logo, which links back to the homepage.
- **Responsive Navigation**: The layout adapts to different screen sizes.
- **Dynamic UI based on User State**: The component's appearance and functionality change significantly depending on whether a user is logged in.
  - **Logged-Out State**: It shows a prominent "Login" button.
  - **Logged-In State**: It hides the "Login" button and instead shows:
    - A link to the user's specific dashboard (Admin, Teacher, or Student).
    - A link to the user's profile page, which displays their avatar and name.
    - A "Logout" button.
    - A special "Admin" link with a shield icon, which is only visible if the user's role is `ADMIN`.
- **Theme Toggling**: It includes a button that allows the user to switch between light and dark modes. This button calls the `toggleTheme` function from the `AppContext`.
- **Logout Logic**: The "Logout" button calls the `logout` function from the context and then uses the `useNavigate` hook from `react-router-dom` to redirect the user to the `/login` page.

## 3. Connections & Dependencies

- **`react-router-dom`**: Uses `Link` for client-side navigation and `useNavigate` for programmatic redirects (e.g., after logout).
- **`../hooks/useAppContext`**: This is a crucial dependency. The component uses it to access:
  - `user`: To determine if a user is logged in and what their role is.
  - `logout`: The function to call when the user clicks the logout button.
  - `theme`: To determine the current theme.
  - `toggleTheme`: The function to switch between light and dark mode.
- **`../types`**: Imports `UserRole` and `Theme` enums for type checking.
- **`./Icons`**: Imports various icon components to be displayed in the buttons and links.

## 4. For Backend/Porting

- This is a standard frontend component. Its logic is portable to other frameworks.
- The key concept to maintain is its **dependency on a global state management system** to get the current user's status. In a different architecture, it would subscribe to a state store (like Redux or Pinia) or receive the user data as a prop from a parent layout component.
- The navigation links (`to="..."`) would need to be updated to match the routing system of the new platform.
