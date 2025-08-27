
# Documentation for `hooks/useTranslation.ts`

## 1. Purpose

This file defines the `useTranslation` custom hook, which is the core of the application's internationalization (i18n) system. It provides a simple and clean way for any component to access translated strings.

## 2. Key Functionality

- **Gets Language and Translations**: It uses `useAppContext` to get the user's currently selected `language` (e.g., 'en', 'pt') and the globally loaded `translations` object, which contains all the JSON language files.

- **`t` function**: The hook returns an object containing the `t` function. This function is the main interface for translation.
  - It takes a `key` (string) as its first argument, which corresponds to a key in the `en.json`, `pt.json`, etc., files.
  - It looks up the key in the file for the current language. If the key doesn't exist in the current language's file, it falls back to the English (`en.json`) version. If it's not found there either, it simply returns the key itself.
  - **Placeholder Replacement**: The `t` function also accepts an optional second argument: a `replacements` object. This allows for dynamic values to be inserted into the translated string, which is crucial for strings like "Welcome back, {name}!".

- **`replace` helper**: A private helper function inside the file uses a regular expression to find and replace placeholders like `{key}` in a string with the values provided in the `replacements` object.

## 3. How It's Used

```typescript
import { useTranslation } from '../hooks/useTranslation';

const WelcomeMessage = ({ name }) => {
  const { t } = useTranslation();

  // t('welcomeBack', { name: 'John' }) will look up 'welcomeBack' in the JSON file
  // and replace {name} with 'John'.
  return <h1>{t('welcomeBack', { name: name })}</h1>;
};
```

## 4. Connections & Dependencies

- **`./useAppContext`**: To get the current `language` and the loaded `translations` object.
- **`../types`**: Imports the `Language` type.

## 5. For Backend/Porting

- This is a standard client-side i18n pattern.
- For very large applications with many languages, translation files can become large. Some advanced i18n frameworks support "code splitting" or "lazy loading" translations, where only the active language file is downloaded by the client, improving initial load performance.
- The `t` function and placeholder replacement logic is a universal concept found in most i18n libraries (like `react-i18next`, `vue-i18n`, etc.).
