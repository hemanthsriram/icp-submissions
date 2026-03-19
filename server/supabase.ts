import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Force load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
export const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Critical: Supabase URL or Key missing. SUPABASE_URL =", supabaseUrl ? '[SET]' : '[EMPTY]');
} else {
  console.log('[Supabase] Client initialized for:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
