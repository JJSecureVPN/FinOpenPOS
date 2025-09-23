"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui";
import { ResponsiveGrid } from "@/components/responsive";
import { CreditCard, Package, AlertTriangle, DollarSign } from "lucide-react";
import type { Product, Customer } from "./types";

interface CreditSaleStatsProps {
  products: Product[];
  selectedCustomer: Customer | null;
  cartTotal: number;
  cartItemsCount: number;
}

export default function CreditSaleStats({ 
  products, 
  selectedCustomer, 
  cartTotal, 
  cartItemsCount 
}: CreditSaleStatsProps) {
  
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.in_stock > 0).length;
  const outOfStockProducts = products.filter(p => p.in_stock === 0).length;
  const newDebtTotal = selectedCustomer ? selectedCustomer.debt + cartTotal : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const stats = [
    {
      title: "Productos Disponibles",
      value: `${inStockProducts}/${totalProducts}`,
      description: "En Stock / Total",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Sin Stock",
      value: outOfStockProducts.toString(),
      description: "Productos agotados",
      icon: AlertTriangle,
      color: outOfStockProducts > 0 ? "text-red-600" : "text-gray-600",
      bgColor: outOfStockProducts > 0 ? "bg-red-100" : "bg-gray-100"
    },
    {
      title: "Total Carrito",
      value: formatCurrency(cartTotal),
      description: `${cartItemsCount} artículos`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Nueva Deuda Total",
      value: selectedCustomer ? formatCurrency(newDebtTotal) : "--",
      description: selectedCustomer ? `Actual: ${formatCurrency(selectedCustomer.debt)}` : "Sin cliente",
      icon: CreditCard,
      color: newDebtTotal > 0 ? "text-orange-600" : "text-gray-600",
      bgColor: newDebtTotal > 0 ? "bg-orange-100" : "bg-gray-100"
    }
  ];

  return (
    <ResponsiveGrid 
      cols={{ default: 2, md: 4 }}
      gap="md"
      className="mb-6"
    >
      {stats.map((stat, index) => (
        <Card key={index} className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <Typography variant="body-sm" className="text-gray-600 truncate">{stat.title}</Typography>
                <Typography variant="body" weight="bold" className={`${stat.color} truncate`}>
                  {stat.value}
                </Typography>
                <Typography variant="micro" className="text-gray-500 truncate">{stat.description}</Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </ResponsiveGrid>
  );
}