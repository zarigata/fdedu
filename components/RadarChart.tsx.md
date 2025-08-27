
# Documentation for `components/RadarChart.tsx`

## 1. Purpose

`RadarChart` is a specialized, reusable component for data visualization. It is designed to take a set of labeled scores for a student and render them as a "radar" or "spider" chart. This is used on the `GradesOverviewPage` to create the "Student Knowledge Profile" cards.

## 2. Key Functionality

- **SVG-Based**: The entire chart is rendered using Scalable Vector Graphics (SVG), making it sharp at any resolution and easy to style.

- **Props**: It accepts a single prop, `stats`, which is an array of objects, where each object has a `label` (string, the name of the topic) and a `value` (number from 0-100, the student's score in that topic).

- **Dynamic Geometry Calculation**:
  - It calculates the coordinates for the vertices of the chart based on the number of stats provided (`numSides`).
  - The `getPoint` helper function converts a score (0-100) and an index into `(x, y)` coordinates on the SVG canvas using trigonometry (`Math.cos`, `Math.sin`).

- **Rendering Layers**: The chart is built up in layers, from back to front:
  1.  **Grid Polygons**: It draws several concentric polygons to serve as a background grid, representing score levels (e.g., 80%, 60%, 40%).
  2.  **Web Lines**: It draws lines from the center of the chart to the outer edge for each stat, creating the "spokes" of the radar.
  3.  **Data Shape**: It connects the calculated points for the student's actual scores to draw the main colored polygon that represents their knowledge profile.
  4.  **Data Points**: It draws small circles at each vertex of the data shape to highlight the specific scores.
  5.  **Labels**: It places the text labels for each topic just outside the main chart area for readability.

- **Conditional Rendering**: It includes a check to ensure there are at least 3 stats, as a radar chart is not meaningful with fewer points. If there isn't enough data, it displays a fallback message.

## 3. Connections & Dependencies

- This component only depends on `react`.
- It is consumed by `pages/GradesOverviewPage.tsx`.

## 4. For Backend/Porting

- This is a pure frontend presentational component. It has no backend logic.
- The logic is self-contained and highly portable. It could be used in any React project or easily adapted to another framework (like Vue or Svelte) that can render SVG elements. The core trigonometric calculations would remain the same.
- The data passed into its `stats` prop would ultimately originate from the backend, but the component itself is agnostic about the data source.
