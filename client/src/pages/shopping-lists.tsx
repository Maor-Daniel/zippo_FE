import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ListCreator from "@/components/shopping-list/list-creator";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

const createListSchema = z.object({
  name: z.string().min(1, { message: "List name is required" }),
});

export default function ShoppingLists() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedList, setSelectedList] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: lists, isLoading, error } = useQuery({
    queryKey: ["/api/lists"],
  });

  const { data: selectedListData } = useQuery({
    queryKey: ["/api/lists", selectedList],
    enabled: !!selectedList,
  });

  const createListMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await apiRequest("POST", "/api/lists", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "List created",
        description: "Your shopping list has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create list: ${error}`,
        variant: "destructive",
      });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/lists/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/lists"] });
      if (selectedList === id) {
        setSelectedList(null);
      }
      toast({
        title: "List deleted",
        description: "Your shopping list has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete list: ${error}`,
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof createListSchema>>({
    resolver: zodResolver(createListSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (data: z.infer<typeof createListSchema>) => {
    createListMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Shopping Lists</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Shopping List</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>List Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Weekly Groceries" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createListMutation.isPending} className="w-full">
                  {createListMutation.isPending ? "Creating..." : "Create List"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Error Loading Lists</h3>
            <p className="text-gray-500 mt-2 mb-4">There was an error loading your shopping lists. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      ) : !lists || !Array.isArray(lists) || lists.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">No Lists Found</h3>
            <p className="text-gray-500 mt-2 mb-4">You don't have any shopping lists yet. Create your first list to get started.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>Create Your First List</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(lists) && lists.map((list: any, index: number) => {
            const listId = list.id || index + 1;
            const createdDate = list.createdAt?.seconds 
              ? new Date(list.createdAt.seconds * 1000).toLocaleDateString()
              : new Date().toLocaleDateString();
            
            return (
              <Card key={listId} className={`hover:shadow-md transition-shadow ${selectedList === listId ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <CardTitle>{list.name || 'Untitled List'}</CardTitle>
                  <CardDescription>
                    Created on {createdDate}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setSelectedList(listId)}>
                    View List
                  </Button>
                  <Button variant="destructive" onClick={() => deleteListMutation.mutate(listId)} disabled={deleteListMutation.isPending}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {selectedList && selectedListData && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedListData.name}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setSelectedList(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ListCreator listId={selectedList} existingItems={selectedListData.items} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
