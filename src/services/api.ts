
import { ExpenseEntry, FactorySummary, Person, PersonSummary } from "@/types";
import { supabase, isSupabaseConfigured } from './supabase';
import { toast } from "sonner";

// Initialize localStorage with default data if empty
const initializeLocalStorage = () => {
  if (!localStorage.getItem('persons')) {
    localStorage.setItem('persons', JSON.stringify([
      { id: 1, name: "John Smith (Worker)" },
      { id: 2, name: "Jane Doe (Shareholder)" },
      { id: 3, name: "Bob Johnson (Supplier)" },
      { id: 4, name: "Alice Williams (Manager)" },
    ]));
  }

  if (!localStorage.getItem('expenseEntries')) {
    localStorage.setItem('expenseEntries', JSON.stringify([
      {
        id: 1,
        personId: 1,
        date: "2023-05-10",
        amount: 1500,
        type: "Credit",
        description: "Monthly salary",
      },
      {
        id: 2,
        personId: 2,
        date: "2023-05-15",
        amount: 3000,
        type: "Credit",
        description: "Dividend payment",
      },
      {
        id: 3,
        personId: 3,
        date: "2023-05-20",
        amount: 2500,
        type: "Debit",
        description: "Raw materials purchase",
      },
      {
        id: 4,
        personId: 4,
        date: "2023-05-25",
        amount: 2000,
        type: "Credit",
        description: "Monthly salary",
      },
      {
        id: 5,
        personId: 1,
        date: "2023-06-01",
        amount: 500,
        type: "Debit",
        description: "Advance payment",
      },
    ]));
  }
};

// Initialize data when the app loads
initializeLocalStorage();

// Helper to get new ID
const getNewId = (items: { id: number }[]): number => {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
};

// Supabase helper functions
const initializeSupabase = async () => {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.log("Supabase is not configured. Using localStorage instead.");
      return false;
    }

    console.log("Initializing Supabase tables...");
    
    // Create tables if they don't exist using SQL
    const createPersonsTableSQL = `
      CREATE TABLE IF NOT EXISTS persons (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
      )
    `;
    
    const createExpenseEntriesTableSQL = `
      CREATE TABLE IF NOT EXISTS expense_entries (
        id INTEGER PRIMARY KEY,
        personId INTEGER NOT NULL,
        date TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        type TEXT NOT NULL,
        description TEXT
      )
    `;
    
    // Execute the SQL to create tables
    const { error: createPersonsError } = await supabase.rpc('exec', { 
      query: createPersonsTableSQL 
    });
    
    if (createPersonsError) {
      console.error('Error creating persons table:', createPersonsError);
      toast.error("Failed to create persons table. Using local storage.");
      return false;
    }
    
    const { error: createExpenseEntriesError } = await supabase.rpc('exec', { 
      query: createExpenseEntriesTableSQL 
    });
    
    if (createExpenseEntriesError) {
      console.error('Error creating expense_entries table:', createExpenseEntriesError);
      toast.error("Failed to create expense entries table. Using local storage.");
      return false;
    }

    // Check if we have any persons data
    const { data: persons, error: personsCheckError } = await supabase
      .from('persons')
      .select('count');
    
    if (personsCheckError) {
      console.error('Error checking persons table:', personsCheckError);
      toast.error("Failed to check persons table. Using local storage.");
      return false;
    }

    // If no persons exist, seed with default data
    if (!persons || persons.length === 0) {
      console.log("Seeding persons table with default data...");
      const defaultPersons = JSON.parse(localStorage.getItem('persons') || '[]');
      for (const person of defaultPersons) {
        await supabase
          .from('persons')
          .insert(person);
      }
    }

    // Check if we have any expense entries
    const { data: entries, error: entriesCheckError } = await supabase
      .from('expense_entries')
      .select('count');
    
    if (entriesCheckError) {
      console.error('Error checking expense_entries table:', entriesCheckError);
      toast.error("Failed to check expense entries table. Using local storage.");
      return false;
    }

    // If no entries exist, seed with default data
    if (!entries || entries.length === 0) {
      console.log("Seeding expense_entries table with default data...");
      const defaultEntries = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
      for (const entry of defaultEntries) {
        const { error: insertError } = await supabase
          .from('expense_entries')
          .insert(entry);
          
        if (insertError) {
          console.error('Error inserting default entry:', insertError);
        }
      }
    }

    console.log("Supabase initialization complete!");
    toast.success("Connected to Supabase database");
    return true;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    toast.error("Failed to connect to Supabase database. Using local storage.");
    return false;
  }
};

// API methods that work with either Supabase or localStorage
export const api = {
  // Person endpoints
  getAllPersons: async (): Promise<Person[]> => {
    if (isSupabaseConfigured()) {
      try {
        await initializeSupabase();
        const { data, error } = await supabase
          .from('persons')
          .select('*');
        
        if (error) throw error;
        console.log("Fetched persons from Supabase:", data?.length || 0);
        toast.success("Data retrieved from cloud database");
        return data || [];
      } catch (error) {
        console.error('Error fetching persons from Supabase:', error);
        toast.error("Failed to fetch from cloud. Using local data.");
        // Fall back to localStorage
        return JSON.parse(localStorage.getItem('persons') || '[]');
      }
    } else {
      // Use localStorage as fallback
      console.log("Using localStorage for persons.");
      return new Promise((resolve) => {
        setTimeout(() => {
          const persons = JSON.parse(localStorage.getItem('persons') || '[]');
          resolve(persons);
        }, 300);
      });
    }
  },

  addPerson: async (name: string): Promise<Person> => {
    if (isSupabaseConfigured()) {
      try {
        await initializeSupabase();
        const persons = await api.getAllPersons();
        const newId = getNewId(persons);
        
        const newPerson: Person = {
          id: newId,
          name,
        };
        
        const { error } = await supabase
          .from('persons')
          .insert(newPerson);
        
        if (error) throw error;
        return newPerson;
      } catch (error) {
        console.error('Error adding person to Supabase:', error);
        // Fall back to localStorage
        return new Promise((resolve) => {
          setTimeout(() => {
            const persons = JSON.parse(localStorage.getItem('persons') || '[]');
            const newPerson: Person = {
              id: getNewId(persons),
              name,
            };
            persons.push(newPerson);
            localStorage.setItem('persons', JSON.stringify(persons));
            resolve(newPerson);
          }, 300);
        });
      }
    } else {
      // Use localStorage as fallback
      return new Promise((resolve) => {
        setTimeout(() => {
          const persons = JSON.parse(localStorage.getItem('persons') || '[]');
          const newPerson: Person = {
            id: getNewId(persons),
            name,
          };
          persons.push(newPerson);
          localStorage.setItem('persons', JSON.stringify(persons));
          resolve(newPerson);
        }, 300);
      });
    }
  },

  // Expense entry endpoints
  getAllExpenses: async (): Promise<ExpenseEntry[]> => {
    if (isSupabaseConfigured()) {
      try {
        await initializeSupabase();
        const { data, error } = await supabase
          .from('expense_entries')
          .select('*');
        
        if (error) throw error;
        console.log("Fetched expenses from Supabase:", data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('Error fetching expenses from Supabase:', error);
        // Fall back to localStorage
        return JSON.parse(localStorage.getItem('expenseEntries') || '[]');
      }
    } else {
      // Use localStorage as fallback
      console.log("Using localStorage for expenses.");
      return new Promise((resolve) => {
        setTimeout(() => {
          const entries = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
          resolve(entries);
        }, 300);
      });
    }
  },

  getExpensesByPerson: async (personId: number): Promise<ExpenseEntry[]> => {
    if (isSupabaseConfigured()) {
      try {
        await initializeSupabase();
        const { data, error } = await supabase
          .from('expense_entries')
          .select('*')
          .eq('personId', personId);
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching expenses by person from Supabase:', error);
        // Fall back to localStorage
        const entries = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
        return entries.filter(
          (entry: ExpenseEntry) => entry.personId === personId
        );
      }
    } else {
      // Use localStorage as fallback
      return new Promise((resolve) => {
        setTimeout(() => {
          const entries = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
          const filteredEntries = entries.filter(
            (entry: ExpenseEntry) => entry.personId === personId
          );
          resolve(filteredEntries);
        }, 300);
      });
    }
  },

  addExpenseEntry: async (entry: Omit<ExpenseEntry, "id">): Promise<ExpenseEntry> => {
    if (isSupabaseConfigured()) {
      try {
        await initializeSupabase();
        const entries = await api.getAllExpenses();
        const newId = getNewId(entries);
        
        const newEntry: ExpenseEntry = {
          ...entry,
          id: newId,
        };
        
        const { error } = await supabase
          .from('expense_entries')
          .insert(newEntry);
        
        if (error) throw error;
        console.log("Added expense to Supabase:", newEntry);
        toast.success("Transaction saved to cloud database");
        return newEntry;
      } catch (error) {
        console.error('Error adding expense to Supabase:', error);
        toast.error("Failed to save to cloud. Saved locally instead.");
        // Fall back to localStorage
        return new Promise((resolve) => {
          setTimeout(() => {
            const entries = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
            const newEntry: ExpenseEntry = {
              ...entry,
              id: getNewId(entries),
            };
            entries.push(newEntry);
            localStorage.setItem('expenseEntries', JSON.stringify(entries));
            resolve(newEntry);
          }, 300);
        });
      }
    } else {
      // Use localStorage as fallback
      console.log("Using localStorage for adding expense.");
      return new Promise((resolve) => {
        setTimeout(() => {
          const entries = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
          const newEntry: ExpenseEntry = {
            ...entry,
            id: getNewId(entries),
          };
          entries.push(newEntry);
          localStorage.setItem('expenseEntries', JSON.stringify(entries));
          resolve(newEntry);
        }, 300);
      });
    }
  },

  // Summary endpoints
  getPersonSummary: async (personId: number): Promise<PersonSummary> => {
    if (isSupabaseConfigured()) {
      try {
        await initializeSupabase();
        // Get person details
        const { data: personData, error: personError } = await supabase
          .from('persons')
          .select('*')
          .eq('id', personId)
          .single();
        
        if (personError) throw personError;
        
        // Get person's expenses
        const { data: entriesData, error: entriesError } = await supabase
          .from('expense_entries')
          .select('*')
          .eq('personId', personId);
        
        if (entriesError) throw entriesError;
        
        const person = personData;
        const personEntries = entriesData || [];
        
        const totalCredit = personEntries
          .filter((entry: ExpenseEntry) => entry.type === "Credit")
          .reduce((sum: number, entry: ExpenseEntry) => sum + entry.amount, 0);
        
        const totalDebit = personEntries
          .filter((entry: ExpenseEntry) => entry.type === "Debit")
          .reduce((sum: number, entry: ExpenseEntry) => sum + entry.amount, 0);
        
        if (!person) {
          throw new Error("Person not found");
        }
        
        return {
          id: person.id,
          name: person.name,
          totalCredit,
          totalDebit,
          balance: totalCredit - totalDebit,
        };
      } catch (error) {
        console.error('Error calculating person summary from Supabase:', error);
        // Fall back to localStorage
        return new Promise((resolve) => {
          setTimeout(() => {
            const persons = JSON.parse(localStorage.getItem('persons') || '[]');
            const entries = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
            
            const person = persons.find((p: Person) => p.id === personId);
            const personEntries = entries.filter((entry: ExpenseEntry) => entry.personId === personId);
            
            const totalCredit = personEntries
              .filter((entry: ExpenseEntry) => entry.type === "Credit")
              .reduce((sum: number, entry: ExpenseEntry) => sum + entry.amount, 0);
            
            const totalDebit = personEntries
              .filter((entry: ExpenseEntry) => entry.type === "Debit")
              .reduce((sum: number, entry: ExpenseEntry) => sum + entry.amount, 0);
            
            if (!person) {
              throw new Error("Person not found");
            }
            
            resolve({
              id: person.id,
              name: person.name,
              totalCredit,
              totalDebit,
              balance: totalCredit - totalDebit,
            });
          }, 300);
        });
      }
    } else {
      // Use localStorage as fallback
      return new Promise((resolve) => {
        setTimeout(() => {
          const persons = JSON.parse(localStorage.getItem('persons') || '[]');
          const entries = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
          
          const person = persons.find((p: Person) => p.id === personId);
          const personEntries = entries.filter((entry: ExpenseEntry) => entry.personId === personId);
          
          const totalCredit = personEntries
            .filter((entry: ExpenseEntry) => entry.type === "Credit")
            .reduce((sum: number, entry: ExpenseEntry) => sum + entry.amount, 0);
          
          const totalDebit = personEntries
            .filter((entry: ExpenseEntry) => entry.type === "Debit")
            .reduce((sum: number, entry: ExpenseEntry) => sum + entry.amount, 0);
          
          if (!person) {
            throw new Error("Person not found");
          }
          
          resolve({
            id: person.id,
            name: person.name,
            totalCredit,
            totalDebit,
            balance: totalCredit - totalDebit,
          });
        }, 300);
      });
    }
  },

  getFactorySummary: async (): Promise<FactorySummary> => {
    if (isSupabaseConfigured()) {
      try {
        await initializeSupabase();
        const { data: entriesData, error: entriesError } = await supabase
          .from('expense_entries')
          .select('*');
        
        if (entriesError) throw entriesError;
        
        const entries = entriesData || [];
        
        const totalCredit = entries
          .filter((entry: ExpenseEntry) => entry.type === "Credit")
          .reduce((sum: number, entry: ExpenseEntry) => sum + entry.amount, 0);
        
        const totalDebit = entries
          .filter((entry: ExpenseEntry) => entry.type === "Debit")
          .reduce((sum: number, entry: ExpenseEntry) => sum + entry.amount, 0);
        
        return {
          totalCredit,
          totalDebit,
          balance: totalCredit - totalDebit,
        };
      } catch (error) {
        console.error('Error calculating factory summary from Supabase:', error);
        // Fall back to localStorage
        return new Promise((resolve) => {
          setTimeout(() => {
            const entries = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
            
            const totalCredit = entries
              .filter((entry: ExpenseEntry) => entry.type === "Credit")
              .reduce((sum: number, entry: ExpenseEntry) => sum + entry.amount, 0);
            
            const totalDebit = entries
              .filter((entry: ExpenseEntry) => entry.type === "Debit")
              .reduce((sum: number, entry: ExpenseEntry) => sum + entry.amount, 0);
            
            resolve({
              totalCredit,
              totalDebit,
              balance: totalCredit - totalDebit,
            });
          }, 300);
        });
      }
    } else {
      // Use localStorage as fallback
      return new Promise((resolve) => {
        setTimeout(() => {
          const entries = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
          
          const totalCredit = entries
            .filter((entry: ExpenseEntry) => entry.type === "Credit")
            .reduce((sum: number, entry: ExpenseEntry) => sum + entry.amount, 0);
          
          const totalDebit = entries
            .filter((entry: ExpenseEntry) => entry.type === "Debit")
            .reduce((sum: number, entry: ExpenseEntry) => sum + entry.amount, 0);
          
          resolve({
            totalCredit,
            totalDebit,
            balance: totalCredit - totalDebit,
          });
        }, 300);
      });
    }
  },
};
