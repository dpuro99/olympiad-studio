// Pure math shared by the SVG chart primitives (charts.jsx).
//
// Kept out of the JSX so the scale/tick math can be unit-tested directly with
// node:test, and so charts stay presentational: all numbers come from the
// caller or from these helpers.

// [min, max] over finite values. Returns [0, 0] for empty/non-numeric input so
// a chart still renders an axis instead of NaN coordinates.
export function extent(values) {
  if (!Array.isArray(values) || values.length === 0) return [0, 0];
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    const v = Number(value);
    if (!Number.isFinite(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 0];
  return [min, max];
}

// Monotonic data-domain → pixel-range mapping (no clamping, so callers can see
// out-of-range points). A degenerate domain maps to the middle of the range.
export function linearScale([d0, d1], [r0, r1]) {
  const span = d1 - d0;
  if (span === 0) {
    const mid = (r0 + r1) / 2;
    return () => mid;
  }
  return (value) => r0 + ((value - d0) / span) * (r1 - r0);
}

export function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

// Human-friendly ticks covering [min, max]: a 1/2/5 × 10^k step chosen by how
// close the raw step is to each candidate (the same rule d3 uses), so axis
// labels read as round numbers. The first tick is at or above min. Returns []
// for non-finite input and [min] when the domain has no width.
export function niceTicks(min, max, count = 4) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (max <= min) return [min];
  const rawStep = (max - min) / Math.max(1, count);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const error = rawStep / magnitude;
  const step = error >= Math.sqrt(50)
    ? magnitude * 10
    : error >= Math.sqrt(10)
      ? magnitude * 5
      : error >= Math.sqrt(2)
        ? magnitude * 2
        : magnitude;
  const start = Math.ceil(min / step) * step;
  const ticks = [];
  for (let tick = start; tick <= max + step * 1e-9; tick += step) {
    // toPrecision (not toFixed) so tiny steps keep their digits and accumulated
    // floating-point drift collapses back to the intended round number.
    ticks.push(Number(tick.toPrecision(12)));
  }
  return ticks;
}

// SVG path "M x y L x y ..." from [{x, y}] pixel points.
export function pathFromPoints(points) {
  if (!Array.isArray(points) || points.length === 0) return '';
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`)
    .join(' ');
}
