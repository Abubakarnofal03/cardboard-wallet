
import { ExpenseEntry, FactorySummary, Person, PersonSummary } from "@/types";

// Mock data for persons
let persons: Person[] = [
  { id: 1, name: "John Smith (Worker)" },
  { id: 2, name: "Jane Doe (Shareholder)" },
  { id: 3, name: "Bob Johnson (Supplier)" },
  { id: 4, name: "Alice Williams (Manager)" },
];

// Mock data for expense entries
let expenseEntries: ExpenseEntry[] = [
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

// Generate a new ID for entities
const getNewId = (items: { id: number }[]): number => {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
};

// Simulate API calls
export const api = {
  // Person endpoints
  getAllPersons: async (): Promise<Person[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...persons]);
      }, 300);
    });
  },

  addPerson: async (name: string): Promise<Person> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPerson: Person = {
          id: getNewId(persons),
          name,
        };
        persons.push(newPerson);
        resolve(newPerson);
      }, 300);
    });
  },

  // Expense entry endpoints
  getAllExpenses: async (): Promise<ExpenseEntry[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...expenseEntries]);
      }, 300);
    });
  },

  getExpensesByPerson: async (personId: number): Promise<ExpenseEntry[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredEntries = expenseEntries.filter(
          (entry) => entry.personId === personId
        );
        resolve(filteredEntries);
      }, 300);
    });
  },

  addExpenseEntry: async (entry: Omit<ExpenseEntry, "id">): Promise<ExpenseEntry> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newEntry: ExpenseEntry = {
          ...entry,
          id: getNewId(expenseEntries),
        };
        expenseEntries.push(newEntry);
        resolve(newEntry);
      }, 300);
    });
  },

  // Summary endpoints
  getPersonSummary: async (personId: number): Promise<PersonSummary> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const person = persons.find((p) => p.id === personId);
        const entries = expenseEntries.filter((entry) => entry.personId === personId);
        
        const totalCredit = entries
          .filter((entry) => entry.type === "Credit")
          .reduce((sum, entry) => sum + entry.amount, 0);
        
        const totalDebit = entries
          .filter((entry) => entry.type === "Debit")
          .reduce((sum, entry) => sum + entry.amount, 0);
        
        const balance = totalCredit - totalDebit;
        
        if (!person) {
          throw new Error("Person not found");
        }
        
        resolve({
          id: person.id,
          name: person.name,
          totalCredit,
          totalDebit,
          balance,
        });
      }, 300);
    });
  },

  getFactorySummary: async (): Promise<FactorySummary> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const totalCredit = expenseEntries
          .filter((entry) => entry.type === "Credit")
          .reduce((sum, entry) => sum + entry.amount, 0);
        
        const totalDebit = expenseEntries
          .filter((entry) => entry.type === "Debit")
          .reduce((sum, entry) => sum + entry.amount, 0);
        
        const balance = totalCredit - totalDebit;
        
        resolve({
          totalCredit,
          totalDebit,
          balance,
        });
      }, 300);
    });
  },
};
