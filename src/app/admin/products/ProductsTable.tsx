"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveShow, MobileAdaptive } from "@/components/responsive";
import { Typography } from "@/components/ui/typography";
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
          <Typography variant="body" className="text-muted-foreground">No se encontraron productos</Typography>
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
                  <th className="text-left p-3">
                    <Typography variant="body-sm" weight="medium">Nombre</Typography>
                  </th>
                  <th className="text-left p-3">
                    <Typography variant="body-sm" weight="medium">Categoría</Typography>
                  </th>
                  <th className="text-right p-3">
                    <Typography variant="body-sm" weight="medium">Precio</Typography>
                  </th>
                  <th className="text-right p-3">
                    <Typography variant="body-sm" weight="medium">Stock</Typography>
                  </th>
                  <th className="text-right p-3">
                    <Typography variant="body-sm" weight="medium">Acciones</Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-muted/40 transition-colors">
                    <td className="p-3">
                      <Typography variant="body-sm" weight="medium">{p.name}</Typography>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs">
                        <Typography variant="caption">{p.category || "Sin categoría"}</Typography>
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Typography variant="body-sm" className="font-mono">${p.price.toFixed(2)}</Typography>
                    </td>
                    <td className="p-3 text-right">
                      <Badge 
                        variant={(p.in_stock ?? 0) > 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        <Typography variant="caption">{p.in_stock ?? 0}</Typography>
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(p)}>
                          <Edit className="h-3 w-3 mr-1" />
                          <Typography variant="button">Editar</Typography>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(p)}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          <Typography variant="button">Eliminar</Typography>
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
                      <Typography variant="body-sm" weight="medium" className="leading-tight line-clamp-2">
                        {p.name}
                      </Typography>
                      <div className="mt-1">
                        <Badge variant="secondary" className="text-xs">
                          <Typography variant="caption">{p.category || "Sin categoría"}</Typography>
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Typography variant="h3" weight="bold" className="text-primary">
                        ${p.price.toFixed(2)}
                      </Typography>
                      <Badge 
                        variant={(p.in_stock ?? 0) > 0 ? "default" : "destructive"}
                        className="text-xs mt-1"
                      >
                        <Typography variant="caption">Stock: {p.in_stock ?? 0}</Typography>
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
                      <Typography variant="button">Editar</Typography>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => onDelete(p)}
                      className="flex-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      <Typography variant="button">Eliminar</Typography>
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
