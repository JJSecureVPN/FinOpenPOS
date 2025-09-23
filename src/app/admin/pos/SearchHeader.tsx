"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  productsCount: number;
}

export default function SearchHeader({ searchTerm, onSearchChange, productsCount }: SearchHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {productsCount} productos
        </div>
      </div>
    </div>
  );
}