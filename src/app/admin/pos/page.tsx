"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ShoppingCart, Package, Receipt, Calculator } from "lucide-react";
import { configService, getEnabledPaymentMethods, type PaymentMethod } from "@/lib/config";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  in_stock: number;
};

type Customer = {
  id: number;
  name: string;
};

interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentReceived, setPaymentReceived] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [showPayment, setShowPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    fetchProducts();
    loadPaymentMethods();
  }, []);

  

  // Cargar métodos de pago desde la configuración
  const loadPaymentMethods = () => {
    const methods = getEnabledPaymentMethods();
    setAvailablePaymentMethods(methods);
    // Seleccionar efectivo por defecto si está disponible
    if (methods.length > 0) {
      const cashMethod = methods.find(m => m.id === 'cash');
      setSelectedPaymentMethod(cashMethod ? cashMethod.id : methods[0].id);
    }
  };

  // Escuchar cambios en la configuración
  useEffect(() => {
    const handleConfigChange = () => {
      loadPaymentMethods();
    };

    window.addEventListener('configChanged', handleConfigChange);
    return () => {
      window.removeEventListener('configChanged', handleConfigChange);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/products");
      if (response.status === 401) {
        // Usuario no autenticado, redirigir al login
        window.location.href = "/login";
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Si hay un error, mostrar productos de ejemplo para la demo
      setProducts([
        { id: 1, name: "Arroz Blanco 1kg", price: 2.50, category: "comestibles", in_stock: 50 },
        { id: 2, name: "Coca Cola 2L", price: 3.25, category: "bebidas", in_stock: 30 },
        { id: 3, name: "Pan Integral", price: 1.80, category: "comestibles", in_stock: 20 },
        { id: 4, name: "Detergente Líquido", price: 4.50, category: "limpieza", in_stock: 15 },
        { id: 5, name: "Champú 400ml", price: 6.75, category: "higiene", in_stock: 25 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = React.useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }
    
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { 
              ...item, 
              quantity: item.quantity + 1,
              subtotal: (item.quantity + 1) * item.price
            }
          : item
      ));
    } else {
      setCart([...cart, {
        ...product,
        quantity: 1,
        subtotal: product.price
      }]);
    }
    
    // Limpiar búsqueda después de agregar
    setSearchTerm("");
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === productId 
        ? { 
            ...item, 
            quantity: newQuantity,
            subtotal: newQuantity * item.price
          }
        : item
    ));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setShowPayment(false);
    setPaymentReceived("");
    setSelectedPaymentMethod("");
  };

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const change = parseFloat(paymentReceived) - total;

  const handleProcessSale = async () => {
    if (cart.length === 0 || !selectedPaymentMethod) return;
    
    // Validar pago según el método seleccionado
    const selectedMethod = availablePaymentMethods.find(m => m.id === selectedPaymentMethod);
    if (!selectedMethod) {
      alert("❌ Método de pago no válido");
      return;
    }

    // Para efectivo, validar que se haya ingresado el monto
    if (selectedMethod.type === 'cash' && (!paymentReceived || parseFloat(paymentReceived) < total)) {
      alert("❌ El monto recibido debe ser mayor o igual al total");
      return;
    }
    
    try {
      console.log("Procesando venta:", {
        paymentMethod: selectedMethod.name,
        paymentMethodId: selectedMethod.id,
        products: cart.map(item => ({ 
          id: item.id, 
          quantity: item.quantity, 
          price: item.price 
        })),
        total,
      });

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // No enviamos customerId para ventas normales
          paymentMethodId: 3, // Mapear a ID de BD según corresponda
          paymentMethod: selectedMethod.name,
          products: cart.map(item => ({ 
            id: item.id, 
            quantity: item.quantity, 
            price: item.price 
          })),
          total,
        }),
      });

      const responseData = await response.json();
      console.log("Respuesta del servidor:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || `Error del servidor: ${response.status}`);
      }

      // Actualizar stock local de productos vendidos
      setProducts(prevProducts => 
        prevProducts.map(product => {
          const soldItem = cart.find(item => item.id === product.id);
          if (soldItem) {
            return {
              ...product,
              in_stock: Math.max(0, product.in_stock - soldItem.quantity)
            };
          }
          return product;
        })
      );

      // Resetear todo
      clearCart();
      setSelectedPaymentMethod(availablePaymentMethods[0]?.id || "");
      
      // Mostrar mensaje diferente según el método de pago
      let successMessage = `🎉 ¡Venta procesada exitosamente!\n\nTotal: $${total.toFixed(2)}\nMétodo: ${selectedMethod.name}`;
      
      if (selectedMethod.type === 'cash') {
        successMessage += `\nPagado: $${paymentReceived}\nCambio: $${change.toFixed(2)}`;
      }
      
      alert(successMessage);
      
    } catch (error) {
      console.error("Error procesando venta:", error);
      alert(`❌ Error al procesar la venta:\n${error instanceof Error ? error.message : 'Error desconocido'}\n\nRevisa la consola para más detalles.`);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      comestibles: "bg-primary/20 text-primary border border-primary/30",
      snacks: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
      bebidas: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
      dulces: "bg-accent/20 text-accent border border-accent/30",
      limpieza: "bg-secondary/20 text-secondary border border-secondary/30",
      higiene: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
    };
    return colors[category] || "bg-muted text-muted-foreground border border-border";
  };

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Cargando productos...</p>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 flex flex-col bg-background">
          {/* Header ultra compacto */}
          <div className="flex items-center justify-between p-3 border-b bg-card flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Receipt className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">POS</h1>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('es-ES', { 
                day: 'numeric',
                month: 'short'
              })}
            </div>
          </div>

          {/* Layout principal que ocupa toda la altura restante */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
            {/* Panel de Productos */}
            <div className="flex flex-col border-r">
              {/* Header de productos */}
              <div className="p-3 border-b bg-card/50 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Productos</span>
                  </div>
                  <Badge variant="outline" className="text-xs h-5">
                    {filteredProducts.length}
                  </Badge>
                </div>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 h-8 text-sm"
                  />
                </div>
              </div>

              {/* Lista de productos con scroll */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="bg-card border rounded-md p-2 cursor-pointer hover:bg-accent/50 hover:border-primary/50 transition-all duration-150 hover:shadow-sm"
                    >
                      <div className="flex flex-col space-y-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-xs text-foreground line-clamp-2 flex-1 pr-1">
                            {product.name}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={`text-[10px] px-1 py-0 h-4 flex-shrink-0 ${getCategoryColor(product.category)}`}
                          >
                            {product.category}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="text-sm font-bold text-primary">
                            ${product.price.toFixed(2)}
                          </div>
                          <div className={`text-[10px] px-1 py-0.5 rounded text-center min-w-[45px] ${
                            (product.in_stock || 0) > 10 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : (product.in_stock || 0) > 0
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {product.in_stock || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredProducts.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm">No hay productos</p>
                  </div>
                )}
              </div>
            </div>

            {/* Panel del Carrito */}
            <div className="flex flex-col">
              {/* Header del carrito */}
              <div className="p-3 border-b bg-card/50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Carrito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs h-5">
                      {cart.length}
                    </Badge>
                    {cart.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearCart}
                        className="h-6 px-2 text-xs"
                      >
                        Limpiar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Contenido del carrito */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Lista del carrito con scroll */}
                <div className="flex-1 overflow-y-auto p-3">
                  {cart.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12 flex flex-col items-center justify-center h-full">
                      <ShoppingCart className="h-12 w-12 mb-3 text-muted-foreground/30" />
                      <p className="font-medium">Carrito vacío</p>
                      <p className="text-xs">Agrega productos</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.id} className="bg-muted/50 rounded-md p-2 border">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-xs text-foreground truncate">
                                {item.name}
                              </h4>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-muted-foreground">
                                  ${item.price.toFixed(2)} c/u
                                </span>
                                <span className="font-semibold text-primary text-sm">
                                  ${item.subtotal.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-6 w-6 p-0 text-xs"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center font-medium text-xs">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-6 w-6 p-0 text-xs"
                              >
                                +
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeFromCart(item.id)}
                              className="h-6 px-2 text-xs"
                            >
                              Quitar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total y Pago - Área fija */}
                {cart.length > 0 && (
                  <div className="border-t bg-card p-3 flex-shrink-0">
                    {/* Resumen compacto */}
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs">
                        <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                        <span>TOTAL:</span>
                        <span className="text-primary">${total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Controles de Pago compactos */}
                    {!showPayment ? (
                      <Button 
                        onClick={() => setShowPayment(true)}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Procesar Pago
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs font-medium text-foreground block mb-1">
                            Método de Pago:
                          </label>
                          <Select
                            value={selectedPaymentMethod}
                            onValueChange={setSelectedPaymentMethod}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {availablePaymentMethods.map(method => (
                                <SelectItem key={method.id} value={method.id}>
                                  {method.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedPaymentMethod === 'cash' && (
                          <div>
                            <label className="text-xs font-medium text-foreground block mb-1">
                              Efectivo:
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              value={paymentReceived}
                              onChange={(e) => setPaymentReceived(e.target.value)}
                              placeholder="0.00"
                              className="h-8"
                            />
                            {paymentReceived && parseFloat(paymentReceived) >= total && (
                              <div className="mt-1 p-2 bg-primary/10 rounded text-center">
                                <span className="text-xs font-medium text-foreground">
                                  Cambio: <span className="text-primary font-bold">
                                    ${change.toFixed(2)}
                                  </span>
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              setShowPayment(false);
                              setSelectedPaymentMethod("");
                              setPaymentReceived("");
                            }}
                            variant="outline"
                            className="flex-1 h-8 text-xs"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            onClick={handleProcessSale}
                            disabled={
                              !selectedPaymentMethod || 
                              (selectedPaymentMethod === 'cash' && (!paymentReceived || parseFloat(paymentReceived) < total))
                            }
                            className="flex-1 bg-primary hover:bg-primary/90 h-8 text-xs"
                          >
                            <Receipt className="h-3 w-3 mr-1" />
                            Finalizar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
