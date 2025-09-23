"use client";

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import {
  Loader2Icon,
  PlusCircle,
  Trash2,
  SearchIcon,
  FilterIcon,
  FilePenIcon,
  HistoryIcon,
  Calendar,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  debt: number;
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerStatus, setNewCustomerStatus] = useState<
    "active" | "inactive"
  >("active");
  const [isEditCustomerDialogOpen, setIsEditCustomerDialogOpen] =
    useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );
  
  // Estados para el pago de deuda
  const [showDebtPaymentDialog, setShowDebtPaymentDialog] = useState(false);
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Estados para el modal de historial
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);
  const [customerHistory, setCustomerHistory] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/customers");
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

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
  }, [customers, filters.status, searchTerm]);

  const resetSelectedCustomer = () => {
    setSelectedCustomerId(null);
    setNewCustomerName("");
    setNewCustomerEmail("");
    setNewCustomerPhone("");
    setNewCustomerStatus("active");
  };

  const handleAddCustomer = useCallback(async () => {
    try {
      const newCustomer = {
        name: newCustomerName,
        email: newCustomerEmail,
        phone: newCustomerPhone,
        status: newCustomerStatus,
      };
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCustomer),
      });

      if (!response.ok) {
        throw new Error("Error creating customer");
      }

      const createdCustomer = await response.json();
      setCustomers([...customers, createdCustomer]);
      setShowNewCustomerDialog(false);
      resetSelectedCustomer();
    } catch (error) {
      console.error(error);
    }
  }, [
    newCustomerName,
    newCustomerEmail,
    newCustomerPhone,
    newCustomerStatus,
    customers,
  ]);

  const handleEditCustomer = useCallback(async () => {
    if (!selectedCustomerId) return;
    try {
      const updatedCustomer = {
        id: selectedCustomerId,
        name: newCustomerName,
        email: newCustomerEmail,
        phone: newCustomerPhone,
        status: newCustomerStatus,
      };
      const response = await fetch(`/api/customers/${selectedCustomerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCustomer),
      });

      if (!response.ok) {
        throw new Error("Error updating customer");
      }

      const updatedCustomerData = await response.json();
      setCustomers(
        customers.map((c) =>
          c.id === updatedCustomerData.id ? updatedCustomerData : c
        )
      );
      setIsEditCustomerDialogOpen(false);
      resetSelectedCustomer();
    } catch (error) {
      console.error(error);
    }
  }, [
    selectedCustomerId,
    newCustomerName,
    newCustomerEmail,
    newCustomerPhone,
    newCustomerStatus,
    customers,
  ]);

  const handleDeleteCustomer = useCallback(async () => {
    if (!customerToDelete) return;
    try {
      const response = await fetch(`/api/customers/${customerToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error deleting customer");
      }

      setCustomers(customers.filter((c) => c.id !== customerToDelete.id));
      setIsDeleteConfirmationOpen(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error(error);
    }
  }, [customerToDelete, customers]);

  // Función para manejar el pago de deuda
  const handleDebtPayment = useCallback(async () => {
    if (!selectedCustomerForPayment || !paymentAmount) return;
    
    setIsProcessingPayment(true);
    try {
      const amount = parseFloat(paymentAmount);
      
      if (amount <= 0) {
        alert('El monto debe ser mayor a 0');
        return;
      }
      
      if (amount > selectedCustomerForPayment.debt) {
        alert('El monto no puede ser mayor a la deuda del cliente');
        return;
      }

      const response = await fetch('/api/debt-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomerForPayment.id,
          amount: amount,
          description: paymentDescription || `Pago de deuda de ${selectedCustomerForPayment.name}`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error processing payment');
      }

      const result = await response.json();
      
      // Actualizar el cliente en la lista
      setCustomers(customers.map(customer => 
        customer.id === selectedCustomerForPayment.id 
          ? { ...customer, debt: result.newDebt }
          : customer
      ));

      // Resetear el diálogo
      setShowDebtPaymentDialog(false);
      setSelectedCustomerForPayment(null);
      setPaymentAmount('');
      setPaymentDescription('');
      
      alert(result.message);

    } catch (error) {
      console.error('Error processing debt payment:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessingPayment(false);
    }
  }, [selectedCustomerForPayment, paymentAmount, paymentDescription, customers]);

  // Función para cargar el historial del cliente
  const handleViewHistory = useCallback(async (customer: Customer) => {
    setSelectedCustomerForHistory(customer);
    setShowHistoryDialog(true);
    setLoadingHistory(true);
    setCustomerHistory(null);

    try {
      const response = await fetch(`/api/customers/${customer.id}/history`);
      if (!response.ok) {
        throw new Error('Error loading customer history');
      }
      
      const historyData = await response.json();
      console.log('Customer history data received:', historyData);
      setCustomerHistory(historyData);
    } catch (error) {
      console.error('Error loading customer history:', error);
      alert('Error cargando el historial del cliente');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      status: value,
    }));
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2Icon className="mx-auto h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Clientes</h1>
        <Card>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="flex flex-col gap-6 p-6">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={handleSearch}
                className="pr-8"
              />
              <SearchIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <FilterIcon className="w-4 h-4" />
                  <span>Filtros</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filtrar por Estado</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.status === "all"}
                  onCheckedChange={() => handleFilterChange("all")}
                >
                  Todos los Estados
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.status === "active"}
                  onCheckedChange={() => handleFilterChange("active")}
                >
                  Activo
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.status === "inactive"}
                  onCheckedChange={() => handleFilterChange("inactive")}
                >
                  Inactivo
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button size="sm" onClick={() => setShowNewCustomerDialog(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Agregar Cliente
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Deuda</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.status}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-red-600">
                      ${(customer.debt || 0).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                        onClick={() => {
                          router.push(`/admin/credit-sales?customerId=${customer.id}`);
                        }}
                      >
                        Vender al Fiado
                      </Button>
                      {customer.debt > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          onClick={() => {
                            setSelectedCustomerForPayment(customer);
                            setPaymentAmount(customer.debt.toString());
                            setShowDebtPaymentDialog(true);
                          }}
                        >
                          Cobrar Deuda
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleViewHistory(customer)}
                        title="Ver historial"
                      >
                        <HistoryIcon className="w-4 h-4" />
                        <span className="sr-only">Historial</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedCustomerId(customer.id);
                          setNewCustomerName(customer.name);
                          setNewCustomerEmail(customer.email);
                          setNewCustomerPhone(customer.phone);
                          setNewCustomerStatus(customer.status);
                          setIsEditCustomerDialogOpen(true);
                        }}
                      >
                        <FilePenIcon className="w-4 h-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setCustomerToDelete(customer);
                          setIsDeleteConfirmationOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        {/* Pagination can be added here if needed */}
      </CardFooter>

      <Dialog
        open={showNewCustomerDialog || isEditCustomerDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setShowNewCustomerDialog(false);
            setIsEditCustomerDialogOpen(false);
            resetSelectedCustomer();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showNewCustomerDialog ? "Crear Nuevo Cliente" : "Editar Cliente"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={newCustomerEmail}
                onChange={(e) => setNewCustomerEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newCustomerStatus}
                onValueChange={(value: "active" | "inactive") =>
                  setNewCustomerStatus(value)
                }
              >
                <SelectTrigger id="status" className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setShowNewCustomerDialog(false);
                setIsEditCustomerDialogOpen(false);
                resetSelectedCustomer();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={
                showNewCustomerDialog ? handleAddCustomer : handleEditCustomer
              }
            >
              {showNewCustomerDialog ? "Create Customer" : "Update Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteConfirmationOpen}
        onOpenChange={setIsDeleteConfirmationOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          Are you sure you want to delete this customer? This action cannot be
          undone.
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsDeleteConfirmationOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCustomer}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de pago de deuda */}
      <Dialog open={showDebtPaymentDialog} onOpenChange={setShowDebtPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cobrar Deuda</DialogTitle>
          </DialogHeader>
          
          {selectedCustomerForPayment && (
            <div className="space-y-4">
              <div>
                <p><strong>Cliente:</strong> {selectedCustomerForPayment.name}</p>
                <p><strong>Deuda Total:</strong> <span className="text-red-600 font-semibold">${(selectedCustomerForPayment.debt || 0).toFixed(2)}</span></p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Monto a Cobrar</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedCustomerForPayment.debt}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Ingrese el monto"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentDescription">Descripción (Opcional)</Label>
                <Input
                  id="paymentDescription"
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  placeholder="Descripción del pago"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDebtPaymentDialog(false);
                setSelectedCustomerForPayment(null);
                setPaymentAmount('');
                setPaymentDescription('');
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleDebtPayment}
              disabled={isProcessingPayment || !paymentAmount || parseFloat(paymentAmount || '0') <= 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Procesar Pago'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Historial del Cliente */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HistoryIcon className="h-5 w-5" />
              Historial de {selectedCustomerForHistory?.name}
            </DialogTitle>
            <DialogDescription>
              Información completa sobre pedidos, pagos y actividad del cliente
            </DialogDescription>
          </DialogHeader>

          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <Loader2Icon className="h-8 w-8 animate-spin" />
            </div>
          ) : customerHistory ? (
            <Tabs defaultValue="statistics" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="statistics" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Estadísticas
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Pedidos ({customerHistory.orders?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Pagos ({customerHistory.debtPayments?.length || 0})
                </TabsTrigger>
              </TabsList>

              {/* Tab de Estadísticas */}
              <TabsContent value="statistics" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Pedidos</p>
                          <p className="text-lg font-semibold">{customerHistory.statistics?.totalOrders || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Gastado</p>
                          <p className="text-lg font-semibold">${(customerHistory.statistics?.totalSpent || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Pagos</p>
                          <p className="text-lg font-semibold">{customerHistory.statistics?.totalPayments || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-red-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Deuda Actual</p>
                          <p className="text-lg font-semibold">${selectedCustomerForHistory?.debt?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Timeline de Actividad */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Actividad Reciente</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {customerHistory.timeline?.length > 0 ? (
                        customerHistory.timeline.map((activity: any, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <div className={`p-1 rounded-full ${
                              activity.type === 'order' ? 'bg-blue-100 text-blue-600' :
                              activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {activity.type === 'order' ? <ShoppingCart className="h-3 w-3" /> :
                               activity.type === 'payment' ? <DollarSign className="h-3 w-3" /> :
                               <Calendar className="h-3 w-3" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.description}</p>
                              <p className="text-xs text-muted-foreground">{activity.date}</p>
                            </div>
                            <div className="text-sm font-medium">
                              ${activity.amount?.toFixed(2)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-4">No hay actividad registrada</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab de Pedidos */}
              <TabsContent value="orders" className="space-y-4">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {customerHistory.orders?.length > 0 ? (
                    customerHistory.orders.map((order: any) => (
                      <Card key={order.id}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">Pedido #{order.id}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${(order.total || 0).toFixed(2)}</p>
                              <Badge variant={order.is_credit ? "destructive" : "default"}>
                                {order.is_credit ? "Al Fiado" : "Pagado"}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {order.items && order.items.length > 0 ? (
                              order.items.map((item: any, itemIndex: number) => (
                                <div key={itemIndex} className="flex justify-between text-sm">
                                  <span>{item.quantity}x {item.product_name}</span>
                                  <span>${(item.subtotal || 0).toFixed(2)}</span>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground italic">
                                No se encontraron detalles de productos para este pedido
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No hay pedidos registrados</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Tab de Pagos */}
              <TabsContent value="payments" className="space-y-4">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {customerHistory.debtPayments?.length > 0 ? (
                    customerHistory.debtPayments.map((payment: any) => (
                      <Card key={payment.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-full bg-green-100 text-green-600">
                                <DollarSign className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className="font-semibold">Pago de Deuda</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(payment.created_at).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                {payment.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{payment.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">+${(payment.amount || 0).toFixed(2)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No hay pagos registrados</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se pudo cargar el historial del cliente</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
