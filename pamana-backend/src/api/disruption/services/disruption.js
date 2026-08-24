'use strict';

/**
 * disruption service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::disruption.disruption');
