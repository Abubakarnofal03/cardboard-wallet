
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { ExpenseEntry, FactorySummary as FactorySummaryType } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Calendar, DollarSign, Filter, TrendingDown, TrendingUp } from "lucide-react";
import TransactionTable from "@/components/TransactionTable";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const FactorySummary: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [summary, setSummary] = useState<FactorySummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseEntry[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [expensesData, summaryData] = await Promise.all([
          api.getAllExpenses(),
          api.getFactorySummary(),
        ]);
        setExpenses(expensesData);
        setFilteredExpenses(expensesData);
        setSummary(summaryData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch factory data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleFilter = () => {
    let filtered = [...expenses];

    if (startDate) {
      filtered = filtered.filter(
        (expense) => new Date(expense.date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (expense) => new Date(expense.date) <= new Date(endDate)
      );
    }

    setFilteredExpenses(filtered);

    // Calculate filtered summary
    const totalCredit = filtered
      .filter((entry) => entry.type === "Credit")
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalDebit = filtered
      .filter((entry) => entry.type === "Debit")
      .reduce((sum, entry) => sum + entry.amount, 0);

    setSummary({
      totalCredit,
      totalDebit,
      balance: totalCredit - totalDebit,
    });
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilteredExpenses(expenses);

    // Reset to original summary
    api.getFactorySummary().then(setSummary);
  };

  // Prepare chart data
  const chartData = [
    { name: 'Credits', value: summary?.totalCredit || 0, color: '#4CAF50' },
    { name: 'Debits', value: summary?.totalDebit || 0, color: '#F44336' },
    { name: 'Balance', value: summary?.balance || 0, color: '#1A365D' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-factory-blue flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-cardboard" />
            Factory Summary
          </CardTitle>
          <CardDescription>
            Overview of all factory transactions and financial status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-green-600 mb-1">Total Credits</p>
                        <h3 className="text-2xl font-bold text-green-700">
                          ₹{summary?.totalCredit.toFixed(2) || "0.00"}
                        </h3>
                      </div>
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-red-600 mb-1">Total Debits</p>
                        <h3 className="text-2xl font-bold text-red-700">
                          ₹{summary?.totalDebit.toFixed(2) || "0.00"}
                        </h3>
                      </div>
                      <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                        <TrendingDown className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={summary?.balance && summary.balance >= 0 ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200"}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-factory-blue mb-1">Net Balance</p>
                        <h3 className={`text-2xl font-bold ${
                          summary?.balance && summary.balance >= 0
                            ? "text-factory-blue"
                            : "text-amber-700"
                        }`}>
                          ₹{summary?.balance.toFixed(2) || "0.00"}
                        </h3>
                      </div>
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-factory-blue" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`₹${value}`, ""]}
                        labelStyle={{ color: '#333' }}
                        contentStyle={{ backgroundColor: 'white', border: '1px solid #ddd' }}
                      />
                      <Bar dataKey="value">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          <div className="mb-6">
            <div className="flex flex-col md:flex-row items-end gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-full md:w-auto flex-1">
                <Label htmlFor="startDate" className="mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="w-full md:w-auto flex-1">
                <Label htmlFor="endDate" className="mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  End Date
                </Label>
                <Input
                  id="endDate"
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
            transactions={filteredExpenses}
            showPerson={true}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FactorySummary;
