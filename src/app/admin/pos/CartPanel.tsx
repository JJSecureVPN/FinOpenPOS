"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import type { CartItem } from "./types";
import CartItems from "./CartItems";
import PaymentSection from "./PaymentSection";

interface CartPanelProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveFromCart: (productId: number) => void;
  onClearCart: () => void;
  showPayment: boolean;
  onShowPayment: (show: boolean) => void;
  onProcessSale: () => void;
  paymentReceived: string;
  onPaymentReceivedChange: (value: string) => void;
  selectedPaymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  availablePaymentMethods: any[];
}

export default function CartPanel({
  cart,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  showPayment,
  onShowPayment,
  onProcessSale,
  paymentReceived,
  onPaymentReceivedChange,
  selectedPaymentMethod,
  onPaymentMethodChange,
  availablePaymentMethods
}: CartPanelProps) {
  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const calculateChange = () => {
    const received = parseFloat(paymentReceived) || 0;
    const total = getTotalAmount();
    return received - total;
  };

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <Typography variant="h2" weight="semibold">Carrito</Typography>
            {cart.length > 0 && (
              <Badge variant="secondary">{cart.length}</Badge>
            )}
          </div>
          {cart.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearCart}
            >
              <Typography variant="body-sm">Limpiar</Typography>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CartItems
          cart={cart}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveFromCart={onRemoveFromCart}
        />

        {cart.length > 0 && (
          <>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <Typography variant="h2" weight="bold">Total:</Typography>
                <Typography variant="h2" weight="bold" className="text-primary">
                  ${getTotalAmount().toFixed(2)}
                </Typography>
              </div>
            </div>

            <PaymentSection
              showPayment={showPayment}
              onShowPayment={onShowPayment}
              onProcessSale={onProcessSale}
              paymentReceived={paymentReceived}
              onPaymentReceivedChange={onPaymentReceivedChange}
              selectedPaymentMethod={selectedPaymentMethod}
              onPaymentMethodChange={onPaymentMethodChange}
              availablePaymentMethods={availablePaymentMethods}
              calculateChange={calculateChange}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}