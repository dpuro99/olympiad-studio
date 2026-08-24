# 02 - UI, Styling & Visual Design System Rules

## Visual Identity
Olympiad Studio follows a constrained, dense, operational engineering-tool visual aesthetic rather than a broad marketing layout. 

## Centralized Theme System
- The interface supports structural light and dark themes using a dedicated native HTML attribute system:
  ```js
  document.documentElement.setAttribute('data-theme', theme)
  ```
- All layout elements must inherit variables directly from `src/index.css` via custom CSS properties (e.g., `var(--bg-primary)`, `var(--border-secondary)`).
- **STRICT PROHIBITION:** Do not use arbitrary or hardcoded hex colors, RGB sequences, or Tailwind-style color strings inline. 

## Typography Rules
- **Standard UI Text:** Use the default sans-serif System UI font layout stack for descriptions, labels, and standard controls.
- **Technical/Numeric Data:** You **MUST** apply monospace fonts to all technical components, including categories, real-time measurements, scoring variables, metadata flags, runtime outputs, and tool values to support the operational design system.

## Layout & Responsive Fallbacks
- Leverage pure CSS layout primitives like Flexbox with active wrapping controls (`flexWrap: 'wrap'`) and dynamic CSS layouts (`repeat(auto-fill, minmax(...))`).
- Ensure tool layouts switch gracefully from a two-column desktop interface (Primary Working Panel left, Results/History right) to a unified vertical block on tight mobile viewports.

## Icon UI Patterns
- Standardize all icon usage around **Tabler Icons** loaded via CDN. Use semantic class notation matching the `ti ti-[name]` pattern (e.g., `<i className="ti ti-settings"></i>`).
- Do not write manual inline SVGs for simple icons unless implementing a custom animation slider or specialized toggle switch.
