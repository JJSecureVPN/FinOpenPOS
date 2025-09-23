"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import type { Product } from "./types";

interface ProductsGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    comestibles: "bg-primary/20 text-primary border border-primary/30",
    snacks: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    bebidas: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    dulces: "bg-accent/20 text-accent border border-accent/30",
    limpieza: "bg-secondary/20 text-secondary border border-secondary/30",
    higiene: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
  };
  return colors[category] || "bg-muted text-muted-foreground border border-border";
};

export default function ProductsGrid({ products, onAddToCart }: ProductsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto">
      {products.map((product) => (
        <Card 
          key={product.id} 
          className="cursor-pointer hover:shadow-md transition-shadow h-fit"
          onClick={() => onAddToCart(product)}
        >
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm leading-tight line-clamp-2">
                  {product.name}
                </h3>
                <Badge 
                  variant="outline" 
                  className={`text-xs shrink-0 ${getCategoryColor(product.category)}`}
                >
                  {product.category}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  ${product.price.toFixed(2)}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Package className="h-3 w-3" />
                  <span className={product.in_stock === 0 ? "text-destructive font-medium" : ""}>
                    {product.in_stock === 0 ? "Agotado" : `${product.in_stock} disponible`}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}