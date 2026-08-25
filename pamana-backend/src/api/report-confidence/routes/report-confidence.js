'use strict';

/**
 * report-confidence custom routes
 *
 * Own top-level path, same reasoning as trip-search/live-vehicles: avoids
 * colliding with the core passenger-report router's /:id pattern.
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/report-confidence',
      handler: 'report-confidence.list',
      config: {
        policies: [],
      },
    },
  ],
};
