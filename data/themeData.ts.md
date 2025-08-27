
# Documentation for `data/themeData.ts`

## 1. Purpose

This file acts as a configuration map for the application's theming system. It connects a theme's unique ID (e.g., `'theme-matrix'`) to a set of translation keys. This allows the application to display different text for UI elements based on the currently active theme, adding a layer of immersive personality.

## 2. Key Functionality

- It exports a single constant, `THEME_CONTENT_KEYS`.
- This is an object where each key is a `themeId` (matching the IDs in the store and user data).
- The value for each theme ID is another object that maps specific UI elements (`store`, `games`, `trainer`, `tutor`) to their corresponding keys in the translation files (`en.json`, `pt.json`, etc.).

### Example Flow:
1. A user equips the 'Matrix Code Theme' (`theme-matrix`).
2. Their `user.activeThemeId` is set to `'theme-matrix'`.
3. The `useThemedContent` hook reads this ID.
4. It looks up `'theme-matrix'` in `THEME_CONTENT_KEYS` and finds `{ storeKey: 'themeMatrixStore', ... }`.
5. It then uses the `useTranslation` hook to look up the value of `'themeMatrixStore'` in the appropriate language file (e.g., `en.json`), which might be "The Black Market".
6. This themed text is then displayed in the UI.

## 3. Connections & Dependencies

- This file has no direct dependencies.
- It is imported and used exclusively by the `hooks/useThemedContent.ts` custom hook.

## 4. For Backend/Porting

- This is a client-side configuration file for controlling UI text.
- If the theming system were to become more complex, this data could potentially be moved to a database and managed via an admin panel, but for the current scope, a static file is efficient and sufficient.
