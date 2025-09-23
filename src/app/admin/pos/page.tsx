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
        <div className="h-screen p-4 overflow-hidden">
        {/* Header más compacto */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Receipt className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Caja Registradora</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 h-[calc(100%-5rem)]">
          {/* Panel de Productos - Más espacio en pantallas grandes */}
          <div className="xl:col-span-3 h-full">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-4 flex-shrink-0">
                <CardTitle className="flex items-center text-lg">
                  <Package className="h-5 w-5 mr-2" />
                  Productos Disponibles
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar producto por nombre o categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-base"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 h-full overflow-y-auto pr-2">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="bg-card border rounded-lg p-4 cursor-pointer hover:bg-card/80 hover:border-border transition-all hover:shadow-sm h-fit"
                    >
                      <div className="flex flex-col space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-sm text-foreground line-clamp-2 flex-1">
                            {product.name}
                          </h3>
                        </div>
                        <Badge className={`text-xs w-fit ${getCategoryColor(product.category)}`}>
                          {product.category}
                        </Badge>
                        <div className="text-xl font-bold text-primary">
                          ${product.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Stock: {product.in_stock || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel del Carrito - Más ancho en pantallas grandes */}
          <div className="xl:col-span-1 h-full">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-4 flex-shrink-0">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Carrito ({cart.length})
                  </div>
                  {cart.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearCart}
                    >
                      Limpiar
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden p-4">
                {/* Lista del carrito */}
                <div className="flex-1 overflow-y-auto mb-4 pr-2">
                  {cart.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 flex flex-col items-center justify-center h-full">
                      <ShoppingCart className="h-12 w-12 mb-2 text-muted-foreground/50" />
                      <p className="font-medium">Carrito vacío</p>
                      <p className="text-sm">Selecciona productos para agregar</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-muted p-3 rounded">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground truncate">{item.name}</div>
                            <div className="text-primary font-semibold">
                              ${item.price.toFixed(2)} × {item.quantity}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-7 w-7 p-0"
                            >
                              -
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-7 w-7 p-0"
                            >
                              +
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeFromCart(item.id)}
                              className="h-7 w-7 p-0"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total y Pago - Fijo en la parte inferior */}
                {cart.length > 0 && (
                  <div className="border-t pt-4 space-y-4 flex-shrink-0">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>TOTAL:</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>

                    {/* Pago */}
                    {!showPayment ? (
                      <Button 
                        onClick={() => setShowPayment(true)}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        size="lg"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Procesar Pago
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        {/* Selección de método de pago */}
                        <div>
                          <label className="text-sm font-medium text-foreground">Método de Pago:</label>
                          <select
                            value={selectedPaymentMethod}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            className="mt-1 w-full p-2 border border-border rounded-md text-base bg-background text-foreground"
                          >
                            <option value="">Seleccionar método</option>
                            {availablePaymentMethods.map(method => (
                              <option key={method.id} value={method.id}>
                                {method.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Input condicional según método de pago */}
                        {selectedPaymentMethod === 'cash' && (
                          <div>
                            <label className="text-sm font-medium text-foreground">Efectivo Recibido:</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={paymentReceived}
                              onChange={(e) => setPaymentReceived(e.target.value)}
                              placeholder="0.00"
                              className="mt-1 text-base"
                            />
                          </div>
                        )}

                        {selectedPaymentMethod === 'card' && (
                          <div className="bg-accent/50 p-3 rounded border">
                            <div className="text-sm font-medium text-foreground">
                              💳 Tarjeta: ${total.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Confirme el pago en el terminal de tarjeta
                            </div>
                          </div>
                        )}

                        {selectedPaymentMethod === 'transfer' && (
                          <div className="bg-secondary/50 p-3 rounded border">
                            <div className="text-sm font-medium text-foreground">
                              🏦 Transferencia: ${total.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Confirme la transferencia bancaria
                            </div>
                          </div>
                        )}
                        
                        {/* Mostrar cambio solo para efectivo */}
                        {selectedPaymentMethod === 'cash' && paymentReceived && parseFloat(paymentReceived) >= total && (
                          <div className="bg-primary/20 p-3 rounded border border-primary/30">
                            <div className="text-sm font-medium text-foreground">
                              Cambio: <span className="text-lg text-primary">${change.toFixed(2)}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => {
                              setShowPayment(false);
                              setSelectedPaymentMethod("");
                              setPaymentReceived("");
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            onClick={handleProcessSale}
                            disabled={
                              !selectedPaymentMethod || 
                              (selectedPaymentMethod === 'cash' && (!paymentReceived || parseFloat(paymentReceived) < total))
                            }
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            <Receipt className="h-4 w-4 mr-2" />
                            Finalizar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      )}
    </>
  );
}
