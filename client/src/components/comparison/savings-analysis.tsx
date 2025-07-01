import { Card, CardContent } from "@/components/ui/card";

interface StorePrice {
  storeId: number;
  name: string;
  chain: string;
  distance: number;
  totalPrice: number;
  savings: number;
  priceDetails: any[];
}

interface SavingsAnalysisProps {
  results: StorePrice[];
}

export default function SavingsAnalysis({ results }: SavingsAnalysisProps) {
  // Get the best savings from the results
  const bestSavings = results.reduce((max, store) => Math.max(max, store.savings), 0);
  
  // Calculate savings percentage based on the highest price store
  const highestPrice = results.reduce((max, store) => Math.max(max, store.totalPrice), 0);
  const savingsPercentage = highestPrice > 0 ? (bestSavings / highestPrice) * 100 : 0;
  
  // Projected annual savings (assuming weekly shopping)
  const annualSavings = bestSavings * 52;

  return (
    <Card className="max-w-3xl mx-auto bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Potential Savings Analysis</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Based on your current shopping list across all available stores.
        </p>
      </div>
      <CardContent className="p-6">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-100">
                Potential Savings
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-green-600">
                {savingsPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-100">
            <div
              style={{ width: `${Math.min(savingsPercentage, 100)}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
            ></div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-primary-100 text-primary p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">${bestSavings.toFixed(2)}</h4>
                <p className="text-sm text-gray-500">Total savings on this list</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-primary-100 text-primary p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">${annualSavings.toFixed(2)}</h4>
                <p className="text-sm text-gray-500">Projected annual savings</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
