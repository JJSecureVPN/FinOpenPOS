"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { MobileAdaptive } from "@/components/responsive";

interface SearchHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  productsCount: number;
}

export default function SearchHeader({ searchTerm, onSearchChange, productsCount }: SearchHeaderProps) {
  return (
    <MobileAdaptive
      mobileLayout="stack"
      breakpoint="sm"
      className="mb-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="text-sm text-muted-foreground sm:whitespace-nowrap">
          {productsCount} productos
        </div>
      </div>
    </MobileAdaptive>
  );
}