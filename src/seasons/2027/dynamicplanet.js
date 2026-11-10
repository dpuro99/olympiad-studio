// Dynamic Planet — 2027 Division C season data.
// Scope transcribed from the 2027 Division C Rules Manual, pp. C24–C25.
//
// The manual lists competition topics rather than printing formulas, so each
// toolbox entry records the section that names the quantity and states plainly
// whether the relationship is printed or standard. That is what keeps the
// toolbox rule-grounded instead of inventing official formulas.
export const dynamicplanet2027 = {
  manualReference: 'Division C Rules Manual, pp. C24–C25',
  toolbox: {
    sinuosity: {
      title: 'Channel sinuosity',
      citation: '§3.d.i (p. C24)',
      basis: 'The manual explicitly calls for the calculation of sinuosity. Sinuosity is the standard channel (thalweg) length ÷ valley-axis length ratio; the band labels are descriptive textbook conventions, not rules.'
    },
    hydraulicGradient: {
      title: 'Hydraulic gradient',
      citation: '§3.g.iii (p. C24)',
      basis: 'The manual names hydraulic gradient and groundwater flow. The gradient is the standard head change ÷ flow-path length ratio (m/m).'
    },
    darcyFlow: {
      title: 'Darcy groundwater flow',
      citation: '§3.g.iii (p. C24)',
      basis: 'The manual names groundwater flow. Darcy’s law (q = K·i, Q = q·A) is the standard relationship; seepage velocity v = q ÷ n uses the effective porosity you enter.'
    },
    residenceTime: {
      title: 'Reservoir residence time',
      citation: '§3.a.ii (p. C24)',
      basis: 'The manual names storage reservoirs, residence times, and water budgets. Residence time is the standard storage ÷ throughput ratio.'
    },
    recurrenceInterval: {
      title: 'Flood recurrence interval',
      citation: '§3.f.iv (p. C24)',
      basis: 'The manual names floods, flood frequency, and recurrence intervals. The return period T = 1 ÷ annual exceedance probability is the definitional relationship. The manual prints no plotting-position formula, so a ranked record must follow the convention your problem gives.'
    },
    manningFlow: {
      title: 'Manning open-channel flow',
      citation: '§3.f.iii (p. C24)',
      basis: 'The manual calls for the mathematical relationships describing open-channel flow. Manning’s equation is the standard average-velocity relationship, fed here by the hydraulic radius R = A ÷ wetted perimeter.'
    }
  },
  // Generated interpretation cases. Each kind records the section it exercises
  // and the convention the generator had to choose, because the manual names
  // the task without printing a procedure.
  mapPractice: {
    contour: {
      title: 'Topographic contour gradient',
      citation: '§3.k.i (p. C25)',
      basis: 'The manual asks participants to interpret freshwater features on topographic maps. Relief and average gradient follow from the labelled contour interval and the map scale; the practice map is synthetic, and the gradient is the straight-line average between two points.'
    },
    streamOrder: {
      title: 'Stream network order',
      citation: '§3.c.ii (p. C24)',
      basis: 'The manual names stream order and drainage-network patterns but does not fix an ordering convention. These cases use Strahler order (equal-order tributaries raise the order) and say so; Shreve ordering counts headwater tips instead and would give a different number.'
    },
    wellMap: {
      title: 'Water table from well data',
      citation: '§3.k.ii (p. C25)',
      basis: 'The manual asks participants to map the water table from well data, including contour maps, flow lines, and flow direction. Three well heads define a plane here, so the contours are evenly spaced and the answers follow from the well elevations and the map scale.'
    },
    hydrograph: {
      title: 'Storm hydrograph',
      citation: '§3.k.iii (p. C25)',
      basis: 'The manual names stream gauging, discharge measurement, and hydrographs, including baseflow versus stormflow, peak discharge, and lag time. Lag time is measured from the rainfall centroid to the hydrograph peak, the convention stated in the case; the hydrograph is synthetic.'
    }
  }
};
