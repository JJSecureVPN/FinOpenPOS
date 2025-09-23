"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import type { CartItem } from "./types";

interface CartItemsProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveFromCart: (productId: number) => void;
}

export default function CartItems({ cart, onUpdateQuantity, onRemoveFromCart }: CartItemsProps) {
  if (cart.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>El carrito está vacío</p>
        <p className="text-sm mt-1">Agrega productos para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[40vh] overflow-y-auto">
      {cart.map((item) => (
        <Card key={item.id} className="p-3">
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-medium text-sm leading-tight">{item.name}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFromCart(item.id)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              >
                ×
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="h-6 w-6 p-0"
                >
                  -
                </Button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="h-6 w-6 p-0"
                >
                  +
                </Button>
              </div>
              <span className="font-semibold text-sm">${item.subtotal.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}