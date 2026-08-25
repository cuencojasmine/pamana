'use strict';

/**
 * trip-search custom routes
 *
 * Kept as its own top-level path (not nested under /routes/) to avoid
 * colliding with the core route router's GET /routes/:id pattern.
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/trip-search',
      handler: 'trip-search.search',
      config: {
        policies: [],
      },
    },
  ],
};
