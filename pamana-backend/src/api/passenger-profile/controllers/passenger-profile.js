'use strict';

/**
 * passenger-profile controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  'api::passenger-profile.passenger-profile',
  ({ strapi }) => ({
    async create(ctx) {
      const userId = ctx.state.user.id;

      const existing = await strapi
        .documents('api::passenger-profile.passenger-profile')
        .findFirst({ filters: { user: { id: userId } } });

      if (existing) {
        return ctx.badRequest('Passenger profile already exists for this account.');
      }

      if (ctx.request.body.data) {
        delete ctx.request.body.data.user;
      }

      const result = await super.create(ctx);
      const documentId = result?.data?.documentId;

      if (!documentId) {
        return result;
      }

      await strapi.documents('api::passenger-profile.passenger-profile').update({
        documentId,
        data: { user: userId },
      });

      const updated = await strapi
        .documents('api::passenger-profile.passenger-profile')
        .findOne({ documentId });

      const sanitized = await this.sanitizeOutput(updated, ctx);

      return this.transformResponse(sanitized);
    },

    async find(ctx) {
      ctx.query = {
        ...ctx.query,
        filters: {
          ...(ctx.query.filters || {}),
          user: { id: ctx.state.user.id },
        },
      };

      return super.find(ctx);
    },

    async findOne(ctx) {
      const profile = await strapi
        .documents('api::passenger-profile.passenger-profile')
        .findOne({ documentId: ctx.params.id, populate: ['user'] });

      if (!profile || profile.user?.id !== ctx.state.user.id) {
        return ctx.notFound();
      }

      return super.findOne(ctx);
    },

    async update(ctx) {
      const profile = await strapi
        .documents('api::passenger-profile.passenger-profile')
        .findOne({ documentId: ctx.params.id, populate: ['user'] });

      if (!profile || profile.user?.id !== ctx.state.user.id) {
        return ctx.notFound();
      }

      if (ctx.request.body.data) {
        delete ctx.request.body.data.user;
      }

      return super.update(ctx);
    },
  })
);
