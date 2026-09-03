import ReactGA from 'react-ga4';

const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID;

export function initializeAnalytics() {
  if (!measurementId) {
    console.warn('GA4 is disabled because VITE_GA4_MEASUREMENT_ID is not configured.');
    return;
  }

  ReactGA.initialize(measurementId, {
    gtagOptions: { send_page_view: false },
  });
}

export function trackPageView(page, title) {
  ReactGA.send({
    hitType: 'pageview',
    page,
    title,
    ...(import.meta.env.DEV ? { debug_mode: true } : {}),
  });
}

export function trackEvent(name, parameters = {}) {
  ReactGA.event(name, {
    ...parameters,
    ...(import.meta.env.DEV ? { debug_mode: true } : {}),
  });
}