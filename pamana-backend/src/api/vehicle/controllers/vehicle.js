'use strict';

/**
 * vehicle controller
 *
 * A Driver caller may only update the vehicle assigned to them, and only
 * its occupancy_level (Stage 10.4) - everything else (plate number,
 * capacity, cooperative/route assignment, etc.) stays admin-only.
 * Administrator callers (no linked driver profile) keep the default,
 * unrestricted update behavior.
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::vehicle.vehicle', ({ strapi }) => ({
  async update(ctx) {
    const driver = await strapi
      .documents('api::driver.driver')
      .findFirst({ filters: { user: { id: ctx.state.user.id } }, populate: ['vehicle'] });

    if (driver) {
      if (!driver.vehicle || driver.vehicle.documentId !== ctx.params.id) {
        return ctx.notFound();
      }

      const { occupancy_level } = ctx.request.body?.data || {};

      if (!occupancy_level) {
        return ctx.badRequest('"occupancy_level" is required.');
      }

      ctx.request.body.data = { occupancy_level };
    }

    return super.update(ctx);
  },
}));
