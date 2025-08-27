
# Documentation for `components/Footer.tsx`

## 1. Purpose

The `Footer` component is a shared UI component that appears at the bottom of every page in the application. It provides supplementary navigation links, branding, and legal information.

## 2. Key Functionality

- **Layout**: It uses a grid layout to organize links into logical columns ("Company", "Legal").
- **Branding**: Displays the "FeVeDucation" name and a tagline.
- **Navigation**:
  - It contains `Link` components from `react-router-dom` to navigate to important but less frequently accessed pages:
    - `/about`: The About Us page.
    - `/terms`: The Terms and Conditions page.
    - `/privacy`: The Privacy Policy page.
- **Copyright Information**: Displays a copyright notice with the current year, which is dynamically generated using `new Date().getFullYear()`.

## 3. Connections & Dependencies

- **`react-router-dom`**: Uses the `Link` component for client-side navigation.
- It has no other internal dependencies and does not connect to the application's context or state. It is a purely presentational component.

## 4. For Backend/Porting

- This is a standard frontend component with no backend logic.
- The links are hardcoded. In a more complex application, particularly one built on a CMS like WordPress, these footer links might be dynamically managed through a menu system in the admin dashboard. In that case, the component would fetch the menu structure from an API instead of hardcoding the `Link` components.
- The component's structure and styling are directly portable to other frontend frameworks.
