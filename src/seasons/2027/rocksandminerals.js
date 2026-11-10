// Rocks and Minerals — 2027 Division C season data.
// Source: 2027 Division C Rules Manual, pp. C52–C56. The official 2027 National
// Rocks and Minerals List (pp. C55–C56) supplies every mineral name below, its
// chemical-class grouping, and its State/National asterisk.
//
// The manual prints no per-mineral diagnostic properties: footnote 1 says
// identification information "such as diagnostic properties, chemical formulas,
// grain size, or composition" is provided at the tournament. The key therefore
// ships the list as a skeleton and every property value is recorded by the
// student — nothing here is an answer key.

const mineral = (id, name, cls, level = 'regional', extra = {}) =>
  Object.freeze({ id, name, cls, level, ...extra });

const state = 'state';

export const rocksandminerals2027 = Object.freeze({
  year: 2027,
  manualReference: 'Division C Rules Manual, pp. C52–C56',
  mineralKey: Object.freeze({
    citation: '2027 National Rocks and Minerals List, manual pp. C55–C56',
    basis:
      'Mineral names, chemical-class groupings, and State/National asterisks are transcribed from the official list. '
      + 'The list prints no per-mineral properties (footnote 1: identification material such as diagnostic properties or formulas is provided at the tournament), '
      + 'so every property value in this key is one you record from your own observations or a published field guide — not a rule-supplied answer.',
    acidNote:
      'The manual states that HCl is not used or provided at the tournament, so an acid-reaction filter is study support, not a station observation.',
    levelNote:
      'Minerals marked with an asterisk on the official list are used at State and National tournaments only.'
  }),
  minerals: Object.freeze([
    // SULFATES
    mineral('barite', 'Barite', 'Sulfates'),
    mineral('celestite', 'Celestite/Celestine', 'Sulfates', 'regional', { note: 'Also spelled celestine.' }),
    mineral('gypsum', 'Gypsum', 'Sulfates', 'regional', {
      note: 'Listed varieties: alabaster (massive), satin spar (fibrous), selenite (crystalline). Rock Gypsum is identified as gypsum (footnote 5).'
    }),

    // SULFIDES
    mineral('bornite', 'Bornite', 'Sulfides', state),
    mineral('chalcopyrite', 'Chalcopyrite', 'Sulfides'),
    mineral('galena', 'Galena', 'Sulfides'),
    mineral('pyrite', 'Pyrite', 'Sulfides'),
    mineral('sphalerite', 'Sphalerite', 'Sulfides'),
    mineral('stibnite', 'Stibnite', 'Sulfides', state),

    // SILICATES
    mineral('actinolite', 'Actinolite', 'Silicates', state, { group: 'Amphibole Group' }),
    mineral('hornblende', 'Hornblende', 'Silicates', 'regional', { group: 'Amphibole Group' }),
    mineral('tremolite', 'Tremolite', 'Silicates', state, { group: 'Amphibole Group' }),
    mineral('apophyllite', 'Apophyllite', 'Silicates', state),
    mineral('beryl', 'Beryl', 'Silicates'),
    mineral('chrysocolla', 'Chrysocolla', 'Silicates', state),
    mineral('dioptase', 'Dioptase', 'Silicates', state),
    mineral('epidote', 'Epidote', 'Silicates'),
    mineral('albite', 'Albite', 'Silicates', 'regional', { group: 'Plagioclase feldspar' }),
    mineral('labradorite', 'Labradorite', 'Silicates', 'regional', { group: 'Plagioclase feldspar' }),
    mineral('amazonite', 'Amazonite', 'Silicates', 'regional', {
      group: 'Potassium feldspar',
      note: 'Green variety of potassium feldspar.'
    }),
    mineral('orthoclase', 'Orthoclase/Microcline', 'Silicates', 'regional', {
      group: 'Potassium feldspar',
      note: 'Tan/pink potassium feldspar; the list accepts Orthoclase/Microcline or Potassium feldspar (footnote 2).'
    }),
    mineral('almandine', 'Almandine', 'Silicates', 'regional', { group: 'Garnet Group' }),
    mineral('grossular', 'Grossular', 'Silicates', 'regional', { group: 'Garnet Group', note: 'Green variety is the one the list names.' }),
    mineral('kaolinite', 'Kaolinite', 'Silicates'),
    mineral('kyanite', 'Kyanite', 'Silicates'),
    mineral('biotite', 'Biotite', 'Silicates', 'regional', { group: 'Mica Group' }),
    mineral('lepidolite', 'Lepidolite', 'Silicates', state, { group: 'Mica Group' }),
    mineral('muscovite', 'Muscovite', 'Silicates', 'regional', { group: 'Mica Group' }),
    mineral('olivine', 'Olivine', 'Silicates'),
    mineral('prehnite', 'Prehnite', 'Silicates', state),
    mineral('augite', 'Augite', 'Silicates', 'regional', { group: 'Pyroxene Group' }),
    mineral('rhodonite', 'Rhodonite', 'Silicates', state),
    mineral('spodumene', 'Spodumene', 'Silicates', state),
    mineral('aventurine', 'Aventurine', 'Silicates', 'regional', { group: 'Quartz variety' }),
    mineral('agate', 'Agate/Chalcedony', 'Silicates', 'regional', { group: 'Quartz variety' }),
    mineral('amethyst', 'Amethyst', 'Silicates', 'regional', { group: 'Quartz variety' }),
    mineral('citrine', 'Citrine', 'Silicates', 'regional', { group: 'Quartz variety' }),
    mineral('jasper', 'Jasper', 'Silicates', state, { group: 'Quartz variety' }),
    mineral('milky-quartz', 'Milky Quartz', 'Silicates', 'regional', { group: 'Quartz variety' }),
    mineral('opal', 'Opal', 'Silicates', 'regional', {
      group: 'Quartz variety',
      note: 'Listed with the quartz varieties even though it is hydrous silica, not crystalline quartz.'
    }),
    mineral('rock-crystal', 'Rock Crystal', 'Silicates', 'regional', { group: 'Quartz variety' }),
    mineral('rose-quartz', 'Rose Quartz', 'Silicates', 'regional', { group: 'Quartz variety' }),
    mineral('smoky-quartz', 'Smoky Quartz', 'Silicates', state, { group: 'Quartz variety' }),
    mineral('tigers-eye', 'Tiger’s Eye', 'Silicates', state, { group: 'Quartz variety' }),
    mineral('sodalite', 'Sodalite', 'Silicates'),
    mineral('staurolite', 'Staurolite', 'Silicates'),
    mineral('stilbite', 'Stilbite', 'Silicates', state),
    mineral('talc', 'Talc', 'Silicates'),
    mineral('topaz', 'Topaz', 'Silicates'),
    mineral('tourmaline', 'Tourmaline', 'Silicates', 'regional', {
      note: 'The generic group name tourmaline is accepted for identification (footnote 3).'
    }),
    mineral('willemite', 'Willemite', 'Silicates', state),
    mineral('wollastonite', 'Wollastonite', 'Silicates', state),
    mineral('zircon', 'Zircon', 'Silicates', state),

    // BORATES
    mineral('ulexite', 'Ulexite', 'Borates'),

    // CARBONATES
    mineral('aragonite', 'Aragonite', 'Carbonates'),
    mineral('azurite', 'Azurite', 'Carbonates'),
    mineral('calcite', 'Calcite', 'Carbonates'),
    mineral('dolomite', 'Dolomite', 'Carbonates'),
    mineral('malachite', 'Malachite', 'Carbonates'),
    mineral('magnesite', 'Magnesite', 'Carbonates', state),
    mineral('rhodochrosite', 'Rhodochrosite', 'Carbonates', state),
    mineral('siderite', 'Siderite', 'Carbonates', state),

    // NATIVE ELEMENTS
    mineral('copper', 'Copper', 'Native elements'),
    mineral('diamond', 'Diamond', 'Native elements'),
    mineral('gold', 'Gold', 'Native elements'),
    mineral('graphite', 'Graphite', 'Native elements'),
    mineral('silver', 'Silver', 'Native elements'),
    mineral('sulfur', 'Sulfur', 'Native elements'),

    // HALIDES
    mineral('fluorite', 'Fluorite', 'Halides'),
    mineral('halite', 'Halite', 'Halides', 'regional', { note: 'Rock Salt is identified as halite (footnote 5).' }),

    // OXIDE / HYDROXIDES
    mineral('corundum', 'Corundum', 'Oxide/Hydroxides'),
    mineral('goethite', 'Goethite/Limonite', 'Oxide/Hydroxides'),
    mineral('hematite', 'Hematite', 'Oxide/Hydroxides'),
    mineral('magnetite', 'Magnetite', 'Oxide/Hydroxides'),
    mineral('pyrolusite', 'Pyrolusite', 'Oxide/Hydroxides', state),
    mineral('rutile', 'Rutile', 'Oxide/Hydroxides', state),
    mineral('zincite', 'Zincite', 'Oxide/Hydroxides', state),

    // PHOSPHATES
    mineral('turquoise', 'Turquoise', 'Phosphates', state),
    mineral('fluorapatite', 'Fluorapatite', 'Phosphates', 'regional', { group: 'Apatite Group' }),
    mineral('pyromorphite', 'Pyromorphite', 'Phosphates', state, { group: 'Apatite Group' }),
    mineral('vanadinite', 'Vanadinite', 'Phosphates', state, { group: 'Apatite Group' })
  ])
});
