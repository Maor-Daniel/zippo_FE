import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface PriceHistoryProps {
  productName: string;
  storeId?: number;
}

export default function PriceHistoryChart({ productName, storeId }: PriceHistoryProps) {
  // Get all prices for this product
  const { data: prices, isLoading: isPriceLoading } = useQuery({
    queryKey: [`/api/prices?productName=${encodeURIComponent(productName)}`],
  });

  // Get price history for the product (defaulting to first store if storeId not provided)
  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: [
      '/api/price-history',
      { storeId: storeId || (prices?.[0]?.storeId || 1), productName },
    ],
    enabled: !!productName && (!!storeId || (!!prices && prices.length > 0)),
  });

  // Create a nicely formatted chart dataset
  const chartData = history?.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: Number(item.price),
    timestamp: new Date(item.date).getTime(),
  }))
  .sort((a: any, b: any) => a.timestamp - b.timestamp);

  // Calculate statistics
  const currentPrice = prices?.[0]?.price || 0;
  
  // Calculate average price
  let avgPrice = 0;
  if (prices && prices.length > 0) {
    avgPrice = prices.reduce((sum: number, item: any) => sum + Number(item.price), 0) / prices.length;
  }
  
  // Find lowest price
  let lowestPrice = Number.MAX_VALUE;
  let lowestPriceStore = '';
  if (prices && prices.length > 0) {
    prices.forEach((item: any) => {
      if (Number(item.price) < lowestPrice) {
        lowestPrice = Number(item.price);
        lowestPriceStore = item.storeId;
      }
    });
  }

  const isLoading = isPriceLoading || isHistoryLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="flex justify-between mb-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-[250px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold">Price History: {productName}</h3>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          Set Alert
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Current lowest price</p>
          <p className="text-xl font-bold text-gray-900">${lowestPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">30-day average</p>
          <p className="text-xl font-bold text-gray-900">${avgPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Price trend</p>
          {chartData && chartData.length >= 2 && chartData[chartData.length - 1].price < chartData[0].price ? (
            <p className="text-xl font-bold text-green-600">Falling</p>
          ) : (
            <p className="text-xl font-bold text-red-600">Rising</p>
          )}
        </div>
      </div>

      <div className="h-[250px] w-full">
        {chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickMargin={10}
                tickFormatter={(value) => `$${value}`}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <ReferenceLine y={avgPrice} stroke="#8884d8" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Card className="h-full">
            <CardContent className="flex items-center justify-center h-full">
              <p className="text-gray-500">No price history data available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
