"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, ResponsiveShow, ResponsiveGrid } from "@/components/responsive";
import { Search, Filter, X, UserCheck, UserX, Users } from "lucide-react";
import type { CustomerFilters } from "./types";

interface CustomerSearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export default function CustomerSearchFilters({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  onClearFilters,
  totalCount,
  filteredCount
}: CustomerSearchFiltersProps) {

  const hasActiveFilters = filters.status !== "all" || searchTerm.trim() !== "";

  return (
    <ResponsiveContainer>
      <Card>
        <CardContent className="p-4">
          <ResponsiveShow on="mobile">
            {/* Mobile Layout: Stack vertically */}
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 text-lg"
                />
              </div>

              {/* Filters Row */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    value={filters.status}
                    onValueChange={(value: "all" | "active" | "inactive") => 
                      onFiltersChange({ ...filters, status: value })
                    }
                  >
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <Typography variant="body-sm">Todos los Estados</Typography>
                        </div>
                      </SelectItem>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-green-600" />
                          <Typography variant="body-sm">Solo Activos</Typography>
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <UserX className="w-4 h-4 text-red-600" />
                          <Typography variant="body-sm">Solo Inactivos</Typography>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearFilters}
                    className="px-3"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Results Counter */}
              <div className="text-center py-2 border-t">
                <Typography variant="body-sm" className="text-gray-600">
                  {filteredCount === totalCount ? (
                    <>Mostrando {totalCount} clientes</>
                  ) : (
                    <>Mostrando {filteredCount} de {totalCount} clientes</>
                  )}
                </Typography>
              </div>
            </div>
          </ResponsiveShow>

          <ResponsiveShow on="tablet-desktop">
            {/* Desktop Layout: Horizontal */}
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar clientes por nombre, email o teléfono..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Status Filter */}
                <div className="w-48">
                  <Select
                    value={filters.status}
                    onValueChange={(value: "all" | "active" | "inactive") => 
                      onFiltersChange({ ...filters, status: value })
                    }
                  >
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <Typography variant="body-sm">Todos los Estados</Typography>
                        </div>
                      </SelectItem>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-green-600" />
                          <Typography variant="body-sm">Solo Activos</Typography>
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <UserX className="w-4 h-4 text-red-600" />
                          <Typography variant="body-sm">Solo Inactivos</Typography>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={onClearFilters}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <Typography variant="button">Limpiar Filtros</Typography>
                  </Button>
                )}
              </div>

              {/* Results Counter */}
              <div className="flex justify-between items-center border-t pt-3">
                <Typography variant="body-sm" className="text-gray-600">
                  {filteredCount === totalCount ? (
                    <>Mostrando todos los {totalCount} clientes</>
                  ) : (
                    <>Mostrando {filteredCount} de {totalCount} clientes</>
                  )}
                </Typography>
                
                {hasActiveFilters && (
                  <Typography variant="body-sm" className="text-blue-600">
                    <Filter className="w-4 h-4 inline mr-1" />
                    Filtros activos
                  </Typography>
                )}
              </div>
            </div>
          </ResponsiveShow>
        </CardContent>
      </Card>
    </ResponsiveContainer>
  );
}