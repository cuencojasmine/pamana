'use strict';

/**
 * vehicle-location service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::vehicle-location.vehicle-location');
