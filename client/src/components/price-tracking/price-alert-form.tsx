import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PriceAlertFormProps {
  products?: any[];
  onSuccess?: () => void;
}

const alertSchema = z.object({
  productName: z.string().min(1, { message: "Please select a product" }),
  targetPrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid price",
  }),
  storeId: z.string().optional(),
  emailAlert: z.boolean().default(true),
  pushAlert: z.boolean().default(true),
});

export default function PriceAlertForm({ products = [], onSuccess }: PriceAlertFormProps) {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Get stores for dropdown
  const { data: stores } = useQuery({
    queryKey: ["/api/stores"],
  });

  // Get current prices for the selected product to suggest a price
  const { data: prices } = useQuery({
    queryKey: [`/api/prices?productName=${encodeURIComponent(selectedProduct || "")}`],
    enabled: !!selectedProduct,
  });

  const form = useForm<z.infer<typeof alertSchema>>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      productName: "",
      targetPrice: "",
      storeId: "",
      emailAlert: true,
      pushAlert: true,
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: async (values: z.infer<typeof alertSchema>) => {
      // Convert string values to appropriate types
      const data = {
        ...values,
        targetPrice: Number(values.targetPrice),
        storeId: values.storeId ? Number(values.storeId) : undefined,
      };
      
      const res = await apiRequest("POST", "/api/alerts", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Alert created",
        description: "You'll be notified when the price drops below your target.",
      });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create alert: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Handle product selection to update price suggestions
  const handleProductChange = (value: string) => {
    setSelectedProduct(value);
    form.setValue("productName", value);
    
    // Clear target price to avoid confusion
    form.setValue("targetPrice", "");
  };

  // Calculate suggested target price (10% below average)
  const getSuggestedPrice = () => {
    if (!prices || prices.length === 0) return null;
    
    const avgPrice = prices.reduce((sum, p) => sum + Number(p.price), 0) / prices.length;
    const targetPrice = (avgPrice * 0.9).toFixed(2);
    
    return targetPrice;
  };

  const onSubmit = (values: z.infer<typeof alertSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create price alerts.",
        variant: "destructive",
      });
      return;
    }
    
    createAlertMutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Select
                onValueChange={handleProductChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.name}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Price</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <Input
                    type="text"
                    placeholder="0.00"
                    className="pl-7"
                    {...field}
                  />
                </div>
              </FormControl>
              {getSuggestedPrice() && (
                <FormDescription>
                  Suggested: ${getSuggestedPrice()}{" "}
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs"
                    type="button"
                    onClick={() => form.setValue("targetPrice", getSuggestedPrice() || "")}
                  >
                    (Use this)
                  </Button>
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="storeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store (Optional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="All stores" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">All stores</SelectItem>
                  {stores?.map((store: any) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Leave empty to track prices at all stores.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col space-y-4">
          <FormField
            control={form.control}
            name="emailAlert"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Email Alerts</FormLabel>
                  <FormDescription>
                    Get notified via email when price drops below target.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pushAlert"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Push Notifications</FormLabel>
                  <FormDescription>
                    Receive push notifications on your device.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={createAlertMutation.isPending}
        >
          {createAlertMutation.isPending ? "Creating..." : "Create Alert"}
        </Button>
      </form>
    </Form>
  );
}
