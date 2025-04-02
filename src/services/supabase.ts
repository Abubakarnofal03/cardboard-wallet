
import { createClient } from '@supabase/supabase-js';
import { ExpenseEntry, Person } from '@/types';

// Default to empty strings, but add a check to prevent initialization when empty
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize Supabase client only if the URL and key are available
export const supabase = supabaseUrl && supabaseKey ? 
  createClient(supabaseUrl, supabaseKey) : 
  null;

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== '' && supabaseKey !== '' && supabase !== null;
};
