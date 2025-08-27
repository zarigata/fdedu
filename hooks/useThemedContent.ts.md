
# Documentation for `hooks/useThemedContent.ts`

## 1. Purpose

This custom hook is a clever piece of the UI system that provides theme-specific text content for key navigation and feature elements. It allows the names of features like the "Store" or "Games" to change based on the cosmetic theme the user has equipped, enhancing the immersive experience.

## 2. Key Functionality

1.  **Get User's Active Theme**: It uses `useAppContext` to get the current `user` and finds their `activeThemeId`. It defaults to `'theme-default'` if no theme is active or if the theme ID is invalid.

2.  **Get Theme Keys**: It uses the `activeThemeId` to look up the corresponding set of translation keys from the `THEME_CONTENT_KEYS` map in `themeData.ts`. For example, for `'theme-matrix'`, it gets `{ storeKey: 'themeMatrixStore', ... }`.

3.  **Translate Keys**: It uses the `useTranslation` hook (`t` function) to translate these keys into the currently selected language. For instance, it calls `t('themeMatrixStore')` to get the string "The Black Market" (from `en.json`).

4.  **Return Themed Content**: It returns an object of type `ThemeContent` containing the final, translated, theme-specific strings for the store, games, trainer, and tutor.

## 3. How It's Used

Components that display feature names use this hook to get their text, ensuring it's always in sync with the user's theme and language.

```typescript
// Example from a component
import { useThemedContent } from '../hooks/useThemedContent';

const MyComponent = () => {
  const content = useThemedContent(); // Returns { store: "The Boutique", ... } if glass theme is active

  return (
    <Link to="/store">{content.store}</Link>
  );
};
```

## 4. Connections & Dependencies

- **`./useAppContext`**: To get the `user` object with the `activeThemeId`.
- **`../data/themeData`**: To get the map of theme IDs to translation keys.
- **`./useTranslation`**: To perform the final translation of the keys into the user's selected language.
- **`../types`**: Imports the `ThemeContent` type definition.

## 5. For Backend/Porting

This is a pure frontend logic hook that orchestrates other client-side systems (context, translation). It has no direct backend implications. The pattern is highly portable to other component-based frameworks.
