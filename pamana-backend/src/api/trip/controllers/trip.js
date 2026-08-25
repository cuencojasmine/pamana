'use strict';

/**
 * trip controller
 *
 * A driver may only start/end their own trips, using their own assigned
 * vehicle - never another driver's. find/findOne only apply that scoping
 * when the caller resolves to a driver profile; Administrator callers
 * (no linked driver profile) see everything their role permissions allow.
 */

const { createCoreController } = require('@strapi/strapi').factories;

const getOwnDriver = (userId) =>
  strapi
    .documents('api::driver.driver')
    .findFirst({ filters: { user: { id: userId } }, populate: ['vehicle'] });

module.exports = createCoreController('api::trip.trip', ({ strapi }) => ({
  async create(ctx) {
    const driver = await getOwnDriver(ctx.state.user.id);

    if (!driver) {
      return ctx.badRequest('No driver profile linked to this account.');
    }

    if (!driver.vehicle) {
      return ctx.badRequest('No vehicle assigned to this driver.');
    }

    const activeTrip = await strapi.documents('api::trip.trip').findFirst({
      filters: { driver: { id: driver.id }, trip_status: 'active' },
    });

    if (activeTrip) {
      return ctx.badRequest(
        'You already have an active trip. End it before starting a new one.'
      );
    }

    const { route, direction } = ctx.request.body?.data || {};

    if (!route || !direction) {
      return ctx.badRequest('"route" and "direction" are required.');
    }

    // Created via the Document Service directly (not super.create(ctx)):
    // the Driver role has no `find` permission on the Driver content-type,
    // and Strapi's content-API write validation rejects setting a relation
    // to a target the caller can't read, even though `driver` is required.
    const created = await strapi.documents('api::trip.trip').create({
      data: {
        route,
        direction,
        driver: driver.id,
        vehicle: driver.vehicle.id,
        trip_status: 'active',
        started_at: new Date().toISOString(),
      },
    });

    await strapi.documents('api::vehicle.vehicle').update({
      documentId: driver.vehicle.documentId,
      data: { vehicle_status: 'in_transit' },
    });

    const sanitized = await this.sanitizeOutput(created, ctx);

    ctx.status = 201;

    return this.transformResponse(sanitized);
  },

  async update(ctx) {
    const driver = await getOwnDriver(ctx.state.user.id);

    if (!driver) {
      return ctx.notFound();
    }

    const trip = await strapi.documents('api::trip.trip').findOne({
      documentId: ctx.params.id,
      populate: ['driver', 'vehicle'],
    });

    if (!trip || trip.driver?.id !== driver.id) {
      return ctx.notFound();
    }

    const { trip_status, ended_at } = ctx.request.body?.data || {};
    const allowedStatuses = ['completed', 'cancelled'];

    if (!trip_status || !allowedStatuses.includes(trip_status)) {
      return ctx.badRequest('"trip_status" must be "completed" or "cancelled".');
    }

    ctx.request.body.data = {
      trip_status,
      ended_at: ended_at || new Date().toISOString(),
    };

    const result = await super.update(ctx);

    if (trip.vehicle) {
      await strapi.documents('api::vehicle.vehicle').update({
        documentId: trip.vehicle.documentId,
        data: { vehicle_status: 'available' },
      });
    }

    return result;
  },

  async find(ctx) {
    const driver = await getOwnDriver(ctx.state.user.id);

    if (driver) {
      // Filtering by the `driver` relation directly hits the same
      // restricted-relations check as above. Resolve the caller's own
      // trip ids server-side first, then filter by `id` instead - a
      // plain scalar field, not a relation to a restricted content-type.
      const ownTrips = await strapi.documents('api::trip.trip').findMany({
        filters: { driver: { id: driver.id } },
        fields: ['id'],
      });

      const ownIds = ownTrips.map((trip) => trip.id);

      ctx.query = {
        ...ctx.query,
        filters: {
          ...(ctx.query.filters || {}),
          id: { $in: ownIds.length > 0 ? ownIds : [-1] },
        },
      };
    }

    return super.find(ctx);
  },

  async findOne(ctx) {
    const driver = await getOwnDriver(ctx.state.user.id);

    if (driver) {
      const trip = await strapi.documents('api::trip.trip').findOne({
        documentId: ctx.params.id,
        populate: ['driver'],
      });

      if (!trip || trip.driver?.id !== driver.id) {
        return ctx.notFound();
      }
    }

    return super.findOne(ctx);
  },
}));
