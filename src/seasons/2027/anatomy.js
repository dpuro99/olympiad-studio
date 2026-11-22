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
  ])
});
