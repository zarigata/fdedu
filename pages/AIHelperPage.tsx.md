
# Documentation for `pages/AIHelperPage.tsx`

## 1. Purpose

This page provides students with a focused, AI-powered "Study Buddy" for a specific homework assignment. Unlike the general `TutorChatPage`, this chat is contextualized to the assignment the student is working on and offers different AI personas designed to guide them without giving away direct answers.

## 2. Key Functionality

- **Assignment Context**: It retrieves the `assignmentId` from the URL and finds the corresponding assignment data. This context is used in the initial welcome message.

- **AI Personas**:
  - It defines a `PERSONAS` array, where each object contains a `name` and a `systemInstruction`. The `systemInstruction` is a detailed prompt that defines the AI's personality, rules, and goals (e.g., "You are Socrates... never reveal the final answer").
  - A dropdown menu allows the student to switch between these personas (e.g., "Socrates," "Sarcastic Robot"). Changing the persona re-initializes the chat with the new system instruction.

- **Chat Initialization**:
  - In a `useEffect` hook, it calls `getAIHelperChat` from the `aiService` to create a new chat instance. It passes the selected persona's `systemInstruction` to configure the AI's behavior.
  - It populates the chat history with an initial welcome message from the AI.

- **Chat Interface**:
  - It renders the conversation history from the `history` state variable.
  - User messages are styled differently from model (AI) messages.
  - It shows a typing indicator (animated dots) when `isLoading` is true.

- **Sending Messages**:
  - The `handleSendMessage` function takes the user's input and sends it to the AI using the `chat.sendMessageStream` method.
  - It's configured to handle a streaming response, progressively building the AI's answer as chunks of text arrive.

- **"Like" Functionality & Knowledge Graph**:
  - Each AI message has a "thumb up" button.
  - When a student clicks this button, the `handleLikeMessage` function is triggered.
  - This function captures the context: the student's last question and the AI's helpful answer.
  - It then calls `addKnowledgeNode` from the `useAppContext`, which saves this "successful learning moment" to the global state. This data is then displayed on the Admin Dashboard's "FeVe-Verse" page.

## 3. Connections & Dependencies

- **`react-router-dom`**: Uses `useParams` to get the `assignmentId`.
- **`../hooks/useAppContext`**:
  - `classrooms`: To find the assignment details.
  - `aiProvider`: To know which AI service to use.
  - `addKnowledgeNode`: The function to call when a user "likes" an AI response.
- **`../services/aiService`**: Imports and calls `getAIHelperChat` to initialize and interact with the AI model.
- **`../types`**: Imports `ChatMessage` and `AIPersona` types.
- **`@google/genai`**: Imports the `Chat` type for type-hinting the chat instance.

## 4. For Backend/Porting

- **Session Management**: Chat history is currently managed on the client. A robust backend would store chat histories in a database, associated with a user and a session ID. This would allow a user to continue their conversation across different devices.
- **API Calls**: As with other AI features, the calls to the AI service should be proxied through a secure backend.
  - The frontend would send the new message to an endpoint like `POST /api/chat/message`.
  - The backend would retrieve the chat history from the database, append the new message, make the call to the Gemini API, and then save the AI's response back to the database before sending it to the client.
- **"Liking" / Knowledge Graph**: The `addKnowledgeNode` function call would be replaced with an API call to an endpoint like `POST /api/knowledge-nodes`. The backend would then save this data to a `knowledge_graph` table in the database.
