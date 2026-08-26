'use strict';

const { Client } = require('pg');
const crypto = require('crypto');

const ACTIONS = [
  'api::pamana-ai.pamana-ai.waitTime',
  'api::pamana-ai.pamana-ai.demand',
  'api::pamana-ai.pamana-ai.supplyDemand',
  'api::pamana-ai.pamana-ai.dashboardSummary',
];

const ROLE_IDS = [3, 5, 6]; // Passenger, LGU, Administrator

async function main() {
  const c = new Client({
    host: '127.0.0.1',
    port: 5432,
    database: 'pamana-db',
    user: 'postgres',
    password: 'jcuenco08',
  });
  await c.connect();

  for (const roleId of ROLE_IDS) {
    const ordRes = await c.query(
      'SELECT COALESCE(MAX(permission_ord), 0) AS max_ord FROM up_permissions_role_lnk WHERE role_id = $1',
      [roleId]
    );
    let ord = Number(ordRes.rows[0].max_ord);

    for (const action of ACTIONS) {
      const existing = await c.query(
        `SELECT p.id FROM up_permissions p
         JOIN up_permissions_role_lnk rl ON rl.permission_id = p.id
         WHERE p.action = $1 AND rl.role_id = $2`,
        [action, roleId]
      );
      if (existing.rows.length > 0) continue;

      const docId = crypto.randomBytes(16).toString('hex').slice(0, 24);
      const insert = await c.query(
        `INSERT INTO up_permissions (document_id, action, created_at, updated_at, published_at)
         VALUES ($1, $2, now(), now(), now()) RETURNING id`,
        [docId, action]
      );
      const permissionId = insert.rows[0].id;

      ord += 1;
      await c.query(
        `INSERT INTO up_permissions_role_lnk (permission_id, role_id, permission_ord) VALUES ($1, $2, $3)`,
        [permissionId, roleId, ord]
      );
      console.log(`granted ${action} -> role ${roleId}`);
    }
  }

  await c.end();
}

main().catch((err) => {
  console.error('GRANT FAILED:', err.message);
  process.exit(1);
});
