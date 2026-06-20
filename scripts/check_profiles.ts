import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  
  console.log("--- TABLE COLUMNS FOR 'profiles' ---");
  const res = await client.query(`
    SELECT column_name, data_type, is_nullable, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'profiles';
  `);
  console.log(res.rows);

  console.log("--- TABLE CONSTRAINTS FOR 'profiles' ---");
  const constraints = await client.query(`
    SELECT 
        conname AS constraint_name, 
        pg_get_constraintdef(c.oid) AS constraint_definition
    FROM 
        pg_constraint c
    JOIN 
        pg_namespace n ON n.oid = c.connamespace
    WHERE 
        conrelid = 'public.profiles'::regclass;
  `);
  console.log(constraints.rows);

  await client.end();
}
check().catch(console.error);
