
# Documentation for `pages/AboutUsPage.tsx`

## 1. Purpose

This is a static informational page that tells the story behind FeVeDucation. Its goal is to build trust and connection with the user by explaining the mission, vision, and the creators of the platform.

## 2. Key Sections & Content

- **Main Headline**: A large title introducing the page and the company's mission.
- **Core Mission Statement**: A `Card` component containing a paragraph that details the "why" behind FeVeDucation.
- **Pillar Features**: A three-column section with icons that highlights the core values or goals for students, teachers, and the future of education.
- **Visionaries Section**: A section dedicated to introducing the creators, `feverdream.dev`.
- **Creator's Manifesto**: A final `Card` containing a paragraph that explains the philosophy of `feverdream.dev` and its commitment to building impactful AI applications.

## 3. Connections & Dependencies

- **`../components/Card`**: Used to structure and style the main content blocks.
- **`../components/Icons`**: Imports icons to visually represent the core values.
- This page is purely presentational and has no dependencies on `useAppContext` or any dynamic application state.

## 4. State Management

This page is stateless. It simply renders hardcoded text and images.

## 5. For Backend/Porting

- This is a pure frontend page with no backend dependencies.
- Similar to the `HomePage`, the content is currently hardcoded in the JSX. For easier updates without changing code, this content could be fetched from a Content Management System (CMS). The component would then make an API call to the CMS and render the text and image URLs it receives.
- The component's structure is simple and easily portable to any other frontend framework or even static HTML/CSS.
