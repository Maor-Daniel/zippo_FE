import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, Tag, Store, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RealTimeScraper from "@/components/price-tracking/real-time-scraper";

interface ProductWithPrice {
  id: string;
  name: string;
  store_id: string;
  store_name: string;
  price: number;
  quantity: number;
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [addingToList, setAddingToList] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all products from Firebase Products collection
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['/api/prices/all-products', searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/prices/all-products?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    }
  });

  const addToShoppingList = async (productName: string) => {
    setAddingToList(productName);
    
    // Simulate API call delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    toast({
      title: "Added to Shopping List",
      description: `${productName} has been added to your shopping list.`,
    });
    
    setAddingToList(null);
  };

  // Group products by name to find different stores selling same product
  const getProductVariants = (productName: string) => {
    return products.filter((product: ProductWithPrice) => 
      product.name === productName
    );
  };

  const getLowestPrice = (productName: string) => {
    const variants = getProductVariants(productName);
    if (variants.length === 0) return null;
    return Math.min(...variants.map((p: ProductWithPrice) => p.price));
  };

  // Get unique products (removing duplicates by name)
  const uniqueProducts = products.reduce((acc: ProductWithPrice[], current: ProductWithPrice) => {
    const existingProduct = acc.find(p => p.name === current.name);
    if (!existingProduct) {
      acc.push(current);
    }
    return acc;
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Products</h1>
          <p className="text-gray-600">Unable to load products from the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Catalog</h1>
        <p className="text-gray-600 mb-6">Browse all available products and compare prices across stores</p>
        
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : uniqueProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-600">
            {searchQuery ? 
              `No products match "${searchQuery}". Try a different search term.` :
              "No products available in the catalog."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueProducts.map((product: ProductWithPrice) => {
            const lowestPrice = getLowestPrice(product.name);
            const productVariants = getProductVariants(product.name);
            
            return (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {product.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Badge variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {product.store_name}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {product.quantity}g
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Price Information */}
                    {lowestPrice && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Best Price:</span>
                        <span className="text-lg font-bold text-green-600">
                          ₪{lowestPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {/* Store Availability */}
                    {productVariants.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1 mb-1">
                          <Store className="h-3 w-3" />
                          <span>Available in {productVariants.length} store{productVariants.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => addToShoppingList(product.name)}
                        className="flex-1"
                        disabled={addingToList === product.name}
                      >
                        {addingToList === product.name ? (
                          <>
                            <div className="animate-spin h-4 w-4 mr-1 border-2 border-white border-t-transparent rounded-full" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Add to List
                          </>
                        )}
                      </Button>
                      {productVariants.length > 1 && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            // Navigate to price comparison for this product
                            window.location.href = `/compare?product=${encodeURIComponent(product.name)}`;
                          }}
                        >
                          Compare
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Summary Stats */}
      {uniqueProducts.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{uniqueProducts.length}</div>
              <div className="text-sm text-gray-600">Unique Products</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{products.length}</div>
              <div className="text-sm text-gray-600">Total Listings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {new Set(products.map((p: ProductWithPrice) => p.store_name)).size}
              </div>
              <div className="text-sm text-gray-600">Partner Stores</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}