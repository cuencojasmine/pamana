'use strict';

/**
 * Phase 16 - Supply and Demand Analysis
 * Compares Phase 15's predicted demand against expected seat capacity on
 * the route (active/available vehicles only - offline vehicles don't count
 * as supply).
 */

const { predictDemand } = require('./demand');

const STATUS_MARGIN = 5; // passengers of slack before calling it a real shortage vs. just "watch it"

async function analyzeSupplyDemand(strapi, { routeId, stopId = null, hour }) {
  const demand = await predictDemand(strapi, { routeId, stopId, hour });

  const vehicles = await strapi.documents('api::vehicle.vehicle').findMany({
    filters: { route: { id: routeId } },
    fields: ['capacity', 'vehicle_status'],
  });

  const activeVehicles = vehicles.filter((v) => v.vehicle_status !== 'offline');
  const expectedCapacity = activeVehicles.reduce((sum, v) => sum + (v.capacity || 0), 0);

  if (demand.expected_passengers === null) {
    return { ...demand, expected_capacity: expectedCapacity, shortage: null, status: 'UNKNOWN' };
  }

  const gap = demand.expected_passengers - expectedCapacity;
  let status;
  if (gap > STATUS_MARGIN) status = 'SHORTAGE';
  else if (gap > -STATUS_MARGIN) status = 'MONITOR';
  else status = 'ADEQUATE';

  return {
    ...demand,
    expected_capacity: expectedCapacity,
    vehicle_count: activeVehicles.length,
    shortage: Math.max(0, gap),
    status,
  };
}

module.exports = { analyzeSupplyDemand };
