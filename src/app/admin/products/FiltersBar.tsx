"use client";
import React from "react";
import type { Filters } from "./types";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  categories: string[];
  filters: Filters;
  onFiltersChange: (next: Filters) => void;
};

const FiltersBar: React.FC<Props> = ({ search, onSearchChange, categories, filters, onFiltersChange }) => {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-4">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar productos..."
        className="w-full sm:max-w-xs rounded-md border px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <select
          className="rounded-md border px-3 py-2 text-sm"
          value={filters.category}
          onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border px-3 py-2 text-sm"
          value={filters.inStock}
          onChange={(e) => onFiltersChange({ ...filters, inStock: e.target.value })}
        >
          <option value="all">Stock: Todos</option>
          <option value="in-stock">Con stock</option>
          <option value="out-of-stock">Sin stock</option>
        </select>
      </div>
    </div>
  );
};

export default FiltersBar;
