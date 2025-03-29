
import React, { useState, useEffect } from "react";
import { ExpenseEntry, Person } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api";

interface TransactionTableProps {
  transactions: ExpenseEntry[];
  showPerson: boolean;
  isLoading: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  showPerson, 
  isLoading 
}) => {
  const [persons, setPersons] = useState<Record<number, Person>>({});

  useEffect(() => {
    const fetchPersons = async () => {
      if (!showPerson) return;
      
      try {
        const personsData = await api.getAllPersons();
        const personsRecord: Record<number, Person> = {};
        personsData.forEach((person) => {
          personsRecord[person.id] = person;
        });
        setPersons(personsRecord);
      } catch (error) {
        console.error("Failed to fetch persons for transaction table", error);
      }
    };

    fetchPersons();
  }, [showPerson]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return <p className="text-center py-4 text-gray-500">No transactions found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            {showPerson && <TableHead>Person</TableHead>}
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{formatDate(transaction.date)}</TableCell>
              {showPerson && (
                <TableCell>
                  {persons[transaction.personId]?.name || `Person #${transaction.personId}`}
                </TableCell>
              )}
              <TableCell>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    transaction.type === "Credit"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {transaction.type}
                </span>
              </TableCell>
              <TableCell className={`text-right font-medium ${
                transaction.type === "Credit" ? "text-green-600" : "text-red-600"
              }`}>
                ₹{transaction.amount.toFixed(2)}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {transaction.description || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
