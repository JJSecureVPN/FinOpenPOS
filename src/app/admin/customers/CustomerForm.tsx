"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, ResponsiveShow } from "@/components/responsive";
import { Plus, X, User, Mail, Phone, UserCheck } from "lucide-react";
import type { NewCustomerForm } from "./types";

interface CustomerFormProps {
  onSubmit: (customer: NewCustomerForm) => void;
  onCancel?: () => void;
  initialData?: Partial<NewCustomerForm>;
  isCompact?: boolean;
}

export default function CustomerForm({ onSubmit, onCancel, initialData, isCompact = false }: CustomerFormProps) {
  const [formData, setFormData] = useState<NewCustomerForm>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    status: initialData?.status || "active"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone) {
      onSubmit(formData);
      setFormData({
        name: "",
        email: "",
        phone: "",
        status: "active"
      });
    }
  };

  const handleInputChange = (field: keyof NewCustomerForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // IMPORTANTE: No definir un componente (function) dentro y luego usarlo como <Componente />
  // porque React lo considera un nuevo tipo en cada render y desmonta/remonta el árbol,
  // provocando pérdida de foco al teclear. En su lugar usamos JSX directo (formContent).
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off" noValidate>
      <ResponsiveShow on="mobile">
        <div className="space-y-4">
          {/* Mobile: Stack all fields vertically */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <Typography variant="body-sm" weight="medium">Nombre Completo</Typography>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Ej: Juan Pérez"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="text-lg"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <Typography variant="body-sm" weight="medium">Correo Electrónico</Typography>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="juan@ejemplo.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <Typography variant="body-sm" weight="medium">Teléfono</Typography>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="0999-999-999"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              <Typography variant="body-sm" weight="medium">Estado</Typography>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: "active" | "inactive") => handleInputChange("status", value)}
            >
              <SelectTrigger id="status" name="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <Typography variant="body-sm">Activo</Typography>
                </SelectItem>
                <SelectItem value="inactive">
                  <Typography variant="body-sm">Inactivo</Typography>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2 pt-2">
            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              <Typography variant="button">{initialData ? "Actualizar Cliente" : "Agregar Cliente"}</Typography>
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="w-full">
                <X className="w-4 h-4 mr-2" />
                <Typography variant="button">Cancelar</Typography>
              </Button>
            )}
          </div>
        </div>
      </ResponsiveShow>

      <ResponsiveShow on="tablet-desktop">
        <div className="space-y-4">
          {/* Desktop: Optimize layout based on space */}
          {isCompact ? (
            // Compact horizontal layout
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[150px]">
                <Label htmlFor="name"><Typography variant="body-sm" weight="medium">Nombre</Typography></Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nombre completo..."
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="flex-1 min-w-[150px]">
                <Label htmlFor="email"><Typography variant="body-sm" weight="medium">Email</Typography></Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="flex-1 min-w-[120px]">
                <Label htmlFor="phone"><Typography variant="body-sm" weight="medium">Teléfono</Typography></Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0999-999-999"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>

              <div className="flex-1 min-w-[100px]">
                <Label htmlFor="status"><Typography variant="body-sm" weight="medium">Estado</Typography></Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") => handleInputChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active"><Typography variant="body-sm">Activo</Typography></SelectItem>
                    <SelectItem value="inactive"><Typography variant="body-sm">Inactivo</Typography></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" />
                  <Typography variant="button">{initialData ? "Actualizar" : "Agregar"}</Typography>
                </Button>
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // Full desktop layout for modal forms
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <Typography variant="body-sm" weight="medium">Nombre Completo</Typography>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ej: Juan Pérez"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="text-lg"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  <Typography variant="body-sm" weight="medium">Estado</Typography>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") => handleInputChange("status", value)}
                >
                  <SelectTrigger id="status" name="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active"><Typography variant="body-sm">Activo</Typography></SelectItem>
                    <SelectItem value="inactive"><Typography variant="body-sm">Inactivo</Typography></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <Typography variant="body-sm" weight="medium">Correo Electrónico</Typography>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="juan@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <Typography variant="body-sm" weight="medium">Teléfono</Typography>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0999-999-999"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>

              <div className="col-span-2 flex justify-end gap-2 pt-4">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    <X className="w-4 h-4 mr-2" />
                    <Typography variant="button">Cancelar</Typography>
                  </Button>
                )}
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" />
                  <Typography variant="button">{initialData ? "Actualizar Cliente" : "Agregar Cliente"}</Typography>
                </Button>
              </div>
            </div>
          )}
        </div>
      </ResponsiveShow>
    </form>
  );

  if (isCompact) {
    return formContent;
  }

  return (
    <ResponsiveContainer>
      <Card>
        <CardHeader>
          <CardTitle>
            <Typography variant="h3">{initialData ? "Editar Cliente" : "Nuevo Cliente"}</Typography>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    </ResponsiveContainer>
  );
}