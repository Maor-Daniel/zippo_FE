import { useState, useEffect } from "react";
import { useShoppingList } from "@/hooks/use-shopping-list";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ListItem from "@/components/shopping-list/list-item";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface ListCreatorProps {
  listId?: number;
  existingItems?: any[];
}

export default function ListCreator({ listId, existingItems }: ListCreatorProps = {}) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [newItem, setNewItem] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const {
    listItems,
    searchQuery,
    setSearchQuery,
    searchResults,
    addItem,
    removeItem,
    toggleItemChecked,
    updateItem,
  } = useShoppingList(listId);
  
  // Product categories
  const categories = [
    { id: "all", name: "All" },
    { id: "fruits", name: "Fruits" },
    { id: "vegetables", name: "Vegetables" },
    { id: "meat", name: "Meat & Seafood" },
    { id: "dairy", name: "Dairy & Eggs" },
    { id: "bakery", name: "Bakery" },
    { id: "pantry", name: "Pantry" },
    { id: "frozen", name: "Frozen Foods" },
    { id: "beverages", name: "Beverages" },
    { id: "snacks", name: "Snacks" },
  ];

  // Handle input change for search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewItem(value);
    setSearchQuery(value);
    setShowResults(value.length > 1);
  };

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === "all" ? null : category);
    
    // When a category is selected, we can optionally prefill the search with category name
    if (category !== "all") {
      setSearchQuery(category);
      setNewItem("");
      setShowResults(true);
    } else {
      setSearchQuery("");
      setNewItem("");
      setShowResults(false);
    }
  };

  // Add item to list
  const handleAddItem = (productName: string) => {
    if (productName.trim()) {
      addItem(productName.trim());
      setNewItem("");
      setShowResults(false);
    }
  };

  // Submit form when pressing enter
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddItem(newItem);
  };

  // Select from search results
  const handleSelectResult = (name: string) => {
    handleAddItem(name);
  };

  // Compare Prices
  const handleCompare = () => {
    navigate("/compare");
  };

  // Filter search results by selected category
  const filteredResults = selectedCategory && searchResults && Array.isArray(searchResults)
    ? searchResults.filter((product: any) => 
        product.category?.toLowerCase().includes(selectedCategory.toLowerCase()))
    : searchResults;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium">My Shopping List</h3>
      </div>
      
      {/* Category Selection */}
      <div className="mb-4">
        <ScrollArea className="w-full">
          <div className="flex space-x-2 pb-2">
            {categories.map((category) => (
              <Badge 
                key={category.id}
                variant={selectedCategory === category.id || (category.id === "all" && !selectedCategory) 
                  ? "default" 
                  : "outline"}
                className="cursor-pointer px-3 py-1"
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <Input
            type="text"
            id="product-search"
            className="pl-10 pr-12"
            placeholder={selectedCategory 
              ? `Search in ${categories.find(c => c.id === selectedCategory)?.name}` 
              : "Search for a product"}
            value={newItem}
            onChange={handleInputChange}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-full text-gray-400 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M4 5a2 2 0 012-2h1a1 1 0 010 2H6a1 1 0 00-1 1v1a1 1 0 01-2 0V5zm8 0a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2V5zm8 8a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3a2 2 0 012-2h3a2 2 0 012 2v3zm-8 0a2 2 0 01-2 2H6a2 2 0 01-2-2v-3a2 2 0 012-2h1a2 2 0 012 2v3z" />
              </svg>
            </Button>
          </div>
        </div>
      </form>

      {showResults && filteredResults && filteredResults.length > 0 && (
        <Card className="absolute z-10 mt-1 w-full max-w-md">
          <CardContent className="p-2">
            <ScrollArea className="max-h-60">
              <div className="space-y-1">
                {filteredResults.map((product: any) => (
                  <div
                    key={product.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer rounded-md"
                    onClick={() => handleSelectResult(product.name)}
                  >
                    <p className="text-sm font-medium">{product.name}</p>
                    {product.category && (
                      <p className="text-xs text-gray-500">{product.category}</p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <ScrollArea className="h-60 mt-6">
        <div className="space-y-2">
          {listItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Your shopping list is empty.</p>
              <p className="text-sm">Start by searching for products or select a category above.</p>
            </div>
          ) : (
            listItems.map((item) => (
              <ListItem
                key={item.id}
                item={item}
                onToggle={() => toggleItemChecked(item.id!)}
                onRemove={() => removeItem(item.id!)}
                onUpdateQuantity={(quantity) => updateItem(item.id!, { quantity })}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!user || listItems.length === 0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
            </svg>
            Save List
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!user}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Import
          </Button>
        </div>
        <Button
          type="button"
          onClick={handleCompare}
          disabled={listItems.length === 0}
        >
          Compare Prices
        </Button>
      </div>
    </div>
  );
}
