import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface ListItemProps {
  item: {
    id?: number;
    productName: string;
    quantity: number;
    checked: boolean;
  };
  onToggle: () => void;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

export default function ListItem({ item, onToggle, onRemove, onUpdateQuantity }: ListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (quantity !== item.quantity) {
      onUpdateQuantity(quantity);
    }
  };

  const incrementQuantity = () => {
    const newQuantity = item.quantity + 1;
    onUpdateQuantity(newQuantity);
    setQuantity(newQuantity);
  };

  const decrementQuantity = () => {
    if (item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      onUpdateQuantity(newQuantity);
      setQuantity(newQuantity);
    }
  };

  return (
    <div className={`flex items-center justify-between bg-gray-50 p-3 rounded-md ${item.checked ? 'opacity-70' : ''}`}>
      <div className="flex items-center flex-1 min-w-0">
        <Checkbox
          id={`item-${item.id}`}
          checked={item.checked}
          onCheckedChange={onToggle}
        />
        <label
          htmlFor={`item-${item.id}`}
          className={`ml-3 text-sm truncate ${item.checked ? 'line-through text-gray-500' : ''}`}
        >
          {item.productName}
        </label>
      </div>
      <div className="flex items-center">
        {isEditing ? (
          <input
            type="number"
            className="w-12 p-1 text-sm text-center border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            value={quantity}
            onChange={handleQuantityChange}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
            autoFocus
          />
        ) : (
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={decrementQuantity}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </Button>
            <span
              className="text-sm text-gray-600 mx-1 cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              {item.quantity}
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={incrementQuantity}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={onRemove} className="ml-2 h-6 w-6 text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
