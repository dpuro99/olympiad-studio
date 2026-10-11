// Anatomy and Physiology C — Reference & Study Compiler config (sheet mode).
// Objectives are transcribed from the verified 2027 overview in ./info.md,
// which cites Division C Rules Manual pp. C3–C5. Specific required disease
// lists live only in the manual; they are not reproduced here.

export const anatomyReferenceCompilerConfig = {
  eventId: 'anatomy',
  eventName: 'Anatomy and Physiology',
  division: 'C',
  mode: 'sheet',
  storageKey: 'olympiad-studio.anatomy-c.2027-reference-sheet',
  fileStem: 'anatomy-c-2027-reference-sheet',
  manualReference: 'Division C Rules Manual, pp. C3–C5',
  resource: {
    title: 'One double-sided 8.5 × 11 in sheet per team',
    summary: 'Any content or source; one sheet, both sides.',
    sides: 2,
    constraints: [
      'Lamination or a sheet protector is permitted.',
      'Multiple sheets and affixed labels are prohibited.'
    ]
  },
  objectivesNote: 'Topic outline transcribed from the manual summary. The specific required disease lists and level boundaries are in the manual pp. C3–C5.',
  objectiveGroups: [
    {
      id: 'respiratory',
      label: 'Respiratory system',
      objectives: [
        { id: 'resp-anatomy', label: 'Anatomy and function of the respiratory system', level: 'core' },
        { id: 'resp-mechanics', label: 'Breathing mechanics and pressure changes', level: 'core' },
        { id: 'resp-airway', label: 'Airway structures', level: 'core' },
        { id: 'resp-volumes', label: 'Lung volumes, spirometry, and flow-volume loops', level: 'core' },
        { id: 'resp-gas', label: 'Gas exchange and oxygen transport', level: 'core' },
        { id: 'resp-exercise', label: 'Exercise and altitude responses', level: 'core' },
        { id: 'resp-disorders', label: 'Specified respiratory disorders', level: 'core' },
        { id: 'resp-regulation', label: 'Respiratory regulation and additional disorders', level: 'state-national' },
        { id: 'resp-national', label: 'Further disorders and prevention/diagnosis/treatment', level: 'national-only' }
      ]
    },
    {
      id: 'digestive',
      label: 'Digestive system',
      objectives: [
        { id: 'dig-tract', label: 'Alimentary tract and accessory organs', level: 'core' },
        { id: 'dig-peritoneum', label: 'Abdominal wall and peritoneal relationships', level: 'core' },
        { id: 'dig-layers', label: 'Canal wall layers', level: 'core' },
        { id: 'dig-motility', label: 'Motility and hormonal/enteric regulation', level: 'core' },
        { id: 'dig-digestion', label: 'Mechanical and chemical digestion', level: 'core' },
        { id: 'dig-absorption', label: 'Nutrient absorption', level: 'core' },
        { id: 'dig-exercise', label: 'Exercise and obesity', level: 'core' },
        { id: 'dig-disorders', label: 'Specified digestive disorders', level: 'core' },
        { id: 'dig-liver', label: 'Liver/pancreas cellular roles, metabolic and toxin effects, gut microbes and disorders', level: 'state-national' },
        { id: 'dig-national', label: 'Further biliary/motility disorders, cancers, and prevention/diagnosis/treatment', level: 'national-only' }
      ]
    },
    {
      id: 'immune',
      label: 'Immune system',
      objectives: [
        { id: 'imm-organs', label: 'Immune organs', level: 'core' },
        { id: 'imm-innate-adaptive', label: 'Innate and adaptive immunity', level: 'core' },
        { id: 'imm-integration', label: 'Integration of immune responses', level: 'core' },
        { id: 'imm-immunization', label: 'Active/passive immunity and immunization', level: 'core' },
        { id: 'imm-classes', label: 'Five immunoglobulin classes', level: 'core' },
        { id: 'imm-disorders', label: 'Specified immunodeficiencies, autoimmune diseases, and hypersensitivities', level: 'core' },
        { id: 'imm-signaling', label: 'Immune signaling, detailed antibody structure, transplant rejection, and additional disorders', level: 'state-national' },
        { id: 'imm-national', label: 'Tumor immunology, vaccines/adjuvants, antibody-dependent enhancement, and further disorders', level: 'national-only' }
      ]
    },
    {
      id: 'general',
      label: 'General / cross-cutting',
      objectives: [
        { id: 'general-notes', label: 'General reference and cross-system notes', level: 'core' }
      ]
    }
  ]
};

export default anatomyReferenceCompilerConfig;
