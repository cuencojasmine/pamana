'use strict';

/**
 * cooperative controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::cooperative.cooperative');
