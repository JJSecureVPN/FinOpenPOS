"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import type { Product } from "./types";

type Props = {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
};

const ProductsTable: React.FC<Props> = ({ products, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Nombre</th>
            <th className="text-left p-2">Categoría</th>
            <th className="text-right p-2">Precio</th>
            <th className="text-right p-2">Stock</th>
            <th className="text-right p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b hover:bg-muted/40">
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.category}</td>
              <td className="p-2 text-right">${p.price.toFixed(2)}</td>
              <td className="p-2 text-right">{p.in_stock ?? 0}</td>
              <td className="p-2 text-right">
                <div className="inline-flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(p)}>
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(p)}>
                    Eliminar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
