// Electric Vehicle — 2027 Division C rule constants.
// Source: 2027 Division C Rules Manual, pp. C26–C31 (+ official EV FAQ).
export const electricvehicle2027 = Object.freeze({
  year: 2027,
  manualReference: 'Division C Rules Manual, pp. C26–C31',
  levels: Object.freeze([
    Object.freeze({ id: 'regional', label: 'Regional / Invitational', bottleLineM: 2 }),
    Object.freeze({ id: 'state', label: 'State', bottleLineM: 3 }),
    Object.freeze({ id: 'national', label: 'National', bottleLineM: 4 })
  ]),
  maxVehicleLengthCm: 80.0,
  maxVehicleWidthCm: 35.0,
  baseScore: 100,
  distanceVehicleMultiplier: 2,
  failedRunDistanceScore: 2500,
  bottleDistanceFallbackCm: 400,
  timeErrorRatePtPerSec: 0.5,
  bottleFullyPastLineBonus: 20,
  pusherBonusRatePtPerCm: 1.5,
  pusherReferenceOpeningCm: 35,
  competitionViolationPenalty: 150,
  constructionViolationPenalty: 300,
  nonModificationPenaltyPoints: 50,
  maxEventTimeSec: 480,
  nationalEventTimeBonusDivisor: 30,
  notImpoundedPenalty: 5000,
  // Kit and program self-check clauses, transcribed from the manual text.
  // The checklist engine receives this as data and prints each citation.
  compliance: Object.freeze({
    clarification: Object.freeze({
      text: 'The official EV FAQ addresses this question: “What if the program on the EV is developed partly by a member of the 15-person team, and the rest of it is developed by a competitor from the same school who is not on the 15-person team?” The FAQ answer is authoritative — follow the linked page rather than any paraphrase.',
      url: 'https://www.soinc.org/faq/electric-vehicle-div-c'
    }),
    checks: Object.freeze([
      Object.freeze({
        id: 'modifications',
        label: 'Two functional kit modifications are documented',
        detail: 'At least two functional modifications made during the build, documented on the Kit Modification Form from soinc.org. The completed form must be impounded.',
        citation: '§3.k.i (p. C27)',
        scope: 'kit',
        consequence: 'Violating §3.k.i adds the non-modification penalty (§5.i.iii).'
      }),
      Object.freeze({
        id: 'pusher',
        label: 'The bottle pusher is team-designed and team-built',
        detail: 'A bottle pusher from kit sources cannot be used; teams design and build their own.',
        citation: '§3.k.ii (p. C27)',
        scope: 'kit',
        consequence: 'Violating §3.k.ii adds the non-modification penalty (§5.i.iii).'
      }),
      Object.freeze({
        id: 'kit-parts',
        label: 'Kit parts are commonly available from other sources',
        detail: 'A kit may provide only common parts available elsewhere (no custom printed circuit boards); this does not include 3D-printed plastic parts.',
        citation: '§3.k.iii (p. C27)',
        scope: 'kit',
        consequence: 'Violating §3.k.iii adds the non-modification penalty (§5.i.iii).'
      }),
      Object.freeze({
        id: 'program',
        label: 'The program has a current team-member contributor',
        detail: 'The program must be developed by at least one of the 15 team members. Skeleton or blank shell programs from the internet or another competitor at the same school may be a starting point, and small code sections or examples may be downloaded; single-source programs are prohibited.',
        citation: '§3.l (p. C27)',
        scope: 'all',
        consequence: 'A violation is a construction violation (§5.i.ii).'
      })
    ])
  })
});
