import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

export default function StoreMap() {
  const [maxDistance, setMaxDistance] = useState(10);
  const [location, setLocation] = useState("San Francisco, CA 94103");
  const [selectedStores, setSelectedStores] = useState<{[id: number]: boolean}>({});

  // Fetch stores
  const { data: stores } = useQuery({
    queryKey: ["/api/stores"],
  });

  // Initialize selected stores
  useEffect(() => {
    if (stores && stores.length > 0) {
      const initialSelectedStores = stores.reduce((acc, store) => {
        acc[store.id] = true;
        return acc;
      }, {});
      setSelectedStores(initialSelectedStores);
    }
  }, [stores]);

  const handleStoreToggle = (storeId: number, checked: boolean) => {
    setSelectedStores((prev) => ({
      ...prev,
      [storeId]: checked,
    }));
  };

  const handleDistanceChange = (value: number[]) => {
    setMaxDistance(value[0]);
  };

  const handleSavePreferences = () => {
    // In a real implementation, this would save to the backend
    // For now, we just show a console message
    console.log("Saving preferences:", { maxDistance, selectedStores });
  };

  // Get stores within max distance
  const nearbyStores = stores
    ? stores.filter((store) => Number(store.distance) <= maxDistance)
    : [];

  // Group stores by chain
  const storesByChain = nearbyStores.reduce((groups, store) => {
    if (!groups[store.chain]) {
      groups[store.chain] = [];
    }
    groups[store.chain].push(store);
    return groups;
  }, {});

  const sortedChains = Object.keys(storesByChain).sort();

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="h-80 bg-gray-200 rounded-t-lg relative">
        {/* Using a static map image as placeholder */}
        <img 
          className="w-full h-full object-cover rounded-t-lg" 
          src="https://pixabay.com/get/g2a82bc2dd4ee1970470e199ffee7f43d24669cfb51b8bf1c6d8ea9bf97cfe5078a0f72ab56bf515b192851d1f262baab2794a843ab0d3435311ecfd087364a53_1280.jpg" 
          alt="Map showing store locations" 
        />
        {/* Map controls */}
        <div className="absolute top-4 right-4 bg-white rounded-md shadow p-2">
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 border-t border-gray-200">
        <div className="space-y-4">
          <div>
            <Label htmlFor="location" className="text-sm font-medium text-gray-700">Your Location</Label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <Input
                type="text"
                id="location"
                className="pl-10 pr-12"
                placeholder="Enter your address or zip code"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-full px-3 text-primary bg-primary/10 hover:bg-primary/20"
                >
                  Use Current
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between">
              <Label htmlFor="distance-range" className="text-sm font-medium text-gray-700">Maximum Travel Distance</Label>
              <span className="text-sm font-medium text-gray-700">{maxDistance} miles</span>
            </div>
            <Slider
              id="distance-range"
              value={[maxDistance]}
              min={1}
              max={50}
              step={1}
              onValueChange={handleDistanceChange}
              className="mt-2"
            />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preferred Store Chains</h3>
            <p className="text-sm text-gray-500 mb-4">Select the stores you want to include in price comparisons.</p>
            
            <div className="grid grid-cols-2 gap-4">
              {sortedChains.map((chain) => (
                <div key={chain} className="relative flex items-start">
                  <Checkbox
                    id={`store-chain-${chain}`}
                    checked={storesByChain[chain].every((store) => selectedStores[store.id])}
                    onCheckedChange={(checked) => {
                      storesByChain[chain].forEach((store) => {
                        handleStoreToggle(store.id, !!checked);
                      });
                    }}
                  />
                  <Label
                    htmlFor={`store-chain-${chain}`}
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    {chain}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4">
            <Button className="w-full" onClick={handleSavePreferences}>
              Save Preferences
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardHeader className="border-t border-gray-200">
        <CardTitle className="text-lg">Nearby Stores</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          {nearbyStores
            .filter((store) => selectedStores[store.id])
            .slice(0, 3)
            .map((store) => (
              <div key={store.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{store.name}</p>
                    <p className="text-xs text-gray-500">{store.distance} miles • {store.address}</p>
                  </div>
                </div>
                {store.id === 1 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Best Prices
                  </span>
                )}
              </div>
            ))}
        </div>
      </CardContent>
    </div>
  );
}
