import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PriceHistoryChart from "@/components/price-tracking/price-history-chart";
import PriceAlertForm from "@/components/price-tracking/price-alert-form";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function PriceAlerts() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);
  const [isCreateAlertDialogOpen, setIsCreateAlertDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      toast({
        title: "Authentication required",
        description: "Please log in to manage your price alerts.",
        variant: "destructive",
      });
    }
  }, [user, authLoading, navigate]);

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["/api/alerts"],
    enabled: !!user,
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products/search"],
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/alerts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert deleted",
        description: "Your price alert has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete alert: ${error}`,
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
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
        <h1 className="text-3xl font-bold text-gray-900">Price Alerts</h1>
        <Dialog open={isCreateAlertDialogOpen} onOpenChange={setIsCreateAlertDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create a New Price Alert</DialogTitle>
            </DialogHeader>
            <PriceAlertForm 
              products={products || []} 
              onSuccess={() => {
                setIsCreateAlertDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      ) : alerts?.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">No Price Alerts</h3>
            <p className="text-gray-500 mt-2 mb-4">You haven't set up any price alerts yet. Create your first alert to get notified of price drops.</p>
            <Button onClick={() => setIsCreateAlertDialogOpen(true)}>Create Your First Alert</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your Price Alerts</CardTitle>
                <CardDescription>
                  You'll be notified when prices drop below your target.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert: any) => (
                    <div key={alert.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg">
                            <button 
                              onClick={() => setSelectedProductName(alert.productName)}
                              className="hover:text-primary"
                            >
                              {alert.productName}
                            </button>
                          </h3>
                          <p className="text-sm text-gray-500">Target price: ${Number(alert.targetPrice).toFixed(2)}</p>
                          <div className="flex items-center mt-1 space-x-2">
                            {alert.emailAlert && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Email</span>
                            )}
                            {alert.pushAlert && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Push</span>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => deleteAlertMutation.mutate(alert.id)}
                          disabled={deleteAlertMutation.isPending}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsCreateAlertDialogOpen(true)}
                >
                  Add Another Alert
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            {selectedProductName ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Price History: {selectedProductName}</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedProductName(null)}
                    >
                      Close
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <PriceHistoryChart productName={selectedProductName} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Track Price Changes</CardTitle>
                  <CardDescription>
                    Select an alert from the list to view its price history.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium">No Product Selected</h3>
                  <p className="text-gray-500 mt-2">Click on a product name from your alerts to view its price history.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <div className="mt-12 bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Price Alert Features</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Get the most out of our price tracking system.
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img 
                className="w-full h-auto rounded-lg shadow-lg" 
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=600&q=80" 
                alt="Person comparing prices on a tablet" 
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Price Alert Features</h3>
              <ul className="space-y-3">
                <li className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Get notified when prices drop on items you're tracking</span>
                </li>
                <li className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">See historical price trends to plan your purchases</span>
                </li>
                <li className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Receive weekly summaries of potential savings</span>
                </li>
                <li className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Compare seasonal price patterns</span>
                </li>
                <li className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Get suggestions on the best time to buy</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
