
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { ExpenseEntry, PersonSummary } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import TransactionTable from "./TransactionTable";

interface PersonDetailProps {
  personId: number;
}

const PersonDetail: React.FC<PersonDetailProps> = ({ personId }) => {
  const [transactions, setTransactions] = useState<ExpenseEntry[]>([]);
  const [summary, setSummary] = useState<PersonSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState<ExpenseEntry[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [transactionsData, summaryData] = await Promise.all([
          api.getExpensesByPerson(personId),
          api.getPersonSummary(personId),
        ]);
        setTransactions(transactionsData);
        setFilteredTransactions(transactionsData);
        setSummary(summaryData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch person data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [personId, toast]);

  const handleFilter = () => {
    let filtered = [...transactions];

    if (startDate) {
      filtered = filtered.filter(
        (transaction) => new Date(transaction.date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (transaction) => new Date(transaction.date) <= new Date(endDate)
      );
    }

    setFilteredTransactions(filtered);

    // Recalculate summary based on filtered transactions
    const totalCredit = filtered
      .filter((entry) => entry.type === "Credit")
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalDebit = filtered
      .filter((entry) => entry.type === "Debit")
      .reduce((sum, entry) => sum + entry.amount, 0);

    if (summary) {
      setSummary({
        ...summary,
        totalCredit,
        totalDebit,
        balance: totalCredit - totalDebit,
      });
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilteredTransactions(transactions);

    // Reset summary to original
    api.getPersonSummary(personId).then(setSummary);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-factory-blue">
          {summary ? summary.name : "Person"} - Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-green-600 mb-1">Total Credits</h3>
              <p className="text-xl font-bold text-green-700">
                ₹{summary?.totalCredit.toFixed(2) || "0.00"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-red-600 mb-1">Total Debits</h3>
              <p className="text-xl font-bold text-red-700">
                ₹{summary?.totalDebit.toFixed(2) || "0.00"}
              </p>
            </CardContent>
          </Card>

          <Card className={`${
            summary?.balance && summary.balance >= 0
              ? "bg-blue-50 border-blue-200"
              : "bg-amber-50 border-amber-200"
          }`}>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-factory-blue mb-1">Balance</h3>
              <p className={`text-xl font-bold ${
                summary?.balance && summary.balance >= 0
                  ? "text-factory-blue"
                  : "text-amber-700"
              }`}>
                ₹{summary?.balance.toFixed(2) || "0.00"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="flex flex-col md:flex-row items-end gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-full md:w-auto flex-1">
              <Label htmlFor="personStartDate" className="mb-2">Start Date</Label>
              <Input
                id="personStartDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="w-full md:w-auto flex-1">
              <Label htmlFor="personEndDate" className="mb-2">End Date</Label>
              <Input
                id="personEndDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleFilter}
                className="bg-cardboard hover:bg-cardboard-dark"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button 
                variant="outline" 
                onClick={clearFilters}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        <TransactionTable
          transactions={filteredTransactions}
          showPerson={false}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default PersonDetail;
