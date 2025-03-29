
import { ExpenseEntry, FactorySummary, Person, PersonSummary } from "@/types";
import { supabase, TABLES, migrateLocalDataToSupabase } from "@/lib/supabase";

// Initialize localStorage with default data if empty
const initializeLocalStorage = async () => {
  // Check if we have data in Supabase first
  const { data: persons, error: personsError } = await supabase
    .from(TABLES.PERSONS)
    .select('*');

  if (personsError || !persons || persons.length === 0) {
    // No data in Supabase, use default data
    const defaultPersons = [
      { id: 1, name: "John Smith (Worker)" },
      { id: 2, name: "Jane Doe (Shareholder)" },
      { id: 3, name: "Bob Johnson (Supplier)" },
      { id: 4, name: "Alice Williams (Manager)" },
    ];

    const { error } = await supabase
      .from(TABLES.PERSONS)
      .upsert(defaultPersons);
      
    if (error) {
      console.error('Error initializing persons data:', error);
      // Fallback to localStorage
      localStorage.setItem('persons', JSON.stringify(defaultPersons));
    }
  }

  const { data: expenseEntries, error: expensesError } = await supabase
    .from(TABLES.EXPENSE_ENTRIES)
    .select('*');

  if (expensesError || !expenseEntries || expenseEntries.length === 0) {
    // No data in Supabase, use default data
    const defaultEntries = [
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
    ];

    const { error } = await supabase
      .from(TABLES.EXPENSE_ENTRIES)
      .upsert(defaultEntries);
      
    if (error) {
      console.error('Error initializing expense entries data:', error);
      // Fallback to localStorage
      localStorage.setItem('expenseEntries', JSON.stringify(defaultEntries));
    }
  }
};

// Initialize data when the app loads
initializeLocalStorage();

// Helper to get new ID
const getNewId = async (table: string): Promise<number> => {
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .order('id', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return 1;
  }
  
  return data[0].id + 1;
};

// Helper to fallback to localStorage if Supabase fails
const getLocalData = (key: string) => {
  return JSON.parse(localStorage.getItem(key) || '[]');
};

export const api = {
  // Person endpoints
  getAllPersons: async (): Promise<Person[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.PERSONS)
        .select('*')
        .order('id');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching persons:', error);
      // Fallback to localStorage
      return getLocalData('persons');
    }
  },

  addPerson: async (name: string): Promise<Person> => {
    try {
      const id = await getNewId(TABLES.PERSONS);
      
      const newPerson: Person = {
        id,
        name,
      };
      
      const { error } = await supabase
        .from(TABLES.PERSONS)
        .insert(newPerson);

      if (error) throw error;
      return newPerson;
    } catch (error) {
      console.error('Error adding person:', error);
      // Fallback to localStorage
      const persons = getLocalData('persons');
      const newPerson: Person = {
        id: getNewId(persons),
        name,
      };
      persons.push(newPerson);
      localStorage.setItem('persons', JSON.stringify(persons));
      return newPerson;
    }
  },

  // Expense entry endpoints
  getAllExpenses: async (): Promise<ExpenseEntry[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.EXPENSE_ENTRIES)
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      // Fallback to localStorage
      return getLocalData('expenseEntries');
    }
  },

  getExpensesByPerson: async (personId: number): Promise<ExpenseEntry[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLES.EXPENSE_ENTRIES)
        .select('*')
        .eq('personId', personId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching expenses for person ${personId}:`, error);
      // Fallback to localStorage
      const entries = getLocalData('expenseEntries');
      return entries.filter(
        (entry: ExpenseEntry) => entry.personId === personId
      );
    }
  },

  addExpenseEntry: async (entry: Omit<ExpenseEntry, "id">): Promise<ExpenseEntry> => {
    try {
      const id = await getNewId(TABLES.EXPENSE_ENTRIES);
      
      const newEntry: ExpenseEntry = {
        ...entry,
        id,
      };
      
      const { error } = await supabase
        .from(TABLES.EXPENSE_ENTRIES)
        .insert(newEntry);

      if (error) throw error;
      return newEntry;
    } catch (error) {
      console.error('Error adding expense entry:', error);
      // Fallback to localStorage
      const entries = getLocalData('expenseEntries');
      const newEntry: ExpenseEntry = {
        ...entry,
        id: getNewId(entries),
      };
      entries.push(newEntry);
      localStorage.setItem('expenseEntries', JSON.stringify(entries));
      return newEntry;
    }
  },

  // Summary endpoints
  getPersonSummary: async (personId: number): Promise<PersonSummary> => {
    try {
      // Get person details
      const { data: person, error: personError } = await supabase
        .from(TABLES.PERSONS)
        .select('*')
        .eq('id', personId)
        .single();

      if (personError) throw personError;

      // Get person expenses
      const { data: personEntries, error: entriesError } = await supabase
        .from(TABLES.EXPENSE_ENTRIES)
        .select('*')
        .eq('personId', personId);

      if (entriesError) throw entriesError;
      
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
      console.error(`Error getting summary for person ${personId}:`, error);
      // Fallback to localStorage
      const persons = getLocalData('persons');
      const entries = getLocalData('expenseEntries');
      
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
      
      return {
        id: person.id,
        name: person.name,
        totalCredit,
        totalDebit,
        balance: totalCredit - totalDebit,
      };
    }
  },

  getFactorySummary: async (): Promise<FactorySummary> => {
    try {
      const { data: entries, error } = await supabase
        .from(TABLES.EXPENSE_ENTRIES)
        .select('*');

      if (error) throw error;
      
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
      console.error('Error getting factory summary:', error);
      // Fallback to localStorage
      const entries = getLocalData('expenseEntries');
      
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
    }
  },

  // Helper for migrating local data to Supabase
  migrateLocalDataToSupabase
};
