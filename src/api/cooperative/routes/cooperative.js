'use strict';

/**
 * cooperative router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::cooperative.cooperative');
