
# Documentation for `components/BarChart.tsx`

## 1. Purpose

`BarChart` is a reusable data visualization component that renders a simple vertical bar chart using SVG. It is used on the `SchoolManagerDashboard` to provide an at-a-glance view of AI token distribution among users.

## 2. Key Functionality

- **SVG-Based**: The chart is rendered entirely with SVG elements, ensuring it is lightweight, scalable, and styles can be controlled with CSS/props.

- **Props**: It accepts a single `data` prop, which is an array of objects, each with a `label` (string for the x-axis) and a `value` (number for the bar height).

- **Dynamic Calculation**:
  - It automatically calculates the `maxValue` from the provided data to set the scale of the y-axis.
  - It dynamically calculates the `barWidth` and positioning based on the number of data points to ensure the chart fits within its container.

- **Rendering Logic**:
  - It maps over the `data` array to render each bar as an SVG `<rect>` element.
  - It adds a `<text>` label above each bar to show its exact value.
  - It adds a `<text>` label below the x-axis for each bar, truncating it to the first word for clarity in tight spaces.
  - It uses a predefined array of colors, cycling through them for visual distinction between bars.
  - It draws a baseline for the x-axis for a clean, finished look.

## 3. Connections & Dependencies

- This component only depends on `react`.
- It is consumed by `pages/SchoolManagerDashboard.tsx`.

## 4. For Backend/Porting

- This is a pure frontend presentational component with no backend logic.
- It is highly portable to any React project. The core SVG rendering logic could also be adapted to other frameworks like Vue or Svelte.
- The data for the chart would be fetched from a backend API on the parent page (`SchoolManagerDashboard`) and then passed into this component via props.
