
# Documentation for `pages/ClassroomGeneratorPage.tsx`

## 1. Purpose

This file was originally intended to be a dedicated page where teachers could use AI to generate an entire classroom, including assignments and questions, from a single prompt.

## 2. Current Status: Obsolete and Removed

This page is now **empty and no longer in use**. Its functionality has been refactored and integrated into a more logical workflow.

The AI generation capability was moved into a **modal window** within the `HomeworkPage.tsx`. Teachers now first create a classroom "shell" and then, from the homework page of that class, they can click a button to open the AI generator modal and add AI-generated assignments directly to that existing classroom.

This provides a much better user experience, as content generation is now part of managing a class, not a separate, disconnected step.

## 3. For Backend/Porting

This file can be safely **deleted** from the project. All logic and considerations for AI-powered assignment generation are now relevant to `HomeworkPage.tsx` and `services/aiService.ts`.
