
# Documentation for `locales/prompts.ts`

## 1. Purpose

This file centralizes all the complex, multi-line prompts that are sent to the AI services. It is a critical part of the application's internationalization (i18n) and "prompt engineering" strategy. By separating prompts from the component logic, they become easier to manage, update, and translate.

## 2. Key Functionality

- **Language-Specific Prompts**:
  - It defines a `prompts` object where the top-level keys are language codes (`en`, `pt`, `ja`).
  - Each language has a `Prompts` object containing all the different instruction sets used by the application (e.g., `generateClassroom`, `analyzeSubmissions`).

- **`getPrompts` Function**:
  - This is the main exported function. It takes a `Language` code as an argument.
  - It returns the entire block of prompts for that specific language.
  - It includes a fallback to English (`en`) if an unsupported language code is passed.

- **Prompt Engineering**:
  - The prompts themselves are carefully constructed to guide the AI's behavior. They include:
    - **Role-playing**: "You are an expert teaching assistant..."
    - **Context**: "The topic of this class is: '{classroomTopic}'"
    - **Data Injection**: Placeholders like `{chatHistory}` are used so that the `aiService` can dynamically insert the relevant data.
    - **Formatting Instructions**: "Format your response clearly with markdown headings."
    - **JSON Schema Instructions**: For providers that don't support native schema enforcement, the prompt includes a description of the desired JSON output.

## 3. How It's Used

The `aiService.ts` file imports `getPrompts` and uses it at the beginning of each AI call to retrieve the correct, translated prompt.

```typescript
// Example from aiService.ts
import { getPrompts } from '../locales/prompts';

export const generateClassroomContent = async (provider, subject, topic, language) => {
  // 1. Get the prompt block for the current language
  const prompts = getPrompts(language);
  // 2. Select the specific prompt and replace placeholders
  const prompt = prompts.generateClassroom.replace('{subject}', subject).replace('{topic}', topic);
  // 3. Send the final prompt to the AI
  // ...
};
```

## 4. Connections & Dependencies

- **`../types`**: Imports the `Language` type.
- It is consumed exclusively by `services/aiService.ts`.

## 5. For Backend/Porting

- This is a best-practice pattern for managing AI prompts.
- When moving the AI calls to a backend, this file (or its logic) should be moved to the backend as well. The backend service would be responsible for selecting the correct language prompt before making the final call to the AI provider.
- For a more advanced system, these prompts could be stored in a database and managed through an admin interface, allowing for prompt adjustments without a full code deployment.
