import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Create Supabase client with service role key to bypass RLS in repository operations
// (RLS security checks are enforced at the application/repository level)
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
