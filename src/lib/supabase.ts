
import { createClient } from '@supabase/supabase-js';
import { type Person, type ExpenseEntry } from '@/types';

// These environment variables need to be set in your Supabase project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema helpers
export const TABLES = {
  PERSONS: 'persons',
  EXPENSE_ENTRIES: 'expense_entries',
};

// Initial migration helper - can be used after connecting to Supabase
export const migrateLocalDataToSupabase = async () => {
  try {
    // Check if we have data in localStorage
    const personsData = localStorage.getItem('persons');
    const expensesData = localStorage.getItem('expenseEntries');
    
    if (personsData) {
      const persons: Person[] = JSON.parse(personsData);
      // Insert persons into Supabase
      const { error: personsError } = await supabase
        .from(TABLES.PERSONS)
        .upsert(persons, { onConflict: 'id' });
      
      if (personsError) throw personsError;
      console.log('Migrated persons data to Supabase');
    }
    
    if (expensesData) {
      const expenses: ExpenseEntry[] = JSON.parse(expensesData);
      // Insert expenses into Supabase
      const { error: expensesError } = await supabase
        .from(TABLES.EXPENSE_ENTRIES)
        .upsert(expenses, { onConflict: 'id' });
      
      if (expensesError) throw expensesError;
      console.log('Migrated expense entries data to Supabase');
    }
    
    return true;
  } catch (error) {
    console.error('Error migrating data to Supabase:', error);
    return false;
  }
};
