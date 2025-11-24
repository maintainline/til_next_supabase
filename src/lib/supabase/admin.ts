import { Database } from '@/types/database.types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

export function createAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin credentials are missing.');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey);
}
