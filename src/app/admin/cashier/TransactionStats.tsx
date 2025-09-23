"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { ResponsiveGrid } from "@/components/responsive";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Transaction } from "./types";

interface TransactionStatsProps {
  transactions: Transaction[];
}

export default function TransactionStats({ transactions }: TransactionStatsProps) {
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;
  const totalTransactions = transactions.length;

  const stats = [
    {
      title: "Balance Total",
      value: `$${balance.toFixed(2)}`,
      icon: DollarSign,
      color: balance >= 0 ? "text-green-600" : "text-red-600",
      bgColor: balance >= 0 ? "bg-green-100" : "bg-red-100"
    },
    {
      title: "Ingresos",
      value: `$${totalIncome.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Gastos",
      value: `$${totalExpenses.toFixed(2)}`,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Transacciones",
      value: totalTransactions.toString(),
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
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
                    <Typography variant="body-sm" weight="medium" className="text-muted-foreground">
                      {stat.title}
                    </Typography>
                    <Typography variant="h2" weight="bold" className={stat.color}>
                      {stat.value}
                    </Typography>
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