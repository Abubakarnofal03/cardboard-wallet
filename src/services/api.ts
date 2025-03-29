
import { ExpenseEntry, FactorySummary, Person, PersonSummary } from "@/types";

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

export const api = {
  // Person endpoints
  getAllPersons: async (): Promise<Person[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const persons = JSON.parse(localStorage.getItem('persons') || '[]');
        resolve(persons);
      }, 300);
    });
  },

  addPerson: async (name: string): Promise<Person> => {
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
  },

  // Expense entry endpoints
  getAllExpenses: async (): Promise<ExpenseEntry[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const entries = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
        resolve(entries);
      }, 300);
    });
  },

  getExpensesByPerson: async (personId: number): Promise<ExpenseEntry[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const entries = JSON.parse(localStorage.getItem('expenseEntries') || '[]');
        const filteredEntries = entries.filter(
          (entry: ExpenseEntry) => entry.personId === personId
        );
        resolve(filteredEntries);
      }, 300);
    });
  },

  addExpenseEntry: async (entry: Omit<ExpenseEntry, "id">): Promise<ExpenseEntry> => {
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
  },

  // Summary endpoints
  getPersonSummary: async (personId: number): Promise<PersonSummary> => {
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
  },

  getFactorySummary: async (): Promise<FactorySummary> => {
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
  },
};
