'use strict';

/**
 * disruption controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::disruption.disruption');
