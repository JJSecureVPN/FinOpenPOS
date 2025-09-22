"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product?: Product | null;
  onSubmit: (data: Omit<Product, "id"> & { id?: number }) => void;
};

const empty: Omit<Product, "id"> = {
  name: "",
  description: "",
  price: 0,
  in_stock: 0,
  category: "",
};

const ProductFormDialog: React.FC<Props> = ({ open, onOpenChange, product, onSubmit }) => {
  const [form, setForm] = useState<Omit<Product, "id"> & { id?: number }>(empty);

  useEffect(() => {
    if (product) {
      const { id, name, description, price, in_stock, category } = product;
      setForm({ id, name, description, price, in_stock, category });
    } else {
      setForm(empty);
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{form.id ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              placeholder="Nombre del producto"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Input
              id="category"
              placeholder="Categoría del producto"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Descripción del producto"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={form.price}
                min={0}
                step="0.01"
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                value={form.in_stock}
                min={0}
                step="1"
                onChange={(e) => setForm({ ...form, in_stock: parseInt(e.target.value || "0", 10) })}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
