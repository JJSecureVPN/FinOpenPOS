"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveContainer, ResponsiveShow } from "@/components/responsive";
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

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ResponsiveShow on="mobile">
        <div className="space-y-4">
          {/* Mobile: Stack all fields vertically */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              required
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value: TransactionType) => handleInputChange("type", value)}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Ingreso</SelectItem>
                <SelectItem value="expense">Gasto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Input
              id="category"
              placeholder="Ej: Ventas, Gastos operativos..."
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción de la transacción..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
              rows={3}
            />
          </div>

          <div className="flex flex-col space-y-2 pt-2">
            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Transacción
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="w-full">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </ResponsiveShow>

      <ResponsiveShow on="tablet-desktop">
        <div className="space-y-4">
          {/* Desktop: Optimize layout based on space */}
          {isCompact ? (
            // Compact horizontal layout for inline forms
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[120px]">
                <Label htmlFor="amount">Monto</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  required
                />
              </div>

              <div className="flex-1 min-w-[120px]">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: TransactionType) => handleInputChange("type", value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Ingreso</SelectItem>
                    <SelectItem value="expense">Gasto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  placeholder="Categoría..."
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  required
                />
              </div>

              <div className="flex-2 min-w-[200px]">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  placeholder="Descripción..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar
                </Button>
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // Full desktop layout for modal forms
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  required
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: TransactionType) => handleInputChange("type", value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Ingreso</SelectItem>
                    <SelectItem value="expense">Gasto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  placeholder="Ej: Ventas, Gastos operativos, Marketing..."
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  required
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Descripción detallada de la transacción..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                  rows={3}
                />
              </div>

              <div className="col-span-2 flex justify-end gap-2 pt-4">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                )}
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Transacción
                </Button>
              </div>
            </div>
          )}
        </div>
      </ResponsiveShow>
    </form>
  );

  if (isCompact) {
    return <FormContent />;
  }

  return (
    <ResponsiveContainer>
      <Card>
        <CardHeader>
          <CardTitle>Nueva Transacción</CardTitle>
        </CardHeader>
        <CardContent>
          <FormContent />
        </CardContent>
      </Card>
    </ResponsiveContainer>
  );
}