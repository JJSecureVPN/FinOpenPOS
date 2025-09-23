"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveGrid } from "@/components/responsive";
import { Users, UserCheck, UserX, DollarSign } from "lucide-react";
import type { Customer } from "./types";

interface CustomerStatsProps {
  customers: Customer[];
}

export default function CustomerStats({ customers }: CustomerStatsProps) {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === "active").length;
  const inactiveCustomers = customers.filter(c => c.status === "inactive").length;
  const totalDebt = customers.reduce((sum, c) => sum + c.debt, 0);

  const stats = [
    {
      title: "Total Clientes",
      value: totalCustomers.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Clientes Activos",
      value: activeCustomers.toString(),
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Clientes Inactivos",
      value: inactiveCustomers.toString(),
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Deuda Total",
      value: `$${totalDebt.toFixed(2)}`,
      icon: DollarSign,
      color: totalDebt > 0 ? "text-orange-600" : "text-green-600",
      bgColor: totalDebt > 0 ? "bg-orange-100" : "bg-green-100"
    }
  ];

  return (
    <div className="mb-6">
      <ResponsiveGrid
        cols={{ default: 1, sm: 2, lg: 4 }}
        gap="md"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">
                      {stat.title}
                    </p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </ResponsiveGrid>
    </div>
  );
}