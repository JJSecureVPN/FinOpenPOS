"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ResponsiveShow } from "@/components/responsive";
import { MoreHorizontal, Edit, Trash2, DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Transaction } from "./types";

interface TransactionsTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}

export default function TransactionsTable({ transactions, onEdit, onDelete }: TransactionsTableProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "income":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "expense":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "bg-green-100 text-green-800";
      case "expense":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => (
    <Card className="mb-3 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with amount and type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTypeIcon(transaction.type)}
              <Typography 
                variant="h3" 
                weight="bold" 
                className={transaction.type === "income" ? "text-green-600" : "text-red-600"}
              >
                ${transaction.amount.toFixed(2)}
              </Typography>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(transaction)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <Typography variant="body-sm">Editar</Typography>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(transaction.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <Typography variant="body-sm">Eliminar</Typography>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Type badge and category */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getTypeColor(transaction.type)}>
              <Typography variant="caption">
                {transaction.type === "income" ? "Ingreso" : "Gasto"}
              </Typography>
            </Badge>
            <Typography variant="body-sm" className="text-muted-foreground">
              {transaction.category}
            </Typography>
          </div>

          {/* Description */}
          <div>
            <Typography variant="body-sm" className="text-gray-700 line-clamp-2">
              {transaction.description}
            </Typography>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {formatDate(transaction.date)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <ResponsiveShow on="mobile">
        <div className="space-y-1">
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <Typography variant="body" className="text-gray-500">No hay transacciones registradas</Typography>
                <Typography variant="body-sm" className="text-gray-400 mt-1">
                  Agrega tu primera transacción para comenzar
                </Typography>
              </CardContent>
            </Card>
          ) : (
            transactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))
          )}
        </div>
      </ResponsiveShow>

      <ResponsiveShow on="tablet-desktop">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Typography variant="body-sm" weight="medium">Fecha</Typography></TableHead>
                    <TableHead><Typography variant="body-sm" weight="medium">Tipo</Typography></TableHead>
                    <TableHead><Typography variant="body-sm" weight="medium">Categoría</Typography></TableHead>
                    <TableHead><Typography variant="body-sm" weight="medium">Descripción</Typography></TableHead>
                    <TableHead className="text-right"><Typography variant="body-sm" weight="medium">Monto</Typography></TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <DollarSign className="w-12 h-12 text-gray-400" />
                          <Typography variant="body" className="text-gray-500">No hay transacciones registradas</Typography>
                          <Typography variant="body-sm" className="text-gray-400">
                            Agrega tu primera transacción para comenzar
                          </Typography>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(transaction.date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(transaction.type)}
                            <Badge className={getTypeColor(transaction.type)}>
                              <Typography variant="caption">
                                {transaction.type === "income" ? "Ingreso" : "Gasto"}
                              </Typography>
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body" weight="medium">{transaction.category}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body-sm" className="text-gray-700 max-w-[300px] truncate block">
                            {transaction.description}
                          </Typography>
                        </TableCell>
                        <TableCell className="text-right">
                          <Typography 
                            variant="body" 
                            weight="bold" 
                            className={transaction.type === "income" ? "text-green-600" : "text-red-600"}
                          >
                            ${transaction.amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEdit(transaction)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <Typography variant="body-sm">Editar</Typography>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onDelete(transaction.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <Typography variant="body-sm">Eliminar</Typography>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </ResponsiveShow>
    </div>
  );
}