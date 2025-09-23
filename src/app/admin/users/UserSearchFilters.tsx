"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, ResponsiveShow } from "@/components/responsive";
import { Typography } from "@/components/ui/typography";
import { Search, Filter, X, Shield, ShieldCheck, Users } from "lucide-react";
import type { UserFilters } from "./types";

interface UserSearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export default function UserSearchFilters({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  onClearFilters,
  totalCount,
  filteredCount
}: UserSearchFiltersProps) {

  const hasActiveFilters = 
    filters.role !== "all" || 
    searchTerm.trim() !== "";

  return (
    <ResponsiveContainer>
      <Card>
        <CardContent className="p-4">
          <ResponsiveShow on="mobile">
            {/* Mobile Layout: Search + Role Filter */}
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por email..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Role Filter Only */}
              <div className="flex gap-2">
                <Select
                  value={filters.role}
                  onValueChange={(value: "all" | "admin" | "cajero") => 
                    onFiltersChange({ ...filters, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los usuarios</SelectItem>
                    <SelectItem value="admin">Solo Administradores</SelectItem>
                    <SelectItem value="cajero">Solo Cajeros</SelectItem>
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearFilters}
                    className="px-3 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Results Counter */}
              {(hasActiveFilters || filteredCount !== totalCount) && (
                <Typography variant="caption" className="text-gray-500 text-center block">
                  {filteredCount} de {totalCount} usuarios
                </Typography>
              )}
            </div>
          </ResponsiveShow>

          <ResponsiveShow on="tablet-desktop">
            {/* Desktop Layout: Search + Role Filter */}
            <div className="space-y-4">
              <div className="flex gap-4 items-center">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar usuarios por email..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Role Filter Only */}
                <div className="w-48">
                  <Select
                    value={filters.role}
                    onValueChange={(value: "all" | "admin" | "cajero") => 
                      onFiltersChange({ ...filters, role: value })
                    }
                  >
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <SelectValue placeholder="Filtrar por rol" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Todos los usuarios
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          Solo Administradores
                        </div>
                      </SelectItem>
                      <SelectItem value="cajero">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          Solo Cajeros
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
                    <Typography variant="button">Limpiar</Typography>
                  </Button>
                )}
              </div>

              {/* Results Counter */}
              <div className="flex justify-between items-center border-t pt-3">
                <Typography variant="body-sm" className="text-gray-600">
                  {filteredCount === totalCount ? (
                    <>Mostrando todos los {totalCount} usuarios</>
                  ) : (
                    <>Mostrando {filteredCount} de {totalCount} usuarios</>
                  )}
                </Typography>
                
                {hasActiveFilters && (
                  <Typography variant="body-sm" className="text-blue-600 flex items-center gap-1">
                    <Filter className="w-4 h-4" />
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