'use strict';

/**
 * passenger-report service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::passenger-report.passenger-report');
