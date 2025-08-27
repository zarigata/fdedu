
# Documentation for `pages/GradesOverviewPage.tsx`

## 1. Purpose

This is a comprehensive performance overview page for teachers. It provides two main features: a traditional, tabular gradebook for viewing all grades at a glance, and a powerful AI analysis section that generates deep insights, knowledge profiles, and reports on class performance.

## 2. Key Functionality

### Gradebook Table
- **Data Aggregation**: A `useMemo` hook processes the raw `submissions` data into a structured `gradebook` array. Each row in this array represents a student, containing their details, a map of their grades for each assignment, and their overall average.
- **Dynamic Table**: The component dynamically generates the table headers from the list of `assignments` in the classroom.
- **Display**: It renders a classic gradebook table with students as rows and assignments as columns. It also includes columns for the student's overall average and calculates the average grade for each assignment in the table footer.

### AI Performance Analysis
- **Trigger**: The teacher clicks a "Generate Analysis" button to start the process.
- **Data Preparation for AI**: `handleAnalyze` compiles a summary of the gradebook data, anonymizing it slightly by only sending student names and their grades, not IDs.
- **AI Service Call**: It calls the `analyzeGradebook` function from `aiService`. This service uses a strict `responseSchema` to force the AI to return a structured JSON object containing:
  - `classAnalysis`: A detailed text report.
  - `assignmentTopics`: The AI's categorization of each assignment into a knowledge area (e.g., "Algebra", "Cell Biology").
  - `gradeDistribution`: A count of students in each letter-grade bracket (A, B, C, D, F).
- **State Management**: It uses `isLoading`, `error`, and `analysisResult` state to manage the UI during and after the AI call.

### AI-Generated Visualizations
- Once the `analysisResult` is available, the component renders several new sections:
- **Student Knowledge Profiles**:
  - It processes the AI's `assignmentTopics` to calculate each student's average score for each topic.
  - It then maps over these profiles and renders a `RadarChart` for each student. This "Knowledge Circle" provides a powerful visual representation of a student's strengths and weaknesses across different concepts.
- **Class Grade Distribution**: It displays a simple bar chart showing the number of students in each grade bracket, as determined by the AI.
- **AI Analyst Report**: It displays the detailed text report from the AI, providing qualitative insights and recommendations for the teacher.

## 3. Connections & Dependencies

- **`../hooks/useAppContext`**: To fetch all the necessary raw data (`classrooms`, `users`, `submissions`) and the AI configuration (`aiProvider`).
- **`../services/aiService`**: To call the `analyzeGradebook` function.
- **`../components/Card`**, **`../components/Avatar`**: For UI structure.
- **`../components/RadarChart`**: The custom component used to render the knowledge profiles.

## 4. For Backend/Porting

- The backend should provide an endpoint that returns the pre-calculated gradebook data, e.g., `GET /api/classrooms/{id}/gradebook`. This avoids sending all submissions to the client.
- The AI analysis should be a dedicated backend endpoint, `POST /api/classrooms/{id}/analyze-gradebook`. The backend would be responsible for fetching all data, calling the AI, and returning the structured JSON result. This is crucial for performance and security.
- The `RadarChart` is a pure frontend component and can be reused. Its `stats` prop would be populated with data calculated on the backend and sent to the client.
