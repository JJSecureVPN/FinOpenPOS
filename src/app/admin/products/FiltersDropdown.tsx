"use client";
import React from "react";
import { FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Filters } from "./types";

type Props = {
  categories: string[];
  filters: Filters;
  onChange: (next: Filters) => void;
};

const FiltersDropdown: React.FC<Props> = ({ categories, filters, onChange }) => {
  const toggleCategory = (cat: string, checked: boolean) => {
    if (cat === "all") return onChange({ ...filters, category: "all" });
    // Si desmarcan la categoría actual, volvemos a "all"
    const next = checked ? cat : "all";
    onChange({ ...filters, category: next });
  };

  const toggleStock = (value: "all" | "in-stock" | "out-of-stock", checked: boolean) => {
    if (value === "all") return onChange({ ...filters, inStock: "all" });
    const next = checked ? value : "all";
    onChange({ ...filters, inStock: next });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Filtros">
          <FilterIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Filtrar por categoría</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={filters.category === "all"}
          onCheckedChange={(v) => toggleCategory("all", Boolean(v))}
        >
          Todas las categorías
        </DropdownMenuCheckboxItem>
        {categories.map((c) => (
          <DropdownMenuCheckboxItem
            key={c}
            checked={filters.category === c}
            onCheckedChange={(v) => toggleCategory(c, Boolean(v))}
          >
            {c}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Stock</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={filters.inStock === "all"}
          onCheckedChange={(v) => toggleStock("all", Boolean(v))}
        >
          Todo el stock
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.inStock === "in-stock"}
          onCheckedChange={(v) => toggleStock("in-stock", Boolean(v))}
        >
          En stock
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.inStock === "out-of-stock"}
          onCheckedChange={(v) => toggleStock("out-of-stock", Boolean(v))}
        >
          Sin stock
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FiltersDropdown;
