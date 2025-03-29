
export interface Person {
  id: number;
  name: string;
  expenseEntries?: ExpenseEntry[];
}

export interface ExpenseEntry {
  id: number;
  personId: number;
  person?: Person;
  date: string;
  amount: number;
  type: "Debit" | "Credit";
  description?: string;
}

export interface PersonSummary {
  id: number;
  name: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

export interface FactorySummary {
  totalDebit: number;
  totalCredit: number;
  balance: number;
}
