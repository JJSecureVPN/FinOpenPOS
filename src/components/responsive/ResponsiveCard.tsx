"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  headerActions?: React.ReactNode;
  variant?: "default" | "outlined" | "filled" | "ghost";
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  fullHeight?: boolean;
}

/**
 * Card responsiva que se adapta al contenido y tamaño de pantalla
 */
export function ResponsiveCard({ 
  children, 
  className,
  title,
  description,
  headerActions,
  variant = "default",
  size = "md",
  interactive = false,
  fullHeight = false
}: ResponsiveCardProps) {
  
  const variantClasses = {
    default: "",
    outlined: "border-2",
    filled: "bg-muted/50",
    ghost: "border-none shadow-none bg-transparent"
  };

  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6"
  };

  const cardClasses = cn(
    variantClasses[variant],
    interactive && "hover:shadow-md transition-shadow cursor-pointer",
    fullHeight && "h-full",
    className
  );

  return (
    <Card className={cardClasses}>
      {(title || description || headerActions) && (
        <CardHeader className={cn(
          "flex flex-row items-center justify-between space-y-0",
          sizeClasses[size]
        )}>
          <div className="space-y-1">
            {title && (
              <CardTitle className="text-sm font-medium sm:text-base">
                {title}
              </CardTitle>
            )}
            {description && (
              <p className="text-xs text-muted-foreground sm:text-sm">
                {description}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </CardHeader>
      )}
      <CardContent className={cn(
        "flex-1",
        title || description || headerActions ? "pt-0" : "",
        sizeClasses[size]
      )}>
        {children}
      </CardContent>
    </Card>
  );
}