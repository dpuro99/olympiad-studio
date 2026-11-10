// Dynamic Planet — generated map / hydrograph interpretation cases.
//
// Pure functions only (no React, no DOM). Every case is generated from an
// integer seed, so a case is reproducible and the tests can assert that the
// prompt, the drawing, and the accepted answer agree with each other. Rule
// scope and citations live in src/seasons/<year>/dynamicplanet.js; the numeric
// conventions a generator relies on are stated in the case's own solution text.

// ---------------------------------------------------------------------------
// Seeded RNG + small numeric helpers
// ---------------------------------------------------------------------------

/** mulberry32 — tiny, deterministic, good enough for practice data. */
export function createRng(seed) {
  let state = (Number(seed) >>> 0) || 1;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value, decimals = 0) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/** Random value in [min, max] on a `step` grid. */
function pick(rng, min, max, step = 1, decimals = 0) {
  const steps = Math.round((max - min) / step);
  return round(min + Math.floor(rng() * (steps + 1)) * step, decimals);
}

const distance2d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** Percentage tolerance with an absolute floor, so small values stay gradable. */
const toleranceFor = (value, percent, floor) => Math.max(floor, Math.abs(value) * percent);

// ---------------------------------------------------------------------------
// Contour map (§3.k.i interpreting freshwater features on topographic maps)
// ---------------------------------------------------------------------------

// One map unit is one kilometre, so a distance in map units is a distance in km.
export const MAP_EXTENT = Object.freeze({ xMax: 4, yMax: 3 });

/**
 * Analytic height field behind the contour case. Not a real landscape: a tilted
 * plane with a smooth undulation, which varies contour spacing without inventing
 * an actual place.
 */
export function sampleContourHeight(params, x, y) {
  const { base, gx, gy, amp, kx, ky, phase } = params;
  return base + gx * x + gy * y + amp * Math.sin(kx * x + phase) * Math.cos(ky * y);
}

/**
 * Marching-squares contour extraction. Returns an array of segments, each a
 * pair of `[x, y]` world points. Segments are not merged into polylines; they
 * share endpoints, so drawing each one as a line looks continuous. Crossing
 * points are interpolated linearly along a cell edge, which is the standard
 * marching-squares approximation (a segment endpoint lands within a small
 * fraction of a contour interval of the exact level).
 */
export function contourSegments(height, level, { grid = 40 } = {}) {
  const cellX = MAP_EXTENT.xMax / grid;
  const cellY = MAP_EXTENT.yMax / grid;
  const at = (i, j) => height(i * cellX, j * cellY);
  const between = (p1, v1, p2, v2) => {
    const t = (level - v1) / (v2 - v1);
    return [p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t];
  };
  const segments = [];
  for (let i = 0; i < grid; i += 1) {
    for (let j = 0; j < grid; j += 1) {
      const p00 = [i * cellX, j * cellY];
      const p10 = [(i + 1) * cellX, j * cellY];
      const p11 = [(i + 1) * cellX, (j + 1) * cellY];
      const p01 = [i * cellX, (j + 1) * cellY];
      const v00 = at(i, j);
      const v10 = at(i + 1, j);
      const v11 = at(i + 1, j + 1);
      const v01 = at(i, j + 1);
      const crossings = [];
      if ((v00 > level) !== (v10 > level)) crossings.push(between(p00, v00, p10, v10));
      if ((v10 > level) !== (v11 > level)) crossings.push(between(p10, v10, p11, v11));
      if ((v11 > level) !== (v01 > level)) crossings.push(between(p11, v11, p01, v01));
      if ((v01 > level) !== (v00 > level)) crossings.push(between(p01, v01, p00, v00));
      if (crossings.length === 2) segments.push(crossings);
      else if (crossings.length === 4) segments.push([crossings[0], crossings[1]], [crossings[2], crossings[3]]);
    }
  }
  return segments;
}

/** The point on `contour` closest to `target`, so a marked point sits on a line. */
function nearestPointOnContour(contour, target) {
  let best = null;
  let bestDistance = Infinity;
  for (const segment of contour.segments) {
    for (const point of segment) {
      const d = Math.hypot(point[0] - target.x, point[1] - target.y);
      if (d < bestDistance) {
        bestDistance = d;
        best = point;
      }
    }
  }
  return best ? { x: round(best[0], 2), y: round(best[1], 2) } : null;
}

function generateContourCase(rng) {
  const params = {
    base: 100,
    gx: pick(rng, 12, 22),
    gy: pick(rng, 4, 12),
    amp: pick(rng, 8, 16),
    kx: round(0.8 + rng() * 1.2, 2),
    ky: round(0.8 + rng() * 1.2, 2),
    phase: round(rng() * Math.PI * 2, 3)
  };
  const height = (x, y) => sampleContourHeight(params, x, y);

  // Sample the field first so the contour interval fits what was generated.
  const samples = [];
  for (let i = 0; i <= 40; i += 1) {
    for (let j = 0; j <= 30; j += 1) {
      samples.push(height((i / 40) * MAP_EXTENT.xMax, (j / 30) * MAP_EXTENT.yMax));
    }
  }
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const interval = max - min > 110 ? 20 : 10;
  const levels = [];
  for (let level = Math.ceil(min / interval) * interval; level <= max; level += interval) {
    levels.push(level);
  }

  // Keep only levels that actually draw something, then mark A and B on two
  // lines that are at least two intervals apart so relief is unambiguous.
  const contours = levels
    .map((level) => ({ level, segments: contourSegments(height, level) }))
    .filter((contour) => contour.segments.length > 0);

  const targetA = { x: round(0.5 + rng() * 0.5, 2), y: round(0.6 + rng() * 0.5, 2) };
  const targetB = { x: round(3.1 + rng() * 0.5, 2), y: round(1.9 + rng() * 0.6, 2) };
  const levelA = contours.reduce((best, contour) =>
    Math.abs(contour.level - height(targetA.x, targetA.y)) < Math.abs(best - height(targetA.x, targetA.y))
      ? contour.level
      : best
  , contours[0].level);
  const levelB = contours.reduce((best, contour) => {
    if (Math.abs(contour.level - levelA) < interval * 2) return best;
    const targetHeight = height(targetB.x, targetB.y);
    return Math.abs(contour.level - targetHeight) < Math.abs(best - targetHeight) ? contour.level : best;
  }, null);

  const contourA = contours.find((contour) => contour.level === levelA);
  const contourB = contours.find((contour) => contour.level === levelB);
  const pointA = nearestPointOnContour(contourA, targetA);
  const pointB = nearestPointOnContour(contourB, targetB);

  const relief = Math.abs(levelB - levelA);
  const spacingKm = distance2d(pointA, pointB);
  const gradient = relief / spacingKm;

  return {
    kind: 'contour',
    title: 'Topographic contour gradient',
    prompt: 'Points A and B sit on labelled contours. Read the map scale, then work out the relief and the average gradient.',
    drawing: {
      extent: MAP_EXTENT,
      contours,
      interval,
      points: { a: pointA, b: pointB },
      levels: { a: levelA, b: levelB }
    },
    questions: [
      {
        id: 'relief',
        label: 'Elevation difference between A and B',
        unit: 'm',
        decimals: 0,
        expected: relief,
        tolerance: 0.5
      },
      {
        id: 'gradient',
        label: 'Average gradient from A to B',
        unit: 'm/km',
        decimals: 1,
        expected: round(gradient, 1),
        tolerance: toleranceFor(gradient, 0.02, 0.2)
      }
    ],
    solution: [
      `A is on the ${levelA} m contour and B is on the ${levelB} m contour, so the relief is ${Math.max(levelA, levelB)} m − ${Math.min(levelA, levelB)} m = ${relief} m.`,
      `The straight-line map distance is ${round(spacingKm, 2)} km, so the gradient is ${relief} m ÷ ${round(spacingKm, 2)} km = ${round(gradient, 1)} m/km.`,
      'A gradient read between two contours is an average over that straight line; the steepest local slope would need the closest contour spacing.'
    ]
  };
}

// ---------------------------------------------------------------------------
// Stream network order (§3.c.ii stream order and networks)
// ---------------------------------------------------------------------------

/**
 * Every junction has two tributaries, so the tree is a real drainage network
 * (a single-child node would be a segment continuing without a junction and
 * would make the first-order count ambiguous).
 */
function buildNetwork(rng, maxDepth, ids, depth = 0) {
  const node = { id: `n${ids.next}`, depth, children: [] };
  ids.next += 1;
  const branches = depth < maxDepth && (depth === 0 || rng() < 0.72);
  if (branches) {
    node.children.push(buildNetwork(rng, maxDepth, ids, depth + 1));
    node.children.push(buildNetwork(rng, maxDepth, ids, depth + 1));
  }
  node.order = computeStrahler(node);
  return node;
}

/** Strahler order: leaves are 1; two equal highest tributaries raise the order. */
export function computeStrahler(node) {
  if (!node.children.length) return 1;
  const childOrders = node.children.map(computeStrahler);
  const highest = Math.max(...childOrders);
  return childOrders.filter((order) => order === highest).length >= 2 ? highest + 1 : highest;
}

const countLeaves = (node) =>
  node.children.length ? node.children.reduce((sum, child) => sum + countLeaves(child), 0) : 1;

const collectLinks = (node, links = []) => {
  for (const child of node.children) {
    links.push({ id: `${node.id}-${child.id}`, from: node.id, to: child.id, order: child.order });
    collectLinks(child, links);
  }
  return links;
};

const collectNodes = (node, nodes = []) => {
  nodes.push(node);
  node.children.forEach((child) => collectNodes(child, nodes));
  return nodes;
};

/** Headwaters sit on the left, the outlet on the right; the SVG frames the bounds. */
function layoutNetwork(root) {
  const nodes = collectNodes(root);
  nodes
    .filter((node) => !node.children.length)
    .forEach((leaf, index) => {
      leaf.x = round(0.4 + leaf.depth * 1.1, 2);
      leaf.y = round(0.5 + index * 0.9, 2);
    });
  const place = (node) => {
    node.children.forEach(place);
    if (node.children.length) {
      node.x = round(Math.max(...node.children.map((child) => child.x)) + 1.1, 2);
      const ys = node.children.map((child) => child.y);
      node.y = round((Math.min(...ys) + Math.max(...ys)) / 2, 2);
    }
  };
  place(root);
  return root;
}

function generateStreamCase(rng) {
  let root = null;
  for (let attempt = 0; attempt < 80 && !root; attempt += 1) {
    const candidate = buildNetwork(rng, 3 + Math.floor(rng() * 2), { next: 1 });
    const leaves = countLeaves(candidate);
    if (candidate.order >= 2 && candidate.order <= 4 && leaves >= 4 && leaves <= 9) root = candidate;
  }
  if (!root) root = buildNetwork(createRng(7), 4, { next: 1 });
  layoutNetwork(root);

  const nodes = collectNodes(root);
  const links = collectLinks(root);
  const headwaters = nodes.filter((node) => !node.children.length);
  const firstOrderSegments = links.filter((link) => link.order === 1).length;

  const bounds = {
    minX: Math.min(...nodes.map((node) => node.x)),
    maxX: Math.max(...nodes.map((node) => node.x)),
    minY: Math.min(...nodes.map((node) => node.y)),
    maxY: Math.max(...nodes.map((node) => node.y))
  };

  return {
    kind: 'streamOrder',
    title: 'Stream network order',
    prompt: 'Order the network with the Strahler convention and answer at the outlet.',
    drawing: {
      nodes: nodes.map((node) => ({ id: node.id, x: node.x, y: node.y, order: node.order })),
      links,
      outletId: root.id,
      headwaterIds: headwaters.map((node) => node.id),
      bounds
    },
    questions: [
      {
        id: 'outletOrder',
        label: 'Stream order at the outlet',
        unit: 'order',
        decimals: 0,
        expected: root.order,
        tolerance: 0
      },
      {
        id: 'firstOrderCount',
        label: 'Number of first-order segments',
        unit: 'segments',
        decimals: 0,
        expected: firstOrderSegments,
        tolerance: 0
      }
    ],
    solution: [
      'Strahler ordering: a headwater segment is order 1; where two segments of the same order meet, the segment below the junction is one order higher; a tributary of lower order does not raise the order.',
      `This network has ${firstOrderSegments} first-order segments (one per headwater) and an outlet order of ${root.order}.`,
      'Shreve ordering instead adds the headwater tips below a junction, so the same network would carry a larger number — state the convention whenever a problem does not.'
    ]
  };
}

// ---------------------------------------------------------------------------
// Well data / water table (§3.k.ii mapping the water table from well data)
// ---------------------------------------------------------------------------

/** Fit h(x, y) = a·x + b·y + c through three non-collinear wells. */
export function fitWaterTablePlane(wells) {
  const [p1, p2, p3] = wells;
  const determinant = (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
  if (Math.abs(determinant) < 1e-9) return null;
  const a = ((p2.head - p1.head) * (p3.y - p1.y) - (p3.head - p1.head) * (p2.y - p1.y)) / determinant;
  const b = ((p3.head - p1.head) * (p2.x - p1.x) - (p2.head - p1.head) * (p3.x - p1.x)) / determinant;
  const c = p1.head - a * p1.x - b * p1.y;
  return { a, b, c, height: (x, y) => a * x + b * y + c, gradient: Math.hypot(a, b) };
}

/** A water-table contour is a straight line perpendicular to the gradient. */
function contourLineThrough({ a, b, c }, level, extent) {
  const anchor = Math.abs(a) >= Math.abs(b) ? [(level - c) / a, 0] : [0, (level - c) / b];
  const direction = [-b, a];
  // Slab clip: intersect the x-slab and y-slab parameter ranges.
  let tMin = -Infinity;
  let tMax = Infinity;
  const clipAxis = (origin, delta, min, max) => {
    if (Math.abs(delta) <= 1e-9) return;
    const t1 = (min - origin) / delta;
    const t2 = (max - origin) / delta;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  };
  clipAxis(anchor[0], direction[0], 0, extent.xMax);
  clipAxis(anchor[1], direction[1], 0, extent.yMax);
  return [
    [round(anchor[0] + tMin * direction[0], 3), round(anchor[1] + tMin * direction[1], 3)],
    [round(anchor[0] + tMax * direction[0], 3), round(anchor[1] + tMax * direction[1], 3)]
  ];
}

const WELL_CONTOUR_INTERVAL = 5;

function generateWellCase(rng) {
  const wells = [
    { id: 'W1', x: 0.7, y: 2.4, head: pick(rng, 32, 52) },
    { id: 'W2', x: 1.2, y: 0.7, head: pick(rng, 24, 44) },
    { id: 'W3', x: 3.3, y: 1.7, head: pick(rng, 12, 30) }
  ];
  const plane = fitWaterTablePlane(wells);
  const point = { x: round(1.9 + rng() * 0.4, 2), y: round(1.3 + rng() * 0.4, 2) };
  const pointHeight = plane.height(point.x, point.y);

  const w1 = wells[0];
  const w2 = wells[1];
  const spacing = distance2d(w1, w2);
  const drop = Math.abs(w1.head - w2.head);
  const pairGradient = drop / spacing;

  // Contours at a regular interval, like a real water-table map read off wells.
  const corners = [
    plane.height(0, 0),
    plane.height(MAP_EXTENT.xMax, 0),
    plane.height(0, MAP_EXTENT.yMax),
    plane.height(MAP_EXTENT.xMax, MAP_EXTENT.yMax)
  ];
  const contours = [];
  for (
    let level = Math.ceil(Math.min(...corners) / WELL_CONTOUR_INTERVAL) * WELL_CONTOUR_INTERVAL;
    level <= Math.max(...corners);
    level += WELL_CONTOUR_INTERVAL
  ) {
    contours.push({ level, segment: contourLineThrough(plane, level, MAP_EXTENT) });
  }

  const center = {
    x: (w1.x + w2.x + wells[2].x) / 3,
    y: (w1.y + w2.y + wells[2].y) / 3
  };
  const downhillLength = 0.55;
  const downhill = { x: -plane.a / plane.gradient, y: -plane.b / plane.gradient };
  const flowArrow = {
    from: [round(center.x, 2), round(center.y, 2)],
    to: [round(center.x + downhill.x * downhillLength, 2), round(center.y + downhill.y * downhillLength, 2)]
  };

  return {
    kind: 'wellMap',
    title: 'Water table from well data',
    prompt: 'Three wells give the water-table elevation at each screen. Draw the contours, then read the gradient and the head at point P.',
    drawing: {
      extent: MAP_EXTENT,
      wells,
      contours,
      interval: WELL_CONTOUR_INTERVAL,
      flowArrow,
      point: { ...point, height: pointHeight },
      planeGradient: plane.gradient
    },
    questions: [
      {
        id: 'pairGradient',
        label: 'Water-table gradient between W1 and W2',
        unit: 'm/km',
        decimals: 2,
        expected: round(pairGradient, 2),
        tolerance: toleranceFor(pairGradient, 0.02, 0.2)
      },
      {
        id: 'pointHead',
        label: `Water-table elevation at point P (interpolate between the ${WELL_CONTOUR_INTERVAL} m contours)`,
        unit: 'm',
        decimals: 1,
        expected: round(pointHeight, 1),
        tolerance: 1
      }
    ],
    solution: [
      `W1 reads ${w1.head} m and W2 reads ${w2.head} m, ${round(spacing, 2)} km apart, so the gradient is ${round(drop, 1)} m ÷ ${round(spacing, 2)} km = ${round(pairGradient, 2)} m/km.`,
      `Draw ${WELL_CONTOUR_INTERVAL} m contours by interpolating between the wells; P falls between the two nearest contours at about ${round(pointHeight, 1)} m.`,
      `Groundwater flows perpendicular to the contours, from high head toward low head — here roughly ${round(plane.gradient, 3)} m/m of slope.`
    ]
  };
}

// ---------------------------------------------------------------------------
// Storm hydrograph (§3.k.iii stream gauging and hydrographs)
// ---------------------------------------------------------------------------

const HYDROGRAPH_DURATION_H = 36;
const HYDROGRAPH_STEP_H = 0.5;

function generateHydrographCase(rng) {
  const rainStart = pick(rng, 2, 5);
  // Even rainfall duration keeps the centroid on the sampled time grid.
  const rainHours = pick(rng, 2, 4, 2);
  const rainCentroid = rainStart + rainHours / 2;
  const lag = pick(rng, 3, 8);
  const peakTime = rainCentroid + lag;
  const baseflow = pick(rng, 2, 6, 0.5, 1);
  const rise = pick(rng, 10, 40);
  const recession = round(5 + rng() * 5, 1);

  const series = [];
  for (let t = 0; t <= HYDROGRAPH_DURATION_H; t += HYDROGRAPH_STEP_H) {
    let discharge = baseflow;
    if (t > rainStart && t <= peakTime) {
      discharge = baseflow + rise * ((t - rainStart) / (peakTime - rainStart)) ** 2;
    } else if (t > peakTime) {
      discharge = baseflow + rise * Math.exp(-(t - peakTime) / recession);
    }
    series.push({ t, q: round(discharge, 2) });
  }
  const peakDischarge = baseflow + rise;

  return {
    kind: 'hydrograph',
    title: 'Storm hydrograph',
    prompt: 'The hyetograph above the hydrograph shows when the rain fell. Read the lag time and the peak discharge.',
    drawing: {
      series,
      step: HYDROGRAPH_STEP_H,
      rainfall: { start: rainStart, hours: rainHours, amount: pick(rng, 10, 40) },
      baseflow,
      peakTime,
      peakDischarge,
      duration: HYDROGRAPH_DURATION_H
    },
    questions: [
      {
        id: 'lag',
        label: 'Lag time (rainfall centroid to peak discharge)',
        unit: 'h',
        decimals: 0,
        expected: lag,
        tolerance: 0
      },
      {
        id: 'peak',
        label: 'Peak discharge',
        unit: 'm³/s',
        decimals: 1,
        expected: round(peakDischarge, 1),
        tolerance: 1
      }
    ],
    solution: [
      `Rain falls from hour ${rainStart} to hour ${rainStart + rainHours}, so its centroid is hour ${rainCentroid}. The hydrograph peaks at hour ${peakTime}, a lag of ${lag} h.`,
      `Peak discharge is ${round(peakDischarge, 1)} m³/s; baseflow is ${baseflow} m³/s, so stormflow adds ${round(rise, 1)} m³/s.`,
      'Lag time depends on the basin as much as the storm: steep, urbanized, or small basins peak sooner than flat, vegetated, or large ones.'
    ]
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const GENERATORS = {
  contour: generateContourCase,
  streamOrder: generateStreamCase,
  wellMap: generateWellCase,
  hydrograph: generateHydrographCase
};

export const CASE_KINDS = Object.freeze(Object.keys(GENERATORS));

/** Generate one case for `kind` from an integer seed. Same seed → same case. */
export function generateCase(kind, seed) {
  const generator = GENERATORS[kind];
  if (!generator) throw new Error(`Unknown case kind: ${kind}`);
  const numericSeed = Number(seed);
  if (!Number.isInteger(numericSeed)) throw new Error('Seed must be an integer.');
  const normalized = Math.abs(numericSeed) % 1000000 || 1;
  return { ...generator(createRng(normalized)), seed: normalized };
}

/**
 * Grade the answers for a generated case. A blank field is "not answered"
 * rather than wrong, so a student is not punished for a half-filled form.
 */
export function checkAnswers(caseData, answers = {}) {
  return caseData.questions.map((question) => {
    const raw = String(answers[question.id] ?? '').trim();
    const value = raw === '' ? null : Number(raw);
    const answered = value !== null && Number.isFinite(value);
    const correct = answered && Math.abs(value - question.expected) <= question.tolerance + 1e-9;
    return {
      id: question.id,
      label: question.label,
      unit: question.unit,
      answered,
      correct,
      expected: question.expected
    };
  });
}

/** Render an expected value at the precision the question asks for. */
export function formatCaseValue(value, decimals = 0) {
  if (!Number.isFinite(value)) return '—';
  return value.toFixed(decimals);
}
