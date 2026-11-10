import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  calculateDarcyFlow,
  calculateFloodRecurrence,
  calculateHydraulicGradient,
  calculateManningFlow,
  calculateResidenceTime,
  calculateSinuosity,
  classifySinuosity,
  formatMeasurement,
  fromSI,
  toSI,
  unitOptions
} from '../src/components/events/dynamicplanet/freshwaterToolboxUtils.js';
import { ACTIVE_DATA } from '../src/seasons/active.js';

const close = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);

const registrySource = readFileSync(new URL('../src/components/events/registry.js', import.meta.url), 'utf8');
const toolSource = readFileSync(new URL('../src/components/events/dynamicplanet/FreshwaterToolbox.jsx', import.meta.url), 'utf8');

test('unit conversion round-trips every supported unit and rejects unknown ones', () => {
  const cases = [
    ['length', 'km', 2, 2000],
    ['length', 'ft', 1, 0.3048],
    ['length', 'mi', 1, 1609.344],
    ['area', 'km²', 1, 1e6],
    ['area', 'ha', 1, 1e4],
    ['volume', 'L', 1000, 1],
    ['volume', 'km³', 1, 1e9],
    ['time', 'day', 1, 86400],
    ['time', 'yr', 1, 31557600],
    ['velocity', 'cm/s', 100, 1],
    ['conductivity', 'm/day', 1, 1 / 86400]
  ];
  for (const [dimension, unit, value, si] of cases) {
    close(toSI(value, unit, dimension), si);
    close(fromSI(si, unit, dimension), value);
  }
  for (const unit of unitOptions('length')) {
    close(fromSI(toSI(9.5, unit, 'length'), unit, 'length'), 9.5);
  }
  assert.throws(() => toSI(1, 'm', 'not-a-dimension'), /Unknown unit dimension/);
  assert.throws(() => toSI(1, 'furlong', 'length'), /Unknown length unit/);
});

test('sinuosity divides channel length by valley length and labels the channel pattern', () => {
  const straight = calculateSinuosity({ channelLengthM: 1000, valleyLengthM: 1000 });
  assert.equal(straight.sinuosity, 1);
  assert.equal(straight.classification, 'Straight');
  assert.equal(straight.percentLonger, 0);
  assert.equal(straight.warning, null);

  const meander = calculateSinuosity({ channelLengthM: 1500, valleyLengthM: 1000 });
  assert.equal(meander.sinuosity, 1.5);
  assert.equal(meander.classification, 'Meandering');
  assert.equal(meander.percentLonger, 50);

  assert.equal(classifySinuosity(1.2), 'Sinuous');
  assert.match(calculateSinuosity({ channelLengthM: 0, valleyLengthM: 10 }).error, /Channel length/);
  assert.match(calculateSinuosity({ channelLengthM: 10, valleyLengthM: -1 }).error, /Valley length/);

  const swapped = calculateSinuosity({ channelLengthM: 500, valleyLengthM: 1000 });
  assert.match(swapped.warning, /shorter than the valley axis/);
});

test('hydraulic gradient is head change over flow-path length', () => {
  const result = calculateHydraulicGradient({ headChangeM: 10, flowPathM: 100 });
  assert.equal(result.gradient, 0.1);
  close(result.percent, 10);
  assert.equal(result.magnitude, 0.1);

  const reversed = calculateHydraulicGradient({ headChangeM: -2, flowPathM: 50 });
  assert.equal(reversed.gradient, -0.04);
  assert.equal(reversed.magnitude, 0.04);

  assert.match(calculateHydraulicGradient({ headChangeM: 1, flowPathM: 0 }).error, /Flow-path length/);
  assert.match(calculateHydraulicGradient({ headChangeM: Number.NaN, flowPathM: 5 }).error, /Head change/);
});

test('Darcy flow computes specific discharge, total discharge, and seepage velocity', () => {
  const result = calculateDarcyFlow({
    conductivityMps: 1e-5,
    areaM2: 1000,
    headChangeM: 2,
    flowPathM: 200
  });
  close(result.gradient, 0.01);
  close(result.specificDischargeMps, 1e-7);
  close(result.dischargeM3PerSec, 1e-4);
  assert.equal(result.seepageVelocityMps, null);

  const withPorosity = calculateDarcyFlow({
    conductivityMps: 1e-5,
    areaM2: 1000,
    headChangeM: 2,
    flowPathM: 200,
    porosity: 0.25
  });
  close(withPorosity.seepageVelocityMps, 4e-7);
  assert.equal(withPorosity.porosity, 0.25);

  assert.match(
    calculateDarcyFlow({ conductivityMps: -1, areaM2: 1, headChangeM: 1, flowPathM: 1 }).error,
    /conductivity/
  );
  assert.match(
    calculateDarcyFlow({ conductivityMps: 1e-5, areaM2: 0, headChangeM: 1, flowPathM: 1 }).error,
    /area/
  );
  assert.match(
    calculateDarcyFlow({ conductivityMps: 1e-5, areaM2: 1, headChangeM: 1, flowPathM: 1, porosity: 1.5 }).error,
    /Porosity/
  );
});

test('residence time is storage divided by throughput', () => {
  const result = calculateResidenceTime({ storageM3: 1e6, throughputM3PerSec: 1 });
  assert.equal(result.seconds, 1e6);
  close(result.days, 11.574074074074074);
  close(result.years, 0.03168808781402895);

  assert.equal(calculateResidenceTime({ storageM3: 0, throughputM3PerSec: 1 }).seconds, 0);
  assert.match(calculateResidenceTime({ storageM3: 1, throughputM3PerSec: 0 }).error, /Throughput/);
  assert.match(calculateResidenceTime({ storageM3: -1, throughputM3PerSec: 1 }).error, /Storage/);
});

test('flood recurrence converts exceedance probability to a return period and n-year chance', () => {
  const result = calculateFloodRecurrence({ annualExceedanceProbability: 0.02, periodYears: 10 });
  assert.equal(result.returnPeriodYears, 50);
  close(result.chanceAtLeastOnce, 0.1829271931124533);
  close(result.chanceAtLeastOncePercent, 18.29271931124533);

  assert.equal(calculateFloodRecurrence({ annualExceedanceProbability: 1, periodYears: 0 }).returnPeriodYears, 1);
  assert.match(calculateFloodRecurrence({ annualExceedanceProbability: 0, periodYears: 1 }).error, /probability/);
  assert.match(calculateFloodRecurrence({ annualExceedanceProbability: 1.2, periodYears: 1 }).error, /probability/);
  assert.match(calculateFloodRecurrence({ annualExceedanceProbability: 0.1, periodYears: -1 }).error, /Period/);
});

test('Manning flow derives hydraulic radius, velocity, and discharge', () => {
  const result = calculateManningFlow({ areaM2: 2, wettedPerimeterM: 3, slope: 0.001, roughnessN: 0.03 });
  close(result.hydraulicRadiusM, 2 / 3);
  close(result.velocityMps, 0.8044231725562153);
  close(result.dischargeM3PerSec, 1.6088463451124306);

  assert.equal(calculateManningFlow({ areaM2: 2, wettedPerimeterM: 3, slope: 0, roughnessN: 0.03 }).velocityMps, 0);
  assert.match(calculateManningFlow({ areaM2: 0, wettedPerimeterM: 3, slope: 0.001, roughnessN: 0.03 }).error, /area/);
  assert.match(calculateManningFlow({ areaM2: 2, wettedPerimeterM: 0, slope: 0.001, roughnessN: 0.03 }).error, /perimeter/);
  assert.match(calculateManningFlow({ areaM2: 2, wettedPerimeterM: 3, slope: -1, roughnessN: 0.03 }).error, /slope/);
  assert.match(calculateManningFlow({ areaM2: 2, wettedPerimeterM: 3, slope: 0.001, roughnessN: 0 }).error, /roughness/);
});

test('formatMeasurement keeps values readable across magnitudes', () => {
  assert.equal(formatMeasurement(0), '0');
  assert.equal(formatMeasurement(Number.NaN), '—');
  assert.equal(formatMeasurement(1.5), '1.5');
  assert.equal(formatMeasurement(1 / 3), '0.3333');
  assert.equal(formatMeasurement(1e-7), '1.00e-7');
  assert.equal(formatMeasurement(2.5e7), '2.50e+7');
});

test('the toolbox is registered as a generated/user-input tool with cited manual sections', () => {
  assert.match(registrySource, /id: 'freshwater-toolbox'/);
  assert.match(registrySource, /FreshwaterToolbox/);
  assert.match(toolSource, /driven entirely by the values you enter/);
  assert.doesNotMatch(toolSource, /answer key|correctOption|sample dataset|preset scenario/i);

  const toolbox = ACTIVE_DATA.dynamicplanet.toolbox;
  for (const key of ['sinuosity', 'hydraulicGradient', 'darcyFlow', 'residenceTime', 'recurrenceInterval', 'manningFlow']) {
    assert.ok(toolbox[key], `${key} needs season data`);
    assert.match(toolbox[key].citation, /§3\./, `${key} needs a manual section`);
    assert.ok(toolbox[key].basis.length > 20, `${key} needs an explicit basis`);
  }
});
