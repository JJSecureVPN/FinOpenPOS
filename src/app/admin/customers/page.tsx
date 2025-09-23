"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, ResponsiveShow, ResponsiveGrid } from "@/components/responsive";
import { Loader2Icon, PlusCircle, Trash2, DollarSign, HistoryIcon, ShoppingCart, FilePenIcon, AlertCircle } from "lucide-react";

// Import our new modular components
import CustomerStats from "./CustomerStats";
import CustomerSearchFilters from "./CustomerSearchFilters";
import CustomersTable from "./CustomersTable";
import CustomerForm from "./CustomerForm";
import type { Customer, NewCustomerForm, CustomerFilters, DebtPayment, CustomerActivity, CustomerOrder, CustomerHistory } from "./types";

export default function CustomersPage() {
  const router = useRouter();
  
  // Main data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<CustomerFilters>({
    status: "all"
  });
  
  // Dialog states
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [showEditCustomerDialog, setShowEditCustomerDialog] = useState(false);
  const [showDeleteConfirmationDialog, setShowDeleteConfirmationDialog] = useState(false);
  const [showDebtPaymentDialog, setShowDebtPaymentDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showOrdersDialog, setShowOrdersDialog] = useState(false);
  
  // Selected customer states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  
  // Payment state
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // History state
  const [customerHistory, setCustomerHistory] = useState<CustomerHistory | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/customers");
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        const data = await response.json();
        
        // Transform data to include required fields
        const transformedData = data.map((customer: any) => ({
          ...customer,
          totalOrders: customer.totalOrders || 0,
          totalSpent: customer.totalSpent || 0,
          debt: customer.debt || 0
        }));
        
        setCustomers(transformedData);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      if (filters.status !== "all" && customer.status !== filters.status) {
        return false;
      }
      return (
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
    });
  }, [customers, filters, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === "active").length;
    const inactiveCustomers = customers.filter(c => c.status === "inactive").length;
    const totalDebt = customers.reduce((sum, c) => sum + c.debt, 0);
    
    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      totalDebt
    };
  }, [customers]);

  // Customer CRUD operations
  const handleAddCustomer = useCallback(async (customerData: NewCustomerForm) => {
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        throw new Error("Failed to add customer");
      }

      const newCustomer = await response.json();
      setCustomers(prev => [...prev, {
        ...newCustomer,
        totalOrders: 0,
        totalSpent: 0,
        debt: 0
      }]);
      setShowNewCustomerDialog(false);
    } catch (error) {
      console.error("Error adding customer:", error);
      setError("Error al agregar cliente");
    }
  }, []);

  const handleEditCustomer = useCallback(async (customerData: NewCustomerForm) => {
    if (!selectedCustomer) return;
    
    try {
      const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      const updatedCustomer = await response.json();
      setCustomers(prev => 
        prev.map(c => c.id === selectedCustomer.id ? {
          ...updatedCustomer,
          totalOrders: c.totalOrders,
          totalSpent: c.totalSpent,
          debt: c.debt
        } : c)
      );
      setShowEditCustomerDialog(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error("Error updating customer:", error);
      setError("Error al actualizar cliente");
    }
  }, [selectedCustomer]);

  const handleDeleteCustomer = useCallback(async () => {
    if (!customerToDelete) return;
    
    try {
      const response = await fetch(`/api/customers/${customerToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
      setShowDeleteConfirmationDialog(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error("Error deleting customer:", error);
      setError("Error al eliminar cliente");
    }
  }, [customerToDelete]);

  // Payment operations
  const handlePayDebt = useCallback(async () => {
    if (!selectedCustomer || !paymentAmount) return;
    
    setIsProcessingPayment(true);
    try {
      const response = await fetch("/api/customers/pay-debt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: selectedCustomer.id,
          amount: parseFloat(paymentAmount),
          description: paymentDescription || "Pago de deuda",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process payment");
      }

      // Update customer debt
      setCustomers(prev => 
        prev.map(c => c.id === selectedCustomer.id 
          ? { ...c, debt: Math.max(0, c.debt - parseFloat(paymentAmount)) }
          : c
        )
      );
      
      setShowDebtPaymentDialog(false);
      setSelectedCustomer(null);
      setPaymentAmount("");
      setPaymentDescription("");
    } catch (error) {
      console.error("Error processing payment:", error);
      setError("Error al procesar el pago");
    } finally {
      setIsProcessingPayment(false);
    }
  }, [selectedCustomer, paymentAmount, paymentDescription]);

  // History operations
  const fetchCustomerHistory = useCallback(async (customer: Customer) => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/customers/${customer.id}/history`);
      if (!response.ok) {
        throw new Error("Failed to fetch customer history");
      }
      const history = await response.json();
      setCustomerHistory(history);
    } catch (error) {
      console.error("Error fetching history:", error);
      setError("Error al cargar el historial");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Event handlers
  const onEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowEditCustomerDialog(true);
  };

  const onViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    fetchCustomerHistory(customer);
    setShowHistoryDialog(true);
  };

  const onPayDebt = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPaymentAmount(customer.debt.toString());
    setShowDebtPaymentDialog(true);
  };

  const onViewHistory = (customer: Customer) => {
    setSelectedCustomer(customer);
    fetchCustomerHistory(customer);
    setShowHistoryDialog(true);
  };

  const onViewOrders = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowOrdersDialog(true);
  };

  const onClearFilters = () => {
    setSearchTerm("");
    setFilters({ status: "all" });
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
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Page Header */}
        <ResponsiveShow on="mobile">
          <div className="flex flex-col space-y-4">
            <h1 className="text-2xl font-bold">Clientes</h1>
            <Button onClick={() => setShowNewCustomerDialog(true)} className="w-full">
              <PlusCircle className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </ResponsiveShow>

        <ResponsiveShow on="tablet-desktop">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
            <Button onClick={() => setShowNewCustomerDialog(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </ResponsiveShow>

        {/* Statistics */}
        <CustomerStats customers={customers} />

        {/* Search and Filters */}
        <CustomerSearchFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={onClearFilters}
          totalCount={customers.length}
          filteredCount={filteredCustomers.length}
        />

        {/* Customers Table */}
        <CustomersTable
          customers={filteredCustomers}
          onEdit={onEditCustomer}
          onViewDetails={onViewDetails}
          onPayDebt={onPayDebt}
          onViewHistory={onViewHistory}
          onViewOrders={onViewOrders}
        />

        {/* New Customer Dialog */}
        <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
              <DialogDescription>
                Complete la información del nuevo cliente
              </DialogDescription>
            </DialogHeader>
            <CustomerForm
              onSubmit={handleAddCustomer}
              onCancel={() => setShowNewCustomerDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Customer Dialog */}
        <Dialog open={showEditCustomerDialog} onOpenChange={setShowEditCustomerDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>
                Modifique la información del cliente
              </DialogDescription>
            </DialogHeader>
            {selectedCustomer && (
              <CustomerForm
                onSubmit={handleEditCustomer}
                onCancel={() => {
                  setShowEditCustomerDialog(false);
                  setSelectedCustomer(null);
                }}
                initialData={{
                  name: selectedCustomer.name,
                  email: selectedCustomer.email,
                  phone: selectedCustomer.phone,
                  status: selectedCustomer.status
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Debt Payment Dialog */}
        <Dialog open={showDebtPaymentDialog} onOpenChange={setShowDebtPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pagar Deuda</DialogTitle>
              <DialogDescription>
                {selectedCustomer && `Procesar pago para ${selectedCustomer.name}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Monto a Pagar</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Input
                  id="description"
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  placeholder="Descripción del pago..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDebtPaymentDialog(false);
                  setSelectedCustomer(null);
                  setPaymentAmount("");
                  setPaymentDescription("");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePayDebt}
                disabled={!paymentAmount || isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <Loader2Icon className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <DollarSign className="w-4 h-4 mr-2" />
                )}
                Procesar Pago
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCustomer && `Historial de ${selectedCustomer.name}`}
              </DialogTitle>
            </DialogHeader>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2Icon className="w-8 h-8 animate-spin" />
              </div>
            ) : customerHistory ? (
              <Tabs defaultValue="activities" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="activities">Actividades</TabsTrigger>
                  <TabsTrigger value="orders">Órdenes</TabsTrigger>
                  <TabsTrigger value="payments">Pagos</TabsTrigger>
                </TabsList>
                <TabsContent value="activities" className="space-y-4">
                  {customerHistory.activities.map((activity) => (
                    <Card key={activity.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{activity.description}</p>
                            <p className="text-sm text-gray-500">{activity.created_at}</p>
                          </div>
                          {activity.amount && (
                            <Badge variant="outline">${activity.amount}</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                <TabsContent value="orders">
                  {/* Orders content */}
                  <p>Contenido de órdenes...</p>
                </TabsContent>
                <TabsContent value="payments">
                  {/* Payments content */}
                  <p>Contenido de pagos...</p>
                </TabsContent>
              </Tabs>
            ) : (
              <p>No se pudo cargar el historial</p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ResponsiveContainer>
  );
}