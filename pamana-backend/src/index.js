'use strict';

/**
 * Strapi's schema sync (strapi.db.schema.sync(), run once per startup)
 * creates every attribute's column purely from its schema.json shape -
 * `required`/`default` are enforced by the Document Service at the
 * application layer only, never as a DB-level NOT NULL/DEFAULT. Confirmed
 * empirically: even a from-scratch CREATE TABLE leaves these nullable with
 * no default, identically to an ALTER TABLE ADD COLUMN on an existing one.
 *
 * These four accessibility flags are meant to be read directly by a future
 * recommendation engine (Phase 17/20.3), so "unknown" must never be
 * possible to read back as true by construction, not just by convention -
 * this hardens that at the DB level too, closing the gap for anything that
 * writes via raw SQL/import scripts instead of the Strapi API.
 *
 * `database/migrations/*.js` files can't do this: Strapi always runs
 * pending user migrations BEFORE schema sync (see @strapi/database's
 * schema/index.js `sync()`), so on a fresh database the target tables
 * don't exist yet at migration time. The user `bootstrap()` lifecycle
 * below is the first hook guaranteed to run after schema sync has
 * finished (Strapi core's own bootstrap() calls db.schema.sync() long
 * before it runs user lifecycles) - so it runs identically on a fresh
 * clone and an existing database, every startup, and is fully idempotent.
 */
const ACCESSIBILITY_BOOLEAN_COLUMNS = [
  { table: 'vehicles', column: 'wheelchair_accessible' },
  { table: 'vehicles', column: 'low_floor' },
  { table: 'route_stops', column: 'covered_waiting_area' },
  { table: 'route_stops', column: 'accessible_toilet_nearby' },
];

async function hardenAccessibilityColumns(strapi) {
  if (strapi.db.dialect.client !== 'postgres') {
    return;
  }

  const knex = strapi.db.connection;

  for (const { table, column } of ACCESSIBILITY_BOOLEAN_COLUMNS) {
    const hasColumn = await knex.schema.hasColumn(table, column);

    if (!hasColumn) {
      continue;
    }

    await knex(table).whereNull(column).update({ [column]: false });

    await knex.schema.alterTable(table, (t) => {
      t.boolean(column).notNullable().defaultTo(false).alter();
    });
  }
}

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    await hardenAccessibilityColumns(strapi);
  },
};
