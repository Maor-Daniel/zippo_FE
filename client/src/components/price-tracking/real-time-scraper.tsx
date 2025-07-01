import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  RefreshCw, 
  Store, 
  Clock, 
  TrendingDown, 
  TrendingUp,
  Play,
  Pause,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ScrapedPrice {
  productName: string;
  price: number;
  storeName: string;
  storeId: string;
  url: string;
  isOnSale: boolean;
  originalPrice?: number;
}

interface ScrapingStatus {
  isRunning: boolean;
  isScheduled: boolean;
  lastRun?: string;
  nextRun?: string;
}

export default function RealTimeScraper() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Available stores for scraping
  const availableStores = [
    { id: "shufersal", name: "Shufersal", color: "bg-blue-500" },
    { id: "rami_levy", name: "Rami Levy", color: "bg-green-500" },
    { id: "mega", name: "Mega", color: "bg-purple-500" },
    { id: "osher_ad", name: "Osher Ad", color: "bg-orange-500" }
  ];

  // Get scraping status
  const { data: scrapingStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/scrape/status'],
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  // Manual product scraping mutation
  const scrapeMutation = useMutation({
    mutationFn: async ({ productName, storeIds }: { productName: string; storeIds?: string[] }) => {
      return apiRequest('/api/scrape/product', 'POST', { productName, storeIds });
    },
    onSuccess: (data) => {
      toast({
        title: "Scraping Complete",
        description: `Found ${data.count} prices for ${searchTerm}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/prices'] });
    },
    onError: (error: any) => {
      toast({
        title: "Scraping Failed",
        description: error.message || "Failed to scrape prices",
        variant: "destructive"
      });
    }
  });

  // Start/stop scheduled scraping mutations
  const startScheduledMutation = useMutation({
    mutationFn: () => apiRequest('/api/scrape/start-scheduled', 'POST'),
    onSuccess: () => {
      toast({ title: "Scheduled Scraping Started", description: "Automatic price updates every 6 hours" });
      queryClient.invalidateQueries({ queryKey: ['/api/scrape/status'] });
    }
  });

  const stopScheduledMutation = useMutation({
    mutationFn: () => apiRequest('/api/scrape/stop-scheduled', 'POST'),
    onSuccess: () => {
      toast({ title: "Scheduled Scraping Stopped", description: "Automatic updates disabled" });
      queryClient.invalidateQueries({ queryKey: ['/api/scrape/status'] });
    }
  });

  // Run immediate scraping
  const runNowMutation = useMutation({
    mutationFn: () => apiRequest('/api/scrape/run-now', 'POST'),
    onSuccess: () => {
      toast({ title: "Background Scraping Started", description: "Updating all product prices" });
      queryClient.invalidateQueries({ queryKey: ['/api/scrape/status'] });
    }
  });

  const handleManualScrape = () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search term required",
        description: "Please enter a product name to search for",
        variant: "destructive"
      });
      return;
    }

    scrapeMutation.mutate({
      productName: searchTerm,
      storeIds: selectedStores.length > 0 ? selectedStores : undefined
    });
  };

  const toggleStoreSelection = (storeId: string) => {
    setSelectedStores(prev => 
      prev.includes(storeId) 
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Price Scraping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Scraping</TabsTrigger>
              <TabsTrigger value="automated">Automated System</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <Alert>
                <Search className="h-4 w-4" />
                <AlertDescription>
                  Search for specific products across Israeli grocery stores to get real-time prices.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {/* Search Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter product name (e.g., חלב, לחם, ביצים)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualScrape()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleManualScrape}
                    disabled={scrapeMutation.isPending || !searchTerm.trim()}
                    className="min-w-[120px]"
                  >
                    {scrapeMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Scraping...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Scrape Prices
                      </>
                    )}
                  </Button>
                </div>

                {/* Store Selection */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Select Stores (optional - all stores if none selected):</h4>
                  <div className="flex flex-wrap gap-2">
                    {availableStores.map((store) => (
                      <Badge
                        key={store.id}
                        variant={selectedStores.includes(store.id) ? "default" : "outline"}
                        className={`cursor-pointer transition-colors ${
                          selectedStores.includes(store.id) ? store.color : ""
                        }`}
                        onClick={() => toggleStoreSelection(store.id)}
                      >
                        <Store className="h-3 w-3 mr-1" />
                        {store.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Scraping Progress */}
                {scrapeMutation.isPending && (
                  <div className="space-y-2">
                    <Progress value={undefined} className="w-full" />
                    <p className="text-sm text-gray-600 text-center">
                      Scraping prices from {selectedStores.length || availableStores.length} stores...
                    </p>
                  </div>
                )}

                {/* Results */}
                {scrapeMutation.data && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-green-700">
                        <TrendingDown className="h-4 w-4" />
                        <span className="font-medium">
                          Successfully scraped {scrapeMutation.data.count} prices for "{searchTerm}"
                        </span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Prices have been updated in your database and are now available for comparison.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="automated" className="space-y-4">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Automated system runs every 6 hours to keep all product prices up-to-date.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">System Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {statusLoading ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Loading status...
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Scheduled Scraping:</span>
                          <Badge variant={scrapingStatus?.isScheduled ? "default" : "secondary"}>
                            {scrapingStatus?.isScheduled ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Currently Running:</span>
                          <Badge variant={scrapingStatus?.isRunning ? "default" : "outline"}>
                            {scrapingStatus?.isRunning ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Controls Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-col gap-2">
                      {scrapingStatus?.isScheduled ? (
                        <Button
                          variant="outline"
                          onClick={() => stopScheduledMutation.mutate()}
                          disabled={stopScheduledMutation.isPending}
                          className="w-full"
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Stop Scheduled Updates
                        </Button>
                      ) : (
                        <Button
                          onClick={() => startScheduledMutation.mutate()}
                          disabled={startScheduledMutation.isPending}
                          className="w-full"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Scheduled Updates
                        </Button>
                      )}
                      
                      <Button
                        variant="secondary"
                        onClick={() => runNowMutation.mutate()}
                        disabled={runNowMutation.isPending || scrapingStatus?.isRunning}
                        className="w-full"
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Run Update Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Info */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Automatically scrapes prices from major Israeli grocery stores</li>
                    <li>• Updates your database with current pricing information</li>
                    <li>• Maintains price history for trend analysis</li>
                    <li>• Runs respectfully with delays to avoid overloading store websites</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}