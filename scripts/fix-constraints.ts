import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function fixConstraints() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set in .env');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  const fixSql = `
    -- Drop old foreign keys referencing public.users
    ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_user_id_fkey;
    ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_user_id_fkey;
    ALTER TABLE public.ocr_uploads DROP CONSTRAINT IF EXISTS ocr_uploads_user_id_fkey;

    -- Re-create foreign keys referencing auth.users(id)
    ALTER TABLE public.categories 
      ADD CONSTRAINT categories_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    ALTER TABLE public.expenses 
      ADD CONSTRAINT expenses_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    ALTER TABLE public.ocr_uploads 
      ADD CONSTRAINT ocr_uploads_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  `;

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Altering foreign key constraints to reference auth.users(id)...');
    await client.query(fixSql);
    console.log('✅ Foreign key constraints updated successfully!');
  } catch (error) {
    console.error('❌ Failed to update foreign keys:', error);
  } finally {
    await client.end();
  }
}

fixConstraints();
