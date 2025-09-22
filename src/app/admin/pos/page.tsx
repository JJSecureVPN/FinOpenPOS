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
      comestibles: "bg-green-100 text-green-800",
      snacks: "bg-yellow-100 text-yellow-800",
      bebidas: "bg-blue-100 text-blue-800",
      dulces: "bg-pink-100 text-pink-800",
      limpieza: "bg-purple-100 text-purple-800",
      higiene: "bg-teal-100 text-teal-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Receipt className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Caja Registradora</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de Productos */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Productos Disponibles
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar producto por nombre o categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="bg-white border rounded-lg p-4 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm text-gray-900 line-clamp-2">
                          {product.name}
                        </h3>
                        <Badge className={`text-xs ${getCategoryColor(product.category)}`}>
                          {product.category}
                        </Badge>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        ${product.price.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Stock: {product.in_stock || 0}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel del Carrito */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
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
              <CardContent>
                {/* Lista del carrito */}
                <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                  {cart.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Carrito vacío</p>
                      <p className="text-sm">Selecciona productos para agregar</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-green-600 font-semibold">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Total */}
                {cart.length > 0 && (
                  <>
                    <div className="border-t pt-4 mb-4">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>TOTAL:</span>
                        <span className="text-green-600">${total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Pago */}
                    {!showPayment ? (
                      <Button 
                        onClick={() => setShowPayment(true)}
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="lg"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Procesar Pago
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        {/* Selección de método de pago */}
                        <div>
                          <label className="text-sm font-medium text-gray-700">Método de Pago:</label>
                          <select
                            value={selectedPaymentMethod}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md text-lg"
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
                            <label className="text-sm font-medium text-gray-700">Efectivo Recibido:</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={paymentReceived}
                              onChange={(e) => setPaymentReceived(e.target.value)}
                              placeholder="0.00"
                              className="mt-1 text-lg"
                            />
                          </div>
                        )}

                        {selectedPaymentMethod === 'card' && (
                          <div className="bg-blue-50 p-3 rounded">
                            <div className="text-sm font-medium text-blue-800">
                              💳 Tarjeta: ${total.toFixed(2)}
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              Confirme el pago en el terminal de tarjeta
                            </div>
                          </div>
                        )}

                        {selectedPaymentMethod === 'transfer' && (
                          <div className="bg-purple-50 p-3 rounded">
                            <div className="text-sm font-medium text-purple-800">
                              🏦 Transferencia: ${total.toFixed(2)}
                            </div>
                            <div className="text-xs text-purple-600 mt-1">
                              Confirme la transferencia bancaria
                            </div>
                          </div>
                        )}
                        
                        {/* Mostrar cambio solo para efectivo */}
                        {selectedPaymentMethod === 'cash' && paymentReceived && parseFloat(paymentReceived) >= total && (
                          <div className="bg-green-50 p-3 rounded">
                            <div className="text-sm font-medium text-green-800">
                              Cambio: <span className="text-lg">${change.toFixed(2)}</span>
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
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Receipt className="h-4 w-4 mr-2" />
                            Finalizar
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
