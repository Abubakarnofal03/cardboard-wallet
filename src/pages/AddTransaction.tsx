
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { Person } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const transactionSchema = z.object({
  personId: z.string().min(1, "Person is required"),
  date: z.string().min(1, "Date is required"),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    {
      message: "Amount must be a positive number",
    }
  ),
  type: z.enum(["Credit", "Debit"], {
    required_error: "Transaction type is required",
  }),
  description: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

const AddTransaction: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [showNewPersonInput, setShowNewPersonInput] = useState(false);
  const { toast } = useToast();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      amount: "",
      type: "Credit",
      description: "",
    },
  });

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const data = await api.getAllPersons();
        setPersons(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch persons",
        });
      }
    };

    fetchPersons();
  }, [toast]);

  const onSubmit = async (values: TransactionFormValues) => {
    setIsLoading(true);
    try {
      await api.addExpenseEntry({
        personId: parseInt(values.personId),
        date: values.date,
        amount: parseFloat(values.amount),
        type: values.type,
        description: values.description,
      });

      toast({
        title: "Success",
        description: "Transaction added successfully",
      });

      form.reset({
        personId: "",
        date: new Date().toISOString().slice(0, 10),
        amount: "",
        type: "Credit",
        description: "",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add transaction",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNewPerson = async () => {
    if (!newPersonName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Person name cannot be empty",
      });
      return;
    }

    try {
      const newPerson = await api.addPerson(newPersonName);
      setPersons([...persons, newPerson]);
      form.setValue("personId", newPerson.id.toString());
      setNewPersonName("");
      setShowNewPersonInput(false);
      
      toast({
        title: "Success",
        description: `Person "${newPerson.name}" added successfully`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add new person",
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-factory-blue">Add Transaction</CardTitle>
        <CardDescription>
          Enter the details of the new transaction for the cardboard factory.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Person</FormLabel>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-cardboard"
                    onClick={() => setShowNewPersonInput(!showNewPersonInput)}
                  >
                    {showNewPersonInput ? "Select Existing" : "Add New Person"}
                  </Button>
                </div>

                {showNewPersonInput ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter new person name"
                      value={newPersonName}
                      onChange={(e) => setNewPersonName(e.target.value)}
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddNewPerson}
                      className="bg-cardboard hover:bg-cardboard-dark text-white"
                    >
                      Add
                    </Button>
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="personId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a person" />
                            </SelectTrigger>
                            <SelectContent>
                              {persons.map((person) => (
                                <SelectItem
                                  key={person.id}
                                  value={person.id.toString()}
                                >
                                  {person.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Transaction Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-6"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Credit" />
                          </FormControl>
                          <FormLabel className="font-normal text-green-600">
                            Credit (Money In)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Debit" />
                          </FormControl>
                          <FormLabel className="font-normal text-red-600">
                            Debit (Money Out)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter transaction details..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-factory-blue hover:bg-factory-blue/90"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Transaction"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddTransaction;
