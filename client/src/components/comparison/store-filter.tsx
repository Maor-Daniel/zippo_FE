import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StoreFilterProps {
  maxDistance: number;
  sortBy: "price" | "distance" | "savings";
  onFilterChange: (maxDistance: number, sortBy: "price" | "distance" | "savings") => void;
}

export default function StoreFilter({ maxDistance, sortBy, onFilterChange }: StoreFilterProps) {
  const handleDistanceChange = (value: string) => {
    onFilterChange(parseInt(value, 10), sortBy);
  };

  const handleSortChange = (value: string) => {
    onFilterChange(maxDistance, value as "price" | "distance" | "savings");
  };

  return (
    <Card className="bg-gray-50 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div className="w-full sm:w-auto">
          <Label htmlFor="max-distance" className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Distance
          </Label>
          <Select value={String(maxDistance)} onValueChange={handleDistanceChange}>
            <SelectTrigger id="max-distance" className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select distance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 miles</SelectItem>
              <SelectItem value="10">10 miles</SelectItem>
              <SelectItem value="15">15 miles</SelectItem>
              <SelectItem value="25">25 miles</SelectItem>
              <SelectItem value="50">50 miles</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-auto">
          <Label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
            Sort Results By
          </Label>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger id="sort-by" className="w-full sm:w-[240px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Total Price (Low to High)</SelectItem>
              <SelectItem value="distance">Distance (Closest First)</SelectItem>
              <SelectItem value="savings">Total Savings</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
