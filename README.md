
# FeVeDucation - Next Generation Education Platform

FeVeDucation is a modern, AI-powered education platform designed to provide a dynamic and engaging learning experience. It leverages generative AI to assist both teachers and students, streamlining classroom management and personalizing education.

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **AI Services:** Google Gemini API, OpenRouter API, Ollama (for local models)
- **Styling:** Memphis Design Philosophy & Custom Theming

---

## Environment Variables

This application is a **client-side only prototype**. It uses a multi-provider AI service layer that requires API keys. To run the application, you must create a `.env` file in the root of your project or configure these variables in your hosting environment.

```
# Required for Google Gemini API
# This key is used for the @google/genai SDK.
API_KEY=YOUR_GEMINI_API_KEY_HERE

# Required for OpenRouter API
# This key is used for making fetch calls to the OpenRouter service.
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY_HERE

# (Optional) Required for local Ollama integration
# The full URL to your running Ollama server instance.
OLLAMA_SERVER_URL=http://localhost:11434
```

The application's Admin Dashboard allows you to switch between these providers. The app checks for the presence of these keys and displays the status on the dashboard.

**IMPORTANT SECURITY NOTE**: In a production application, these keys should **NEVER** be exposed on the client-side. The `aiService.ts` file should be ported to a secure backend that proxies all calls to the AI providers.

---

## Available Scripts

In the project directory, you can run:

### `npm install`

Installs all the necessary dependencies to run the application.

### `npm start` or `npm run dev`

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) (or a similar port) to view it in the browser.

### `npm run build`

Builds the app for production to a `build` or `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

---

## Deployment

1.  **Build the Project:** Run `npm run build` on your local machine. This will create a production-ready `dist` (or `build`) folder.
2.  **Upload Files:** Using your hosting provider's File Manager or an FTP client, upload the **contents** of the `dist` folder to your website's root directory (e.g., `public_html`).
3.  **Set Environment Variables:** In your hosting control panel (e.g., Hostinger, Vercel, Netlify), find the section for setting environment variables. Add the `API_KEY`, `OPENROUTER_API_KEY`, and `OLLAMA_SERVER_URL` with their respective values. This is the most critical step for the AI features to work.

---

## How to Integrate a New AI Provider

The application is designed to be extensible. To add a new AI provider (e.g., Anthropic's API):

1.  **Update `types.ts`**: Add your new provider to the `AIProvider` enum.
2.  **Update `aiService.ts`**:
    - Add a new `else if` block in each of the main functions (`generateClassroomContent`, `analyzeSubmissions`, etc.).
    - In this block, implement the `fetch` call specific to your new provider's API documentation.
    - If the provider has a chat-like interface, you can follow the pattern used for OpenRouter and Ollama to create a compatible "chat object" that mimics the Gemini SDK's interface. This allows the UI components to work without modification.
3.  **Update `AdminPage.tsx`**: Add a new button to the "AI Provider Selection" section to allow admins to switch to your new provider.

---

## Application Roles

- **Admin:** Manages the entire platform, including user creation, classroom enrollment, and AI provider settings. Default login: `admin@feveducation.com`, password `SenhaDeAdmin1234`.
- **Teacher:** Creates and manages classrooms, generates AI assignments, and analyzes student performance.
- **Student:** Enrolls in classes and uses the AI helper for guidance on assignments.
