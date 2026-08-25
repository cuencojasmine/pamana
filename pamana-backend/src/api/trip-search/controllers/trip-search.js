'use strict';

/**
 * trip-search controller
 *
 * Matches a passenger's origin/destination search against active routes.
 * Ranks results using a basic fare/time heuristic only (no AI, no
 * wait-time or demand data) - this is a placeholder for Phase 17's
 * Dynamic Route Recommendation Engine, kept behind the same response
 * shape so the frontend won't need structural changes once that lands.
 */

const normalize = (values) => {
  const nums = values.filter((v) => typeof v === 'number' && !Number.isNaN(v));

  if (nums.length === 0) {
    return () => null;
  }

  const min = Math.min(...nums);
  const max = Math.max(...nums);

  if (min === max) {
    return (v) => (typeof v === 'number' ? 0 : null);
  }

  return (v) => (typeof v === 'number' ? (v - min) / (max - min) : null);
};

const withRecommendedScore = (routes) => {
  const normalizeFare = normalize(routes.map((route) => route.base_fare));
  const normalizeTime = normalize(routes.map((route) => route.estimated_travel_time));

  return routes.map((route) => {
    const parts = [normalizeFare(route.base_fare), normalizeTime(route.estimated_travel_time)]
      .filter((value) => typeof value === 'number');

    const recommended_score =
      parts.length > 0 ? parts.reduce((sum, value) => sum + value, 0) / parts.length : null;

    return { ...route, recommended_score };
  });
};

module.exports = {
  async search(ctx) {
    const { origin, destination } = ctx.query;

    if (!origin || !destination) {
      return ctx.badRequest('Both "origin" and "destination" query parameters are required.');
    }

    const routes = await strapi.documents('api::route.route').findMany({
      filters: {
        route_status: 'active',
        $or: [
          { origin: { $containsi: origin }, destination: { $containsi: destination } },
          { origin: { $containsi: destination }, destination: { $containsi: origin } },
        ],
      },
      populate: {
        route_stops: true,
      },
    });

    let results = routes.map((route) => {
      const isReverse =
        route.destination.toLowerCase().includes(String(origin).toLowerCase()) &&
        route.origin.toLowerCase().includes(String(destination).toLowerCase());

      const stops = (route.route_stops || [])
        .slice()
        .sort((a, b) => a.sequence - b.sequence)
        .map((stop) => ({
          id: stop.id,
          name: stop.name,
          sequence: stop.sequence,
          latitude: stop.latitude,
          longitude: stop.longitude,
          stop_type: stop.stop_type,
        }));

      return {
        id: route.id,
        documentId: route.documentId,
        route_name: route.route_name,
        route_code: route.route_code,
        origin: isReverse ? route.destination : route.origin,
        destination: isReverse ? route.origin : route.destination,
        direction: isReverse ? 'reverse' : 'forward',
        base_fare: route.base_fare,
        estimated_travel_time: route.estimated_travel_time,
        stops: isReverse ? stops.slice().reverse() : stops,
      };
    });

    results = withRecommendedScore(results);

    const fares = results.map((route) => route.base_fare).filter((v) => typeof v === 'number');
    const times = results
      .map((route) => route.estimated_travel_time)
      .filter((v) => typeof v === 'number');
    const scores = results
      .map((route) => route.recommended_score)
      .filter((v) => typeof v === 'number');

    const cheapestFare = fares.length > 0 ? Math.min(...fares) : null;
    const fastestTime = times.length > 0 ? Math.min(...times) : null;
    const bestScore = scores.length > 0 ? Math.min(...scores) : null;

    results = results
      .map((route) => ({
        ...route,
        is_cheapest: cheapestFare !== null && route.base_fare === cheapestFare,
        is_fastest: fastestTime !== null && route.estimated_travel_time === fastestTime,
        is_recommended: bestScore !== null && route.recommended_score === bestScore,
      }))
      .sort((a, b) => {
        if (a.recommended_score === null) return 1;
        if (b.recommended_score === null) return -1;
        return a.recommended_score - b.recommended_score;
      });

    ctx.body = { data: results };
  },
};
