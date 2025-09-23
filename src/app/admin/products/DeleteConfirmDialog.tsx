"use client";
import React from "react";
import type { Product } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product?: Product | null;
  onConfirm: (product: Product) => void;
};

const DeleteConfirmDialog: React.FC<Props> = ({ open, onOpenChange, product, onConfirm }) => {
  if (!open || !product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-background p-4 shadow-lg">
        <div className="mb-2 text-lg font-semibold">Eliminar producto</div>
        <p className="mb-4 text-sm text-muted-foreground">
          ¿Seguro que deseas eliminar &quot;{product.name}&quot;? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <button className="rounded-md border px-3 py-2 text-sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </button>
          <button
            className="rounded-md border bg-destructive text-destructive-foreground px-3 py-2 text-sm"
            onClick={() => onConfirm(product)}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;
