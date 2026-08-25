'use strict';

/**
 * vehicle-location controller
 *
 * A driver can only post GPS pings for their own active trip/vehicle -
 * the client-supplied vehicle/trip (if any) is always ignored in favor
 * of the caller's actual active trip, to prevent spoofing pings for a
 * vehicle the driver doesn't operate.
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::vehicle-location.vehicle-location', ({ strapi }) => ({
  async create(ctx) {
    const driver = await strapi
      .documents('api::driver.driver')
      .findFirst({ filters: { user: { id: ctx.state.user.id } }, populate: ['vehicle'] });

    if (!driver) {
      return ctx.badRequest('No driver profile linked to this account.');
    }

    const activeTrip = await strapi.documents('api::trip.trip').findFirst({
      filters: { driver: { id: driver.id }, trip_status: 'active' },
      populate: ['vehicle'],
    });

    if (!activeTrip) {
      return ctx.badRequest('No active trip. Start a trip before sending GPS updates.');
    }

    const { latitude, longitude, speed, heading, recorded_at } =
      ctx.request.body?.data || {};

    if (latitude === undefined || longitude === undefined) {
      return ctx.badRequest('"latitude" and "longitude" are required.');
    }

    ctx.request.body.data = {
      latitude,
      longitude,
      speed,
      heading,
      recorded_at: recorded_at || new Date().toISOString(),
      trip: activeTrip.id,
      vehicle: activeTrip.vehicle.id,
    };

    return super.create(ctx);
  },
}));
