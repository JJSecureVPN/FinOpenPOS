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
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50 sticky top-0">
            <tr className="border-b">
              <th className="text-left p-3 font-medium">Nombre</th>
              <th className="text-left p-3 font-medium">Categoría</th>
              <th className="text-right p-3 font-medium">Precio</th>
              <th className="text-right p-3 font-medium">Stock</th>
              <th className="text-right p-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-muted/40 transition-colors">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {p.category || "Sin categoría"}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono">${p.price.toFixed(2)}</td>
                  <td className="p-3 text-right">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      (p.in_stock ?? 0) > 0 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    }`}>
                      {p.in_stock ?? 0}
                    </span>
                  </td>
                  <td className="p-3 text-right">
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsTable;
