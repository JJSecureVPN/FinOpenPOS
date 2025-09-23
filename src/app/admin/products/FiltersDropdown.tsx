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
import { Typography } from "@/components/ui/typography";
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
        <DropdownMenuLabel>
          <Typography variant="body-sm" weight="medium">Filtrar por categoría</Typography>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={filters.category === "all"}
          onCheckedChange={(v) => toggleCategory("all", Boolean(v))}
        >
          <Typography variant="body-sm">Todas las categorías</Typography>
        </DropdownMenuCheckboxItem>
        {categories.map((c) => (
          <DropdownMenuCheckboxItem
            key={c}
            checked={filters.category === c}
            onCheckedChange={(v) => toggleCategory(c, Boolean(v))}
          >
            <Typography variant="body-sm">{c}</Typography>
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>
          <Typography variant="body-sm" weight="medium">Stock</Typography>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={filters.inStock === "all"}
          onCheckedChange={(v) => toggleStock("all", Boolean(v))}
        >
          <Typography variant="body-sm">Todo el stock</Typography>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.inStock === "in-stock"}
          onCheckedChange={(v) => toggleStock("in-stock", Boolean(v))}
        >
          <Typography variant="body-sm">En stock</Typography>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.inStock === "out-of-stock"}
          onCheckedChange={(v) => toggleStock("out-of-stock", Boolean(v))}
        >
          <Typography variant="body-sm">Sin stock</Typography>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FiltersDropdown;
