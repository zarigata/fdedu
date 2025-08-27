
# Documentation for `App.tsx`

## 1. Purpose

`App.tsx` is the root component of the application. It establishes the main layout structure and, most importantly, controls all the client-side routing, determining which page or component is displayed to the user based on the URL and their login status.

## 2. Key Functionality

- **Main Layout**: It defines a consistent layout for the entire application, rendering the `<Header />` at the top and the `<Footer />` at the bottom. The main page content is rendered in between.

- **Routing**:
  - It uses `react-router-dom` for navigation. The entire component is wrapped in `<HashRouter>`, which uses the URL hash (`#`) for routing. This is a simple and effective method for SPAs that doesn't require server-side configuration.
  - The `<Routes>` component acts as a container for all possible routes.
  - Each `<Route>` defines a URL `path` and the `element` (page component) to render for that path.

- **Role-Based Access Control (RBAC)**: This component implements the application's security model.
  - It uses the `useAppContext` hook to get the current `user` object from the global state.
  - It conditionally renders routes based on whether a user is logged in and what their `role` is (`STUDENT`, `TEACHER`, or `ADMIN`).
  - For example, the `/admin` route is only rendered if `user?.role === UserRole.ADMIN`. This prevents users from accessing pages they are not authorized to see.

- **Redirects**:
  - It uses the `<Navigate />` component from `react-router-dom` for redirects.
  - For instance, if a logged-in user tries to visit the `/login` page, they are redirected back to the homepage (`/`).
  - A catch-all route (`path="*"`) handles any undefined URLs. It intelligently redirects logged-in users to their respective dashboards and logged-out users to the homepage.

## 3. Connections & Dependencies

- **`react-router-dom`**: The core dependency for all routing functionality.
- **`./hooks/useAppContext`**: Used to access the global application state, primarily the `user` object to check for authentication and authorization.
- **`./components/Header` & `./components/Footer`**: These layout components are rendered on every page.
- **All Page Components**: It imports all the page components from the `/pages` directory (e.g., `HomePage`, `LoginPage`, `AdminPage`, etc.) and maps them to their corresponding routes.
- **`./types`**: Imports the `UserRole` enum to check against the user's role.

## 4. For Backend/Porting

- **Routing**: The routing logic is fundamental. Any port or rewrite would need to replicate this structure of public routes, authenticated routes, and role-specific routes. On a platform with server support, you might switch from `<HashRouter>` to `<BrowserRouter>` for cleaner URLs (without the `#`).
- **Authorization**: The RBAC logic is currently implemented entirely on the client-side. In a production application with a real backend, this is **not secure**.
  - A proper implementation would involve the backend validating the user's session/token on every API request for protected data. The client-side routing should be seen as a UX convenience, while the **backend must be the ultimate authority on data access**.
  - When porting, you would build API endpoints that are protected by middleware checking the user's role before returning data. The frontend would then show or hide links based on the role, and if a user tried to access an unauthorized API, it would fail with a `403 Forbidden` error.
