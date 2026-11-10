import { anatomy2027 } from './2027/anatomy.js';
import { boomilever2027 } from './2027/boomilever.js';
import { chemlab2027 } from './2027/chemlab.js';
import { designergenes2027 } from './2027/designergenes.js';
import { dynamicplanet2027 } from './2027/dynamicplanet.js';
import { electricvehicle2027 } from './2027/electricvehicle.js';
import { rocksandminerals2027 } from './2027/rocksandminerals.js';

// Per-event season data for the active manual. Add each season's data module
// here when a new manual lands; engines take constants as parameters with the
// active season as the default.
export const ACTIVE_DATA = Object.freeze({
  anatomy: anatomy2027,
  boomilever: boomilever2027,
  chemlab: chemlab2027,
  designergenes: designergenes2027,
  dynamicplanet: dynamicplanet2027,
  electricvehicle: electricvehicle2027,
  rocksandminerals: rocksandminerals2027
});
