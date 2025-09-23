"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, ResponsiveShow } from "@/components/responsive";
import { Typography } from "@/components/ui/typography";
import { User, Mail, Lock, Shield, ShieldCheck, Eye, EyeOff } from "lucide-react";
import type { NewUser } from "./types";

interface UserFormProps {
  onSubmit: (user: NewUser) => void;
  onCancel?: () => void;
  initialData?: Partial<NewUser>;
  isCompact?: boolean;
  submitText?: string;
}

export default function UserForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isCompact = false, 
  submitText = "Crear Usuario" 
}: UserFormProps) {
  
  const [formData, setFormData] = useState<NewUser>({
    email: initialData?.email || "",
    password: initialData?.password || "",
    confirmPassword: initialData?.confirmPassword || "",
    role: initialData?.role || "cajero"
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<NewUser>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<NewUser> = {};
    
    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        role: "cajero"
      });
      setErrors({});
    }
  };

  const handleInputChange = (field: keyof NewUser, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ResponsiveShow on="mobile">
        <div className="space-y-4">
          {/* Mobile: Stack all fields vertically */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Correo Electrónico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              className={`text-lg ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && (
              <Typography variant="body-sm" className="text-red-600">{errors.email}</Typography>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {errors.password && (
              <Typography variant="body-sm" className="text-red-600">{errors.password}</Typography>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirmar Contraseña
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repite la contraseña"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
                className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <Typography variant="body-sm" className="text-red-600">{errors.confirmPassword}</Typography>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Rol del Usuario
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: "admin" | "cajero") => handleInputChange("role", value)}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cajero">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Cajero
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Administrador
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col space-y-2 pt-2">
            <Button type="submit" className="w-full">
              <User className="w-4 h-4 mr-2" />
              <Typography variant="button">{submitText}</Typography>
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="w-full">
                <Typography variant="button">Cancelar</Typography>
              </Button>
            )}
          </div>
        </div>
      </ResponsiveShow>

      <ResponsiveShow on="tablet-desktop">
        <div className="space-y-4">
          {isCompact ? (
            // Compact layout for inline forms
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Typography variant="body-sm" weight="medium">Email</Typography>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <Typography variant="body-sm" className="text-red-600">{errors.email}</Typography>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  <Typography variant="body-sm" weight="medium">Rol</Typography>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "cajero") => handleInputChange("role", value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cajero">
                      <Typography variant="body-sm">Cajero</Typography>
                    </SelectItem>
                    <SelectItem value="admin">
                      <Typography variant="body-sm">Administrador</Typography>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  <Typography variant="body-sm" weight="medium">Contraseña</Typography>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <Typography variant="body-sm" className="text-red-600">{errors.password}</Typography>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  <Typography variant="body-sm" weight="medium">Confirmar</Typography>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <Typography variant="body-sm" className="text-red-600">{errors.confirmPassword}</Typography>
                )}
              </div>

              <div className="col-span-2 flex justify-end gap-2 pt-2">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    <Typography variant="button">Cancelar</Typography>
                  </Button>
                )}
                <Button type="submit">
                  <User className="w-4 h-4 mr-2" />
                  <Typography variant="button">{submitText}</Typography>
                </Button>
              </div>
            </div>
          ) : (
            // Full desktop layout for modal forms
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className={`text-lg ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Rol del Usuario
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "cajero") => handleInputChange("role", value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cajero">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Cajero
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        Administrador
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite la contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="col-span-2 flex justify-end gap-2 pt-4">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                )}
                <Button type="submit">
                  <User className="w-4 h-4 mr-2" />
                  {submitText}
                </Button>
              </div>
            </div>
          )}
        </div>
      </ResponsiveShow>
    </form>
  );

  if (isCompact) {
    return <FormContent />;
  }

  return (
    <ResponsiveContainer>
      <Card>
        <CardHeader>
          <CardTitle>
            <Typography variant="h3" weight="semibold">Nuevo Usuario</Typography>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormContent />
        </CardContent>
      </Card>
    </ResponsiveContainer>
  );
}