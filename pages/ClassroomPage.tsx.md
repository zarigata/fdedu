
# Documentation for `pages/ClassroomPage.tsx`

## 1. Purpose

This component is the heart of the live, interactive learning experience in FeVeDucation. It functions as a "Digital Classroom," providing a shared space where a teacher and enrolled students can communicate in real-time via chat and collaborate on a visual "workboard."

## 2. Key Functionality

### Layout & Panels
- The page is divided into two main sections:
  1.  **A sidebar** containing a participant list and the live chat.
  2.  **A main content area** that serves as the collaborative workboard.

### Participants Panel
- Displays the teacher and a list of all enrolled students in the class, showing their avatars and names.

### Live Chat
- **Real-Time Communication**: Displays a running log of messages between participants.
- **Role-Based Styling**: Teacher messages are styled differently (with a purple background) to make them stand out. The current user's messages are aligned to the right.
- **Auto-Scrolling**: The chat window automatically scrolls to the newest message.
- **Message Submission**: A form at the bottom allows users to type and send new messages by calling `sendLiveChatMessage` from the context.

### Collaborative Workboard
- **Visual Space**: A large area with a dotted grid background where users can post notes.
- **Adding Posts**: Users (non-spectators) can click the "Add Post" button to open a modal.
- **Post Creation Modal**: Allows users to:
  - Enter text for the note.
  - **Upload an image**, which is read as a base64 string using `FileReader`.
  - Choose a color for the note.
- **Posting Notes**: When a note is created, `addWorkboardNote` is called from the context. It can contain text, an image, or both.
- **Drag-and-Drop**: Users can click and drag their own notes (or all notes, if they are the teacher) around the workboard.
  - This is implemented using `onMouseDown`, `onMouseMove`, and `onMouseUp` events on the workboard container.
  - The component tracks the `draggingNote`'s ID and its mouse offset to calculate the new position, then calls `updateWorkboardNotePosition` from the context.
- **Deleting Notes**: A user can delete notes they created (or any note, if they are the teacher).

### Admin Spectator Mode
- **Read-Only Access**: If the logged-in user has the `ADMIN` role, the page enters "Spectator Mode."
- An admin can view the chat and the workboard but cannot interact.
- All interactive elements (chat input, "Add Post" button, dragging, deleting) are disabled, and a banner is displayed at the top to indicate their status.

## 3. State Management

- **Global State (from `useAppContext`)**:
  - Reads `user`, `classrooms`, `users` to identify participants.
  - Reads `liveChatMessages` and `workboardNotes` to render the content.
  - Calls `sendLiveChatMessage`, `addWorkboardNote`, `updateWorkboardNotePosition`, and `deleteWorkboardNote` to modify the global state.
- **Local State (`useState`)**:
  - `chatInput`: Manages the content of the chat input field.
  - `isPostModalOpen`, `newPostText`, etc.: Manages the state of the "Add Post" modal.
  - `draggingNote`, `dragOffset`: Manages the state for the drag-and-drop functionality.

## 4. For Backend/Porting

- This page relies heavily on the **real-time simulation** provided by the `AppContext`'s `storage` event listener. This is not suitable for a production, multi-user environment.
- **Backend Requirement: WebSockets**. To make this page work for different users on different computers, you need to replace the `localStorage` simulation with a real-time messaging server using WebSockets (e.g., using a library like `Socket.io` on a Node.js backend, or a service like Firebase).
- **API Flow with WebSockets**:
  1.  When a user loads the page, the client establishes a WebSocket connection to the server and "joins" a room specific to the `classroomId`.
  2.  When a user sends a chat message, instead of calling a context function, it would `socket.emit('chat:message', { text, classroomId })`.
  3.  The server receives this event, saves the message to the database, and then broadcasts the new message to all other clients in that classroom's room.
  4.  All clients receive the broadcasted message and update their UI.
  5.  The same pattern applies to all workboard actions (adding, moving, and deleting notes). Each action would be an event emitted to the server, processed, and broadcast back out to all connected clients.
- **Image Uploads**: The current implementation stores the entire base64 image string in `localStorage`. This is very inefficient. A proper backend would:
  - Upload the image file to a dedicated storage service (like Amazon S3, Google Cloud Storage, or the server's filesystem).
  - The database would then store a URL to the image, not the image data itself.
  - The `WorkboardNote` object would have `imageUrl` instead of a base64 `image` string.
