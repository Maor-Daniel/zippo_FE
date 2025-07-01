import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PriceDetail {
  productName: string;
  quantity: number;
  price: number;
  total: number;
  isOnSale: boolean;
}

interface StoreCardProps {
  storeData: {
    storeId: number;
    name: string;
    chain: string;
    distance: number;
    totalPrice: number;
    savings: number;
    priceDetails: PriceDetail[];
  };
  isBestPrice: boolean;
}

export default function StoreCard({ storeData, isBestPrice }: StoreCardProps) {
  const [showAllItems, setShowAllItems] = useState(false);
  const displayItems = showAllItems ? storeData.priceDetails : storeData.priceDetails.slice(0, 3);

  return (
    <Card className={`overflow-hidden ${isBestPrice ? 'border-green-200' : 'border-gray-200'}`}>
      <CardHeader className={`p-6 ${isBestPrice ? 'bg-green-500 text-white' : 'bg-gray-700 text-white'}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{storeData.name}</h3>
          {isBestPrice && (
            <Badge variant="secondary" className="bg-white text-green-600">
              Best Price
            </Badge>
          )}
        </div>
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-bold">${storeData.totalPrice.toFixed(2)}</span>
          <span className="ml-2 text-sm opacity-75">total</span>
        </div>
        <div className="mt-1">
          <span className="text-sm font-medium">
            {storeData.savings > 0 ? `You save: $${storeData.savings.toFixed(2)}` : 'No savings'}
          </span>
        </div>
        <div className="mt-1 flex items-center text-xs">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          <span>{Number(storeData.distance).toFixed(1)} miles away</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Price Breakdown</h4>
        <ScrollArea className={showAllItems ? "h-60" : "h-auto"}>
          <div className="space-y-1">
            {displayItems.map((detail, index) => (
              <div key={index} className="flex justify-between text-sm py-1">
                <span className="text-gray-600 truncate mr-2">
                  {detail.productName}
                  {detail.quantity > 1 && ` × ${detail.quantity}`}
                </span>
                <span className={`font-medium ${detail.isOnSale ? 'text-green-600' : 'text-gray-900'}`}>
                  ${Number(detail.price).toFixed(2)}
                  {detail.quantity > 1 && ` × ${detail.quantity}`}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
        {storeData.priceDetails.length > 3 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <Button
              variant="link"
              className="p-0 h-auto text-sm font-medium text-primary hover:text-primary-600"
              onClick={() => setShowAllItems(!showAllItems)}
            >
              {showAllItems 
                ? "View fewer items" 
                : `View all ${storeData.priceDetails.length} items`}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <Button 
          className={`w-full ${isBestPrice ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
          Select This Store
        </Button>
      </CardFooter>
    </Card>
  );
}
