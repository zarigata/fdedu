
# Documentation for `components/Avatar.tsx`

## 1. Purpose

`Avatar` is a reusable component responsible for displaying a user's profile picture. It also includes logic to apply decorative, animated frames that users can purchase and equip.

## 2. Key Functionality

- **User Prop**: It takes a `user` object as a prop. If the user is `null`, it renders a placeholder.
- **Dynamic Sizing**: It accepts a `className` prop to allow for easy resizing using Tailwind CSS classes (e.g., `w-10 h-10`, `w-48 h-48`).
- **Frame Application**:
  - It checks the user's `activeAvatarFrameId`.
  - If an active frame is set, it looks for a corresponding CSS class (e.g., `frame-rgb`).
  - If a valid frame class is found, it renders the avatar image inside a `<div>` that has the special frame class applied. These frame styles (animations, gradients, etc.) are defined in `index.html`.
  - If no frame is active, it renders the `<img>` tag with a standard border, ensuring a consistent look.

## 3. Connections & Dependencies

- **`../hooks/useAppContext`**: Uses the context to get the global `storeItems` list. This is necessary to look up the details of the user's active frame.
- **`../types`**: Imports the `User` type.
- **`index.html`**: The CSS classes for the animated frames (`frame-rgb`, `frame-fire`, etc.) are defined in the main HTML file's `<style>` block.

## 4. For Backend/Porting

- This is a pure frontend presentational component.
- The logic for displaying the avatar and applying frame styles would remain the same regardless of the backend.
- The data (`user.avatar` URL and `user.activeAvatarFrameId`) would be fetched from the backend as part of the user's profile data, but the component's rendering logic would not change.
