"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, Loader2Icon, ChevronLeft, ChevronRight } from "lucide-react";
import { ResponsiveContainer, MobileAdaptive, ResponsiveShow } from "@/components/responsive";
import StatsCards from "./StatsCards";
import FiltersDropdown from "./FiltersDropdown";
import ProductsTable from "./ProductsTable";
import ProductFormDialog from "./ProductFormDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import type { Product, Filters } from "./types";
import { Input } from "@/components/ui/input";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>({ category: "all", inStock: "all" });
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const resetSelectedProduct = () => {
    setEditingProduct(null);
  };

  const handleUpsertProduct = useCallback(
    async (data: Omit<Product, "id"> & { id?: number }) => {
      try {
        if (data.id) {
          const response = await fetch(`/api/products/${data.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!response.ok) throw new Error("Failed to update product");
          const updated = await response.json();
          setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        } else {
          const response = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!response.ok) throw new Error("Failed to add product");
          const created = await response.json();
          setProducts((prev) => [...prev, created]);
        }
        setIsProductDialogOpen(false);
        resetSelectedProduct();
      } catch (error) {
        console.error("Error saving product:", error);
      }
    },
    []
  );

  // eliminar handler duplicado de borrado: se usa onConfirm inline en el diálogo

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const stock = product.in_stock ?? 0;

      // Filtro por categoría
      if (filters.category !== "all" && product.category !== filters.category) {
        return false;
      }

      // Filtro por stock
      if (filters.inStock === "in-stock" && stock <= 0) {
        return false; // solo mostrar productos con stock > 0
      }
      if (filters.inStock === "out-of-stock" && stock > 0) {
        return false; // solo mostrar productos con stock = 0
      }

      // Filtro por búsqueda
      return product.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [products, filters.category, filters.inStock, searchTerm]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFiltersChange = (next: Filters) => {
    setFilters(next);
    setCurrentPage(1);
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  // Estadísticas de inventario
  const stats = useMemo(() => {
    const totalValue = products.reduce((sum, p) => sum + (p.price * (p.in_stock ?? 0)), 0);
    const totalUnits = products.reduce((sum, p) => sum + (p.in_stock ?? 0), 0);
    const totalProducts = products.length;
    return { totalValue, totalUnits, totalProducts };
  }, [products]);

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2Icon className="mx-auto h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <ResponsiveContainer variant="page" padding="md">
      <StatsCards totalValue={stats.totalValue} totalUnits={stats.totalUnits} totalSkus={stats.totalProducts} />

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6">
          <MobileAdaptive
            mobileLayout="stack"
            breakpoint="sm"
            className="mb-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2 w-full sm:w-auto">
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full sm:w-64"
                />
                <FiltersDropdown
                  categories={categories}
                  filters={filters}
                  onChange={handleFiltersChange}
                />
              </div>
              <Button 
                size="sm" 
                onClick={() => { setEditingProduct(null); setIsProductDialogOpen(true); }}
                className="w-full sm:w-auto"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                <ResponsiveShow on="mobile">
                  Agregar
                </ResponsiveShow>
                <ResponsiveShow on="tablet-desktop">
                  Agregar Producto
                </ResponsiveShow>
              </Button>
            </div>
          </MobileAdaptive>

          <ProductsTable
            products={currentProducts}
            onEdit={(p) => { setEditingProduct(p); setIsProductDialogOpen(true); }}
            onDelete={(p) => { setProductToDelete(p); setIsDeleteConfirmationOpen(true); }}
          />

          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <MobileAdaptive
              mobileLayout="stack"
              breakpoint="sm"
              className="mt-6 gap-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                  Mostrando {indexOfFirstProduct + 1} a {Math.min(indexOfLastProduct, filteredProducts.length)} de {filteredProducts.length} productos
                </div>
                <div className="flex items-center justify-center gap-2 overflow-x-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="shrink-0"
                  >
                    <ChevronLeft className="h-4 w-4 sm:mr-1" />
                    <ResponsiveShow on="tablet-desktop">
                      Anterior
                    </ResponsiveShow>
                  </Button>
                  
                  <div className="flex items-center gap-1 max-w-full overflow-x-auto">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="min-w-[32px] shrink-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="shrink-0"
                  >
                    <ResponsiveShow on="tablet-desktop">
                      Siguiente
                    </ResponsiveShow>
                    <ChevronRight className="h-4 w-4 sm:ml-1" />
                  </Button>
                </div>
              </div>
            </MobileAdaptive>
          )}
        </div>
      </div>

      <ProductFormDialog
        open={isProductDialogOpen}
        onOpenChange={(v) => { if (!v) resetSelectedProduct(); setIsProductDialogOpen(v); }}
        product={editingProduct}
        onSubmit={handleUpsertProduct}
      />

      <DeleteConfirmDialog
        open={isDeleteConfirmationOpen}
        onOpenChange={setIsDeleteConfirmationOpen}
        product={productToDelete}
        onConfirm={async (prod) => {
          try {
            const response = await fetch(`/api/products/${prod.id}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Failed to delete product");
            setProducts((prev) => prev.filter((p) => p.id !== prod.id));
            setIsDeleteConfirmationOpen(false);
            setProductToDelete(null);
          } catch (error) {
            console.error("Error deleting product:", error);
          }
        }}
      />
    </ResponsiveContainer>
  );
}
