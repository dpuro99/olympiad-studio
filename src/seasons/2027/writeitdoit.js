// Write It, Do It B — season data (2027 Division B Rules Manual, p. B62).
// Rule-derived timings, citations and the illustrative material vocabulary.
// The generator creates synthetic practice objects; the manual prints no model.
export const writeitdoit2027 = {
  manualReference: 'Division B Rules Manual, p. B62',
  timings: {
    writingSeconds: 25 * 60,
    buildingSeconds: 20 * 60
  },
  citations: {
    parameters: '§2.a–b (p. B62)',
    object: '§3.a (p. B62)',
    writing: '§3.b (p. B62)',
    drawings: '§3.c (p. B62)',
    building: '§3.d (p. B62)',
    scoring: '§4.a–b (p. B62)',
    drawingTiers: '§4.d (p. B62)',
    tiebreaker: '§4.e (p. B62)'
  },
  // §3.a lists these as examples ("but not limited to"), not a required set.
  vocabulary: {
    materials: [
      { id: 'popsicle', label: 'Popsicle stick', sizes: ['short', 'medium', 'long'] },
      { id: 'straw', label: 'Straw', sizes: ['short', 'medium', 'long'] },
      { id: 'cup', label: 'Paper cup', sizes: ['small', 'medium', 'large'] },
      { id: 'ball', label: 'Styrofoam ball', sizes: ['small', 'medium', 'large'] },
      { id: 'pin', label: 'Push pin', sizes: ['small'] }
    ],
    colors: ['red', 'blue', 'green', 'yellow'],
    locations: ['left', 'center', 'right', 'front', 'back', 'top', 'bottom'],
    orientations: ['horizontal', 'vertical', 'diagonal up-right', 'diagonal down-right']
  },
  // §4.b names exactly these five per-piece dimensions.
  rubric: {
    dimensions: [
      { id: 'size', label: 'Size' },
      { id: 'color', label: 'Color' },
      { id: 'location', label: 'Location' },
      { id: 'orientation', label: 'Orientation' },
      { id: 'connection', label: 'Connection' }
    ]
  },
  drawingCheck: {
    phrases: ['see diagram', 'as drawn', 'sketch below', 'picture below', 'shown in the drawing'],
    subsectionConsequence: 'Drawing a subsection of the model ranks the team in Tier 2 (§4.d).',
    modelConsequence: 'Drawing a picture of the model results in disqualification (§4.d).'
  },
  notes: {
    object: 'The manual says the object may be abstract and is the same for all teams, built from science or inexpensive materials or commercial sets. Every object here is synthetic, not an official model (§3.a).',
    writing: 'The writer has 25 minutes to describe the object and how to build it; there is no advantage to finishing early (§3.b). Drawings and diagrams of the model or subsections are prohibited (§3.c).',
    building: 'The supervisor passes the description to the builder, who has 20 minutes to recreate the object (§3.d).',
    scoring: 'The team builds the nearest object with no drawings; each piece may score for size, color, location, orientation and/or connection. Correct connections beyond an incorrect connection still count, and unused parts are not penalized (§4.a–c).',
    tiebreaker: 'Construction-phase time is the only stated tiebreaker; the manual does not say whether faster is better, so this tool records the time without ranking it (§4.e).',
    practiceOnly: 'This review compares your recorded build against the synthetic target for practice only. It is not an official score and assigns no points or tiers.'
  }
};
