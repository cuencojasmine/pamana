'use strict';

/**
 * Phase 15 - Passenger Demand Prediction
 *
 * Baseline model: average observed waiting_passengers for this route/stop/
 * time-slot across recent dates. Deliberately simple (no ML) - matches the
 * guide's own baseline scope. Source breakdown is always returned so a
 * simulated-heavy result is never presented as equivalent to real demand.
 */

const { timeSlotForHour } = require('./time-slots');

const DEMAND_LOOKBACK_DAYS = 14;

const classify = (value) => {
  if (value >= 45) return 'CRITICAL';
  if (value >= 30) return 'HIGH';
  if (value >= 15) return 'MODERATE';
  return 'LOW';
};

/**
 * @param {number} routeId
 * @param {number|null} stopId
 * @param {number} hour - 0-23, defaults to current hour
 */
async function predictDemand(strapi, { routeId, stopId = null, hour = new Date().getHours() }) {
  const timeSlot = timeSlotForHour(hour);
  const since = new Date(Date.now() - DEMAND_LOOKBACK_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const filters = {
    route: { id: routeId },
    time_slot: timeSlot,
    date: { $gte: since },
  };
  if (stopId) filters.stop = { id: stopId };

  const observations = await strapi.documents('api::passenger-demand-observation.passenger-demand-observation').findMany({
    filters,
    fields: ['waiting_passengers', 'source', 'date'],
  });

  if (observations.length === 0) {
    return {
      route_id: routeId,
      stop_id: stopId,
      time_slot: timeSlot,
      expected_passengers: null,
      demand_class: null,
      sample_count: 0,
      sources: { observed: 0, crowdsourced: 0, simulation: 0 },
      note: 'No demand observations for this route/stop/time slot yet.',
    };
  }

  const total = observations.reduce((sum, o) => sum + o.waiting_passengers, 0);
  const expected = Math.round(total / observations.length);

  const sources = { observed: 0, crowdsourced: 0, simulation: 0 };
  for (const o of observations) sources[o.source] += 1;

  return {
    route_id: routeId,
    stop_id: stopId,
    time_slot: timeSlot,
    expected_passengers: expected,
    demand_class: classify(expected),
    sample_count: observations.length,
    sources,
  };
}

module.exports = { predictDemand, classify };
