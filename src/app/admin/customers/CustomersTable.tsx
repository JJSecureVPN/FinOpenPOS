"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveShow, ResponsiveGrid } from "@/components/responsive";
import { 
  Edit, 
  Eye, 
  DollarSign, 
  History, 
  ShoppingCart, 
  User, 
  Mail, 
  Phone,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import type { Customer } from "./types";

interface CustomersTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onViewDetails: (customer: Customer) => void;
  onPayDebt: (customer: Customer) => void;
  onViewHistory: (customer: Customer) => void;
  onViewOrders: (customer: Customer) => void;
}

export default function CustomersTable({ 
  customers, 
  onEdit, 
  onViewDetails, 
  onPayDebt, 
  onViewHistory, 
  onViewOrders 
}: CustomersTableProps) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const CustomerCard = ({ customer }: { customer: Customer }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{customer.name}</CardTitle>
              <Badge variant={customer.status === "active" ? "default" : "secondary"} className="mt-1">
                {customer.status === "active" ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <AlertCircle className="w-3 h-3 mr-1" />
                )}
                {customer.status === "active" ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(customer)}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{customer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{customer.phone}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 py-3 border-t border-gray-100">
          <div className="text-center">
            <div className="text-xs text-gray-500">Órdenes</div>
            <div className="font-semibold text-sm">{customer.totalOrders}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Gastado</div>
            <div className="font-semibold text-sm text-green-600">
              {formatCurrency(customer.totalSpent)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Deuda</div>
            <div className={`font-semibold text-sm ${customer.debt > 0 ? 'text-red-600' : 'text-gray-500'}`}>
              {formatCurrency(customer.debt)}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(customer)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            Ver
          </Button>
          
          {customer.debt > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPayDebt(customer)}
              className="flex-1"
            >
              <DollarSign className="w-4 h-4 mr-1" />
              Pagar
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewOrders(customer)}
            className="flex-1"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Órdenes
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewHistory(customer)}
            className="flex-1"
          >
            <History className="w-4 h-4 mr-1" />
            Historial
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      {/* Mobile: Cards View */}
      <ResponsiveShow on="mobile">
        <div className="space-y-4">
          {customers.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <User className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No se encontraron clientes</p>
              </CardContent>
            </Card>
          ) : (
            customers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))
          )}
        </div>
      </ResponsiveShow>

      {/* Desktop: Table View */}
      <ResponsiveShow on="tablet-desktop">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Órdenes</TableHead>
                <TableHead className="text-right">Total Gastado</TableHead>
                <TableHead className="text-right">Deuda</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <User className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No se encontraron clientes</p>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500">ID: {customer.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                        {customer.status === "active" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {customer.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-right font-medium">
                      {customer.totalOrders}
                    </TableCell>
                    
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(customer.totalSpent)}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <span className={`font-medium ${customer.debt > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        {formatCurrency(customer.debt)}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(customer)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(customer)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {customer.debt > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPayDebt(customer)}
                          >
                            <DollarSign className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewOrders(customer)}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewHistory(customer)}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </ResponsiveShow>
    </div>
  );
}