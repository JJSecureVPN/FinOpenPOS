"use client";
import React, { useEffect, useState } from "react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-background p-4 shadow-lg">
        <div className="mb-2 text-lg font-semibold">{form.id ? "Editar producto" : "Nuevo producto"}</div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Categoría"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <textarea
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              type="number"
              className="w-1/2 rounded-md border px-3 py-2 text-sm"
              placeholder="Precio"
              value={form.price}
              min={0}
              step="0.01"
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
            />
            <input
              type="number"
              className="w-1/2 rounded-md border px-3 py-2 text-sm"
              placeholder="Stock"
              value={form.in_stock}
              min={0}
              step="1"
              onChange={(e) => setForm({ ...form, in_stock: parseInt(e.target.value || "0", 10) })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={() => onOpenChange(false)}>
              Cancelar
            </button>
            <button type="submit" className="rounded-md border bg-primary text-primary-foreground px-3 py-2 text-sm">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormDialog;
