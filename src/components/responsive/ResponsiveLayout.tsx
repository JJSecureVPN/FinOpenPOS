"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  direction?: "row" | "col";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  wrap?: boolean;
  responsive?: {
    sm?: Partial<ResponsiveLayoutProps>;
    md?: Partial<ResponsiveLayoutProps>;
    lg?: Partial<ResponsiveLayoutProps>;
    xl?: Partial<ResponsiveLayoutProps>;
  };
}

/**
 * Layout flexbox responsivo con opciones completas de alineación
 */
export function ResponsiveLayout({ 
  children, 
  className,
  direction = "row",
  align = "start",
  justify = "start",
  gap = "md",
  wrap = false,
  responsive
}: ResponsiveLayoutProps) {
  
  const directionClasses = {
    row: "flex-row",
    col: "flex-col"
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center", 
    end: "items-end",
    stretch: "items-stretch"
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around", 
    evenly: "justify-evenly"
  };

  const gapClasses = {
    none: "gap-0",
    xs: "gap-1",
    sm: "gap-2", 
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8"
  };

  return (
    <div className={cn(
      "flex",
      directionClasses[direction],
      alignClasses[align],
      justifyClasses[justify],
      gapClasses[gap],
      wrap && "flex-wrap",
      className
    )}>
      {children}
    </div>
  );
}