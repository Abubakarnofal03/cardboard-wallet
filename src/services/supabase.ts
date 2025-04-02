
import { createClient } from '@supabase/supabase-js';
import { ExpenseEntry, Person } from '@/types';

// These will need to be replaced with actual values from your Supabase project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== '' && supabaseKey !== '';
};
