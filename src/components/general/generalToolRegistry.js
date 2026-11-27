import { lazy } from 'react';
import { ACTIVE_SEASON } from '../../seasons/manifest.js';

// Cross-event tools are registered here, not in the event registry. They share
// the app's tool overlay but never masquerade as a Science Olympiad event.
export const GENERAL_TOOL_REGISTRY = Object.freeze({
  'generic-timer': Object.freeze({
    id: 'generic-timer',
    ti: 'ti-timer',
    label: 'Generic Event Timer',
    cat: 'Practice',
    stage: 'practice',
    gain: 'Cited time windows and live practice countdowns',
    desc: 'Run the written time windows with a live countdown, or set your own practice interval.',
    live: true,
    requiresAuth: false,
    manualReference: ACTIVE_SEASON.manualLabel,
    component: lazy(() => import('./GenericEventTimer.jsx'))
  })
});
