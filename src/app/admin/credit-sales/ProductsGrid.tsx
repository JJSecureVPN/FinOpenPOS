"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveShow, ResponsiveGrid } from "@/components/responsive";
import { Search, Package, Plus, AlertTriangle, Filter } from "lucide-react";
import type { Product, CreditSaleFilters } from "./types";

interface ProductsGridProps {
  products: Product[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: CreditSaleFilters;
  onFiltersChange: (filters: CreditSaleFilters) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductsGrid({ 
  products, 
  searchTerm, 
  onSearchChange,
  filters,
  onFiltersChange,
  onAddToCart 
}: ProductsGridProps) {
  
  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category))).sort();
  
  // Filter products
  const filteredProducts = products.filter(product => {
    // Text search
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = filters.category === "all" || product.category === filters.category;
    
    // Stock filter
    const matchesStock = filters.stockStatus === "all" ||
                        (filters.stockStatus === "in_stock" && product.in_stock > 0) ||
                        (filters.stockStatus === "out_of_stock" && product.in_stock === 0);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="h-full transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-lg leading-tight">{product.name}</h3>
            <Badge variant="outline" className="ml-2 shrink-0">
              {product.category}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-green-600">
              ${product.price.toFixed(2)}
            </span>
            <Badge 
              variant={product.in_stock > 0 ? "default" : "destructive"}
              className="font-medium"
            >
              {product.in_stock > 0 ? (
                <Package className="w-3 h-3 mr-1" />
              ) : (
                <AlertTriangle className="w-3 h-3 mr-1" />
              )}
              Stock: {product.in_stock}
            </Badge>
          </div>
        </div>
        
        <Button
          onClick={() => onAddToCart(product)}
          disabled={product.in_stock === 0}
          className="w-full mt-auto"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          {product.in_stock === 0 ? "Sin Stock" : "Agregar al Carrito"}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Productos Disponibles
          </CardTitle>
          
          {/* Search and Filters */}
          <ResponsiveShow on="mobile">
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Filters */}
              <div className="flex gap-2">
                <Select
                  value={filters.category}
                  onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
                >
                  <SelectTrigger className="flex-1">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Categorías</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={filters.stockStatus}
                  onValueChange={(value: "all" | "in_stock" | "out_of_stock") => 
                    onFiltersChange({ ...filters, stockStatus: value })
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todo el Stock</SelectItem>
                    <SelectItem value="in_stock">En Stock</SelectItem>
                    <SelectItem value="out_of_stock">Sin Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ResponsiveShow>

          <ResponsiveShow on="tablet-desktop">
            <div className="flex gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar productos por nombre o categoría..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Category Filter */}
              <Select
                value={filters.category}
                onValueChange={(value) => onFiltersChange({ ...filters, category: value })}
              >
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Categorías</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Stock Filter */}
              <Select
                value={filters.stockStatus}
                onValueChange={(value: "all" | "in_stock" | "out_of_stock") => 
                  onFiltersChange({ ...filters, stockStatus: value })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo el Stock</SelectItem>
                  <SelectItem value="in_stock">En Stock</SelectItem>
                  <SelectItem value="out_of_stock">Sin Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ResponsiveShow>
          
          {/* Results counter */}
          <div className="text-sm text-gray-600">
            Mostrando {filteredProducts.length} de {products.length} productos
            {(searchTerm || filters.category !== "all" || filters.stockStatus !== "all") && (
              <span className="text-blue-600 ml-2">• Filtros activos</span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-500">
              {searchTerm || filters.category !== "all" || filters.stockStatus !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "No hay productos disponibles"
              }
            </p>
          </div>
        ) : (
          <>
            <ResponsiveShow on="mobile">
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </ResponsiveShow>

            <ResponsiveShow on="tablet-desktop">
              <ResponsiveGrid 
                cols={{ default: 1, sm: 2, lg: 2, xl: 3 }}
                gap="lg"
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ResponsiveGrid>
            </ResponsiveShow>
          </>
        )}
      </CardContent>
    </Card>
  );
}