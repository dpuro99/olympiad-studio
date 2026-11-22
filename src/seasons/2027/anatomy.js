// Anatomy and Physiology — 2027 Division C season data.
// Source: 2027 Division C Rules Manual, pp. C3–C5 (respiratory, digestive, immune).
export const anatomy2027 = Object.freeze({
  year: 2027,
  manualReference: 'Division C Rules Manual, pp. C3–C5',
  systems: Object.freeze([
    Object.freeze({ id: 'respiratory', label: 'Respiratory system' }),
    Object.freeze({ id: 'digestive', label: 'Digestive system' }),
    Object.freeze({ id: 'immune', label: 'Immune system' })
  ]),
  // Structure names are the ones the manual itself lists in the cited
  // subsection. The short notes are general biology study aids written for
  // this drill, not text printed in the rules manual.
  diagrams: Object.freeze([
    Object.freeze({
      id: 'respiratory',
      label: 'Respiratory',
      citation: 'Division C Rules Manual, §3.a.iii',
      structures: Object.freeze([
        Object.freeze({ id: 'pharynx', name: 'Pharynx', note: 'Shared passage for air and food; its wall differs from the larynx and trachea.' }),
        Object.freeze({ id: 'larynx', name: 'Larynx', note: 'Voice box at the top of the trachea, containing the vocal cords.' }),
        Object.freeze({ id: 'trachea', name: 'Trachea', note: 'Cartilage-ringed airway conducting air to the bronchi; its ciliated lining moves mucus upward.' }),
        Object.freeze({ id: 'bronchi', name: 'Bronchi', note: 'The two primary branches of the trachea entering the lungs; cartilage rings are still present.' }),
        Object.freeze({ id: 'bronchioles', name: 'Bronchioles', note: 'Smaller conducting airways without cartilage rings; smooth muscle adjusts their diameter.' }),
        Object.freeze({ id: 'alveoli', name: 'Alveoli', note: 'Thin-walled air sacs where gases diffuse between air and blood.' })
      ])
    }),
    Object.freeze({
      id: 'digestive',
      label: 'Digestive',
      citation: 'Division C Rules Manual, §3.b.ii–iv',
      structures: Object.freeze([
        Object.freeze({ id: 'salivaryGlands', name: 'Salivary glands', note: 'Accessory glands that secrete saliva into the mouth, where carbohydrate digestion begins.' }),
        Object.freeze({ id: 'esophagus', name: 'Esophagus', note: 'Muscular canal carrying the bolus to the stomach; its lining differs from the stomach and intestines.' }),
        Object.freeze({ id: 'stomach', name: 'Stomach', note: 'Muscular chamber that churns food and begins protein digestion.' }),
        Object.freeze({ id: 'liver', name: 'Liver', note: 'Accessory organ that produces bile; named among the accessory organs in §3.b.ii.' }),
        Object.freeze({ id: 'gallbladder', name: 'Gallbladder', note: 'Stores and concentrates bile before it is released into the small intestine.' }),
        Object.freeze({ id: 'pancreas', name: 'Pancreas', note: 'Accessory gland whose enzymes digest proteins, fats and carbohydrates in the small intestine.' }),
        Object.freeze({ id: 'smallIntestine', name: 'Small intestine', note: 'Main site of nutrient absorption; its lining is specialised with folds, villi and microvilli.' }),
        Object.freeze({ id: 'largeIntestine', name: 'Large intestine', note: 'Reclaims water and electrolytes; its lining differs from the small intestine.' })
      ])
    }),
    Object.freeze({
      id: 'immune',
      label: 'Immune',
      citation: 'Division C Rules Manual, §3.c.i',
      structures: Object.freeze([
        Object.freeze({ id: 'boneMarrow', name: 'Bone marrow', note: 'Site where blood cells, including lymphocytes, are produced.' }),
        Object.freeze({ id: 'thymus', name: 'Thymus', note: 'Lymphoid organ where T cells mature and are selected.' }),
        Object.freeze({ id: 'spleen', name: 'Spleen', note: 'Filters blood and mounts responses to blood-borne antigens.' }),
        Object.freeze({ id: 'lymphNodes', name: 'Lymph nodes', note: 'Filter lymph and are sites where lymphocytes encounter antigen.' }),
        Object.freeze({ id: 'skin', name: 'Skin', note: 'Anatomical barrier of the innate immune system.' })
      ])
    })
  ]),
  // Process cases use only terms and processes the manual itself names. The
  // ordering/classification is a study aid derived from the manual's topic
  // sequence, not an official answer key the manual prints.
  processCases: Object.freeze([
    Object.freeze({
      id: 'canal-route',
      label: 'Alimentary canal route',
      level: 'base',
      kind: 'order',
      citation: 'Division C Rules Manual, §3.b.i & §3.b.iv',
      prompt: 'Put these named parts of the alimentary canal in the order food travels through them.',
      steps: Object.freeze([
        Object.freeze({ id: 'esophagus', label: 'Esophagus', detail: 'Muscular canal carrying the bolus toward the stomach.' }),
        Object.freeze({ id: 'stomach', label: 'Stomach', detail: 'Muscular chamber that churns food and begins protein digestion.' }),
        Object.freeze({ id: 'smallIntestine', label: 'Small intestine', detail: 'Main site of nutrient absorption.' }),
        Object.freeze({ id: 'largeIntestine', label: 'Large intestine', detail: 'Reclaims water and electrolytes.' })
      ])
    }),
    Object.freeze({
      id: 'digestion-stages',
      label: 'Digestion to absorption',
      level: 'base',
      kind: 'order',
      citation: 'Division C Rules Manual, §3.b.vi–viii',
      prompt: 'Trace the manual’s progression from mechanical digestion through chemical digestion to absorption.',
      steps: Object.freeze([
        Object.freeze({ id: 'mechanical', label: 'Mechanical digestion', detail: 'Physical breakdown of food (§3.b.vi).' }),
        Object.freeze({ id: 'chemical', label: 'Chemical digestion of proteins, fats and carbohydrates', detail: 'Enzymatic breakdown (§3.b.vii).' }),
        Object.freeze({ id: 'absorption', label: 'Absorption of nutrients, vitamins, minerals and water', detail: 'Including the role of fiber (§3.b.viii).' })
      ])
    }),
    Object.freeze({
      id: 'canal-vs-accessory',
      label: 'Canal or accessory organ',
      level: 'base',
      kind: 'classify',
      citation: 'Division C Rules Manual, §3.b.ii',
      prompt: 'Sort each named organ into the alimentary canal or the accessory organs of digestion.',
      groups: Object.freeze([
        Object.freeze({ id: 'canal', label: 'Alimentary canal' }),
        Object.freeze({ id: 'accessory', label: 'Accessory organ' })
      ]),
      items: Object.freeze([
        Object.freeze({ id: 'salivaryGlands', label: 'Salivary glands', groupId: 'accessory' }),
        Object.freeze({ id: 'esophagus', label: 'Esophagus', groupId: 'canal' }),
        Object.freeze({ id: 'liver', label: 'Liver', groupId: 'accessory' }),
        Object.freeze({ id: 'stomach', label: 'Stomach', groupId: 'canal' }),
        Object.freeze({ id: 'gallbladder', label: 'Gallbladder', groupId: 'accessory' }),
        Object.freeze({ id: 'smallIntestine', label: 'Small intestine', groupId: 'canal' }),
        Object.freeze({ id: 'pancreas', label: 'Pancreas', groupId: 'accessory' }),
        Object.freeze({ id: 'largeIntestine', label: 'Large intestine', groupId: 'canal' })
      ])
    }),
    Object.freeze({
      id: 'innate-vs-adaptive',
      label: 'Innate or adaptive',
      level: 'base',
      kind: 'classify',
      citation: 'Division C Rules Manual, §3.c.ii–iii',
      prompt: 'Sort each named component or process into the innate or adaptive immune system.',
      groups: Object.freeze([
        Object.freeze({ id: 'innate', label: 'Innate' }),
        Object.freeze({ id: 'adaptive', label: 'Adaptive' })
      ]),
      items: Object.freeze([
        Object.freeze({ id: 'barriers', label: 'Anatomical barriers', groupId: 'innate' }),
        Object.freeze({ id: 'complement', label: 'Complement system', groupId: 'innate' }),
        Object.freeze({ id: 'tlr', label: 'Toll-like receptors', groupId: 'innate' }),
        Object.freeze({ id: 'inflammation', label: 'Inflammation', groupId: 'innate' }),
        Object.freeze({ id: 'bCells', label: 'B cells', groupId: 'adaptive' }),
        Object.freeze({ id: 'tCells', label: 'T cells', groupId: 'adaptive' }),
        Object.freeze({ id: 'presentation', label: 'Antigen presentation', groupId: 'adaptive' }),
        Object.freeze({ id: 'memory', label: 'Memory', groupId: 'adaptive' })
      ])
    }),
    Object.freeze({
      id: 'transplant',
      label: 'Transplant terms',
      level: 'state',
      kind: 'classify',
      citation: 'Division C Rules Manual, §3.c.ix (State & National)',
      prompt: 'Sort each named term into a transplant type or a mechanism of rejection.',
      groups: Object.freeze([
        Object.freeze({ id: 'type', label: 'Transplant type' }),
        Object.freeze({ id: 'rejection', label: 'Rejection mechanism' })
      ]),
      items: Object.freeze([
        Object.freeze({ id: 'allograft', label: 'Allograft', groupId: 'type' }),
        Object.freeze({ id: 'autograft', label: 'Autograft', groupId: 'type' }),
        Object.freeze({ id: 'hyperacute', label: 'Hyperacute rejection', groupId: 'rejection' }),
        Object.freeze({ id: 'acute', label: 'Acute rejection', groupId: 'rejection' }),
        Object.freeze({ id: 'chronic', label: 'Chronic rejection', groupId: 'rejection' })
      ])
    }),
    Object.freeze({
      id: 'tumor-immunology',
      label: 'Tumor immunology',
      level: 'national',
      kind: 'classify',
      citation: 'Division C Rules Manual, §3.c.xi (National)',
      prompt: 'Sort each named term into a tumor–immune process or a cancer immunotherapy.',
      groups: Object.freeze([
        Object.freeze({ id: 'process', label: 'Tumor–immune process' }),
        Object.freeze({ id: 'therapy', label: 'Immunotherapy' })
      ]),
      items: Object.freeze([
        Object.freeze({ id: 'surveillance', label: 'Immune surveillance', groupId: 'process' }),
        Object.freeze({ id: 'evasion', label: 'Tumor evasion', groupId: 'process' }),
        Object.freeze({ id: 'vaccines', label: 'Therapeutic cancer vaccines', groupId: 'therapy' }),
        Object.freeze({ id: 'cytokines', label: 'Cytokine therapies', groupId: 'therapy' }),
        Object.freeze({ id: 'antibody', label: 'Antibody therapies', groupId: 'therapy' }),
        Object.freeze({ id: 'cart', label: 'CAR T-cell therapy', groupId: 'therapy' })
      ])
    })
  ])
});
