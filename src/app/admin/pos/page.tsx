"use client";

import React, { useState, useEffect } from "react";
import { Receipt } from "lucide-react";
import { configService, getEnabledPaymentMethods, type PaymentMethod } from "@/lib/config";
import { ResponsiveContainer, MobileAdaptive } from "@/components/responsive";
import { Typography } from "@/components/ui/typography";
import type { Product, CartItem } from "./types";
import ProductsGrid from "./ProductsGrid";
import CartPanel from "./CartPanel";
import SearchHeader from "./SearchHeader";

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

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, searchTerm]);

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
    setShowPayment(false);
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

  return (
    <ResponsiveContainer variant="page" padding="md">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Receipt className="h-8 w-8 text-primary" />
        <Typography variant="h1" weight="bold">Punto de Venta</Typography>
      </div>

      <MobileAdaptive
        mobileLayout="stack"
        breakpoint="lg"
        className="gap-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de Productos */}
          <div className="lg:col-span-3">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6">
                <SearchHeader
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  productsCount={filteredProducts.length}
                />
                
                <ProductsGrid
                  products={filteredProducts}
                  onAddToCart={addToCart}
                />
              </div>
            </div>
          </div>

          {/* Panel del Carrito */}
          <div className="lg:col-span-1">
            <CartPanel
              cart={cart}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
              onClearCart={clearCart}
              showPayment={showPayment}
              onShowPayment={setShowPayment}
              onProcessSale={handleSale}
              paymentReceived={paymentReceived}
              onPaymentReceivedChange={setPaymentReceived}
              selectedPaymentMethod={selectedPaymentMethod}
              onPaymentMethodChange={setSelectedPaymentMethod}
              availablePaymentMethods={availablePaymentMethods}
            />
          </div>
        </div>
      </MobileAdaptive>
    </ResponsiveContainer>
  );
}
