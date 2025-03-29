
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { Person, PersonSummary } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PersonDetail from "@/components/PersonDetail";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const PersonList: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [summaries, setSummaries] = useState<Record<number, PersonSummary>>({});
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        setIsLoading(true);
        const data = await api.getAllPersons();
        setPersons(data);
        
        // Fetch summaries for all persons
        const summariesObj: Record<number, PersonSummary> = {};
        for (const person of data) {
          try {
            const summary = await api.getPersonSummary(person.id);
            summariesObj[person.id] = summary;
          } catch (error) {
            console.error(`Failed to fetch summary for person ${person.id}`, error);
          }
        }
        setSummaries(summariesObj);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch persons",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersons();
  }, [toast]);

  const handlePersonClick = (personId: number) => {
    setSelectedPersonId(personId === selectedPersonId ? null : personId);
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-green-600";
    if (balance < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-factory-blue flex items-center">
            <Users className="h-6 w-6 mr-2 text-cardboard" />
            Person List
          </CardTitle>
          <CardDescription>
            Select a person to view their transaction details and summary.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {persons.length === 0 ? (
                <p className="text-center py-4 text-gray-500">No persons found. Add a person when creating a transaction.</p>
              ) : (
                persons.map((person) => {
                  const summary = summaries[person.id];
                  return (
                    <Button
                      key={person.id}
                      variant="outline"
                      className={`w-full flex justify-between items-center p-4 text-left h-auto ${
                        selectedPersonId === person.id
                          ? "border-cardboard bg-cardboard/10"
                          : ""
                      }`}
                      onClick={() => handlePersonClick(person.id)}
                    >
                      <span className="font-medium">{person.name}</span>
                      {summary && (
                        <span
                          className={`font-semibold ${getBalanceColor(
                            summary.balance
                          )}`}
                        >
                          Balance: ₹{summary.balance.toFixed(2)}
                        </span>
                      )}
                    </Button>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPersonId && <PersonDetail personId={selectedPersonId} />}
    </div>
  );
};

export default PersonList;
