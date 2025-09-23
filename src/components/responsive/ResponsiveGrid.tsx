"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  autoFit?: boolean;
  minItemWidth?: string;
}

/**
 * Grid responsivo que se adapta automáticamente a diferentes tamaños de pantalla
 */
export function ResponsiveGrid({ 
  children, 
  className,
  cols = { default: 1, md: 2, lg: 3 },
  gap = "md",
  autoFit = false,
  minItemWidth = "300px"
}: ResponsiveGridProps) {
  
  const gapClasses = {
    none: "gap-0",
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8"
  };

  // Auto-fit usa CSS Grid para ajuste automático
  if (autoFit) {
    return (
      <div 
        className={cn(
          "grid",
          gapClasses[gap],
          className
        )}
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
        }}
      >
        {children}
      </div>
    );
  }

  // Grid responsivo basado en breakpoints
  const gridClasses = [];
  if (cols.default) gridClasses.push(`grid-cols-${cols.default}`);
  if (cols.sm) gridClasses.push(`sm:grid-cols-${cols.sm}`);
  if (cols.md) gridClasses.push(`md:grid-cols-${cols.md}`);
  if (cols.lg) gridClasses.push(`lg:grid-cols-${cols.lg}`);
  if (cols.xl) gridClasses.push(`xl:grid-cols-${cols.xl}`);

  return (
    <div className={cn(
      "grid",
      ...gridClasses,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}