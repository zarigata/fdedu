
# FeVeDucation API Endpoint Documentation

This document outlines the API endpoints required to transition FeVeDucation from a client-side prototype to a full-stack application with a dedicated backend.

**Authentication**: All endpoints (unless specified) should be protected and require an authenticated user session (e.g., via a JWT Bearer token or session cookie). The backend should extract the `userId` and `userRole` from the valid token.

---

## 👤 User & Profile API

### `POST /api/auth/login`
- **Description**: Authenticates a user and returns a session token.
- **Request Body**: `{ "email": "user@example.com", "password": "..." }`
- **Response**: `{ "token": "your_jwt_token", "user": { ...UserObject } }`

### `POST /api/auth/register`
- **Description**: Creates a new user account.
- **Request Body**: `{ "name": "...", "email": "...", "password": "...", "role": "student" | "teacher" }`
- **Response**: `201 Created` with `{ "token": "your_jwt_token", "user": { ...UserObject } }`

### `GET /api/profile/me`
- **Description**: Fetches the profile of the currently authenticated user.
- **Response**: `{ ...UserObject }`

### `PUT /api/profile/me`
- **Description**: Updates the profile of the currently authenticated user.
- **Request Body**: `{ "name": "...", "email": "...", "password": "(optional)", "likes": "...", "dislikes": "...", "socials": { ... } }`
- **Response**: `{ ...UpdatedUserObject }`

### `POST /api/profile/avatar`
- **Description**: Triggers the server to generate a new avatar URL for the user.
- **Response**: `{ "avatarUrl": "https://new-avatar-url..." }`

---

## 🏫 Classroom & Roster API

### `GET /api/classrooms`
- **Description**: Fetches all classrooms. Admin only.
- **Response**: `[ ...Classroom[] ]`

### `POST /api/classrooms`
- **Description**: Creates a new classroom. Teacher/Admin only. The `teacherId` should be taken from the auth token.
- **Request Body**: `{ "name": "...", "subject": "..." }`
- **Response**: `201 Created` with `{ ...ClassroomObject }`

### `PUT /api/classrooms/:classroomId`
- **Description**: Updates a classroom's details. Teacher/Admin only.
- **Request Body**: `{ "name": "...", "subject": "..." }`
- **Response**: `{ ...UpdatedClassroomObject }`

### `DELETE /api/classrooms/:classroomId`
- **Description**: Deletes a classroom. Teacher/Admin only.
- **Response**: `204 No Content`

### `POST /api/classrooms/:classroomId/students`
- **Description**: Enrolls a student in a classroom. Admin only.
- **Request Body**: `{ "studentId": "..." }`
- **Response**: `200 OK`

### `DELETE /api/classrooms/:classroomId/students/:studentId`
- **Description**: Removes a student from a classroom. Admin only.
- **Response**: `204 No Content`

---

## 📚 Homework & Submissions API

### `GET /api/classrooms/:classroomId/assignments`
- **Description**: Gets all assignments for a specific classroom.
- **Response**: `[ ...Assignment[] ]`

### `POST /api/classrooms/:classroomId/assignments`
- **Description**: Creates a new assignment (or set of assignments) for a classroom. Teacher only.
- **Request Body**: `[ ...AssignmentData[] ]` (accepts an array)
- **Response**: `201 Created` with `[ ...NewAssignment[] ]`

### `POST /api/assignments/:assignmentId/submit`
- **Description**: Submits answers for an assignment. Student only. `studentId` is from auth token.
- **Request Body**: `{ "answers": [ { "questionId": "...", "answer": "..." } ] }`
- **Response**: `201 Created` with `{ ...SubmissionObject }`

---

## 🤖 AI Services API (Backend-to-AI)

These endpoints act as a secure proxy to the AI providers. The frontend calls these endpoints, and the backend makes the actual calls using its protected API keys.

### `POST /api/ai/generate-assignments`
- **Description**: Generates assignment content based on a topic.
- **Request Body**: `{ "subject": "...", "topic": "..." }`
- **Response**: `{ "assignments": [ ... ] }` (The structured JSON from the AI)

### `POST /api/ai/analyze-submissions`
- **Description**: Triggers an AI analysis of all submissions for a given assignment.
- **Request Body**: `{ "assignmentId": "..." }`
- **Response**: `{ "analysis": "The AI-generated text report..." }`

### `POST /api/ai/chat`
- **Description**: Sends a message in a chat context (for AI Helper or Tutor Chat).
- **Request Body**: `{ "history": [ ...ChatMessage[] ], "newMessage": "...", "systemInstruction": "..." }`
- **Response**: `{ "reply": "The AI's response text..." }`

---

## 🎮 Store & Inventory API

### `GET /api/store/items`
- **Description**: Gets all items available in the store.
- **Response**: `[ ...StoreItem[] ]`

### `POST /api/store/purchase`
- **Description**: Attempts to purchase an item for the user.
- **Request Body**: `{ "itemId": "..." }`
- **Response**: `200 OK` on success, `402 Payment Required` if not enough points, `409 Conflict` if already owned.

### `POST /api/inventory/equip`
- **Description**: Equips or unequips an item.
- **Request Body**: `{ "itemId": "..." }`
- **Response**: `{ ...UpdatedUserObject }`

---

## 💬 Live Classroom API (WebSockets)

For real-time features in the `ClassroomPage`, a WebSocket connection is required.

### Connection
- Client connects to `ws://your-server.com/live-classroom`

### Events (Client to Server)
- `join-room`: Client sends this after connecting to join a specific classroom's channel.
  - **Payload**: `{ "classroomId": "..." }`
- `chat-message`: Client sends a new chat message.
  - **Payload**: `{ "text": "..." }`
- `add-note`: Client adds a new workboard note.
  - **Payload**: `{ "text": "...", "color": "...", "image": "(optional base64)" }`
- `move-note`: Client updates the position of a note.
  - **Payload**: `{ "noteId": "...", "position": { "x": 100, "y": 150 } }`
- `delete-note`: Client deletes a note.
  - **Payload**: `{ "noteId": "..." }`

### Events (Server to Client)
- `new-message`: Server broadcasts a new message to all clients in the room.
  - **Payload**: `{ ...LiveChatMessage }`
- `note-added`: Server broadcasts a new note.
  - **Payload**: `{ ...WorkboardNote }`
- `note-moved`: Server broadcasts a note's new position.
  - **Payload**: `{ "noteId": "...", "position": { "x": 100, "y": 150 } }`
- `note-deleted`: Server broadcasts that a note was deleted.
  - **Payload**: `{ "noteId": "..." }`
