"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, Loader2Icon } from "lucide-react";
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
    <>
      <StatsCards totalValue={stats.totalValue} totalUnits={stats.totalUnits} totalSkus={stats.totalProducts} />

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-2">
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
          <Button size="sm" onClick={() => { setEditingProduct(null); setIsProductDialogOpen(true); }}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Agregar Producto
          </Button>
        </div>

        <ProductsTable
          products={currentProducts}
          onEdit={(p) => { setEditingProduct(p); setIsProductDialogOpen(true); }}
          onDelete={(p) => { setProductToDelete(p); setIsDeleteConfirmationOpen(true); }}
        />
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
    </>
  );
}
