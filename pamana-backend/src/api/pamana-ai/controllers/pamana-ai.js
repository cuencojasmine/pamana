'use strict';

/**
 * pamana-ai controller
 *
 * Phases 14-16 and 18's backend surface: wait-time prediction, demand
 * prediction, supply/demand analysis, and an LGU dashboard summary that
 * combines all three. Phase 17 (route scoring) lives in trip-search's own
 * controller instead, since it extends an existing endpoint rather than
 * needing a new one.
 */

const { predictWaitTime } = require('../../../services/pamana-ai/wait-time');
const { predictDemand } = require('../../../services/pamana-ai/demand');
const { analyzeSupplyDemand } = require('../../../services/pamana-ai/supply-demand');

async function resolveRouteId(strapi, routeParam) {
  if (routeParam) {
    const route = await strapi.documents('api::route.route').findFirst({
      filters: { documentId: routeParam },
      fields: ['id'],
    });
    return route ? route.id : null;
  }

  // Single-corridor pilot: no route given just means "the corridor." Match
  // by route_code specifically, not just "first active route" - the DB
  // also has a leftover "Authentication Test Route" that's active too and
  // would otherwise win a plain id-order tiebreak.
  const pilotRoute = await strapi.documents('api::route.route').findFirst({
    filters: { route_code: 'SL-SF-01', route_status: 'active' },
    fields: ['id'],
  });
  if (pilotRoute) return pilotRoute.id;

  const anyActiveRoute = await strapi.documents('api::route.route').findFirst({
    filters: { route_status: 'active' },
    sort: ['id:asc'],
    fields: ['id'],
  });
  return anyActiveRoute ? anyActiveRoute.id : null;
}

async function resolveStopId(strapi, stopParam) {
  if (!stopParam) return null;
  const stop = await strapi.documents('api::route-stop.route-stop').findFirst({
    filters: { documentId: stopParam },
    fields: ['id'],
  });
  return stop ? stop.id : null;
}

module.exports = {
  async waitTime(ctx) {
    const routeId = await resolveRouteId(strapi, ctx.query.route);
    if (!routeId) return ctx.badRequest('"route" (documentId) is required and must exist.');

    const result = await predictWaitTime(strapi, { routeId });
    ctx.body = { data: result };
  },

  async demand(ctx) {
    const routeId = await resolveRouteId(strapi, ctx.query.route);
    if (!routeId) return ctx.badRequest('"route" (documentId) is required and must exist.');
    const stopId = await resolveStopId(strapi, ctx.query.stop);
    const hour = ctx.query.hour !== undefined ? Number(ctx.query.hour) : undefined;

    const result = await predictDemand(strapi, { routeId, stopId, hour });
    ctx.body = { data: result };
  },

  async supplyDemand(ctx) {
    const routeId = await resolveRouteId(strapi, ctx.query.route);
    if (!routeId) return ctx.badRequest('"route" (documentId) is required and must exist.');
    const stopId = await resolveStopId(strapi, ctx.query.stop);
    const hour = ctx.query.hour !== undefined ? Number(ctx.query.hour) : undefined;

    const result = await analyzeSupplyDemand(strapi, { routeId, stopId, hour });
    ctx.body = { data: result };
  },

  async dashboardSummary(ctx) {
    const routeId = await resolveRouteId(strapi, ctx.query.route);
    if (!routeId) return ctx.badRequest('"route" (documentId) is required and must exist.');
    const hour = ctx.query.hour !== undefined ? Number(ctx.query.hour) : undefined;

    const stops = await strapi.documents('api::route-stop.route-stop').findMany({
      filters: { route: { id: routeId } },
      sort: ['sequence:asc'],
      fields: ['id', 'documentId', 'name', 'sequence'],
    });

    const waitTime = await predictWaitTime(strapi, { routeId });

    const perStop = await Promise.all(
      stops.map(async (stop) => {
        const analysis = await analyzeSupplyDemand(strapi, { routeId, stopId: stop.id, hour });
        return {
          stop_id: stop.documentId,
          stop_name: stop.name,
          ...analysis,
        };
      })
    );

    const shortages = perStop.filter((s) => s.status === 'SHORTAGE');
    const recommendations = shortages.map((s) => {
      const extraSeatsNeeded = s.shortage;
      const extraVehicles = Math.max(1, Math.ceil(extraSeatsNeeded / 20));
      return {
        stop_name: s.stop_name,
        message: `Predicted shortage at ${s.stop_name} (${s.expected_passengers} waiting vs ${s.expected_capacity} seats available). Recommend dispatching ${extraVehicles} additional vehicle${extraVehicles > 1 ? 's' : ''}.`,
      };
    });

    ctx.body = {
      data: {
        route_id: routeId,
        wait_time: waitTime,
        stops: perStop,
        shortage_count: shortages.length,
        recommendations,
      },
    };
  },
};
