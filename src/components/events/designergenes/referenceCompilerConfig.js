// Designer Genes C — Reference & Study Compiler config (sheet mode).
// Objectives transcribed from the verified 2027 overview in ./info.md,
// which cites Division C Rules Manual pp. C20–C21.

export const designerGenesReferenceCompilerConfig = {
  eventId: 'designergenes',
  eventName: 'Designer Genes',
  division: 'C',
  mode: 'sheet',
  storageKey: 'olympiad-studio.designergenes-c.2027-reference-sheet',
  fileStem: 'designergenes-c-2027-reference-sheet',
  manualReference: 'Division C Rules Manual, pp. C20–C21',
  resource: {
    title: 'One double-sided 8.5 × 11 in sheet per team',
    summary: 'Any content or source; one sheet, both sides.',
    sides: 2,
    constraints: [
      'Lamination or a sheet protector is permitted.',
      'Multiple sheets and affixed labels are prohibited.'
    ]
  },
  objectivesNote: 'Topic outline transcribed from the manual summary. The exhaustive detailed sub-items and level boundaries are in the manual pp. C20–C21.',
  objectiveGroups: [
    {
      id: 'mendelian',
      label: 'Mendelian genetics',
      objectives: [
        { id: 'dg-mendel-laws', label: 'Inheritance laws, exceptions, and crosses', level: 'core' },
        { id: 'dg-mendel-prob', label: 'Probability, pedigrees, and epistasis', level: 'core' },
        { id: 'dg-two-gene', label: 'Two-gene linkage/map distances', level: 'state-national' },
        { id: 'dg-three-gene', label: 'Three-gene mapping', level: 'national-only' }
      ]
    },
    {
      id: 'cell-division',
      label: 'Mitosis & Meiosis',
      objectives: [
        { id: 'dg-mitosis-meiosis', label: 'Stages, nondisjunction, and karyotypes', level: 'core' },
        { id: 'dg-vdj', label: 'V(D)J recombination and class switching', level: 'state-national' }
      ]
    },
    {
      id: 'population-evolution',
      label: 'Population & evolutionary genetics',
      objectives: [
        { id: 'dg-hw', label: 'Hardy–Weinberg and allele-frequency mechanisms', level: 'core' },
        { id: 'dg-additive', label: 'Additive traits', level: 'core' },
        { id: 'dg-homologs', label: 'Gene duplication, homologs/orthologs/paralogs, and phylogenies', level: 'core' },
        { id: 'dg-heritability', label: 'Broad-, narrow-, and realized-heritability calculations', level: 'state-national' }
      ]
    },
    {
      id: 'dna',
      label: 'DNA & genome organization',
      objectives: [
        { id: 'dg-dna-structure', label: 'DNA structure, directionality, and replication fidelity', level: 'core' },
        { id: 'dg-genome', label: 'Genome organization', level: 'core' },
        { id: 'dg-damage', label: 'DNA damage, repair, mutations, and protein consequences', level: 'core' },
        { id: 'dg-telomeres', label: 'End-replication problem and telomeres', level: 'state-national' }
      ]
    },
    {
      id: 'gene-expression',
      label: 'Eukaryotic gene expression',
      objectives: [
        { id: 'dg-central-dogma', label: 'Central dogma and transcription', level: 'core' },
        { id: 'dg-regulation', label: 'Cis/trans regulation and yeast two-hybrid', level: 'core' },
        { id: 'dg-rna', label: 'RNA processing and translation', level: 'core' },
        { id: 'dg-mge', label: 'Mobile genetic elements', level: 'state-national' }
      ]
    },
    {
      id: 'techniques',
      label: 'Techniques & molecular tools',
      objectives: [
        { id: 'dg-pcr', label: 'PCR, Illumina vs Nanopore', level: 'core' },
        { id: 'dg-cloning', label: 'Cloning, including Golden Gate', level: 'core' },
        { id: 'dg-ko', label: 'Knockout/knockdown/complementation', level: 'core' },
        { id: 'dg-rnai', label: 'RNAi', level: 'state-national' },
        { id: 'dg-hr-cre', label: 'Homologous recombination and Cre-Lox', level: 'state-national' },
        { id: 'dg-crispr', label: 'CRISPR', level: 'state-national' },
        { id: 'dg-chip-hic-rnaseq', label: 'ChIP-seq, Hi-C, and RNA-Seq', level: 'state-national' }
      ]
    },
    {
      id: 'general',
      label: 'General / cross-cutting',
      objectives: [
        { id: 'dg-general', label: 'General reference, data interpretation, and experimental design notes', level: 'core' }
      ]
    }
  ]
};

export default designerGenesReferenceCompilerConfig;
