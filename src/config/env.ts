import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://mock.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'mock-anon-key',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
