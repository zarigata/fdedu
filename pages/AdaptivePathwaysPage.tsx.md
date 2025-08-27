
# Documentation for `pages/AdaptivePathwaysPage.tsx`

## 1. Purpose

This page is a powerful tool for teachers that demonstrates the concept of **differentiated instruction** powered by AI. It allows a teacher to define a learning objective, and the AI analyzes the performance of all students in the class to generate a custom plan with different assignments tailored to different learning groups.

## 2. Key Functionality

- **Topic Input**: The teacher provides a single learning objective or topic for the week (e.g., "The Krebs Cycle").

- **Data Aggregation for AI**:
  - When the "Generate Plan" button is clicked, the component gathers a rich set of data about the students in the class. For each student, it compiles:
    - Their average grade from all past submissions.
    - Snippets from their most recent "helpful" interactions with the AI tutor (from the Knowledge Graph).
  - This data provides the AI with a multi-faceted view of each student's performance and areas of interest or confusion.

- **AI Plan Generation**:
  - The compiled data is sent to the `generateAdaptivePathways` function in `aiService`.
  - This function uses a sophisticated prompt that instructs the AI to group students into three categories ('Accelerated', 'Proficient', 'Needs Reinforcement') and create a unique, level-appropriate assignment for each group.
  - It uses a strict `responseSchema` to ensure the AI returns a clean, structured `AdaptivePathwayPlan` object.

- **Plan Review and Approval**:
  - The generated plan is displayed to the teacher in a clear, three-column layout, with one column for each learning pathway.
  - The teacher can review:
    - Which students were placed in each group.
    - The custom-generated assignment (title, description, and questions) for each group.
  - If the teacher is satisfied with the plan, they can click "Approve & Assign to Students".

- **Assignment Creation**:
  - The approval button calls the `addAdaptiveAssignmentsToClassroom` function from the context.
  - This function takes the pathways from the plan and creates new, distinct `Assignment` records in the global state. Crucially, it sets the `studentIds` field on each assignment, ensuring that each student only sees the assignment that was specifically generated for their learning group.

## 3. Connections & Dependencies

- **`react-router-dom`**: Uses `useParams` for the classroom ID and `useNavigate` to redirect the teacher to the homework page after approving the plan.
- **`../hooks/useAppContext`**: Heavily uses the context to get `classrooms`, `users`, `submissions`, and `knowledgeGraph` for the analysis, and calls `addAdaptiveAssignmentsToClassroom` to save the results.
- **`../services/aiService`**: Imports and calls `generateAdaptivePathways`.
- **`../types`**: Imports `AdaptivePathwayPlan`.

## 4. For Backend/Porting

- This feature is a prime candidate for a backend-driven process due to the amount of data being processed.
- **API Design**:
  1. The frontend would make a `POST` request to an endpoint like `/api/classrooms/{id}/generate-pathways`. The request body would just contain the topic: `{ "topic": "..." }`.
  2. The backend would be responsible for fetching all the necessary data: student list, all their submissions, and their knowledge graph entries.
  3. The backend would make the call to the AI service with the compiled data.
  4. The AI's structured JSON response would be sent back to the frontend for review.
  5. When the teacher approves, the frontend would send the plan back to the backend via a `POST` request to `/api/classrooms/{id}/assign-pathways`. The backend would then create all the necessary assignment and question records in the database.
