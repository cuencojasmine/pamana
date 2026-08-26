'use strict';

/**
 * trip-search controller
 *
 * Matches a passenger's origin/destination search against active routes.
 * Phase 17 (Dynamic Route Recommendation Engine): scores each route on
 * fare, travel time, and predicted wait (src/services/pamana-ai/wait-time),
 * then explains the recommendation in plain language - a formula, not a
 * trained model, per the guide's own baseline scope.
 */

const { predictWaitTime } = require('../../../services/pamana-ai/wait-time');

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
  const normalizeWait = normalize(routes.map((route) => route.predicted_wait_minutes?.high ?? null));

  return routes.map((route) => {
    const parts = [
      normalizeFare(route.base_fare),
      normalizeTime(route.estimated_travel_time),
      normalizeWait(route.predicted_wait_minutes?.high ?? null),
    ].filter((value) => typeof value === 'number');

    const recommended_score =
      parts.length > 0 ? parts.reduce((sum, value) => sum + value, 0) / parts.length : null;

    return { ...route, recommended_score };
  });
};

const explainRecommendation = (route, { isCheapest, isFastest, isMostReliable, isRecommended }) => {
  if (!isRecommended) return null;

  const reasons = [];
  if (isCheapest) reasons.push('the cheapest fare');
  if (isFastest) reasons.push('the fastest travel time');
  if (isMostReliable) reasons.push('the most reliable predicted wait');

  if (reasons.length === 0) {
    return `${route.route_name} is recommended as the best overall balance of fare, travel time, and predicted wait.`;
  }

  const joined =
    reasons.length === 1
      ? reasons[0]
      : `${reasons.slice(0, -1).join(', ')} and ${reasons[reasons.length - 1]}`;

  return `${route.route_name} is recommended because it has ${joined}.`;
};

module.exports = {
  async search(ctx) {
    const { origin, destination } = ctx.query;

    if (!origin || !destination) {
      return ctx.badRequest('Both "origin" and "destination" query parameters are required.');
    }

    // Bidirectional, case-insensitive substring match done in memory rather
    // than via $containsi: a location picker can send a more specific string
    // than what's stored (e.g. "San Luis, Pampanga" vs. the stored "San
    // Luis") - $containsi only ever checks one direction, so a more specific
    // search string could never match. Fine at this pilot's route count.
    const matches = (storedValue, searchValue) => {
      const stored = String(storedValue).toLowerCase().trim();
      const search = String(searchValue).toLowerCase().trim();
      return stored.includes(search) || search.includes(stored);
    };

    const allActiveRoutes = await strapi.documents('api::route.route').findMany({
      filters: { route_status: 'active' },
      populate: {
        route_stops: true,
      },
    });

    const routes = allActiveRoutes.filter(
      (route) =>
        (matches(route.origin, origin) && matches(route.destination, destination)) ||
        (matches(route.origin, destination) && matches(route.destination, origin))
    );

    let results = routes.map((route) => {
      const isReverse = matches(route.destination, origin) && matches(route.origin, destination);

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
          covered_waiting_area: stop.covered_waiting_area,
          accessible_toilet_nearby: stop.accessible_toilet_nearby,
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

    const waitTimes = await Promise.all(
      results.map((route) => predictWaitTime(strapi, { routeId: route.id }))
    );
    results = results.map((route, i) => ({
      ...route,
      predicted_wait_minutes: waitTimes[i].predicted_wait_minutes,
      wait_confidence: waitTimes[i].confidence,
    }));

    results = withRecommendedScore(results);

    const fares = results.map((route) => route.base_fare).filter((v) => typeof v === 'number');
    const times = results
      .map((route) => route.estimated_travel_time)
      .filter((v) => typeof v === 'number');
    const scores = results
      .map((route) => route.recommended_score)
      .filter((v) => typeof v === 'number');
    const reliabilities = results
      .map((route) => route.wait_confidence)
      .filter((v) => typeof v === 'number');

    const cheapestFare = fares.length > 0 ? Math.min(...fares) : null;
    const fastestTime = times.length > 0 ? Math.min(...times) : null;
    const bestScore = scores.length > 0 ? Math.min(...scores) : null;
    const bestReliability = reliabilities.length > 0 ? Math.max(...reliabilities) : null;

    results = results.map((route) => {
      const flags = {
        isCheapest: cheapestFare !== null && route.base_fare === cheapestFare,
        isFastest: fastestTime !== null && route.estimated_travel_time === fastestTime,
        isMostReliable: bestReliability !== null && route.wait_confidence === bestReliability,
        isRecommended: bestScore !== null && route.recommended_score === bestScore,
      };

      return {
        ...route,
        is_cheapest: flags.isCheapest,
        is_fastest: flags.isFastest,
        is_most_reliable: flags.isMostReliable,
        is_recommended: flags.isRecommended,
        recommendation_reason: explainRecommendation(route, flags),
      };
    });

    results = results.sort((a, b) => {
      if (a.recommended_score === null) return 1;
      if (b.recommended_score === null) return -1;
      return a.recommended_score - b.recommended_score;
    });

    ctx.body = { data: results };
  },
};
