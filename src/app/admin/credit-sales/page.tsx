"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2Icon, ShoppingCart, CreditCard, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Product = {
  id: number;
  name: string;
  price: number;
  in_stock: number;
  category: string;
};

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  debt: number;
};

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
};

export default function CreditSalePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId');

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customer data
        const customerResponse = await fetch('/api/customers');
        if (customerResponse.ok) {
          const customersData = await customerResponse.json();
          setCustomers(customersData);
          
          if (customerId) {
            // Si hay customerId, usar ese cliente específico
            const selectedCustomer = customersData.find((c: Customer) => c.id === parseInt(customerId));
            if (selectedCustomer) {
              setCustomer(selectedCustomer);
            } else {
              alert('Cliente no encontrado');
              router.push('/admin/customers');
              return;
            }
          }
          // Si no hay customerId, solo cargar la lista de clientes para mostrar
        }

        // Fetch products
        const productsResponse = await fetch('/api/products');
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId, router]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      const orderData = {
        customerId: customer.id,
        paymentMethodId: null, // No hay método de pago para ventas al fiado
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
        
        // Actualizar la información del cliente
        const updatedCustomer = { ...customer, debt: customer.debt + total };
        setCustomer(updatedCustomer);
        
        // Actualizar el stock de productos
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
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2Icon className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Ventas al Fiado</h1>
          <Link href="/admin/customers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ir a Clientes
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Seleccionar Cliente</h2>
            <p className="text-muted-foreground">
              Selecciona un cliente para realizar una venta al fiado
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers.map((customerItem) => (
                <Card 
                  key={customerItem.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setCustomer(customerItem)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium">{customerItem.name}</h3>
                    <p className="text-sm text-muted-foreground">{customerItem.email}</p>
                    <p className="text-sm text-muted-foreground">{customerItem.phone}</p>
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant={customerItem.status === 'active' ? 'default' : 'secondary'}>
                        {customerItem.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <Badge variant={customerItem.debt > 0 ? 'destructive' : 'outline'}>
                        Deuda: ${customerItem.debt.toFixed(2)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {customers.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-muted-foreground">No hay clientes disponibles</p>
                  <Link href="/admin/customers" className="text-blue-500 hover:underline">
                    Ir a crear un cliente
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
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
            <ArrowLeft className="h-4 w-4 mr-2" />
            {customerId ? 'Volver a Clientes' : 'Cambiar Cliente'}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Venta al Fiado</h1>
            <p className="text-muted-foreground">Cliente: {customer.name}</p>
          </div>
        </div>
        <Badge variant="destructive" className="text-sm">
          Deuda Actual: ${customer.debt.toFixed(2)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Productos</h2>
                <div className="w-72">
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold">${product.price.toFixed(2)}</span>
                        <Badge variant={product.in_stock > 0 ? "default" : "destructive"}>
                          Stock: {product.in_stock}
                        </Badge>
                      </div>
                      <Button
                        onClick={() => addToCart(product)}
                        disabled={product.in_stock === 0}
                        className="w-full mt-2"
                        size="sm"
                      >
                        Agregar al Carrito
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Carrito</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Carrito vacío
                </p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} c/u
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          size="sm"
                          variant="outline"
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          size="sm"
                          variant="outline"
                        >
                          +
                        </Button>
                        <Button
                          onClick={() => removeFromCart(item.id)}
                          size="sm"
                          variant="destructive"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Nueva deuda total:</span>
                      <span>${(customer.debt + total).toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={processCreditSale}
                    disabled={processing}
                    className="w-full bg-orange-600 hover:bg-orange-700"
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
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}