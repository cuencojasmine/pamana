'use strict';

/**
 * live-vehicle custom routes
 *
 * Kept as its own top-level path (not nested under /vehicles/ or
 * /vehicle-locations/) to avoid colliding with the core routers' :id
 * patterns for those content-types.
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/live-vehicles',
      handler: 'live-vehicle.list',
      config: {
        policies: [],
      },
    },
  ],
};
