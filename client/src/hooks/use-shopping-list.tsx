import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface ListItem {
  id?: number;
  listId?: number;
  productName: string;
  quantity: number;
  checked: boolean;
}

interface Product {
  id: number;
  name: string;
  category: string;
  barcode?: string;
  imageUrl?: string;
}

export function useShoppingList(listId?: number) {
  const { user, isAuthenticated } = useAuth();
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isReady, setIsReady] = useState(false);

  // Fetch existing list items if listId is provided
  const { data: listData, isLoading } = useQuery({
    queryKey: ["/api/lists", listId],
    enabled: !!listId && isAuthenticated,
  });

  // Search for products
  const { data: searchResults } = useQuery<Product[]>({
    queryKey: [`/api/products/search?q=${searchQuery}`],
    enabled: searchQuery.length > 1,
  });

  // Update listItems when existing items are loaded
  useEffect(() => {
    if (listData && typeof listData === 'object' && 'items' in listData && Array.isArray(listData.items) && listId) {
      setListItems(listData.items as ListItem[]);
      setIsReady(true);
    }
  }, [listData, listId]);

  // Initialize with empty array when no listId
  useEffect(() => {
    if (!listId) {
      setListItems([]);
      setIsReady(true);
    }
  }, [listId]);

  const addItemMutation = useMutation({
    mutationFn: async (item: ListItem) => {
      if (listId && isAuthenticated) {
        const res = await apiRequest("POST", `/api/lists/${listId}/items`, item);
        return res.json();
      } else {
        // For local list (not saved to server)
        return { ...item, id: Date.now() };
      }
    },
    onSuccess: (newItem) => {
      if (listId && isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/lists", listId] });
      } else {
        // Update local state for non-saved lists
        setListItems((prev) => [...prev, newItem]);
      }
      toast({
        title: "Item added",
        description: `${newItem.productName} has been added to your list.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add item: ${error}`,
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async (item: ListItem) => {
      if (item.id && listId && isAuthenticated) {
        const res = await apiRequest("PUT", `/api/lists/items/${item.id}`, item);
        return res.json();
      } else {
        // For local list updates
        return item;
      }
    },
    onSuccess: (updatedItem) => {
      if (listId && isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/lists", listId] });
      } else {
        // Update local state for non-saved lists
        setListItems((prev) => 
          prev.map((item) => 
            item.id === updatedItem.id ? updatedItem : item
          )
        );
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update item: ${error}`,
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      if (listId && isAuthenticated) {
        await apiRequest("DELETE", `/api/lists/items/${id}`);
      }
      return id;
    },
    onSuccess: (id) => {
      if (listId && isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/lists", listId] });
      } else {
        // Update local state for non-saved lists
        setListItems((prev) => prev.filter((item) => item.id !== id));
      }
      toast({
        title: "Item removed",
        description: "Item has been removed from your list.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove item: ${error}`,
        variant: "destructive",
      });
    },
  });

  const addItem = (productName: string, quantity: number = 1) => {
    // Check if item already exists
    const existingItem = listItems.find(
      (item) => item.productName.toLowerCase() === productName.toLowerCase()
    );

    if (existingItem) {
      // Increase quantity of existing item
      updateItemMutation.mutate({
        ...existingItem,
        quantity: existingItem.quantity + quantity,
      });
    } else {
      // Add new item
      addItemMutation.mutate({
        listId,
        productName,
        quantity,
        checked: false,
      });
    }
  };

  const updateItem = (id: number, updates: Partial<ListItem>) => {
    const item = listItems.find((item) => item.id === id);
    if (item) {
      updateItemMutation.mutate({ ...item, ...updates });
    }
  };

  const removeItem = (id: number) => {
    removeItemMutation.mutate(id);
  };

  const toggleItemChecked = (id: number) => {
    const item = listItems.find((item) => item.id === id);
    if (item) {
      updateItemMutation.mutate({ ...item, checked: !item.checked });
    }
  };

  const clearList = () => {
    if (window.confirm("Are you sure you want to clear the entire list?")) {
      // If using a server-stored list, we'd delete all items via API
      // For now, just clear the local state
      setListItems([]);
    }
  };

  return {
    listItems,
    isLoading,
    isReady,
    searchQuery,
    setSearchQuery,
    searchResults,
    addItem,
    updateItem,
    removeItem,
    toggleItemChecked,
    clearList,
  };
}
