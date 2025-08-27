
# Documentation for `pages/HomePage.tsx`

## 1. Purpose

`HomePage.tsx` is the main landing page for the FeVeDucation application. It serves as the public-facing "front door" for users who are not yet logged in. Its goal is to explain the platform's value proposition and encourage visitors to sign up or log in.

## 2. Key Sections & Content

- **Hero Section**:
  - A large, attention-grabbing section at the top.
  - Features a main headline, a descriptive paragraph, and a primary "call-to-action" button (`Launch The Future`) that links to the login page.
  - Includes decorative, animated "blob" elements in the background for visual flair. The animation is defined with `@keyframes` in an inline `<style>` tag.

- **Features Grid**:
  - A three-column grid that highlights the main features of the platform: "AI-Powered Classrooms," "Intelligent Tutoring," and "Actionable Analytics."
  - Uses the reusable `FeatureCard` component.

- **"For Teachers" & "For Students" Sections**:
  - Two dedicated sections that elaborate on the benefits for each primary user type.
  - They use a two-column layout, combining descriptive text and bullet points with illustrative, non-functional `Card` components to create a visually engaging collage.

- **Fade-In Animation**:
  - The page uses a `useEffect` hook and the `IntersectionObserver` API to implement a fade-in-on-scroll effect.
  - Sections with the `.fade-in-section` class are initially hidden (`opacity: 0`). When they scroll into the viewport, the `is-visible` class is added, triggering a CSS transition to fade them in.

## 3. Connections & Dependencies

- **`react-router-dom`**: Uses the `Link` component to navigate users to the `/login` page.
- **`../components/Card`**: Heavily used throughout the page to create styled content containers.
- **`../components/Icons`**: Imports various icons to be displayed within feature cards and bullet points.

## 4. State Management

This page is largely static and does not interact with the application's global state (it has no need for `useAppContext`). It's a presentational page for all visitors.

## 5. For Backend/Porting

- This is a pure frontend page with no backend dependencies.
- The content is currently hardcoded within the JSX. For a more flexible system (like a marketing site or a WordPress theme), this content could be fetched from a Content Management System (CMS). In that case, the component would make an API call to the CMS to get the text for headlines, descriptions, and feature lists, and then render it dynamically.
- The `IntersectionObserver` logic is a standard web API and is portable to any JavaScript environment.
