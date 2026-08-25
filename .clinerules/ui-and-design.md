# UI and Design Rules

- Preserve the dense, practical engineering-workbench character of Olympiad Studio.
- Use the existing theme system: `data-theme` on the document root and CSS custom properties from `src/index.css`.
- Prefer theme variables over new hardcoded colors. If a domain visualization needs a fixed semantic color, define or document the token centrally rather than scattering literals.
- Use the established sans and monospace theme tokens; technical values, units, measurements, and runtime output should use monospace.
- Use Flexbox/grid with wrapping and stable dimensions. Tool panels should stack cleanly on narrow screens without clipping or overlap.
- Use Tabler Icons through the existing CDN class convention. Avoid manual SVGs for ordinary interface icons; custom visualization graphics may use SVG when they are part of the tool itself.
- Keep hover and focus states in CSS. Do not add JavaScript event handlers solely for styling.
- Match controls to their semantics: buttons for actions, links for navigation, checkboxes/toggles for binary settings, and clearly labeled inputs for numeric values.
- Do not claim that a visual, formula, or status is official unless its source has been verified.
