import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface ListItem {
  id?: number;
  listId?: number;
  productName: string;
  quantity: number;
  checked: boolean;
}

interface StorePrice {
  storeId: number;
  name: string;
  chain: string;
  distance: number;
  totalPrice: number;
  savings: number;
  priceDetails: {
    productName: string;
    quantity: number;
    price: number;
    total: number;
    isOnSale: boolean;
  }[];
}

export function usePriceComparison() {
  const [compareResults, setCompareResults] = useState<StorePrice[] | null>(null);

  const compareMutation = useMutation({
    mutationFn: async ({
      items,
      maxDistance,
    }: {
      items: ListItem[];
      maxDistance: number;
    }) => {
      const res = await apiRequest("POST", "/api/compare", {
        listItems: items,
        maxDistance,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setCompareResults(data);
      if (data.length === 0) {
        toast({
          title: "No Results Found",
          description: "No stores within your selected distance have all your items.",
          variant: "default",
        });
      } else {
        toast({
          title: "Comparison Complete",
          description: `Found prices at ${data.length} stores.`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Comparison Failed",
        description: `Failed to compare prices: ${error}`,
        variant: "destructive",
      });
    },
  });

  const compare = async (items: ListItem[], maxDistance: number) => {
    if (items.length === 0) {
      toast({
        title: "Empty List",
        description: "Add items to your list before comparing prices.",
        variant: "default",
      });
      return;
    }

    await compareMutation.mutateAsync({ items, maxDistance });
  };

  return {
    compareResults,
    isComparing: compareMutation.isPending,
    compare,
  };
}
