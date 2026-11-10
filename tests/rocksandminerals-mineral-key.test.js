import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHEMICAL_CLASSES,
  HARDNESS_TOLERANCE,
  OFFICIAL_MINERALS,
  activeCriteriaCount,
  buildCards,
  buildCardsCsv,
  cardsInScope,
  coverageOf,
  createCriteria,
  createEmptyProperties,
  formatHardness,
  hasRecordedProperties,
  importCardsCsv,
  matchCard,
  parseCsv,
  propertyReadouts,
  rankCandidates,
  safeParseAuthored,
  sanitizeProperties
} from '../src/components/events/rocksandminerals/specimenCardsUtils.js';

const cardFor = (authored, id) => buildCards(authored).find((card) => card.id === id);

const GALENA = {
  luster: ['metallic'],
  hardnessMin: '2.5',
  hardnessMax: '2.75',
  cleavage: ['perfect'],
  streak: ['gray'],
  acid: 'none',
  magnetic: 'no',
  notes: 'Three perfect cleavage directions.'
};

const PYRITE = {
  luster: ['metallic'],
  hardnessMin: '6',
  hardnessMax: '6.5',
  cleavage: ['none'],
  streak: ['black', 'green'],
  acid: 'none',
  magnetic: 'no',
  notes: ''
};

test('the official list is transcribed whole, with classes and levels from the manual', () => {
  // pp. C55–C56: 81 minerals, 27 of them asterisked State/National specimens.
  assert.equal(OFFICIAL_MINERALS.length, 81);
  assert.equal(OFFICIAL_MINERALS.filter((mineral) => mineral.level === 'state').length, 27);
  assert.deepEqual(
    [...CHEMICAL_CLASSES],
    ['Sulfates', 'Sulfides', 'Silicates', 'Borates', 'Carbonates', 'Native elements', 'Halides', 'Oxide/Hydroxides', 'Phosphates']
  );

  const ids = OFFICIAL_MINERALS.map((mineral) => mineral.id);
  assert.equal(new Set(ids).size, ids.length, 'mineral ids must be unique');
  assert.ok(OFFICIAL_MINERALS.every((mineral) => mineral.name.trim() && mineral.cls.trim()));
  assert.ok(OFFICIAL_MINERALS.every((mineral) => mineral.level === 'regional' || mineral.level === 'state'));

  // Spot-check the asterisks and list footnotes that decide item names.
  const byId = Object.fromEntries(OFFICIAL_MINERALS.map((mineral) => [mineral.id, mineral]));
  assert.equal(byId.bornite.level, 'state');
  assert.equal(byId.pyrite.level, 'regional');
  assert.equal(byId.zircon.level, 'state');
  assert.equal(byId.calcite.level, 'regional');
  assert.equal(byId.orthoclase.name, 'Orthoclase/Microcline');
  assert.equal(byId.orthoclase.group, 'Potassium feldspar');
  assert.match(byId.tourmaline.note, /generic group name/);
  assert.equal(byId.goethite.name, 'Goethite/Limonite');
  assert.equal(byId.agate.name, 'Agate/Chalcedony');
  assert.equal(byId.fluorapatite.group, 'Apatite Group');
  assert.equal(byId.vanadinite.group, 'Apatite Group');
});

test('property records merge onto the official list without changing its identity', () => {
  const cards = buildCards({ galena: GALENA, 'not-a-mineral': { luster: ['metallic'] } });
  assert.equal(cards.length, OFFICIAL_MINERALS.length);
  const galena = cards.find((card) => card.id === 'galena');
  assert.equal(galena.name, 'Galena');
  assert.equal(galena.cls, 'Sulfides');
  assert.deepEqual(galena.properties.luster, ['metallic']);
  assert.equal(cards.some((card) => card.id === 'not-a-mineral'), false);

  // A record cannot relabel the skeleton or promote a State/National mineral.
  const tampered = buildCards({ zircon: { ...GALENA, cls: 'Carbonates', level: 'regional', name: 'Not zircon' } });
  const zircon = tampered.find((card) => card.id === 'zircon');
  assert.equal(zircon.name, 'Zircon');
  assert.equal(zircon.cls, 'Silicates');
  assert.equal(zircon.level, 'state');
});

test('saved properties are sanitised: unknown fields, tags and out-of-range values are dropped', () => {
  const properties = sanitizeProperties({
    luster: ['metallic', 'sparkly', 'metallic'],
    hardnessMin: '-4',
    hardnessMax: '99',
    cleavage: ['perfect', 'bogus'],
    streak: 'black',
    acid: 'explosive',
    magnetic: 'yes',
    notes: 'x'.repeat(2100),
    evil: true
  });
  assert.deepEqual(properties.luster, ['metallic']);
  assert.deepEqual(properties.cleavage, ['perfect']);
  assert.deepEqual(properties.streak, []);
  assert.equal(properties.hardnessMin, 1);
  assert.equal(properties.hardnessMax, 10);
  assert.equal(properties.acid, '');
  assert.equal(properties.magnetic, 'yes');
  assert.equal(properties.notes.length, 2000);
  assert.equal('evil' in properties, false);
  assert.deepEqual(sanitizeProperties(null), createEmptyProperties());
  assert.deepEqual(sanitizeProperties('junk'), createEmptyProperties());
});

test('hardness is compared as a range with a stated tolerance', () => {
  const galena = cardFor({ galena: GALENA }, 'galena');
  assert.equal(formatHardness(galena.properties), '2.5–2.75');
  assert.equal(matchCard(galena, { hardness: '2.5' }).status, 'match');
  assert.equal(matchCard(galena, { hardness: '3' }).status, 'match', 'within the half-point window');
  assert.equal(matchCard(galena, { hardness: '3.5' }).status, 'excluded');
  assert.equal(matchCard(galena, { hardness: '1.5' }).status, 'excluded');
  assert.equal(HARDNESS_TOLERANCE, 0.5);

  // A single bound still describes a point observation.
  const single = cardFor({ galena: { ...GALENA, hardnessMin: '', hardnessMax: '3' } }, 'galena');
  assert.equal(formatHardness(single.properties), '3');
  assert.equal(matchCard(single, { hardness: '3' }).status, 'match');
  assert.equal(matchCard(single, { hardness: '4' }).status, 'excluded');
});

test('matching separates recorded conflicts from properties not yet recorded', () => {
  const galena = cardFor({ galena: GALENA }, 'galena');
  const unrecorded = cardFor({}, 'galena');

  assert.equal(matchCard(unrecorded, { luster: ['metallic'] }).status, 'unknown');
  assert.deepEqual(matchCard(unrecorded, { luster: ['metallic'] }).missing, ['Luster']);
  assert.equal(matchCard(unrecorded, {}).status, 'match', 'no observations means no judgement needed');

  assert.equal(matchCard(galena, { luster: ['metallic', 'vitreous'] }).status, 'match', 'tags are OR within a property');
  const conflict = matchCard(galena, { luster: ['vitreous'] });
  assert.equal(conflict.status, 'excluded');
  assert.deepEqual(conflict.conflicts[0], { property: 'Luster', wanted: 'Vitreous (glassy)', recorded: 'Metallic' });

  assert.equal(matchCard(galena, { streak: ['gray'] }).status, 'match');
  assert.equal(matchCard(galena, { cleavage: ['none'] }).status, 'excluded');
  assert.equal(matchCard(galena, { acid: 'strong' }).status, 'excluded');
  assert.equal(matchCard(galena, { magnetic: 'yes' }).status, 'excluded');
});

test('ranking splits candidates into matched, unknown and excluded buckets', () => {
  const cards = buildCards({ galena: GALENA, pyrite: PYRITE });
  const { matched, unknown, excluded } = rankCandidates(cards, { luster: ['metallic'], hardness: '2.5' });
  assert.deepEqual(matched.map((entry) => entry.card.name), ['Galena']);
  assert.deepEqual(excluded.map((entry) => entry.card.name), ['Pyrite']);
  assert.equal(excluded[0].verdict.conflicts[0].property, 'Hardness');
  assert.equal(unknown.length, OFFICIAL_MINERALS.length - 2);
  assert.ok(unknown.every((entry) => entry.verdict.missing.length > 0));

  // Name order is stable inside a bucket so the list does not jump while typing.
  const all = rankCandidates(cards, {});
  assert.equal(all.matched.length, OFFICIAL_MINERALS.length);
  const names = all.matched.map((entry) => entry.card.name);
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b)));
});

test('class filter, scope gating and coverage describe the list honestly', () => {
  const cards = buildCards({ galena: GALENA, zircon: PYRITE });
  const carbonates = rankCandidates(cards, { cls: 'Carbonates' });
  assert.ok(carbonates.matched.every((entry) => entry.card.cls === 'Carbonates'));
  assert.equal(carbonates.excluded.length, OFFICIAL_MINERALS.length - carbonates.matched.length);

  const regional = cardsInScope(cards, false);
  const all = cardsInScope(cards, true);
  assert.equal(all.length, OFFICIAL_MINERALS.length);
  assert.equal(regional.length, OFFICIAL_MINERALS.length - 27);
  assert.ok(regional.every((card) => card.level === 'regional'));

  assert.deepEqual(coverageOf(cards), { recorded: 2, total: OFFICIAL_MINERALS.length });
  assert.equal(hasRecordedProperties(createEmptyProperties()), false);
  assert.equal(hasRecordedProperties({ ...createEmptyProperties(), notes: 'only a note' }), false);
  assert.equal(hasRecordedProperties({ ...createEmptyProperties(), streak: ['white'] }), true);

  assert.equal(activeCriteriaCount(createCriteria()), 0);
  assert.equal(activeCriteriaCount({ ...createCriteria(), luster: ['metallic'], hardness: '6' }), 2);
});

test('property readouts only show what the student recorded', () => {
  const galena = cardFor({ galena: GALENA }, 'galena');
  const readouts = propertyReadouts(galena);
  assert.deepEqual(readouts.find((item) => item.label === 'Hardness'), { label: 'Hardness', value: '2.5–2.75' });
  assert.deepEqual(readouts.find((item) => item.label === 'Cleavage'), { label: 'Cleavage', value: 'Perfect' });
  assert.deepEqual(readouts.find((item) => item.label === 'Magnet'), { label: 'Magnet', value: 'Not magnetic' });
  assert.deepEqual(propertyReadouts(cardFor({}, 'galena')), []);
});

test('saved data is validated before it reaches the key', () => {
  const parsed = safeParseAuthored(JSON.stringify({ galena: GALENA }));
  assert.deepEqual(parsed.value.galena.luster, ['metallic']);
  assert.deepEqual(parsed.value.galena.cleavage, ['perfect']);

  assert.match(safeParseAuthored('{ not json').error, /could not be read/);
  assert.match(safeParseAuthored('[]').error, /unsupported format/);
  assert.match(safeParseAuthored('"text"').error, /unsupported format/);
});

test('CSV export round-trips through import, escaping cells safely', () => {
  const cards = buildCards({ galena: GALENA, pyrite: { ...PYRITE, notes: '=HYPERLINK("bad")' } });
  const csv = buildCardsCsv(cards);
  const parsed = parseCsv(csv);
  assert.equal(parsed[0][0], 'mineral');
  assert.equal(parsed.length, OFFICIAL_MINERALS.length + 1);
  assert.ok(csv.includes("'=HYPERLINK"), 'spreadsheet formulas are neutralised');
  assert.ok(csv.includes('"Metallic"'));

  const imported = importCardsCsv(csv);
  assert.equal(imported.error, undefined);
  assert.equal(imported.applied.length, OFFICIAL_MINERALS.length);
  assert.equal(imported.skipped.length, 0);
  assert.deepEqual(imported.authored.galena.luster, ['metallic']);
  assert.deepEqual(imported.authored.pyrite.streak, ['black', 'green']);
  assert.equal(imported.authored.galena.hardnessMin, 2.5);
  assert.equal(imported.authored.galena.hardnessMax, 2.75);
  assert.equal(imported.authored.galena.magnetic, 'no');
});

test('CSV import reports unknown minerals and unrecognised values instead of guessing', () => {
  const csv = [
    'mineral,luster,hardness_min,cleavage,streak,acid,magnetic,notes',
    'Galena,Metallic,2.5,Perfect,gray,none,no,"Cubic cleavage, metallic gray"',
    'Unobtainium,Metallic,3,,,,,',
    'Pyrite,Sparkly,abc,,,,,'
  ].join('\r\n');
  const imported = importCardsCsv(csv);
  assert.deepEqual(imported.skipped, ['Unobtainium']);
  assert.deepEqual(imported.applied, ['Galena', 'Pyrite']);
  assert.deepEqual(imported.authored.galena.streak, ['gray']);
  assert.deepEqual(imported.authored.galena.notes, 'Cubic cleavage, metallic gray');
  assert.deepEqual(imported.authored.pyrite.luster, []);
  assert.equal(imported.authored.pyrite.hardnessMin, '');
  assert.equal(imported.ignoredValues, 2);

  assert.match(importCardsCsv('').error, /no rows/);
  assert.match(importCardsCsv('name,hardness\nGalena,2.5').error, /"mineral" column/);
});

test('the parser handles quoted commas, escaped quotes and both line endings', () => {
  const rows = parseCsv('a,"b, with comma",c\r\n"say ""hi""",,\n');
  assert.deepEqual(rows, [
    ['a', 'b, with comma', 'c'],
    ['say "hi"', '', '']
  ]);
});
