
# Documentation for `types.ts`

## 1. Purpose

This file is the single source of truth for all custom data structures used throughout the FeVeDucation application. By defining TypeScript `interface`s and `enum`s here, we ensure that data is handled consistently and safely across all components, hooks, and services. It acts as a contract for the shape of our data.

## 2. Key Definitions

### Enums
- **`UserRole`**: Defines the possible roles a user can have (`student`, `teacher`, `admin`). Using an enum prevents typos and makes role-based logic more readable.
- **`AIProvider`**: Specifies the available AI services (`gemini`, `openrouter`).
- **`Theme`**: Defines the UI themes (`light`, `dark`).

### Core Interfaces
- **`User`**: The blueprint for a user object. It includes essential information like `id`, `name`, `email`, `role`, and `avatar`, as wellas optional profile details.
- **`Classroom`**: The blueprint for a classroom. It connects a `teacherId` with an array of `studentIds` and contains an array of `Assignment` objects. It also includes presentational data like `color` and `pattern`.
- **`Assignment`**: Defines the structure for a homework assignment, including its `title`, `description`, and an array of `Question`s.
- **`Question`**: Defines a single question within an assignment, specifying its type (`multiple-choice`, `open-ended`, etc.) and correct `answer`.
- **`Submission`**: Represents a student's completed work for an assignment, linking a `studentId` to an `assignmentId` and containing their answers.

### Real-Time & AI Interfaces
- **`ChatMessage`**: The standard format for messages in an AI chat session history, used by the AI helper and tutor pages. It follows the structure expected by the Gemini API.
- **`LiveChatMessage`**: The structure for a message in the live digital classroom chat, containing more user metadata like `userName` and `userAvatar`.
- **`WorkboardNote`**: Defines a sticky note on the collaborative classroom wall, including its content, position, color, and an optional `image`.
- **`KnowledgeNode`**: Represents a "learning moment" captured for the admin's FeVe-Verse feed, logging a helpful AI interaction.

## 3. Connections & Dependencies

This file has **no dependencies**. However, **nearly every other `.tsx` file in the project depends on this file**. It is imported by components to type their props, by the context to type its state, and by services to type their function arguments and return values.

## 4. For Backend/Porting

- This file is arguably the **most important file for a backend developer**. It is a direct blueprint for designing the database schema.
- When creating a backend for this application, you would create tables that mirror these interfaces:
  - A `users` table with columns matching the `User` interface.
  - A `classrooms` table.
  - `assignments`, `questions`, and `submissions` tables with foreign keys linking them together.
  - You would use join tables to manage many-to-many relationships, like the one between students and classrooms (`studentIds`).
- Any developer building an API for this app should use this file as the definitive guide for the expected JSON structure of API request bodies and responses. Adhering to these types will ensure seamless integration with the frontend.
