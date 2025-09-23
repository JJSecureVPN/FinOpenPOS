"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ResponsiveContainer } from "@/components/responsive";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import TransactionStats from "./TransactionStats";
import TransactionForm from "./TransactionForm";
import TransactionsTable from "./TransactionsTable";
import type { Transaction, NewTransactionForm, TransactionType } from "./types";

export default function Cashier() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/transactions");
        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        // Set demo data if API fails
        setTransactions([
          {
            id: 1,
            date: new Date().toISOString(),
            type: "income",
            amount: 1500.00,
            description: "Venta de productos",
            category: "Ventas"
          },
          {
            id: 2,
            date: new Date(Date.now() - 86400000).toISOString(),
            type: "expense",
            amount: 250.00,
            description: "Compra de suministros",
            category: "Suministros"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Handle form submission
  const handleFormSubmit = async (formData: NewTransactionForm) => {
    try {
      const newTransaction: Transaction = {
        id: Date.now(), // In a real app, this would come from the server
        date: new Date().toISOString(),
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category
      };

      // If editing, update existing transaction
      if (transactionToEdit) {
        const response = await fetch(`/api/transactions/${transactionToEdit.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTransaction),
        });

        if (response.ok) {
          setTransactions(prev => 
            prev.map(t => t.id === transactionToEdit.id ? { ...newTransaction, id: transactionToEdit.id } : t)
          );
        } else {
          // Fallback for demo
          setTransactions(prev => 
            prev.map(t => t.id === transactionToEdit.id ? { ...newTransaction, id: transactionToEdit.id } : t)
          );
        }
        setTransactionToEdit(null);
      } else {
        // Add new transaction
        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTransaction),
        });

        if (response.ok) {
          const addedTransaction = await response.json();
          setTransactions(prev => [...prev, addedTransaction]);
        } else {
          // Fallback for demo
          setTransactions(prev => [...prev, newTransaction]);
        }
      }

      setIsFormDialogOpen(false);
    } catch (error) {
      console.error("Error saving transaction:", error);
      // Still add to demo data
      const newTransaction: Transaction = {
        id: Date.now(),
        date: new Date().toISOString(),
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category
      };
      
      if (transactionToEdit) {
        setTransactions(prev => 
          prev.map(t => t.id === transactionToEdit.id ? { ...newTransaction, id: transactionToEdit.id } : t)
        );
        setTransactionToEdit(null);
      } else {
        setTransactions(prev => [...prev, newTransaction]);
      }
      setIsFormDialogOpen(false);
    }
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setIsFormDialogOpen(true);
  };

  // Handle delete transaction
  const handleDeleteTransaction = (id: number) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setTransactionToDelete(transaction);
      setIsDeleteConfirmationOpen(true);
    }
  };

  // Confirm delete
  const confirmDelete = useCallback(async () => {
    if (!transactionToDelete) return;
    
    try {
      const response = await fetch(`/api/transactions/${transactionToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
      } else {
        // Fallback for demo
        setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      // Still remove from demo data
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
    }

    setIsDeleteConfirmationOpen(false);
    setTransactionToDelete(null);
  }, [transactionToDelete]);

  // Handle new transaction button
  const handleNewTransaction = () => {
    setTransactionToEdit(null);
    setIsFormDialogOpen(true);
  };

  if (loading) {
    return (
      <ResponsiveContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando transacciones...</p>
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cajero</h1>
            <p className="text-muted-foreground">
              Gestiona las transacciones de ingresos y gastos
            </p>
          </div>
          <Button onClick={handleNewTransaction} className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva Transacción
          </Button>
        </div>

        {/* Statistics */}
        <TransactionStats transactions={transactions} />

        {/* Transactions Table */}
        <TransactionsTable
          transactions={transactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />

        {/* Form Dialog */}
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {transactionToEdit ? "Editar Transacción" : "Nueva Transacción"}
              </DialogTitle>
            </DialogHeader>
            <TransactionForm
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormDialogOpen(false)}
              isCompact={false}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>¿Estás seguro de que deseas eliminar esta transacción?</p>
              {transactionToDelete && (
                <div className="mt-3 p-3 bg-gray-100 rounded-md">
                  <p className="font-medium">{transactionToDelete.description}</p>
                  <p className="text-sm text-gray-600">
                    {transactionToDelete.category} - ${transactionToDelete.amount.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteConfirmationOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
              >
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ResponsiveContainer>
  );
}
