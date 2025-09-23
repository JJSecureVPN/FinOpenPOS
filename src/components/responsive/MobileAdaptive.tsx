"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MobileAdaptiveProps {
  children: React.ReactNode;
  className?: string;
  mobileLayout?: "stack" | "scroll" | "tabs" | "drawer";
  breakpoint?: "sm" | "md" | "lg";
  mobileFirst?: boolean;
}

/**
 * Componente que adapta automáticamente el layout para móviles
 */
export function MobileAdaptive({ 
  children, 
  className,
  mobileLayout = "stack",
  breakpoint = "md",
  mobileFirst = true
}: MobileAdaptiveProps) {
  
  const breakpointClasses = {
    sm: "sm:",
    md: "md:",
    lg: "lg:"
  };

  const bp = breakpointClasses[breakpoint];

  const mobileLayoutClasses = {
    stack: "flex flex-col space-y-4",
    scroll: "overflow-x-auto",
    tabs: "space-y-4",
    drawer: "relative"
  };

  return (
    <div className={cn(
      // Layout móvil por defecto
      mobileLayoutClasses[mobileLayout],
      // Layout desktop en breakpoint mayor
      `${bp}block ${bp}space-y-0`,
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Hook para detectar tamaño de pantalla
 */
export function useResponsiveBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<"mobile" | "tablet" | "desktop">("desktop");

  React.useEffect(() => {
    const checkBreakpoint = () => {
      if (window.innerWidth < 768) {
        setBreakpoint("mobile");
      } else if (window.innerWidth < 1024) {
        setBreakpoint("tablet");
      } else {
        setBreakpoint("desktop");
      }
    };

    checkBreakpoint();
    window.addEventListener("resize", checkBreakpoint);
    return () => window.removeEventListener("resize", checkBreakpoint);
  }, []);

  return breakpoint;
}

/**
 * Componente para mostrar/ocultar contenido según breakpoint
 */
export function ResponsiveShow({ 
  children, 
  on = "desktop",
  className 
}: { 
  children: React.ReactNode; 
  on: "mobile" | "tablet" | "desktop" | "mobile-tablet" | "tablet-desktop";
  className?: string;
}) {
  const showClasses = {
    mobile: "block md:hidden",
    tablet: "hidden md:block lg:hidden",
    desktop: "hidden lg:block",
    "mobile-tablet": "block lg:hidden",
    "tablet-desktop": "hidden md:block"
  };

  return (
    <div className={cn(showClasses[on], className)}>
      {children}
    </div>
  );
}