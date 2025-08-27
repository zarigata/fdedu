
# Documentation for `components/Card.tsx`

## 1. Purpose

`Card` is a simple, highly reusable presentational component that acts as a consistent container for content throughout the application. It encapsulates the app's unique "Memphis design" visual style, featuring a hard shadow, thick border, and rounded corners.

## 2. Key Functionality & Props

- **`children: ReactNode`**: This is the most important prop. It allows any other React elements or components to be nested inside the card.
- **`className?: string`**: Allows for passing additional Tailwind CSS classes to the card for custom styling (e.g., `p-6`, `text-center`).
- **`color?: string`**: Accepts a Tailwind background color class (e.g., `'bg-brand-pink'`, `'bg-yellow-300'`). It defaults to `'bg-white'`.
- **`...rest: HTMLAttributes<HTMLDivElement>`**: This is a powerful feature. It allows the `Card` component to accept any standard HTML attribute that a `<div>` element can take. This includes event handlers like `onClick`, ARIA attributes, and, as seen in `AdminPage.tsx`, drag-and-drop handlers like `onDragOver` and `onDrop`.

## 3. How It's Styled

- The component combines the default styles with any custom classes and colors passed in as props.
- **Base Styles**: `border-4 border-black dark:border-gray-700 rounded-xl shadow-hard`. These define the core look.
- **Hover Effect**: `transition-all hover:shadow-none hover:-translate-x-1 hover:-translate-y-1`. This creates the signature interactive effect where the card lifts up slightly and its shadow disappears on hover.
- **Dynamic Classes**: The `color` and `className` props are dynamically inserted into the class string.

## 4. Usage Example

```typescript
import Card from './Card';

const MyComponent = () => (
  <Card
    color="bg-brand-yellow"
    className="p-8 text-center"
    onClick={() => alert('Card clicked!')}
  >
    <h2 className="text-xl font-bold">Hello World</h2>
    <p>This is content inside the card.</p>
  </Card>
);
```

## 5. For Backend/Porting

- This component is purely presentational and has no backend logic.
- When porting to another framework (like Vue or Svelte), you would create a nearly identical "Card" component that accepts similar props (`children` would be a `<slot>`).
- The CSS classes are based on Tailwind CSS. To port this, the new project must also have Tailwind CSS installed and configured with the same custom theme (colors, shadows) as defined in `index.html`.
