
# Documentation for `README.md`

## 1. Purpose

This file is the primary entry point for a developer looking to understand and run the FeVeDucation project. It provides essential information about the project's purpose, technology stack, setup instructions, and guidance for extension.

## 2. Key Sections

-   **Project Title & Description**: A brief overview of what FeVeDucation is.

-   **Tech Stack**: Lists the core technologies used on the frontend (React, TypeScript, Tailwind) and for the AI services.

-   **Environment Variables**:
    -   This is a **critical** section. It clearly lists the environment variables (`API_KEY`, `OPENROUTER_API_KEY`, etc.) that are required for the application's AI features to function.
    -   It explains what each variable is for.
    -   It includes a crucial **security warning**, correctly stating that in a production application, these keys should never be exposed on the client-side and that the `aiService.ts` logic must be moved to a secure backend. This is an excellent instruction for the next developer.

-   **Available Scripts**: Standard `npm` commands (`install`, `start`, `build`) for working with the project.

-   **Deployment**: Provides a basic guide for deploying the built static files to a hosting provider and, most importantly, reiterates the need to configure the environment variables on that provider.

-   **How to Integrate a New AI Provider**: Gives a high-level overview of the steps required to extend the `aiService.ts` to support a new AI model, demonstrating the application's extensible design.

-   **Application Roles**: Describes the different user roles and provides the default login credentials for the admin account, which is essential for testing.

## 3. For Backend/Porting

-   This README is well-prepared for a handover to a backend developer.
-   **Evolution**: When the backend is built, this README should be updated:
    -   The **Tech Stack** section should be expanded to include the backend technologies (e.g., Node.js, Express, PostgreSQL, Prisma).
    -   The **Environment Variables** section should be updated to include any new backend-specific variables (e.g., `DATABASE_URL`, `JWT_SECRET`).
    -   A new section on **Running the Backend** should be added.
    -   The **Available Scripts** might be updated to include a command to run both the frontend and backend concurrently (e.g., using `concurrently`).
    -   The **Deployment** section would become more detailed, explaining how to deploy both the frontend static assets and the backend server application.
