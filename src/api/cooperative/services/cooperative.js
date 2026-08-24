'use strict';

/**
 * cooperative service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::cooperative.cooperative');
