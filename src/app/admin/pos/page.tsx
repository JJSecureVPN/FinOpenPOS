"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, ShoppingCart, X, Plus, Minus, Trash2, CreditCard, DollarSign } from "lucide-react";
import { getEnabledPaymentMethods, type PaymentMethod } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Typography } from "@/components/ui";
import type { Product, CartItem } from "./types";

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [paymentReceived, setPaymentReceived] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [showCart, setShowCart] = useState(false);
  // const [showPayment, setShowPayment] = useState(false);
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
        window.location.href = "/login";
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Búsqueda y filtrado de productos
  useEffect(() => {
    if (searchTerm.trim() === "" && selectedCategory === "all") {
      setSearchResults([]);
      return;
    }

    let filtered = products;
    
    // Filtrar por categoría
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setSearchResults(filtered);
  }, [products, searchTerm, selectedCategory]);

  // Obtener categorías únicas (memoizado)
  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.category))).sort(),
    [products]
  );

  const addToCart = (product: Product) => {
    if (product.in_stock === 0) {
      alert("❌ Producto agotado");
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.in_stock) {
          alert(`❌ No hay suficiente stock. Stock disponible: ${product.in_stock}`);
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1, subtotal: product.price }];
      }
    });
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.in_stock) {
      alert(`❌ No hay suficiente stock. Stock disponible: ${product.in_stock}`);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
          : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  setPaymentReceived("");
  };

  const handleSale = async () => {
    if (cart.length === 0) {
      alert("❌ El carrito está vacío");
      return;
    }

    if (!selectedPaymentMethod) {
      alert("❌ Selecciona un método de pago");
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const received = parseFloat(paymentReceived) || 0;
    
    if (selectedPaymentMethod === 'cash' && received < total) {
      alert("❌ El monto recibido es insuficiente");
      return;
    }

    try {
      const saleResponse = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            subtotal: item.subtotal
          })),
          total_amount: total,
          payment_method: selectedPaymentMethod,
          payment_received: selectedPaymentMethod === 'cash' ? received : total,
          change_given: selectedPaymentMethod === 'cash' ? Math.max(0, received - total) : 0
        }),
      });

      if (!saleResponse.ok) {
        const errorData = await saleResponse.json();
        throw new Error(errorData.error || "Error al procesar la venta");
      }

      const saleData = await saleResponse.json();

      for (const item of cart) {
        const updateResponse = await fetch(`/api/products/${item.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            in_stock: item.in_stock - item.quantity
          }),
        });

        if (!updateResponse.ok) {
          console.error(`Error actualizando stock del producto ${item.id}`);
        }
      }

      await fetchProducts();

      const paymentMethodName = availablePaymentMethods.find(m => m.id === selectedPaymentMethod)?.name || selectedPaymentMethod;
      
      if (selectedPaymentMethod === 'cash') {
        const change = Math.max(0, received - total);
        alert(`✅ Venta procesada exitosamente!\n\nTotal: $${total.toFixed(2)}\nRecibido: $${received.toFixed(2)}\nCambio: $${change.toFixed(2)}\nMétodo: ${paymentMethodName}\nVenta #${saleData.id}`);
      } else {
        alert(`✅ Venta procesada exitosamente!\n\nTotal: $${total.toFixed(2)}\nMétodo: ${paymentMethodName}\nVenta #${saleData.id}`);
      }
      
      clearCart();
    } catch (error) {
      console.error("Error procesando venta:", error);
      alert(`❌ Error al procesar la venta:\n${error instanceof Error ? error.message : 'Error desconocido'}\n\nRevisa la consola para más detalles.`);
    }
  };

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const totalAmount = useMemo(() => cart.reduce((sum, item) => sum + item.subtotal, 0), [cart]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <Typography variant="body" className="mt-4 text-muted-foreground">Cargando productos...</Typography>
        </div>
      </div>
    );
  }

  // Subcomponentes internos para reducir duplicación
  const PaymentMethodIcon = ({ id }: { id: string }) => {
    if (id === 'cash') return <DollarSign className="h-4 w-4" />;
    if (id === 'credit-card' || id === 'debit-card' || id === 'transfer') return <CreditCard className="h-4 w-4" />;
    return null;
  };

  const EmptyState = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="text-center py-12 text-gray-500">
      <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
      <Typography variant="body">{title}</Typography>
      {subtitle && (
        <Typography variant="body-sm" className="mt-2">{subtitle}</Typography>
      )}
    </div>
  );

  const ProductCard = ({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) => (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Typography variant="body" className="font-medium">
            {product.name}
          </Typography>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
            <Typography variant="body-sm" className="text-gray-500">
              Stock: {product.in_stock}
            </Typography>
          </div>
          <Typography variant="body" className="font-semibold text-primary mt-1">
            ${product.price.toFixed(2)}
          </Typography>
        </div>
        <Button
          onClick={() => onAdd(product)}
          disabled={product.in_stock === 0}
          size="sm"
          className="ml-4"
        >
          Agregar
        </Button>
      </div>
    </Card>
  );

  const CartItemRow = ({ item }: { item: CartItem }) => (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Typography variant="body" className="font-medium">
            {item.name}
          </Typography>
          <Typography variant="body-sm" className="text-gray-500">
            ${item.price.toFixed(2)} c/u
          </Typography>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Typography variant="body" className="w-8 text-center">
            {item.quantity}
          </Typography>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeFromCart(item.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="mt-2 text-right">
        <Typography variant="body" className="font-semibold">
          ${item.subtotal.toFixed(2)}
        </Typography>
      </div>
    </Card>
  );

  return (
    <div className="relative bg-background">
      {/* Header del POS con altura fija (56px) */}
      <div className="h-14 px-4 border-b sticky top-0 z-20 bg-background flex items-center">
        <ShoppingCart className="h-6 w-6 text-primary mr-2" />
        <Typography variant="h2">Punto de Venta</Typography>
      </div>

  {/* Área principal de búsqueda (sin contenedor oscuro, sin scroll extra) */}
  {/* min-h = 100vh - header global (56) - header POS (56) - footer (56) = 100vh - 168px */}
  <div className="px-4 pt-4 pb-[56px] min-h-[calc(100vh-168px)]">
          {/* Buscador y filtros */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar productos por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            
            {/* Selector de categorías */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="rounded-full"
              >
                Todas
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Resultados de búsqueda */}
          <div className="space-y-2">
            {searchResults.length === 0 && (searchTerm.trim() !== "" || selectedCategory !== "all") && (
              <EmptyState title="No se encontraron productos" />
            )}
            {searchResults.length === 0 && searchTerm.trim() === "" && selectedCategory === "all" && (
              <EmptyState
                title="Busca productos por nombre o categoría"
                subtitle="Usa la barra de búsqueda o selecciona una categoría para comenzar"
              />
            )}
            {searchResults.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
        </div>
      
  {/* Footer fijo dentro del área de contenido (respeta sidebar en todas las vistas) */}
      <div className="fixed bottom-0 left-16 right-0 h-[56px] bg-background border-t shadow-lg z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Contador de productos */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-600" />
                {totalItems > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {totalItems}
                  </Badge>
                )}
              </div>
              <Typography variant="body-sm" className="text-gray-600">
                {totalItems} producto{totalItems !== 1 ? 's' : ''}
              </Typography>
              {totalAmount > 0 && (
                <Typography variant="body" className="font-semibold">
                  ${totalAmount.toFixed(2)}
                </Typography>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-2">
              {totalItems > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowCart(true)}
                  size="sm"
                >
                  Ver Carrito
                </Button>
              )}
              <Button
                onClick={() => totalItems > 0 ? setShowCart(true) : null}
                disabled={totalItems === 0}
                size="sm"
                className="px-6"
              >
                Pagar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Carrito como bottom sheet desde el footer (respeta sidebar) */}
      {showCart && (
        <div className="fixed inset-y-0 left-16 right-0 z-40" onClick={() => setShowCart(false)}>
          <div
            className="fixed bottom-0 left-16 right-0 bg-card rounded-t-lg shadow-xl border overflow-hidden max-h-[75vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del carrito */}
            <div className="flex items-center justify-between p-4 border-b bg-background">
              <Typography variant="h3">Carrito de Compras</Typography>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCart(false)}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Lista de productos */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <Typography variant="body" className="text-gray-500">
                    El carrito está vacío
                  </Typography>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer del carrito con total y pago */}
            {cart.length > 0 && (
              <div className="border-t p-4 space-y-4 bg-background">
                <div className="flex justify-between items-center">
                  <Typography variant="h3">Total:</Typography>
                  <Typography variant="h3" className="text-primary">
                    ${totalAmount.toFixed(2)}
                  </Typography>
                </div>
                
                {/* Métodos de pago */}
                <div className="space-y-3">
                  <Typography variant="body-sm" className="text-gray-600">
                    Método de pago:
                  </Typography>
                  <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePaymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          <div className="flex items-center space-x-2">
                            <PaymentMethodIcon id={method.id} />
                            <span>{method.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Input para efectivo */}
                  {selectedPaymentMethod === 'cash' && (
                    <div className="space-y-2">
                      <Typography variant="body-sm" className="text-gray-600">
                        Monto recibido:
                      </Typography>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={paymentReceived}
                        onChange={(e) => setPaymentReceived(e.target.value)}
                        className="text-base"
                      />
                      {paymentReceived && parseFloat(paymentReceived) >= totalAmount && (
                        <Typography variant="body-sm" className="text-green-600">
                          Cambio: ${(parseFloat(paymentReceived) - totalAmount).toFixed(2)}
                        </Typography>
                      )}
                    </div>
                  )}

                  {/* Botón de procesar venta */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="flex-1"
                    >
                      Limpiar
                    </Button>
                    <Button
                      onClick={handleSale}
                      className="flex-1"
                      disabled={!selectedPaymentMethod || (selectedPaymentMethod === 'cash' && parseFloat(paymentReceived || '0') < totalAmount)}
                    >
                      Procesar Venta
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
