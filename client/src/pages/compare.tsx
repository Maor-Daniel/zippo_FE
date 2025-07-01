import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useShoppingList } from "@/hooks/use-shopping-list";
import { usePriceComparison } from "@/hooks/use-price-comparison";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StoreCard from "@/components/comparison/store-card";
import StoreFilter from "@/components/comparison/store-filter";
import SavingsAnalysis from "@/components/comparison/savings-analysis";
import ListCreator from "@/components/shopping-list/list-creator";

export default function Compare() {
  const [maxDistance, setMaxDistance] = useState(10);
  const [sortBy, setSortBy] = useState<"price" | "distance" | "savings">("price");
  const { listItems, isReady } = useShoppingList();
  const { compareResults, isComparing, compare } = usePriceComparison();
  const [viewMoreStores, setViewMoreStores] = useState(false);

  // Automatically compare when list items change and we have items
  useEffect(() => {
    if (isReady && listItems.length > 0) {
      compare(listItems, maxDistance);
    }
  }, [listItems, maxDistance, isReady]);

  // Handle filter changes
  const handleFilterChange = (distance: number, sort: "price" | "distance" | "savings") => {
    setMaxDistance(distance);
    setSortBy(sort);
  };

  // Sort results based on sortBy
  const sortedResults = compareResults ? [...compareResults] : [];
  if (sortedResults.length) {
    if (sortBy === "price") {
      sortedResults.sort((a, b) => a.totalPrice - b.totalPrice);
    } else if (sortBy === "distance") {
      sortedResults.sort((a, b) => Number(a.distance) - Number(b.distance));
    } else if (sortBy === "savings") {
      sortedResults.sort((a, b) => b.savings - a.savings);
    }
  }

  // Limit displayed stores unless "view more" is clicked
  const displayedResults = viewMoreStores ? sortedResults : sortedResults.slice(0, 3);
  const hasMoreStores = sortedResults.length > 3;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">
          Compare Prices Across Stores
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
          Find the best deals on your entire shopping list. Set your preferred distance and see which store offers the lowest total price.
        </p>
      </div>

      {/* Shopping List Section */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Your Shopping List</h2>
          <ListCreator />
        </CardContent>
      </Card>

      {/* Distance and Sort Filter */}
      <div className="max-w-3xl mx-auto mb-8">
        <StoreFilter 
          maxDistance={maxDistance} 
          sortBy={sortBy} 
          onFilterChange={handleFilterChange} 
        />
      </div>

      {/* Comparison Results */}
      <div className="mb-8">
        {isComparing ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 rounded-lg" />
            ))}
          </div>
        ) : !isReady || listItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">No Items to Compare</h3>
              <p className="text-gray-500 mt-2 mb-4">Add items to your shopping list to see price comparisons across stores.</p>
            </CardContent>
          </Card>
        ) : displayedResults.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">No Stores Found</h3>
              <p className="text-gray-500 mt-2 mb-4">No stores within your selected distance have all your items. Try increasing the distance or changing your list.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {displayedResults.map((result, index) => (
                <StoreCard 
                  key={result.storeId} 
                  storeData={result} 
                  isBestPrice={index === 0 && sortBy === "price"} 
                />
              ))}
            </div>

            {/* View more stores button */}
            {hasMoreStores && (
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={() => setViewMoreStores(!viewMoreStores)}>
                  {viewMoreStores ? "Show Fewer Stores" : `View ${sortedResults.length - 3} More Stores`}
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ml-2 transition-transform ${viewMoreStores ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Savings Analysis */}
      {displayedResults.length > 0 && (
        <SavingsAnalysis results={sortedResults} />
      )}
    </div>
  );
}
