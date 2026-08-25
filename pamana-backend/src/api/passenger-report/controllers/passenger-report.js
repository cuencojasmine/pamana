'use strict';

/**
 * passenger-report controller
 *
 * A passenger's report is always attributed to their own passenger
 * profile (never a client-supplied id), and duplicate reports for the
 * same route/stop/type within a short window are rejected so a single
 * passenger can't inflate the crowdsourcing confidence signal.
 */

const { createCoreController } = require('@strapi/strapi').factories;

const DUPLICATE_WINDOW_MINUTES = 5;

module.exports = createCoreController('api::passenger-report.passenger-report', ({ strapi }) => ({
  async create(ctx) {
    const passengerProfile = await strapi.documents('api::passenger-profile.passenger-profile').findFirst({
      filters: { user: { id: ctx.state.user.id } },
    });

    if (!passengerProfile) {
      return ctx.badRequest('No passenger profile linked to this account.');
    }

    const { report_type, route, stop, vehicle, latitude, longitude } = ctx.request.body?.data || {};

    if (!report_type || !route || !stop) {
      return ctx.badRequest('"report_type", "route", and "stop" are required.');
    }

    const windowStart = new Date(Date.now() - DUPLICATE_WINDOW_MINUTES * 60 * 1000).toISOString();

    const recentDuplicate = await strapi.documents('api::passenger-report.passenger-report').findFirst({
      filters: {
        passenger: { id: passengerProfile.id },
        route: { id: route },
        stop: { id: stop },
        report_type,
        reported_at: { $gte: windowStart },
      },
    });

    if (recentDuplicate) {
      return ctx.badRequest('You already submitted this report recently. Please wait before submitting again.');
    }

    ctx.request.body.data = {
      report_type,
      route,
      stop,
      vehicle: vehicle || undefined,
      latitude,
      longitude,
      reported_at: new Date().toISOString(),
      passenger: passengerProfile.id,
    };

    return super.create(ctx);
  },
}));
