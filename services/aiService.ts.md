
# Documentation for `services/aiService.ts`

## 1. Purpose

This file is the **centralized service layer** for all interactions with third-party AI providers. It acts as an abstraction layer, meaning that the rest of the application doesn't need to know the specific details of how to talk to Google Gemini vs. OpenRouter. Components simply call a function from this service, and it handles the underlying API communication.

## 2. Backend Requirements & Security

- This service directly depends on API keys being available as **environment variables**:
  - `process.env.API_KEY` for Google Gemini.
  - `process.env.OPENROUTER_API_KEY` for OpenRouter.
- **CRITICAL**: These keys **must** be configured in the hosting environment (e.g., as secrets in Vercel, Netlify, or Hostinger's control panel). Without them, the AI features will fail.
- The `isProviderConfigured` function is a utility to check if these keys have been successfully loaded.
- In a production environment, these API calls should be made from a secure backend server, not directly from the client, to protect the API keys. This file serves as a perfect blueprint for which backend API endpoints to build.

## 3. Key Functions

### `generateClassroomContent(provider, subject, topic)`
- **Goal**: To generate a set of assignments and questions based on a topic.
- **Gemini Implementation**:
  - Uses the official `@google/genai` SDK.
  - It leverages Gemini's **structured output** feature by providing a `responseSchema`. This forces the AI to return a clean, predictable JSON object that matches the application's types, which is far more reliable than parsing text.
- **OpenRouter Implementation**:
  - It makes a standard `fetch` call to the OpenRouter API endpoint.
  - It simulates structured output by setting `response_format: { type: "json_object" }` and including a description of the desired JSON schema directly in the text prompt.

### `analyzeSubmissions(provider, ...)`
- **Goal**: To get a qualitative analysis of student performance on an assignment.
- **Implementation**: It constructs a detailed prompt that includes the assignment questions, correct answers, and all student submissions. It then asks the AI to provide insights based on this data, expecting a text/markdown response.

### `generateTrainerLesson(provider, topic)`
- **Goal**: To create a short lesson and a few quiz questions for the "My Trainer" page.
- **Implementation**: Similar to `generateClassroomContent`, it uses a `responseSchema` (for Gemini) or an equivalent prompt (for OpenRouter) to get a structured JSON response.

### `getAIHelperChat(provider, systemInstruction)`
- **Goal**: To create an interactive chat session with a specific AI personality.
- **Gemini Implementation**: Uses the SDK's `ai.chats.create()` method, which handles chat history and context automatically. It passes the `systemInstruction` in the chat configuration.
- **OpenRouter Implementation**: This is a clever **compatibility layer**. Since OpenRouter doesn't have a chat SDK, this function returns a custom object that *mimics* the interface of the Gemini chat object.
  - It maintains its own `history` array.
  - It has a `sendMessageStream` method that manually constructs the API call with the chat history and returns the response in a way that the UI components can handle, just as they would with a real Gemini stream. This allows the frontend chat components to be written once, regardless of the selected AI provider.

## 4. For Backend/Porting

As mentioned, this entire file should be moved to a backend. Each function would become a distinct API endpoint.

- `generateClassroomContent` -> `POST /api/ai/generate-classroom`
- `analyzeSubmissions` -> `POST /api/ai/analyze-submissions`
- `getAIHelperChat` -> The logic for this would be part of a `POST /api/chat` endpoint, which would manage chat histories in a database.
