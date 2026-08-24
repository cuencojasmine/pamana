'use strict';

/**
 * prediction service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::prediction.prediction');
