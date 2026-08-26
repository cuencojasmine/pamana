'use strict';

/**
 * Phase 14 - Vehicle Wait-Time Prediction
 *
 * Baseline model: average gap between historical completed-trip start times
 * on the route. The pilot has almost no usable trip history yet (a handful
 * of same-day test trips seconds apart), so this deliberately falls back to
 * an assumed default service frequency when there isn't enough real signal
 * - and says so honestly via `basis` and a low `confidence`, rather than
 * pretending a real pattern exists.
 */

const DEFAULT_FREQUENCY_MINUTES = 15; // typical jeepney headway assumption, used only as a fallback
const MIN_GAP_MINUTES = 1; // filters out same-burst test artifacts, not real service gaps
const MAX_PLAUSIBLE_GAP_MINUTES = 45; // a gap wider than this reflects a driver going offline/test data, not real headway

async function predictWaitTime(strapi, { routeId }) {
  const trips = await strapi.documents('api::trip.trip').findMany({
    filters: { route: { id: routeId }, trip_status: 'completed' },
    sort: ['started_at:asc'],
    fields: ['started_at'],
  });

  const startTimes = trips
    .map((t) => new Date(t.started_at).getTime())
    .sort((a, b) => a - b);

  const intervalsMin = [];
  for (let i = 1; i < startTimes.length; i++) {
    const diffMin = (startTimes[i] - startTimes[i - 1]) / 60000;
    if (diffMin >= MIN_GAP_MINUTES && diffMin <= MAX_PLAUSIBLE_GAP_MINUTES) intervalsMin.push(diffMin);
  }

  const usingRealHistory = intervalsMin.length > 0;
  const avgInterval = usingRealHistory
    ? intervalsMin.reduce((a, b) => a + b, 0) / intervalsMin.length
    : DEFAULT_FREQUENCY_MINUTES;

  const activeTrips = await strapi.documents('api::trip.trip').findMany({
    filters: { route: { id: routeId }, trip_status: 'active' },
    fields: ['id'],
  });
  const hasActiveVehicle = activeTrips.length > 0;

  const low = Math.max(1, Math.round(avgInterval * 0.7));
  const high = Math.max(low + 1, Math.round(avgInterval * 1.3));

  let availabilityClass;
  if (!hasActiveVehicle) {
    availabilityClass = 'Low';
  } else if (high <= 10) {
    availabilityClass = 'High';
  } else if (high <= 25) {
    availabilityClass = 'Medium';
  } else {
    availabilityClass = 'Low';
  }

  const confidence = intervalsMin.length >= 5 ? 0.7 : intervalsMin.length >= 1 ? 0.4 : 0.2;

  return {
    route_id: routeId,
    predicted_wait_minutes: { low, high },
    availability_class: availabilityClass,
    confidence,
    active_vehicles: activeTrips.length,
    sample_count: intervalsMin.length,
    basis: usingRealHistory ? 'historical_trip_intervals' : 'assumed_default_frequency',
  };
}

module.exports = { predictWaitTime, DEFAULT_FREQUENCY_MINUTES };
