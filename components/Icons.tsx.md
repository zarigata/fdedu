
# Documentation for `components/Icons.tsx`

## 1. Purpose

This file serves as a centralized library of SVG icons used throughout the FeVeDucation application. Instead of scattering SVG code across multiple files or dealing with image files, all icons are defined as individual, self-contained React components.

## 2. Key Functionality & Benefits

- **Consistency**: All icons are in one place, making them easy to manage, update, and reuse.
- **Performance**: By inlining SVGs as React components, we reduce the number of HTTP requests the browser needs to make compared to loading individual image files.
- **Styling**: SVGs as components can be easily styled with CSS or Tailwind classes passed via props (e.g., changing size or color). Many icons in this file are styled using `currentColor`, which means they will inherit the text color of their parent element.
- **Readability**: Using a named component like `<IconPlus />` in the code is much more readable than a complex `<svg>...</svg>` block.

## 3. Structure

- Each icon is a separate `React.FC` (Functional Component).
- The component returns the SVG markup for that specific icon.
- Some components are designed to be customizable by accepting a `className` prop, which allows for passing Tailwind CSS classes for styling.

### Example of a simple icon:
```typescript
export const IconBook = () => (
    <svg>...</svg>
);
```

### Example of a customizable icon:
```typescript
export const IconChat: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
    <svg className={className}>...</svg>
);
```
This allows the icon to be resized, for example: `<IconChat className="h-12 w-12" />`.

## 4. Connections & Dependencies

- This file only depends on `react`.
- Many other components and pages throughout the application import and use these icon components to enhance the UI visually (e.g., `Header.tsx`, `AdminPage.tsx`, `ClassroomPage.tsx`).

## 5. For Backend/Porting

- This is a pure frontend presentational file with no backend logic.
- The concept of an icon library is universal. When porting to another framework, you would create a similar file or set of files containing the SVG definitions.
- For a larger application, you might use a dedicated icon library like `react-icons` or `heroicons` to avoid maintaining the SVGs manually. However, for a custom design system like FeVeDucation's, having a dedicated icon file is a good approach.
