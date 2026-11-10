import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CASE_KINDS,
  MAP_EXTENT,
  checkAnswers,
  computeStrahler,
  contourSegments,
  createRng,
  fitWaterTablePlane,
  formatCaseValue,
  generateCase,
  sampleContourHeight
} from '../src/components/events/dynamicplanet/mapPracticeUtils.js';

const close = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);

const questionById = (caseData, id) => caseData.questions.find((question) => question.id === id);

test('the seeded generator is deterministic and stays in range', () => {
  const first = createRng(42);
  const second = createRng(42);
  const sequence = Array.from({ length: 20 }, () => first());
  assert.deepEqual(sequence, Array.from({ length: 20 }, () => second()));
  assert.ok(sequence.every((value) => value >= 0 && value < 1));
  assert.notDeepEqual(Array.from({ length: 5 }, createRng(43)), sequence.slice(0, 5));
});

test('the same seed reproduces a case exactly, and different seeds differ', () => {
  for (const kind of CASE_KINDS) {
    const a = generateCase(kind, 1234);
    const b = generateCase(kind, 1234);
    assert.deepEqual(a, b, `${kind} must be reproducible`);
    assert.equal(a.kind, kind);
    assert.equal(a.seed, 1234);
  }
  assert.notDeepEqual(generateCase('contour', 1), generateCase('contour', 2));
  assert.notDeepEqual(generateCase('hydrograph', 1), generateCase('hydrograph', 2));
  assert.throws(() => generateCase('nope', 1), /Unknown case kind/);
  assert.throws(() => generateCase('contour', 1.5), /Seed must be an integer/);
  assert.equal(generateCase('contour', -5).seed, 5);
  assert.equal(generateCase('contour', 0).seed, 1);
});

test('contour cases put A and B on labelled contours, so relief and gradient match the map', () => {
  for (const seed of [1, 7, 42, 99, 2027]) {
    const caseData = generateCase('contour', seed);
    const { contours, interval, points, levels, extent } = caseData.drawing;
    assert.deepEqual(extent, MAP_EXTENT);
    assert.ok(contours.length >= 4, `seed ${seed} needs readable contours`);
    assert.ok(contours.every((contour) => contour.segments.length > 0), 'every listed level draws something');
    assert.ok(contours.every((contour) => contour.level % interval === 0), 'levels are multiples of the interval');
    assert.notEqual(levels.a, levels.b);
    assert.ok(Math.abs(levels.a - levels.b) >= interval * 2, 'relief is unambiguous');

    // Both marked points sit on their own contour line, so a student reads the
    // elevation straight off the label rather than interpolating.
    assert.ok(points.a.x >= 0 && points.a.x <= MAP_EXTENT.xMax);
    assert.ok(points.b.y >= 0 && points.b.y <= MAP_EXTENT.yMax);
    for (const [point, level] of [[points.a, levels.a], [points.b, levels.b]]) {
      assert.ok(
        contours.some((contour) => contour.level === level),
        `level ${level} must be drawn`
      );
      const nearest = Math.min(
        ...contours
          .find((contour) => contour.level === level)
          .segments.flat()
          .map(([x, y]) => Math.hypot(x - point.x, y - point.y))
      );
      assert.ok(nearest <= 0.05, 'the marked point is on the contour');
    }

    const relief = Math.abs(levels.a - levels.b);
    const distance = Math.hypot(points.b.x - points.a.x, points.b.y - points.a.y);
    assert.equal(questionById(caseData, 'relief').expected, relief);
    assert.equal(questionById(caseData, 'gradient').expected, Math.round((relief / distance) * 10) / 10);
  }
});

test('contour extraction returns segments on the requested level, inside the map', () => {
  const params = { base: 100, gx: 18, gy: 8, amp: 12, kx: 1.4, ky: 1.1, phase: 0.7 };
  const height = (x, y) => sampleContourHeight(params, x, y);
  const segments = contourSegments(height, 150, { grid: 20 });
  assert.ok(segments.length > 0);
  for (const [start, end] of segments) {
    for (const [x, y] of [start, end]) {
      assert.ok(x >= -1e-9 && x <= MAP_EXTENT.xMax + 1e-9);
      assert.ok(y >= -1e-9 && y <= MAP_EXTENT.yMax + 1e-9);
      // Endpoints are linearly interpolated along a cell edge, so they sit
      // within a small fraction of a contour interval of the exact level; the
      // error grows with cell size squared, hence the looser 20x20 bound.
      close(height(x, y), 150, 0.15);
    }
  }
  assert.equal(contourSegments(height, -1000, { grid: 20 }).length, 0);
});

test('stream networks follow Strahler ordering, recomputed independently from the drawing', () => {
  const orderOf = (links, id, memo = new Map()) => {
    if (memo.has(id)) return memo.get(id);
    const children = links.filter((link) => link.from === id).map((link) => link.to);
    const order = children.length === 0 ? 1 : (() => {
      const childOrders = children.map((child) => orderOf(links, child, memo));
      const highest = Math.max(...childOrders);
      return childOrders.filter((value) => value === highest).length >= 2 ? highest + 1 : highest;
    })();
    memo.set(id, order);
    return order;
  };

  for (const seed of [3, 11, 64, 512]) {
    const caseData = generateCase('streamOrder', seed);
    const { links, nodes, outletId, headwaterIds } = caseData.drawing;

    assert.equal(orderOf(links, outletId), questionById(caseData, 'outletOrder').expected);
    assert.ok([2, 3, 4].includes(questionById(caseData, 'outletOrder').expected));

    // A first-order segment is one that ends at a headwater, so the count is
    // exactly the number of headwaters.
    assert.equal(questionById(caseData, 'firstOrderCount').expected, headwaterIds.length);
    assert.equal(links.filter((link) => link.order === 1).length, headwaterIds.length);

    // Every internal node has two upstream links (no phantom single-child junction).
    for (const node of nodes) {
      const upstream = links.filter((link) => link.from === node.id);
      assert.ok(upstream.length === 0 || upstream.length === 2, `${node.id} has ${upstream.length} tributaries`);
      if (upstream.length === 0) assert.ok(headwaterIds.includes(node.id));
    }

    // Each link stores the Strahler order of the segment it carries, and the
    // stored node orders agree with the independent recomputation.
    for (const link of links) {
      assert.equal(link.order, orderOf(links, link.to));
    }
    for (const node of nodes) assert.equal(node.order, orderOf(links, node.id));

    // The outlet is the only node with no downstream link.
    const outlets = nodes.filter((node) => !links.some((link) => link.to === node.id));
    assert.deepEqual(outlets.map((node) => node.id), [outletId]);
  }

  assert.equal(computeStrahler({ children: [] }), 1);
  assert.equal(computeStrahler({ children: [{ children: [] }, { children: [] }] }), 2);
  assert.equal(computeStrahler({ children: [{ children: [] }, { children: [{ children: [] }, { children: [] }] }] }), 2);
});

test('well cases draw regular contours that agree with the fitted water-table plane', () => {
  for (const seed of [5, 77, 909, 4040]) {
    const caseData = generateCase('wellMap', seed);
    const { wells, point, contours, interval, flowArrow } = caseData.drawing;
    const plane = fitWaterTablePlane(wells);
    assert.ok(plane, 'the generated wells must not be collinear');

    // The plane is the wells' own surface.
    for (const well of wells) close(plane.height(well.x, well.y), well.head, 1e-9);

    // Contours are evenly spaced and each one is a level line of that surface.
    assert.ok(contours.length >= 2, `seed ${seed} needs at least two contours`);
    for (const contour of contours) {
      assert.equal(contour.level % interval, 0);
      for (const [x, y] of contour.segment) {
        close(plane.height(x, y), contour.level, 1e-2);
        // The clipped line stays inside the map rectangle.
        assert.ok(x >= -1e-9 && x <= MAP_EXTENT.xMax + 1e-9, `x ${x} inside the map`);
        assert.ok(y >= -1e-9 && y <= MAP_EXTENT.yMax + 1e-9, `y ${y} inside the map`);
      }
    }

    const [w1, w2] = wells;
    const pairGradient = Math.abs(w1.head - w2.head) / Math.hypot(w1.x - w2.x, w1.y - w2.y);
    assert.equal(questionById(caseData, 'pairGradient').expected, Math.round(pairGradient * 100) / 100);
    assert.equal(questionById(caseData, 'pointHead').expected, Math.round(plane.height(point.x, point.y) * 10) / 10);
    close(point.height, plane.height(point.x, point.y), 1e-9);

    // The flow arrow points straight downhill, perpendicular to the contours.
    const arrow = { x: flowArrow.to[0] - flowArrow.from[0], y: flowArrow.to[1] - flowArrow.from[1] };
    const slope = { x: plane.a, y: plane.b };
    const cosine = (arrow.x * slope.x + arrow.y * slope.y) / (Math.hypot(arrow.x, arrow.y) * Math.hypot(slope.x, slope.y));
    // The arrow endpoints are rounded for display, so only the direction matters.
    close(cosine, -1, 1e-3);
  }
});

test('hydrograph cases peak where their own series peaks, and report lag from the rainfall centroid', () => {
  for (const seed of [2, 19, 256, 8888]) {
    const caseData = generateCase('hydrograph', seed);
    const { series, step, rainfall, peakTime, peakDischarge, baseflow, duration } = caseData.drawing;
    assert.equal(series.length, Math.round(duration / step) + 1);
    assert.equal(series[0].q, baseflow, 'the record starts at baseflow');
    assert.ok(series[series.length - 1].q >= baseflow, 'recession stays above baseflow');

    const maxQ = Math.max(...series.map((point) => point.q));
    close(maxQ, questionById(caseData, 'peak').expected, 0.01);
    close(maxQ, peakDischarge, 0.01);
    assert.equal(series.find((point) => point.q === maxQ).t, peakTime, 'the peak lands on a sampled hour');

    const centroid = rainfall.start + rainfall.hours / 2;
    assert.equal(questionById(caseData, 'lag').expected, peakTime - centroid);
    assert.ok(peakTime > rainfall.start + rainfall.hours, 'the peak follows the rain');
    assert.equal(rainfall.amount >= 10 && rainfall.amount <= 40, true);
  }
});

test('grading accepts tolerant answers, rejects wrong ones, and leaves blanks unanswered', () => {
  const caseData = generateCase('contour', 31);
  const questions = Object.fromEntries(caseData.questions.map((question) => [question.id, question]));

  const exact = checkAnswers(caseData, {
    relief: String(questions.relief.expected),
    gradient: String(questions.gradient.expected)
  });
  assert.deepEqual(exact.map((result) => result.correct), [true, true]);

  const tolerant = checkAnswers(caseData, {
    relief: String(questions.relief.expected + questions.relief.tolerance * 0.9),
    gradient: String(questions.gradient.expected + questions.gradient.tolerance * 0.9)
  });
  assert.deepEqual(tolerant.map((result) => result.correct), [true, true]);

  const wrong = checkAnswers(caseData, {
    relief: String(questions.relief.expected + questions.relief.tolerance * 3),
    gradient: String(questions.gradient.expected - questions.gradient.tolerance * 3)
  });
  assert.deepEqual(wrong.map((result) => result.correct), [false, false]);

  const blank = checkAnswers(caseData, { relief: '   ', gradient: 'not a number' });
  assert.deepEqual(blank.map((result) => result.answered), [false, false]);
  assert.deepEqual(blank.map((result) => result.correct), [false, false]);

  // Integer questions reject a decimal answer that is otherwise close.
  const integerCase = generateCase('streamOrder', 12);
  const outlet = questionById(integerCase, 'outletOrder');
  const firstOrder = questionById(integerCase, 'firstOrderCount');
  assert.deepEqual(
    checkAnswers(integerCase, {
      outletOrder: String(outlet.expected + 0.4),
      firstOrderCount: String(firstOrder.expected)
    }).map((result) => result.correct),
    [false, true]
  );
});

test('every case kind produces gradable questions and a worked solution', () => {
  for (const kind of CASE_KINDS) {
    for (let seed = 1; seed <= 15; seed += 1) {
      const caseData = generateCase(kind, seed);
      assert.ok(caseData.title.length > 0, `${kind} needs a title`);
      assert.ok(caseData.prompt.length > 0, `${kind} needs a prompt`);
      assert.ok(caseData.questions.length >= 2, `${kind} needs at least two questions`);
      assert.ok(caseData.solution.length >= 2, `${kind} needs a worked solution`);
      for (const question of caseData.questions) {
        assert.ok(question.label.length > 0);
        assert.ok(question.unit.length > 0, `${kind}/${question.id} needs a unit`);
        assert.ok(Number.isFinite(question.expected), `${kind}/${question.id} needs a numeric answer`);
        assert.ok(question.tolerance >= 0);
        assert.ok(Number.isInteger(question.decimals) && question.decimals >= 0);
      }
    }
  }
});

test('formatCaseValue prints at the question precision and handles bad values', () => {
  assert.equal(formatCaseValue(7.26, 1), '7.3');
  assert.equal(formatCaseValue(3, 0), '3');
  assert.equal(formatCaseValue(Number.NaN, 1), '—');
});
