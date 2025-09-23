"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, ResponsiveShow, ResponsiveGrid } from "@/components/responsive";
import { User, Mail, Phone, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Customer } from "./types";

interface CustomerSelectorProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
}

export default function CustomerSelector({ customers, onSelectCustomer }: CustomerSelectorProps) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const CustomerCard = ({ customer }: { customer: Customer }) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
      onClick={() => onSelectCustomer(customer)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-lg truncate">{customer.name}</h3>
            <Badge 
              variant={customer.status === "active" ? "default" : "secondary"}
              className="mt-1"
            >
              {customer.status === "active" ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <AlertCircle className="w-3 h-3 mr-1" />
              )}
              {customer.status === "active" ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span className="truncate">{customer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{customer.phone}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">Deuda Actual:</span>
          <Badge 
            variant={customer.debt > 0 ? "destructive" : "outline"}
            className="font-medium"
          >
            {formatCurrency(customer.debt)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header */}
        <ResponsiveShow on="mobile">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/customers">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Ventas al Fiado</h1>
                <p className="text-gray-600">Selecciona un cliente</p>
              </div>
            </div>
          </div>
        </ResponsiveShow>

        <ResponsiveShow on="tablet-desktop">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Ventas al Fiado</h1>
              <p className="text-gray-600 mt-1">Selecciona un cliente para realizar una venta al fiado</p>
            </div>
            <Link href="/admin/customers">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ir a Clientes
              </Button>
            </Link>
          </div>
        </ResponsiveShow>

        {/* Customer Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Clientes Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes disponibles</h3>
                <p className="text-gray-500 mb-4">
                  Necesitas crear clientes antes de poder realizar ventas al fiado
                </p>
                <Link href="/admin/customers">
                  <Button>
                    Ir a crear un cliente
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <ResponsiveShow on="mobile">
                  <div className="space-y-4">
                    {customers.map((customer) => (
                      <CustomerCard key={customer.id} customer={customer} />
                    ))}
                  </div>
                </ResponsiveShow>

                <ResponsiveShow on="tablet-desktop">
                  <ResponsiveGrid 
                    cols={{ default: 1, sm: 2, lg: 3, xl: 4 }}
                    gap="lg"
                  >
                    {customers.map((customer) => (
                      <CustomerCard key={customer.id} customer={customer} />
                    ))}
                  </ResponsiveGrid>
                </ResponsiveShow>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  );
}