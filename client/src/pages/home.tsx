import { Button } from "@/components/ui/button";
import ListCreator from "@/components/shopping-list/list-creator";
import StoreFilter from "@/components/comparison/store-filter";
import StoreMap from "@/components/store-locations/store-map";
import PriceHistoryChart from "@/components/price-tracking/price-history-chart";
import PriceAlertForm from "@/components/price-tracking/price-alert-form";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2">
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                Shop smarter, save bigger
              </h1>
              <p className="mt-3 text-lg">
                Compare prices across multiple stores to find the best deals on your shopping list.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4">
                <Button asChild variant="secondary" size="lg">
                  <Link href="/lists">Create a List</Link>
                </Button>
                <Button asChild className="mt-3 sm:mt-0" size="lg">
                  <Link href="/compare">Compare Prices</Link>
                </Button>
              </div>
            </div>
            <div className="mt-8 lg:mt-0 lg:w-1/2">
              <img 
                className="rounded-lg shadow-xl" 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=800&q=80" 
                alt="Various grocery products and fresh produce" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary tracking-wide uppercase">Features</h2>
            <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">
              How Zolpo helps you save
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-lg overflow-hidden shadow p-6">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Easy List Creation</h3>
                <p className="mt-2 text-base text-gray-500">
                  Create shopping lists through search, barcode scanning, or importing from text.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-lg overflow-hidden shadow p-6">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Smart Price Comparison</h3>
                <p className="mt-2 text-base text-gray-500">
                  Compare total costs across stores within your preferred travel distance.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-lg overflow-hidden shadow p-6">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Price Tracking</h3>
                <p className="mt-2 text-base text-gray-500">
                  Track price changes over time and get alerts when prices drop on items you care about.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* List Creation Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 pr-0 md:pr-8">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Create Your Shopping List
              </h2>
              <p className="mt-3 text-lg text-gray-500">
                Add items to your list with our simple search feature or try other methods like barcode scanning.
              </p>
              
              <div className="mt-8">
                <ListCreator />
              </div>
            </div>
            
            <div className="mt-8 md:mt-0 md:w-1/2">
              <img 
                className="rounded-lg shadow-xl h-auto w-full object-cover" 
                src="https://pixabay.com/get/g6c4494670ad94fd989fba2f7563d4cb725f4f1561036751cfa3362660056c26a19d028b31df3d91422362e6314e37c2413203454f01c9bb260d9ef3404c50015_1280.jpg" 
                alt="Person making a shopping list"
              />
              
              <div className="mt-6 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Other Ways to Create Lists</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-primary/10 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Scan a Receipt</p>
                      <p className="text-sm text-gray-500">Use OCR to import from a previous receipt.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-primary/10 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Previous Lists</p>
                      <p className="text-sm text-gray-500">Reuse items from your saved lists.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-primary/10 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Barcode Scan</p>
                      <p className="text-sm text-gray-500">Add items by scanning product barcodes.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-primary/10 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Handwritten List</p>
                      <p className="text-sm text-gray-500">Scan your handwritten shopping list.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Get Started with Zolpo Today
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Start using the app and start saving on your grocery shopping.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {!user ? (
              <>
                <Button asChild variant="default" size="lg" className="bg-gray-900 hover:bg-gray-800">
                  <Link href="/register">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Register Now
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                    </svg>
                    Log In
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="default" size="lg" className="bg-gray-900 hover:bg-gray-800">
                  <Link href="/lists">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    My Lists
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/compare">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                    </svg>
                    Compare Prices
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
