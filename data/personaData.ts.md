
# Documentation for `data/personaData.ts`

## 1. Purpose

This file defines the content for the various AI "personas" that students can interact with in the `AIHelperPage` and `TutorChatPage`. It separates the persona definitions (their names and, most importantly, their core instructions) from the component logic, making them easy to manage and translate.

## 2. Key Functionality

- **`getAIHelperPersonas(t)` and `getTutorPersonas(t)`**:
  - The file exports two functions, one for the assignment-specific helper and one for the general tutor.
  - Both functions take a `t` function (from the `useTranslation` hook) as an argument.
  - They return an array of `AIPersona` objects.

- **`AIPersona` Object Structure**:
  - **`name`**: The display name of the persona (e.g., "Socrates (The Guide)"). This is fetched from the translation files using the `t` function, so it can be internationalized.
  - **`systemInstruction`**: This is a detailed, multi-line string that is passed to the AI model as its core directive. It tells the AI how to behave, what its personality is, what rules to follow (e.g., "Never reveal the final answer"), and what its goal is. This is the essence of the persona. Like the name, the instruction is also fetched from the translation files.

## 3. How It's Used

The chat pages (`AIHelperPage`, `TutorChatPage`) call the appropriate function to get the list of available personas. They use this list to populate the persona selection dropdown menu. When a user selects a persona, the component uses its `systemInstruction` to initialize the AI chat session.

```typescript
// Example from AIHelperPage.tsx
import { getAIHelperPersonas } from '../data/personaData';
import { useTranslation } from '../hooks/useTranslation';

const AIHelperPage = () => {
  const { t } = useTranslation();
  const PERSONAS = getAIHelperPersonas(t); // Gets the translated persona list
  // ... uses PERSONAS to render dropdown and get system instructions
}
```

## 4. Connections & Dependencies

- **`../types`**: Imports the `AIPersona` type definition.
- **Translation System**: It is designed to work directly with the `t` function from `useTranslation`, meaning it depends on the keys being present in the JSON language files (e.g., `locales/en.json`).
- It is consumed by `pages/AIHelperPage.tsx` and `pages/TutorChatPage.tsx`.

## 5. For Backend/Porting

- This is a content definition file. If the AI chat logic were moved to the backend, these persona definitions (especially the system instructions) would also need to be available on the backend to properly configure the AI model for each chat session. They could be stored in a similar file on the server or in a database table.
