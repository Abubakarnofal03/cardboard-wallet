
import { createClient } from '@supabase/supabase-js';
import { ExpenseEntry, Person } from '@/types';

// Using the provided Supabase URL and anon key
const supabaseUrl = 'https://eqghyohwatpimsuokkfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxZ2h5b2h3YXRwaW1zdW9ra2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MjYxNzYsImV4cCI6MjA1OTIwMjE3Nn0.UGUX8fBlQIYP_n8PpfaJn1mjdCah5vUZdeSBVfHZF6s';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl.length > 0 && supabaseKey.length > 0;
};
