"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, ResponsiveShow } from "@/components/responsive";
import { Loader2Icon, ArrowLeft, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Import our new modular components
import CreditSaleStats from "./CreditSaleStats";
import CustomerSelector from "./CustomerSelector";
import ProductsGrid from "./ProductsGrid";
import CartPanel from "./CartPanel";
import type { Product, Customer, CartItem, CreditSaleFilters, CreditSaleOrder } from "./types";

function CreditSalePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId');

  // Main data state
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<CreditSaleFilters>({
    category: "all",
    stockStatus: "all"
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customers
        const customerResponse = await fetch('/api/customers');
        if (customerResponse.ok) {
          const customersData = await customerResponse.json();
          setCustomers(customersData);
          
          if (customerId) {
            const selectedCustomer = customersData.find((c: Customer) => c.id === parseInt(customerId));
            if (selectedCustomer) {
              setCustomer(selectedCustomer);
            } else {
              setError('Cliente no encontrado');
              router.push('/admin/customers');
              return;
            }
          }
        }

        // Fetch products
        const productsResponse = await fetch('/api/products');
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId, router]);

  // Cart operations
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.in_stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        alert(`Solo hay ${product.in_stock} unidades disponibles`);
      }
    } else {
      if (product.in_stock > 0) {
        setCart([...cart, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          stock: product.in_stock
        }]);
      } else {
        alert('Producto sin stock');
      }
    }
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      const item = cart.find(item => item.id === id);
      if (item && quantity <= item.stock) {
        setCart(cart.map(item =>
          item.id === id ? { ...item, quantity } : item
        ));
      } else {
        alert(`Solo hay ${item?.stock} unidades disponibles`);
      }
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Process credit sale
  const processCreditSale = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    if (!customer) {
      alert('Cliente no encontrado');
      return;
    }

    setProcessing(true);

    try {
      const orderData: CreditSaleOrder = {
        customerId: customer.id,
        paymentMethodId: null,
        products: cart.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total: total,
        isCreditSale: true
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        alert(`Venta al fiado procesada exitosamente.\nTotal: $${total.toFixed(2)}\nCliente: ${customer.name}`);
        setCart([]);
        
        // Update customer debt
        const updatedCustomer = { ...customer, debt: customer.debt + total };
        setCustomer(updatedCustomer);
        
        // Update product stock
        const updatedProducts = products.map(product => {
          const cartItem = cart.find(item => item.id === product.id);
          return cartItem
            ? { ...product, in_stock: product.in_stock - cartItem.quantity }
            : product;
        });
        setProducts(updatedProducts);
        
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error processing credit sale:', error);
      alert('Error procesando la venta al fiado');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <ResponsiveContainer>
        <div className="flex items-center justify-center h-64">
          <Loader2Icon className="w-8 h-8 animate-spin" />
        </div>
      </ResponsiveContainer>
    );
  }

  if (error) {
    return (
      <ResponsiveContainer>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </ResponsiveContainer>
    );
  }

  // Show customer selector if no customer is selected
  if (!customer) {
    return (
      <CustomerSelector 
        customers={customers}
        onSelectCustomer={setCustomer}
      />
    );
  }

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header */}
        <ResponsiveShow on="mobile">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (customerId) {
                    router.push('/admin/customers');
                  } else {
                    setCustomer(null);
                  }
                }}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1">
                <h1 className="text-xl font-bold">Venta al Fiado</h1>
                <p className="text-sm text-gray-600">{customer.name}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-orange-800">Deuda Actual:</span>
              <Badge variant="destructive" className="text-sm">
                ${customer.debt.toFixed(2)}
              </Badge>
            </div>
          </div>
        </ResponsiveShow>

        <ResponsiveShow on="tablet-desktop">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (customerId) {
                    router.push('/admin/customers');
                  } else {
                    setCustomer(null);
                  }
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {customerId ? 'Volver a Clientes' : 'Cambiar Cliente'}
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Venta al Fiado</h1>
                <p className="text-gray-600 mt-1">Cliente: {customer.name}</p>
              </div>
            </div>
            
            <Badge variant="destructive" className="text-lg px-4 py-2">
              Deuda Actual: ${customer.debt.toFixed(2)}
            </Badge>
          </div>
        </ResponsiveShow>

        {/* Statistics */}
        <CreditSaleStats 
          products={products}
          selectedCustomer={customer}
          cartTotal={total}
          cartItemsCount={cartItemsCount}
        />

        {/* Main Content */}
        <ResponsiveShow on="mobile">
          <div className="space-y-6">
            {/* Products Grid */}
            <ProductsGrid
              products={products}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filters={filters}
              onFiltersChange={setFilters}
              onAddToCart={addToCart}
            />
            
            {/* Cart Panel */}
            <CartPanel
              cart={cart}
              customer={customer}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
              onProcessSale={processCreditSale}
              processing={processing}
            />
          </div>
        </ResponsiveShow>

        <ResponsiveShow on="tablet-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products Section */}
            <div className="lg:col-span-2">
              <ProductsGrid
                products={products}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filters}
                onFiltersChange={setFilters}
                onAddToCart={addToCart}
              />
            </div>

            {/* Cart Section */}
            <div className="lg:col-span-1">
              <CartPanel
                cart={cart}
                customer={customer}
                onUpdateQuantity={updateQuantity}
                onRemoveFromCart={removeFromCart}
                onProcessSale={processCreditSale}
                processing={processing}
              />
            </div>
          </div>
        </ResponsiveShow>
      </div>
    </ResponsiveContainer>
  );
}

export default function CreditSalePage() {
  return (
    <Suspense fallback={
      <ResponsiveContainer>
        <div className="flex items-center justify-center h-64">
          <Loader2Icon className="w-8 h-8 animate-spin" />
        </div>
      </ResponsiveContainer>
    }>
      <CreditSalePageInner />
    </Suspense>
  );
}