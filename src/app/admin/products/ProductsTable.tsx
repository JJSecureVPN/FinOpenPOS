"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveShow, MobileAdaptive } from "@/components/responsive";
import { Edit, Trash2, Package } from "lucide-react";
import type { Product } from "./types";

type Props = {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
};

const ProductsTable: React.FC<Props> = ({ products, onEdit, onDelete }) => {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border">
        <div className="p-8 text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No se encontraron productos</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Vista de tabla para desktop */}
      <ResponsiveShow on="tablet-desktop">
        <div className="rounded-lg border overflow-hidden">
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
                {products.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-muted/40 transition-colors">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">
                        {p.category || "Sin categoría"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-mono">${p.price.toFixed(2)}</td>
                    <td className="p-3 text-right">
                      <Badge 
                        variant={(p.in_stock ?? 0) > 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {p.in_stock ?? 0}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(p)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(p)}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ResponsiveShow>

      {/* Vista de cards para móvil */}
      <ResponsiveShow on="mobile">
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {products.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm leading-tight line-clamp-2">
                        {p.name}
                      </h3>
                      <div className="mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {p.category || "Sin categoría"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-primary">
                        ${p.price.toFixed(2)}
                      </div>
                      <Badge 
                        variant={(p.in_stock ?? 0) > 0 ? "default" : "destructive"}
                        className="text-xs mt-1"
                      >
                        Stock: {p.in_stock ?? 0}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(p)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => onDelete(p)}
                      className="flex-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ResponsiveShow>
    </>
  );
};

export default ProductsTable;
