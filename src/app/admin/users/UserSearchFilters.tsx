"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, ResponsiveShow } from "@/components/responsive";
import { Search, Filter, X, Shield, ShieldCheck, CheckCircle, AlertTriangle, Clock, Users } from "lucide-react";
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
    filters.status !== "all" || 
    filters.activity !== "all" || 
    searchTerm.trim() !== "";

  return (
    <ResponsiveContainer>
      <Card>
        <CardContent className="p-4">
          <ResponsiveShow on="mobile">
            {/* Mobile Layout: Compact */}
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

              {/* Filters Row - Single Row */}
              <div className="flex gap-2">
                <Select
                  value={filters.role}
                  onValueChange={(value: "all" | "admin" | "cajero") => 
                    onFiltersChange({ ...filters, role: value })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="cajero">Cajero</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status}
                  onValueChange={(value: "all" | "verified" | "unverified") => 
                    onFiltersChange({ ...filters, status: value })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="verified">Verificado</SelectItem>
                    <SelectItem value="unverified">Sin verificar</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.activity}
                  onValueChange={(value: "all" | "active" | "inactive") => 
                    onFiltersChange({ ...filters, activity: value })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Actividad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
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
                <div className="text-xs text-gray-500 text-center">
                  {filteredCount} de {totalCount} usuarios
                </div>
              )}
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
                    placeholder="Buscar usuarios por email..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Role Filter */}
                <div className="w-44">
                  <Select
                    value={filters.role}
                    onValueChange={(value: "all" | "admin" | "cajero") => 
                      onFiltersChange({ ...filters, role: value })
                    }
                  >
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Todos los Roles
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          Administradores
                        </div>
                      </SelectItem>
                      <SelectItem value="cajero">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          Cajeros
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="w-40">
                  <Select
                    value={filters.status}
                    onValueChange={(value: "all" | "verified" | "unverified") => 
                      onFiltersChange({ ...filters, status: value })
                    }
                  >
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="verified">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Verificados
                        </div>
                      </SelectItem>
                      <SelectItem value="unverified">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          Sin Verificar
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Activity Filter */}
                <div className="w-36">
                  <Select
                    value={filters.activity}
                    onValueChange={(value: "all" | "active" | "inactive") => 
                      onFiltersChange({ ...filters, activity: value })
                    }
                  >
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="inactive">Inactivos</SelectItem>
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
                    Limpiar
                  </Button>
                )}
              </div>

              {/* Results Counter */}
              <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-3">
                <div>
                  {filteredCount === totalCount ? (
                    <span>Mostrando todos los {totalCount} usuarios</span>
                  ) : (
                    <span>Mostrando {filteredCount} de {totalCount} usuarios</span>
                  )}
                </div>
                
                {hasActiveFilters && (
                  <div className="text-blue-600">
                    <Filter className="w-4 h-4 inline mr-1" />
                    Filtros activos
                  </div>
                )}
              </div>
            </div>
          </ResponsiveShow>
        </CardContent>
      </Card>
    </ResponsiveContainer>
  );
}