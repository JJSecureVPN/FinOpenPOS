"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "dashboard" | "fullscreen" | "page";
  padding?: "none" | "sm" | "md" | "lg";
}

/**
 * Contenedor responsivo principal que se adapta a diferentes tipos de pantalla
 */
export function ResponsiveContainer({ 
  children, 
  className, 
  variant = "default",
  padding = "md"
}: ResponsiveContainerProps) {
  const baseClasses = "w-full";
  
  const variantClasses = {
    default: "max-w-none",
    dashboard: "grid gap-4 md:gap-6",
    fullscreen: "h-screen overflow-hidden",
    page: "max-w-7xl mx-auto"
  };

  const paddingClasses = {
    none: "p-0",
    sm: "p-2 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8"
  };

  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}