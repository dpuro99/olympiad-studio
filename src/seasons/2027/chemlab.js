// Chemistry Lab — 2027 Division C season data.
// Ion scope transcribed from the 2027 Division C Rules Manual, §3.d (p. C14).
// Reaction species are inputs to the exact balancer, not a stored answer key.

export const IONS = [
  // Regional monatomic cations — main group elements.
  { formula: 'Li', charge: 1, name: 'lithium', level: 'regional', polyatomic: false },
  { formula: 'Na', charge: 1, name: 'sodium', level: 'regional', polyatomic: false },
  { formula: 'K', charge: 1, name: 'potassium', level: 'regional', polyatomic: false },
  { formula: 'Rb', charge: 1, name: 'rubidium', level: 'regional', polyatomic: false },
  { formula: 'Cs', charge: 1, name: 'cesium', level: 'regional', polyatomic: false },
  { formula: 'Be', charge: 2, name: 'beryllium', level: 'regional', polyatomic: false },
  { formula: 'Mg', charge: 2, name: 'magnesium', level: 'regional', polyatomic: false },
  { formula: 'Ca', charge: 2, name: 'calcium', level: 'regional', polyatomic: false },
  { formula: 'Sr', charge: 2, name: 'strontium', level: 'regional', polyatomic: false },
  { formula: 'Ba', charge: 2, name: 'barium', level: 'regional', polyatomic: false },
  { formula: 'Al', charge: 3, name: 'aluminum', level: 'regional', polyatomic: false },
  // Regional monatomic anions — main group elements.
  { formula: 'H', charge: -1, name: 'hydride', level: 'regional', polyatomic: false },
  { formula: 'N', charge: -3, name: 'nitride', level: 'regional', polyatomic: false },
  { formula: 'O', charge: -2, name: 'oxide', level: 'regional', polyatomic: false },
  { formula: 'F', charge: -1, name: 'fluoride', level: 'regional', polyatomic: false },
  { formula: 'P', charge: -3, name: 'phosphide', level: 'regional', polyatomic: false },
  { formula: 'S', charge: -2, name: 'sulfide', level: 'regional', polyatomic: false },
  { formula: 'Cl', charge: -1, name: 'chloride', level: 'regional', polyatomic: false },
  { formula: 'Br', charge: -1, name: 'bromide', level: 'regional', polyatomic: false },
  { formula: 'I', charge: -1, name: 'iodide', level: 'regional', polyatomic: false },
  // Regional polyatomic ions.
  { formula: 'NH4', charge: 1, name: 'ammonium', level: 'regional', polyatomic: true },
  { formula: 'C2H3O2', charge: -1, name: 'acetate', level: 'regional', polyatomic: true },
  { formula: 'HCO3', charge: -1, name: 'bicarbonate', level: 'regional', polyatomic: true },
  { formula: 'CO3', charge: -2, name: 'carbonate', level: 'regional', polyatomic: true },
  { formula: 'CN', charge: -1, name: 'cyanide', level: 'regional', polyatomic: true },
  { formula: 'OH', charge: -1, name: 'hydroxide', level: 'regional', polyatomic: true },
  { formula: 'NO3', charge: -1, name: 'nitrate', level: 'regional', polyatomic: true },
  { formula: 'PO4', charge: -3, name: 'phosphate', level: 'regional', polyatomic: true },
  { formula: 'SO4', charge: -2, name: 'sulfate', level: 'regional', polyatomic: true },
  // State/National cations — transition metals and their variable charges.
  { formula: 'Cu', charge: 1, name: 'copper', romanNumeral: true, level: 'state', polyatomic: false },
  { formula: 'Cu', charge: 2, name: 'copper', romanNumeral: true, level: 'state', polyatomic: false },
  { formula: 'Fe', charge: 2, name: 'iron', romanNumeral: true, level: 'state', polyatomic: false },
  { formula: 'Fe', charge: 3, name: 'iron', romanNumeral: true, level: 'state', polyatomic: false },
  { formula: 'Ag', charge: 1, name: 'silver', level: 'state', polyatomic: false },
  { formula: 'Zn', charge: 2, name: 'zinc', level: 'state', polyatomic: false },
  // State/National polyatomic anions — the -ite/-ate and hypo-/per- families.
  { formula: 'CrO4', charge: -2, name: 'chromate', level: 'state', polyatomic: true },
  { formula: 'Cr2O7', charge: -2, name: 'dichromate', level: 'state', polyatomic: true },
  { formula: 'MnO4', charge: -1, name: 'permanganate', level: 'state', polyatomic: true },
  { formula: 'O2', charge: -2, name: 'peroxide', level: 'state', polyatomic: true },
  { formula: 'SCN', charge: -1, name: 'thiocyanate', level: 'state', polyatomic: true },
  { formula: 'ClO', charge: -1, name: 'hypochlorite', level: 'state', polyatomic: true },
  { formula: 'ClO2', charge: -1, name: 'chlorite', level: 'state', polyatomic: true },
  { formula: 'ClO3', charge: -1, name: 'chlorate', level: 'state', polyatomic: true },
  { formula: 'ClO4', charge: -1, name: 'perchlorate', level: 'state', polyatomic: true },
  { formula: 'NO2', charge: -1, name: 'nitrite', level: 'state', polyatomic: true },
  { formula: 'SO3', charge: -2, name: 'sulfite', level: 'state', polyatomic: true }
];

export const REACTIONS = [
  { label: 'Combustion of methane', reactants: ['CH4', 'O2'], products: ['CO2', 'H2O'] },
  { label: 'Combustion of ethane', reactants: ['C2H6', 'O2'], products: ['CO2', 'H2O'] },
  { label: 'Combustion of propane', reactants: ['C3H8', 'O2'], products: ['CO2', 'H2O'] },
  { label: 'Combustion of ethanol', reactants: ['C2H6O', 'O2'], products: ['CO2', 'H2O'] },
  { label: 'Synthesis of water', reactants: ['H2', 'O2'], products: ['H2O'] },
  { label: 'Synthesis of ammonia', reactants: ['N2', 'H2'], products: ['NH3'] },
  { label: 'Sodium chloride formation', reactants: ['Na', 'Cl2'], products: ['NaCl'] },
  { label: 'Magnesium oxide formation', reactants: ['Mg', 'O2'], products: ['MgO'] },
  { label: 'Aluminum oxide formation', reactants: ['Al', 'O2'], products: ['Al2O3'] },
  { label: 'Iron(III) oxide formation', reactants: ['Fe', 'O2'], products: ['Fe2O3'] },
  { label: 'Decomposition of hydrogen peroxide', reactants: ['H2O2'], products: ['H2O', 'O2'] },
  { label: 'Decomposition of calcium carbonate', reactants: ['CaCO3'], products: ['CaO', 'CO2'] },
  { label: 'Decomposition of potassium chlorate', reactants: ['KClO3'], products: ['KCl', 'O2'] },
  { label: 'Decomposition of sodium bicarbonate', reactants: ['NaHCO3'], products: ['Na2CO3', 'H2O', 'CO2'] },
  { label: 'Zinc and hydrochloric acid', reactants: ['Zn', 'HCl'], products: ['ZnCl2', 'H2'] },
  { label: 'Magnesium and hydrochloric acid', reactants: ['Mg', 'HCl'], products: ['MgCl2', 'H2'] },
  { label: 'Aluminum and hydrochloric acid', reactants: ['Al', 'HCl'], products: ['AlCl3', 'H2'] },
  { label: 'Iron and copper(II) sulfate', reactants: ['Fe', 'CuSO4'], products: ['FeSO4', 'Cu'] },
  { label: 'Silver nitrate and sodium chloride', reactants: ['AgNO3', 'NaCl'], products: ['AgCl', 'NaNO3'] },
  { label: 'Calcium chloride and sodium carbonate', reactants: ['CaCl2', 'Na2CO3'], products: ['CaCO3', 'NaCl'] },
  { label: 'Lead(II) nitrate and potassium iodide', reactants: ['Pb(NO3)2', 'KI'], products: ['PbI2', 'KNO3'] },
  { label: 'Barium chloride and sodium sulfate', reactants: ['BaCl2', 'Na2SO4'], products: ['BaSO4', 'NaCl'] },
  { label: 'Hydrochloric acid and sodium hydroxide', reactants: ['HCl', 'NaOH'], products: ['NaCl', 'H2O'] },
  { label: 'Sulfuric acid and sodium hydroxide', reactants: ['H2SO4', 'NaOH'], products: ['Na2SO4', 'H2O'] },
  { label: 'Nitric acid and potassium hydroxide', reactants: ['HNO3', 'KOH'], products: ['KNO3', 'H2O'] },
  { label: 'Hydrochloric acid and sodium bicarbonate', reactants: ['HCl', 'NaHCO3'], products: ['NaCl', 'H2O', 'CO2'] }
];

export const chemlab2027 = Object.freeze({
  year: 2027,
  manualReference: 'Division C Rules Manual, §3.d, p. C14',
  IONS,
  REACTIONS
});
