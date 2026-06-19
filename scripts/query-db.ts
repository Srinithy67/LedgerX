import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function query() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  try {
    const constraintsRes = await client.query(`
      SELECT
        conrelid::regclass AS table_name,
        conname AS constraint_name,
        pg_get_constraintdef(c.oid) AS constraint_definition
      FROM
        pg_constraint c
      JOIN
        pg_namespace n ON n.oid = c.connamespace
      WHERE
        contype = 'f' AND conrelid::regclass::text IN ('categories', 'expenses', 'ocr_uploads');
    `);
    console.log('--- raw foreign keys ---');
    console.log(constraintsRes.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

query();
