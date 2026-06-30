// Supabase client — single instance for the entire app
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    'Missing required environment variable VITE_SUPABASE_URL. ' +
    'Create a .env file with VITE_SUPABASE_URL=https://<project>.supabase.co',
  );
}

if (!SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing required environment variable VITE_SUPABASE_ANON_KEY. ' +
    'Create a .env file with VITE_SUPABASE_ANON_KEY=<your-anon-key>',
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
