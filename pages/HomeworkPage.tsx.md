
# Documentation for `pages/HomeworkPage.tsx`

## 1. Purpose

This page serves a dual purpose depending on the user's role. It is the central location for viewing all assignments for a specific class. For teachers, it is also a powerful content creation hub, allowing them to add new assignments either manually or with the help of AI.

## 2. Key Functionality

### For All Users
- **Classroom Banner**: Displays a prominent, colored banner with the classroom's name, subject, and teacher, providing clear context.
- **Assignment List**: The main area of the page lists all assignments for the classroom. Each assignment is displayed in a `Card` showing its title, description, and due date.
- **Roster Panel**: A sidebar shows a list of all students enrolled in the class.

### For Students
- Each assignment card has a "Start / Get Help" button that links to the `AIHelperPage` for that specific assignment, allowing them to begin working or get tutoring.

### For Teachers
- **Assignment Analysis**: Each assignment card has an "Analyze" button, linking to the `ClassroomAnalyzerPage` where they can see AI-powered insights on student submissions.
- **Content Creation Hub**: Two buttons are visible only to the teacher:
  1.  **"Add Manually"**: Opens the `ManualAssignmentModal`.
  2.  **"Generate with AI"**: Opens the `AIGeneratorModal`.

### Manual Assignment Modal (`ManualAssignmentModal`)
- A modal form that allows teachers to build an assignment from scratch.
- They can set a title and description.
- They can dynamically add or remove question fields. Each question has inputs for the question text and the correct answer.
- On saving, it constructs a new `Assignment` object and adds it to the classroom using `addAssignmentsToClassroom`.

### AI Generator Modal (`AIGeneratorModal`)
- A modal that provides an interface for the AI content generation.
- The teacher enters a topic.
- It calls `generateClassroomContent` from the `aiService`.
- It first shows a preview of the AI-generated assignments and questions.
- If the teacher is satisfied, they can click "Add to Class," which adds the full set of generated assignments to the classroom data.

## 3. State Management

- **Global State (from `useAppContext`)**:
  - Reads `user`, `classrooms`, `users`, and `aiProvider`.
  - Calls `addAssignmentsToClassroom` to persist new assignments created by the teacher.
- **Local State (`useState`)**:
  - `isManualModalOpen` & `isAiModalOpen`: Control the visibility of the modals.
  - The modals themselves have their own local state to manage the forms (e.g., the topic for the AI generator, the draft assignment for the manual creator).

## 4. For Backend/Porting

- **Data Fetching**: The page would fetch classroom details and its list of assignments from an endpoint like `GET /api/classrooms/{classroomId}/homework`.
- **Manual Assignment Creation**: The `ManualAssignmentModal` would submit its data to a `POST /api/classrooms/{classroomId}/assignments` endpoint. The backend would then create the new records in the `assignments` and `questions` tables.
- **AI Assignment Generation**: This workflow would involve a few steps:
  1.  The frontend sends the topic to a backend endpoint: `POST /api/ai/generate-assignments`.
  2.  The backend calls the AI service and returns the generated content preview to the frontend.
  3.  When the teacher confirms, the frontend sends the approved, generated content to the same `POST /api/classrooms/{classroomId}/assignments` endpoint used by the manual creator. The backend then saves this data to the database.
- This separates the AI generation step from the data persistence step, which is a robust pattern.
