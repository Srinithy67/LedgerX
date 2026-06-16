import { supabase } from '../config/supabase';

export async function isDatabaseReady(): Promise<boolean> {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      if (error.message.includes('schema cache') || error.code === '42P01') {
        return false;
      }
    }
    return !error;
  } catch {
    return false;
  }
}
