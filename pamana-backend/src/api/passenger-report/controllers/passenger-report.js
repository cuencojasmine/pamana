'use strict';

/**
 * passenger-report controller
 *
 * A passenger's report is always attributed to their own passenger
 * profile (never a client-supplied id). `route`/`stop` are optional -
 * attached automatically when the caller has that context (per the
 * guide's "Automatically Attach Context ... when available"), but a
 * general free-form report is still valid without them. Duplicate
 * reports for the same passenger/type within a short window are
 * rejected (narrowed to the same route/stop too, when both are given)
 * so a single passenger can't inflate the crowdsourcing confidence
 * signal. find/findOne are scoped to the caller's own reports only -
 * passengers can see their own submission history, not everyone else's.
 */

const { createCoreController } = require('@strapi/strapi').factories;

const DUPLICATE_WINDOW_MINUTES = 5;

const getOwnPassengerProfile = (userId) =>
  strapi.documents('api::passenger-profile.passenger-profile').findFirst({
    filters: { user: { id: userId } },
  });

module.exports = createCoreController('api::passenger-report.passenger-report', ({ strapi }) => ({
  async create(ctx) {
    const passengerProfile = await getOwnPassengerProfile(ctx.state.user.id);

    if (!passengerProfile) {
      return ctx.badRequest('No passenger profile linked to this account.');
    }

    const { report_type, route, stop, vehicle, latitude, longitude, location_note } =
      ctx.request.body?.data || {};

    if (!report_type) {
      return ctx.badRequest('"report_type" is required.');
    }

    const windowStart = new Date(Date.now() - DUPLICATE_WINDOW_MINUTES * 60 * 1000).toISOString();

    const duplicateFilters = {
      passenger: { id: passengerProfile.id },
      report_type,
      reported_at: { $gte: windowStart },
    };

    if (route && stop) {
      duplicateFilters.route = { id: route };
      duplicateFilters.stop = { id: stop };
    }

    const recentDuplicate = await strapi.documents('api::passenger-report.passenger-report').findFirst({
      filters: duplicateFilters,
    });

    if (recentDuplicate) {
      return ctx.badRequest('You already submitted this report recently. Please wait before submitting again.');
    }

    ctx.request.body.data = {
      report_type,
      route: route || undefined,
      stop: stop || undefined,
      vehicle: vehicle || undefined,
      latitude,
      longitude,
      location_note,
      reported_at: new Date().toISOString(),
      passenger: passengerProfile.id,
    };

    return super.create(ctx);
  },

  async find(ctx) {
    const passengerProfile = await getOwnPassengerProfile(ctx.state.user.id);

    if (passengerProfile) {
      ctx.query = {
        ...ctx.query,
        filters: {
          ...(ctx.query.filters || {}),
          passenger: { id: passengerProfile.id },
        },
      };
    }

    return super.find(ctx);
  },

  async findOne(ctx) {
    const passengerProfile = await getOwnPassengerProfile(ctx.state.user.id);

    if (passengerProfile) {
      const report = await strapi.documents('api::passenger-report.passenger-report').findOne({
        documentId: ctx.params.id,
        populate: ['passenger'],
      });

      if (!report || report.passenger?.id !== passengerProfile.id) {
        return ctx.notFound();
      }
    }

    return super.findOne(ctx);
  },
}));
