// Designer Genes C — season data (2027 Division C Rules Manual, pp. C20–C21).
// Level scope transcribed from the manual's topic list: technique questions are
// part of the written test, while the advanced technique set (RNAi, homologous
// recombination/Cre-Lox, CRISPR, ChIP-seq, Hi-C, RNA-Seq) is State/National.
export const designergenes2027 = {
  manualReference: 'Division C Rules Manual, pp. C20–C21',
  // The manual lists PCR, sequencing comparisons, cloning (including Golden
  // Gate) and knockout/knockdown/complementation at the base level and reserves
  // the advanced set for State/National. Restriction mapping is a supporting
  // cloning technique rather than a listed regional topic, so the workbench
  // keeps it behind the State/National switch instead of front and center.
  techniqueLevels: {
    restrictionMapping: 'state-national'
  },
  // Genetics Workbench scope. The manual names these topics and the quantities
  // to compute but prints no formulas, so every calculator states its basis in
  // the UI: these are standard genetics relationships used as study aids, not
  // official rules text or an answer key the manual supplies.
  genetics: {
    citations: {
      punnett: 'Division C Rules Manual, §3.i.2–3',
      probability: 'Division C Rules Manual, §3.i.3',
      mappingTwoGene: 'Division C Rules Manual, §3.i.6 (State & National)',
      mappingThreeGene: 'Division C Rules Manual, §3.i.6 (National)',
      hardyWeinberg: 'Division C Rules Manual, §3.iii.1',
      alleleFrequency: 'Division C Rules Manual, §3.iii.2',
      additiveTraits: 'Division C Rules Manual, §3.iii.3',
      heritability: 'Division C Rules Manual, §3.iii.6 (State & National)'
    },
    levels: {
      twoGeneMapping: 'state-national',
      threeGeneMapping: 'national',
      heritability: 'state-national'
    },
    bases: {
      crosses: 'Complete dominance and independent assortment are teaching assumptions for these crosses; the manual asks for Punnett squares and probability rules but prints no dominance convention. Linked genes are a separate topic (§3.i.1) and are not assumed here.',
      hardyWeinberg: 'The Hardy–Weinberg relationships p + q = 1 and p² + 2pq + q² = 1 are standard population-genetics identities. The manual asks that the assumptions and calculations be understood; it does not print the allele list or the equations.',
      mapping: 'Recombination frequency is used here as a map distance in centiMorgans, the standard teaching convention. The manual asks for two-gene (State) and three-gene (National) mapping from recombination data but prints no mapping algorithm.',
      heritability: 'Broad sense H² = V_G / V_P, narrow sense h² = V_A / V_P and realized h² = R / S are standard quantitative-genetics definitions. The manual names the three quantities at State/National but prints no formulas.'
    }
  }
};
