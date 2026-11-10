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
  }
};
