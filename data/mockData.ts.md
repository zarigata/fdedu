
# Documentation for `data/mockData.ts`

## 1. Purpose

This file serves as the initial seed data for the application. It provides a default set of users that will be loaded into the application state if no existing user data is found in the browser's `localStorage`.

## 2. Key Functionality

- **Initial Administrator**: The primary role of this file is to ensure that the application always has at least one administrator account. This allows a first-time user to log in and begin managing the platform without needing a separate sign-up or setup process.
- **Default Data**: The `USERS` array contains a single, pre-defined user object with the `role` set to `UserRole.ADMIN`.
- **Client-Side Seeding**: This data is imported and used as the default value in the `useState` hook for `users` within `context/AppContext.tsx`.

```typescript
// From context/AppContext.tsx
import { USERS as INITIAL_USERS } from '../data/mockData';

// ...
const [users, setUsers] = useState<User[]>(() => loadFromStorage('fvd-users', INITIAL_USERS));
```

This line means: "Try to load users from `localStorage`. If there's nothing there, use the `INITIAL_USERS` from `mockData.ts`."

## 3. Connections & Dependencies

- **`../types`**: Imports the `User` and `UserRole` types to ensure the mock data conforms to the application's data structure.
- **`context/AppContext.tsx`**: This is the only file that consumes this mock data, using it to initialize the user state.

## 4. For Backend/Porting

- When migrating to a real backend with a database, this file becomes the blueprint for your **database seeding script**.
- You would create a script (e.g., a `.sql` file, or a script using a language like Node.js or Python) that runs once when the database is first set up.
- This script would insert the default administrator record into your `users` table. This is a standard practice to ensure a new deployment of the application is immediately usable.
- After the initial seed, this client-side mock data file would be removed, as all user data would be fetched exclusively from the backend API.
