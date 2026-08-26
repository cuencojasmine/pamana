'use strict';

/**
 * One-off seed script for Phases 13-16 demo data (hackathon).
 *
 * The pilot corridor has almost no real usage yet (a handful of same-day
 * test trips, zero demand observations), so wait-time/demand predictions
 * have nothing real to learn from. This seeds clearly-labeled simulated
 * data - `source: 'simulation'` throughout - so the prediction endpoints
 * have something honest to compute from during the demo, per the guide's
 * own Phase 21 rationale ("reliable demo data without depending on real
 * field conditions").
 *
 * Safe to re-run: skips route-stops that already exist by name, and only
 * adds demand observations for a fixed set of dates below (no duplicate
 * accumulation on re-run).
 *
 * Usage: node scripts/seed-demand-data.js
 */

const { Client } = require('pg');
const { timeSlotForHour: timeSlotFor } = require('../src/services/pamana-ai/time-slots');

const ROUTE_ID = 2; // San Luis - San Fernando (SL-SF-01)
const SEED_DATES = ['2026-08-25', '2026-08-26', '2026-08-27'];

// Real San Luis (~15.1667, 120.7333) to real San Fernando city proper
// (~15.0285, 120.6898) - the pre-existing "San Luis Public Market" stop
// was never actually placed in San Luis (it was at 15.02, 120.65, inside
// San Fernando itself), which made the whole corridor render as a ~3km
// cluster on the map instead of the real ~16km corridor. Fixed directly
// in the DB for the existing stop; these 3 are placed along the real line.
const NEW_STOPS = [
  { name: 'Santo Tomas Stop', sequence: 2, latitude: 15.1206, longitude: 120.7188 },
  { name: 'OGC Stop', sequence: 3, latitude: 15.0746, longitude: 120.7043 },
  { name: 'SM City San Fernando', sequence: 4, latitude: 15.0285, longitude: 120.6898 },
];

// hour-of-day -> relative demand weight per stop (rough rush-hour curve, full 24h so the
// demo works no matter what time it's actually run)
const HOURLY_WEIGHT = {
  0: 0.05, 1: 0.05, 2: 0.05, 3: 0.05, 4: 0.1, 5: 0.25,
  6: 0.6, 7: 1.0, 8: 0.9, 9: 0.5, 10: 0.3, 11: 0.3, 12: 0.4,
  13: 0.3, 14: 0.3, 15: 0.4, 16: 0.8, 17: 1.0, 18: 0.9, 19: 0.4,
  20: 0.25, 21: 0.15, 22: 0.1, 23: 0.05,
};

const STOP_BASE_DEMAND = {
  'San Luis Public Market': 18,
  'Santo Tomas Stop': 45, // deliberately the shortage story - exceeds the 20-seat vehicle at peak
  'OGC Stop': 10,
  'SM City San Fernando': 22,
};

function genId() {
  return require('crypto').randomBytes(16).toString('hex').slice(0, 24);
}

async function main() {
  const c = new Client({
    host: '127.0.0.1',
    port: 5432,
    database: 'pamana-db',
    user: 'postgres',
    password: 'jcuenco08',
  });
  await c.connect();

  // 1. Ensure the extra route-stops exist.
  const allStops = await c.query('SELECT id, name FROM route_stops');
  const existingNames = new Set(allStops.rows.map((r) => r.name));

  const stopIds = {};
  for (const row of allStops.rows) stopIds[row.name] = row.id;

  for (const stop of NEW_STOPS) {
    if (existingNames.has(stop.name)) continue;

    const docId = genId();
    const insert = await c.query(
      `INSERT INTO route_stops (document_id, name, sequence, latitude, longitude, stop_type, covered_waiting_area, accessible_toilet_nearby, created_at, updated_at, published_at)
       VALUES ($1, $2, $3, $4, $5, 'both', false, false, now(), now(), now())
       RETURNING id`,
      [docId, stop.name, stop.sequence, stop.latitude, stop.longitude]
    );
    const newId = insert.rows[0].id;
    stopIds[stop.name] = newId;

    // link table: route_stops has a "route" relation -> route_stops_route_lnk
    await c.query(
      `INSERT INTO route_stops_route_lnk (route_stop_id, route_id) VALUES ($1, $2)`,
      [newId, ROUTE_ID]
    );
    console.log(`created stop "${stop.name}" (id ${newId})`);
  }

  // 2. Seed demand observations per stop / date / hour.
  let created = 0;
  for (const date of SEED_DATES) {
    for (const [stopName, baseDemand] of Object.entries(STOP_BASE_DEMAND)) {
      const stopId = stopIds[stopName];
      if (!stopId) continue;

      for (const [hourStr, weight] of Object.entries(HOURLY_WEIGHT)) {
        const hour = Number(hourStr);
        const jitter = 0.85 + Math.random() * 0.3; // +/-15% noise so it's not a flat curve
        const waiting = Math.max(0, Math.round(baseDemand * weight * jitter));

        const dup = await c.query(
          `SELECT pdo.id FROM passenger_demand_observations pdo
           JOIN passenger_demand_observations_stop_lnk sl ON sl.passenger_demand_observation_id = pdo.id
           WHERE pdo.date = $1 AND pdo.time_slot = $2 AND sl.route_stop_id = $3`,
          [date, timeSlotFor(hour), stopId]
        );
        if (dup.rows.length > 0) continue;

        const docId = genId();
        const insert = await c.query(
          `INSERT INTO passenger_demand_observations (document_id, date, time_slot, waiting_passengers, source, created_at, updated_at, published_at)
           VALUES ($1, $2, $3, $4, 'simulation', now(), now(), now())
           RETURNING id`,
          [docId, date, timeSlotFor(hour), waiting]
        );
        const obsId = insert.rows[0].id;

        await c.query(
          `INSERT INTO passenger_demand_observations_route_lnk (passenger_demand_observation_id, route_id) VALUES ($1, $2)`,
          [obsId, ROUTE_ID]
        );
        await c.query(
          `INSERT INTO passenger_demand_observations_stop_lnk (passenger_demand_observation_id, route_stop_id) VALUES ($1, $2)`,
          [obsId, stopId]
        );
        created += 1;
      }
    }
  }

  console.log(`created ${created} passenger_demand_observations rows`);
  await c.end();
}

main().catch((err) => {
  console.error('SEED FAILED:', err.message);
  process.exit(1);
});
