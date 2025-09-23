"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ResponsiveShow } from "@/components/responsive";
import { ShoppingCart, Plus, Minus, X, CreditCard, Loader2Icon, Package } from "lucide-react";
import type { CartItem, Customer } from "./types";

interface CartPanelProps {
  cart: CartItem[];
  customer: Customer;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveFromCart: (id: number) => void;
  onProcessSale: () => void;
  processing: boolean;
}

export default function CartPanel({ 
  cart, 
  customer, 
  onUpdateQuantity, 
  onRemoveFromCart, 
  onProcessSale, 
  processing 
}: CartPanelProps) {
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const newDebtTotal = customer.debt + total;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const CartItemRow = ({ item }: { item: CartItem }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{item.name}</h4>
          <p className="text-sm text-gray-500">
            {formatCurrency(item.price)} c/u
          </p>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <Package className="w-3 h-3" />
            <span>Stock disponible: {item.stock}</span>
          </div>
        </div>
        
        <div className="text-right ml-3">
          <p className="font-medium text-green-600">
            {formatCurrency(item.price * item.quantity)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <Minus className="w-3 h-3" />
          </Button>
          
          <span className="w-12 text-center font-medium text-lg">
            {item.quantity}
          </span>
          
          <Button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={item.quantity >= item.stock}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        
        <Button
          onClick={() => onRemoveFromCart(item.id)}
          size="sm"
          variant="destructive"
          className="h-8 w-8 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Carrito de Compras
          {cart.length > 0 && (
            <Badge variant="default" className="ml-auto">
              {itemsCount} {itemsCount === 1 ? 'artículo' : 'artículos'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Customer Info */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900">{customer.name}</h3>
          <p className="text-sm text-blue-700">Deuda actual: {formatCurrency(customer.debt)}</p>
        </div>

        {/* Cart Items */}
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Carrito vacío</h3>
            <p className="text-gray-500">
              Agrega productos desde la lista para comenzar
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="pb-4 border-b border-gray-100 last:border-b-0">
                  <CartItemRow item={item} />
                </div>
              ))}
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-3">
              <div className="flex justify-between text-lg font-medium">
                <span>Subtotal:</span>
                <span className="text-green-600">{formatCurrency(total)}</span>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>Deuda actual:</span>
                <span>{formatCurrency(customer.debt)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-xl font-bold">
                <span>Nueva deuda total:</span>
                <span className="text-orange-600">{formatCurrency(newDebtTotal)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <ResponsiveShow on="mobile">
              <div className="space-y-3">
                <Button
                  onClick={onProcessSale}
                  disabled={processing}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Procesar Venta al Fiado
                    </>
                  )}
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Esta venta se agregará a la deuda del cliente
                  </p>
                </div>
              </div>
            </ResponsiveShow>

            <ResponsiveShow on="tablet-desktop">
              <div className="space-y-4">
                <Button
                  onClick={onProcessSale}
                  disabled={processing}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Procesar Venta al Fiado
                    </>
                  )}
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Esta venta se agregará como deuda al cliente seleccionado
                  </p>
                </div>
              </div>
            </ResponsiveShow>
          </>
        )}
      </CardContent>
    </Card>
  );
}