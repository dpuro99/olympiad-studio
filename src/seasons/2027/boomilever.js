// Boomilever — 2027 Division C rule constants.
// Source: 2027 Division C Rules Manual, pp. C7–C12.
export const boomilever2027 = Object.freeze({
  year: 2027,
  manualReference: 'Division C Rules Manual, pp. C7–C12',
  loadSupportedCapGrams: 15000,
  loadScoredBonusGrams: 7500,
  bonusHoldsKg: 15,
  baseOptions: Object.freeze([
    Object.freeze({ id: 'standard', label: '15 cm standard boundary' }),
    Object.freeze({ id: 'bonus', label: '10 cm bonus boundary' })
  ]),
  tiers: Object.freeze(['Tier 1', 'Tier 2', 'Tier 3 (participation only)']),
  scoringNote: 'Score = Load Scored / Structure Mass. Bonus applies only when the 10 cm wall-contact boundary is met and 15 kg is held.',

  // Construction self-check. Numeric limits and every consequence below are
  // transcribed from the printed manual; the engine receives them as data.
  compliance: Object.freeze({
    faq: Object.freeze({
      label: 'Official Boomilever event FAQ',
      url: 'https://www.soinc.org/boomilever-div-c'
    }),
    numeric: Object.freeze([
      Object.freeze({
        id: 'chainDistance',
        label: 'Chain centerline distance from wall',
        unit: 'cm', min: 40, max: 45,
        citation: '§3.e.i (p. C8)',
        detail: 'Measured horizontally from the Testing Wall: at least 40 cm and no more than 45 cm.'
      }),
      Object.freeze({
        id: 'chainOffset',
        label: 'Chain centerline offset from wall centerline',
        unit: 'cm', max: 2.5,
        citation: '§3.e.ii (p. C8)',
        detail: 'No more than 2.5 cm horizontally from either side of a perpendicular line from the wall centerline.'
      }),
      Object.freeze({
        id: 'contactDepth',
        label: 'Deepest wall contact below the bolt centerline',
        unit: 'cm', tierLineCm: 15, bonusLineCm: 10,
        citation: '§3.h.i / §3.i.i (p. C8); lines drawn per §6.b.iii (p. C9)',
        detail: 'The 15 cm and 10 cm Horizontal Contact Depth Lines are drawn below the center of the Mounting Bolt hole.'
      })
    ]),
    checks: Object.freeze([
      Object.freeze({
        id: 'singleStructure',
        label: 'One structure, no loose or detachable parts',
        detail: 'No separate, loose or detachable parts or pieces.',
        citation: '§3.a (p. C8)'
      }),
      Object.freeze({
        id: 'woodAdhesive',
        label: 'Wood joined with adhesive only',
        detail: 'The structure is constructed of wood bonded by adhesive; no other materials are permitted.',
        citation: '§3.b, §7.d (pp. C8, C12)'
      }),
      Object.freeze({
        id: 'mountsOnBolt',
        label: 'Attaches by resting on the Mounting Bolt Assembly',
        detail: 'The structure attaches to the Testing Wall by resting on the Mounting Bolt Assembly.',
        citation: '§3.c (p. C8)'
      }),
      Object.freeze({
        id: 'supportsOnlyBlock',
        label: 'Supports only the Loading Block',
        detail: 'The structure supports only the Loading Block, which supports the rest of the Loading Assembly.',
        citation: '§3.d (p. C8)'
      }),
      Object.freeze({
        id: 'wallContactWidth',
        label: 'Wall contact outside the vertical contact width lines',
        detail: 'Contact with the Testing Wall face only outside the Vertical Contact Width Lines (drawn 4.0 cm either side of the bolt centerline); no contact with the sides, top or bottom of the wall.',
        citation: '§3.f (p. C8), §6.b.iv (p. C9)'
      }),
      Object.freeze({
        id: 'blockAboveBolt',
        label: 'Loading block above the bolt centerline before sand',
        detail: 'Before sand is loaded, the bottom of the Loading Block must be supported above the horizontal plane through the Mounting Bolt centerline.',
        citation: '§3.g (p. C8)'
      }),
      Object.freeze({
        id: 'woodDefinition',
        label: 'Wood meets the manual definition',
        detail: 'No bark, particleboard, wood composites, bamboo, grass, paper, plywood or sawdust pieces; wood is not painted, soaked, glue-coated, chemically modified, color enhanced or given tape/paper labels.',
        citation: '§7.a (p. C12)'
      }),
      Object.freeze({
        id: 'noCommercialLaminate',
        label: 'No commercially laminated wood',
        detail: 'Team-made lamination of wood layers with adhesive is allowed without restriction; commercially laminated wood (e.g. plywood) is not.',
        citation: '§7.c (p. C12)'
      }),
      Object.freeze({
        id: 'noAdhesiveTape',
        label: 'No adhesive tape',
        detail: 'Adhesive is only to join materials; adhesive tapes are not allowed.',
        citation: '§7.d (p. C12)'
      }),
      Object.freeze({
        id: 'noApparatusChanges',
        label: 'No measuring or adjusting the Test Apparatus',
        detail: 'At in-person tournaments the Event Supervisor supplies the apparatus; participants may not measure or adjust it or bring any apparatus, equipment, tools or instruments.',
        citation: '§2.d (p. C8)'
      })
    ]),
    consequences: Object.freeze({
      tier2: '§3.h.i allows wall contact only ABOVE the 15 cm line; structures touching below it are placed in Tier 2. Contact exactly on the line is not above it.',
      bonusFallback: '§3.i.i allows contact only ABOVE the 10 cm line; structures touching below it are scored under §3.h instead of the bonus.',
      holdKg: 'Holding 15 kg is required for the Load Scored Bonus; not holding it records no construction violation. Tier 2 structures can still earn the bonus if tiered for a rule other than §3.h.i (§3.i.ii).'
    })
  })
});
