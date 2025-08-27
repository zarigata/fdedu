
# Documentation for `context/AppContext.tsx`

## 1. Purpose

This file is the **central nervous system** of the FeVeDucation application. It uses React's Context API to create a global state management system, eliminating the need to pass props down through many levels of components (a problem known as "prop drilling"). The `AppProvider` component defined here holds all the application's shared data and provides the functions to modify it.

## 2. Key Functionality

### State Management
- **`createContext`**: Initializes a new context object (`AppContext`).
- **`useState`**: The `AppProvider` component uses multiple `useState` hooks to manage all critical pieces of application state:
  - `user`: The currently logged-in user object (or `null`).
  - `users`: The list of all users in the system.
  - `classrooms`: The list of all classrooms.
  - `submissions`: All student submissions.
  - And other state for the AI provider, theme, live chat, etc.

### Data Persistence (Client-Side)
- This application uses the browser's **`localStorage`** to act as a simple, client-side database.
- **`loadFromStorage`**: A helper function that safely reads and parses data from `localStorage` on initial application load. If no data is found, it uses a default value.
- **`useEffect` Hooks**: A series of `useEffect` hooks are set up to monitor each piece of state (e.g., `[users]`, `[classrooms]`). Whenever a piece of state changes, the corresponding `useEffect` hook triggers and writes the updated data back to `localStorage` as a JSON string. This ensures that the user's data persists even if they close the browser tab or refresh the page.

### Real-Time Simulation
- The application simulates a real-time environment (like live chat) without a dedicated WebSocket server.
- It achieves this using a `useEffect` hook that listens for the global `storage` event.
- **How it works**: When you have two tabs of the app open and an action in one tab (e.g., sending a chat message) modifies `localStorage`, the browser fires a `storage` event in the *other* tab. The listener in this `useEffect` hook catches that event, reads the new data from `localStorage`, and updates the second tab's state using `setLiveChatMessages` or `setWorkboardNotes`. This synchronizes the state across tabs, creating a convincing real-time effect.

### State-Modifying Functions
- The context provides a suite of functions to safely update the state. Examples include:
  - `login(email, password)`: Finds a user and sets the `user` state.
  - `logout()`: Clears the `user` state.
  - `addClassroom(classroomData)`: Adds a new classroom to the `classrooms` array.
  - `assignStudentToClassroom(studentId, classroomId)`: Updates a specific classroom to add a student.
  - `sendLiveChatMessage(classroomId, text)`: Adds a new message to the `liveChatMessages` array.
- All these functions are passed down through the context's `value` prop, allowing any child component to call them.

## 3. For Backend/Porting

This file is a **roadmap for your backend API**. When migrating to a real backend, this file will be almost entirely replaced.

- **State -> Database**: All the data currently held in `useState` and `localStorage` (users, classrooms, etc.) would be moved to a proper database (e.g., PostgreSQL, MySQL).
- **Functions -> API Calls**: Every function exposed by the context (`addUser`, `updateClassroom`, etc.) would be converted into an API call.
  - For example, a new `AppContext` would have a function like:
    ```typescript
    const addUser = async (userData) => {
      // Instead of calling setUsers(), we call our backend API
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      // ...then update local state with the result
    };
    ```
- **Real-Time -> WebSockets**: The `storage` event listener trick is a client-side solution. For a robust, multi-user, real-time experience, you would replace this with a proper real-time technology like:
  - **WebSockets**: A persistent, two-way communication channel between client and server.
  - **Server-Sent Events (SSE)**: For one-way (server to client) updates.
  - **Third-Party Services**: Like Firebase Realtime Database, Pusher, or Ably.

The current `AppContext.tsx` is an excellent self-contained prototype of the application's data layer, making it easy to see exactly what API endpoints and database models are needed.
