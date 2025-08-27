
# Documentation for `pages/GamesPage.tsx`

## 1. Purpose

This page is intended to be a hub for educational games where students can play to earn points and practice their skills.

## 2. Current Status: Placeholder

Currently, this page is a **"Coming Soon" placeholder**. It does not contain any functional games.

## 3. Key Functionality

- **Visual Placeholder**: It displays a large, stylized card with a "GAMES - COMING SOON!" message.
- **User Context**: It welcomes the user and displays their current point total, fetched from the `useAppContext`. This serves to remind users of the currency they might use or earn in the future arcade.

## 4. Connections & Dependencies

- **`../hooks/useAppContext`**: It connects to the context solely to get the `user` object to display their name and points.
- **`../components/Card`**: Used to wrap the placeholder content.
- **`../components/Icons`**: Uses `IconGamepad` and `IconCoin` for visual theming.

## 5. For Backend/Porting

- As this is a placeholder, there is no direct logic to port.
- When games are developed, each game could be its own component or page.
- **API Endpoints would be needed for**:
  - **Starting/Ending a Game Session**: e.g., `POST /api/games/{gameId}/start`.
  - **Submitting Scores**: e.g., `POST /api/games/{gameId}/score`. The backend would be responsible for validating the score and awarding the appropriate number of points to the user's account in the database. This server-side validation is critical to prevent players from cheating and giving themselves unlimited points.
