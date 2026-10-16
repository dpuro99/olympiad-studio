// Hand-rolled SVG chart primitives for tool-internal visualization.
//
// Presentation only: every number is derived from props by chartUtils.js, so
// these stay a pure function of state and update live as the tool's inputs
// change. Theme-driven (no hardcoded colours), no charting dependency, and no
// default-export component — follow the react-refresh rule.

import {
  extent,
  linearScale,
  niceTicks,
  pathFromPoints
} from './chartUtils.js';

const VIEW = { w: 320, h: 180, l: 46, r: 12, t: 14, b: 34 };
const PLOT_W = VIEW.w - VIEW.l - VIEW.r;
const PLOT_H = VIEW.h - VIEW.t - VIEW.b;

const SERIES_COLOURS = [
  'var(--color-text-info)',
  'var(--color-text-success)',
  'var(--color-text-warning)',
  'var(--color-text-danger)',
  'var(--color-text-primary)'
];

function tickText(x, y, text, anchor) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize="9" fontFamily="var(--font-mono)" fill="var(--color-text-secondary)">
      {text}
    </text>
  );
}

// Shared frame: axes, ticks, and the pixel scales handed to the children render fn.
function Frame({ xDomain, yDomain, caption, xLabel, yLabel, hideXAxis = false, children }) {
  const x = linearScale(xDomain, [VIEW.l, VIEW.l + PLOT_W]);
  const y = linearScale(yDomain, [VIEW.t + PLOT_H, VIEW.t]);
  const xTicks = niceTicks(xDomain[0], xDomain[1], 4);
  const yTicks = niceTicks(yDomain[0], yDomain[1], 4);
  return (
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      role="img"
      aria-label={caption || 'Chart'}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', maxWidth: 440, height: 'auto', display: 'block' }}
    >
      {caption ? <title>{caption}</title> : null}
      {yLabel ? tickText(VIEW.l, VIEW.t - 4, yLabel, 'start') : null}
      <line x1={VIEW.l} y1={VIEW.t} x2={VIEW.l} y2={VIEW.t + PLOT_H} stroke="var(--color-border-secondary)" />
      <line x1={VIEW.l} y1={VIEW.t + PLOT_H} x2={VIEW.l + PLOT_W} y2={VIEW.t + PLOT_H} stroke="var(--color-border-secondary)" />
      {yTicks.map((tick) => (
        <g key={`yt-${tick}`}>
          <line x1={VIEW.l - 3} x2={VIEW.l} y1={y(tick)} y2={y(tick)} stroke="var(--color-border-secondary)" />
          {tickText(VIEW.l - 5, y(tick) + 3, String(tick), 'end')}
        </g>
      ))}
      {!hideXAxis && xTicks.map((tick) => (
        <g key={`xt-${tick}`}>
          <line x1={x(tick)} x2={x(tick)} y1={VIEW.t + PLOT_H} y2={VIEW.t + PLOT_H + 3} stroke="var(--color-border-secondary)" />
          {tickText(x(tick), VIEW.t + PLOT_H + 13, String(tick), 'middle')}
        </g>
      ))}
      {children({ x, y })}
      {xLabel ? tickText(VIEW.l + PLOT_W / 2, VIEW.h - 3, xLabel, 'middle') : null}
    </svg>
  );
}

function normaliseSeries({ series, points, colour = SERIES_COLOURS[0] }) {
  if (Array.isArray(series) && series.length > 0) {
    return series.map((entry, index) => ({
      ...entry,
      colour: entry.colour || SERIES_COLOURS[index % SERIES_COLOURS.length],
      points: entry.points || []
    }));
  }
  return [{ label: 'Series 1', colour, points: Array.isArray(points) ? points : [] }];
}

function collectExtent(series, axis) {
  const values = series.flatMap((entry) => entry.points.map((point) => Number(point[axis])));
  return extent(values);
}

// Line chart over one or more series. Useful where the x axis is a quantity
// (time, pressure) and live recomputation matters: the path is rebuilt every
// render from the current points.
export function LineChart({ series, points, caption, xLabel, yLabel, xDomain, yDomain, showDots = true }) {
  const entries = normaliseSeries({ series, points });
  const xs = collectExtent(entries, 'x');
  const ys = collectExtent(entries, 'y');
  const xd = xDomain || xs;
  const yd = yDomain || ys;
  return (
    <Frame xDomain={xd} yDomain={yd} caption={caption} xLabel={xLabel} yLabel={yLabel}>
      {({ x, y }) => (
        <>
          {entries.map((entry, index) => {
            const path = pathFromPoints(entry.points.map((point) => ({ x: x(point.x), y: y(point.y) })));
            if (!path) return null;
            return (
              <g key={entry.label || index}>
                <path d={path} fill="none" stroke={entry.colour} strokeWidth="1.5" strokeLinejoin="round" />
                {showDots && entry.points.map((point, i) => (
                  <circle key={`${entry.label || 'p'}-${i}`} cx={x(point.x)} cy={y(point.y)} r="2.2" fill={entry.colour} />
                ))}
              </g>
            );
          })}
        </>
      )}
    </Frame>
  );
}

// Scatter plot of independent observations (no implied continuity).
export function ScatterPlot({ points = [], caption, xLabel, yLabel, xDomain, yDomain, colour = SERIES_COLOURS[0] }) {
  const numeric = points.map((point) => ({ x: Number(point.x), y: Number(point.y) }));
  const xd = xDomain || extent(numeric.map((point) => point.x));
  const yd = yDomain || extent(numeric.map((point) => point.y));
  return (
    <Frame xDomain={xd} yDomain={yd} caption={caption} xLabel={xLabel} yLabel={yLabel}>
      {({ x, y }) => (
        <>
          {numeric.map((point, index) => (
            <circle key={index} cx={x(point.x)} cy={y(point.y)} r="2.6" fill={colour} />
          ))}
        </>
      )}
    </Frame>
  );
}

// Bar chart over categories: `bars` is [{ label, value }]. The y domain always
// includes zero so the baseline reads correctly.
export function BarChart({ bars = [], caption, yLabel, yDomain }) {
  const values = bars.map((bar) => Number(bar.value));
  const [low, high] = extent(values);
  const zeroed = [Math.min(0, low), Math.max(0, high)];
  const yd = yDomain || zeroed;
  const bandwidth = bars.length > 0 ? PLOT_W / bars.length : PLOT_W;
  const barWidth = Math.min(30, Math.max(4, bandwidth * 0.6));
  return (
    <Frame xDomain={[0, Math.max(1, bars.length)]} yDomain={yd} caption={caption} xLabel={null} yLabel={yLabel} hideXAxis>
      {({ y }) => (
        <>
          {bars.map((bar, index) => {
            const value = Number(bar.value) || 0;
            const top = y(Math.max(value, 0));
            const bottom = y(Math.min(value, 0));
            const centreX = VIEW.l + bandwidth * index + bandwidth / 2;
            const height = Math.max(0, bottom - top);
            return (
              <g key={bar.label || index}>
                <rect x={centreX - barWidth / 2} y={top} width={barWidth} height={height} fill={SERIES_COLOURS[index % SERIES_COLOURS.length]} rx="2" />
                {tickText(centreX, VIEW.t + PLOT_H + 13, String(bar.label ?? ''), 'middle')}
              </g>
            );
          })}
        </>
      )}
    </Frame>
  );
}
