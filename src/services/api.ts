import { ExpenseEntry, FactorySummary, Person, PersonSummary } from "@/types";
import { supabase, isSupabaseConfigured } from './supabase';

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
  if (!supabase) {
    console.warn('Supabase client not initialized. Using localStorage fallback.');
    return false;
  }

  try {
    // Check if tables exist, create them if they don't
    const { error: personsError } = await supabase
      .from('persons')
      .select('count')
      .limit(1);

    if (personsError) {
      // Table might not exist, create it
      await supabase.rpc('create_persons_table');
    }

    const { error: expensesError } = await supabase
      .from('expense_entries')
      .select('count')
      .limit(1);

    if (expensesError) {
      // Table might not exist, create it
      await supabase.rpc('create_expense_entries_table');
    }

    // Check if we have any persons data
    const { data: persons } = await supabase
      .from('persons')
      .select('*');

    // If no persons exist, seed with default data
    if (!persons || persons.length === 0) {
      const defaultPersons = JSON.parse(localStorage.getItem('persons') || '[]');
      for (const person of defaultPersons) {
        await supabase
          .from('persons')
          .insert(person);
      }
    }

    // Check if we have any expense entries
    const { data: entries } = await supabase
      .from('expense_entries')
      .select('*');

    // If no entries exist, seed with default data
    if (!entries || entries.length === 0) {
      const defaultEntries = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
      for (const entry of defaultEntries) {
        await supabase
          .from('expense_entries')
          .insert(entry);
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return false;
  }
};

// API methods that work with either Supabase or localStorage
export const api = {
  // Person endpoints
  getAllPersons: async (): Promise<Person[]> => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await initializeSupabase();
        const { data, error } = await supabase
          .from('persons')
          .select('*');
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching persons from Supabase:', error);
        // Fall back to localStorage
        return JSON.parse(localStorage.getItem('persons') || '[]');
      }
    } else {
      // Use localStorage as fallback
      return new Promise((resolve) => {
        setTimeout(() => {
          const persons = JSON.parse(localStorage.getItem('persons') || '[]');
          resolve(persons);
        }, 300);
      });
    }
  },

  addPerson: async (name: string): Promise<Person> => {
    if (isSupabaseConfigured() && supabase) {
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
    if (isSupabaseConfigured() && supabase) {
      try {
        await initializeSupabase();
        const { data, error } = await supabase
          .from('expense_entries')
          .select('*');
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching expenses from Supabase:', error);
        // Fall back to localStorage
        return JSON.parse(localStorage.getItem('expenseEntries') || '[]');
      }
    } else {
      // Use localStorage as fallback
      return new Promise((resolve) => {
        setTimeout(() => {
          const entries = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
          resolve(entries);
        }, 300);
      });
    }
  },

  getExpensesByPerson: async (personId: number): Promise<ExpenseEntry[]> => {
    if (isSupabaseConfigured() && supabase) {
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
    if (isSupabaseConfigured() && supabase) {
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
        return newEntry;
      } catch (error) {
        console.error('Error adding expense to Supabase:', error);
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
    if (isSupabaseConfigured() && supabase) {
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
    if (isSupabaseConfigured() && supabase) {
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
