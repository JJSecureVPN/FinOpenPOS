"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveContainer } from "@/components/responsive";
import { Plus, X } from "lucide-react";
import type { NewTransactionForm, TransactionType } from "./types";

interface TransactionFormProps {
  onSubmit: (transaction: NewTransactionForm) => void;
  onCancel?: () => void;
  isCompact?: boolean;
}

export default function TransactionForm({ onSubmit, onCancel, isCompact = false }: TransactionFormProps) {
  const [formData, setFormData] = useState<NewTransactionForm>({
    amount: "",
    type: "income",
    description: "",
    category: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount && formData.description && formData.category) {
      onSubmit(formData);
      setFormData({
        amount: "",
        type: "income",
        description: "",
        category: ""
      });
    }
  };

  const handleInputChange = (field: keyof NewTransactionForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // IMPORTANTE: No definir un componente (function) dentro y luego usarlo como <Componente />
  // porque React lo considera un nuevo tipo en cada render y desmonta/remonta el árbol,
  // provocando pérdida de foco al teclear. En su lugar usamos JSX directo (formContent).
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              required
              className="text-base"
              autoFocus
              min="0"
              step="0.01"
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value: TransactionType) => handleInputChange("type", value)}
            >
              <SelectTrigger id="type" name="type">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Ingreso</SelectItem>
                <SelectItem value="expense">Gasto</SelectItem>
              </SelectContent>
            </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="category">Categoría</Label>
          <Input
            id="category"
            name="category"
            placeholder="Ej: Ventas, Gastos operativos, Marketing..."
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            required
            maxLength={100}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Descripción detallada de la transacción..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            required
            rows={3}
            maxLength={500}
          />
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        )}
        <Button type="submit">
          <Plus className="w-4 h-4 mr-2" />
          {transactionToLabel(isCompact)}
        </Button>
      </div>
    </form>
  );

  function transactionToLabel(compact:boolean){
    return compact ? 'Agregar' : 'Agregar Transacción';
  }

  if (isCompact) {
    return formContent;
  }

  return (
    <ResponsiveContainer>
      <Card>
        <CardHeader>
          <CardTitle>Nueva Transacción</CardTitle>
        </CardHeader>
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    </ResponsiveContainer>
  );
}