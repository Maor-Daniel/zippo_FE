import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/navbar";
import MobileNav from "@/components/layout/mobile-nav";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import ShoppingLists from "@/pages/shopping-lists";
import Compare from "@/pages/compare";
import PriceAlerts from "@/pages/price-alerts";
import Products from "@/pages/products";
import Login from "@/pages/login";
import Register from "@/pages/register";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/lists" component={ShoppingLists} />
      <Route path="/compare" component={Compare} />
      <Route path="/alerts" component={PriceAlerts} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pb-16 sm:pb-0">
              <Router />
            </main>
            <MobileNav />
            <Footer />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
