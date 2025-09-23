import React from 'react';
import { cn } from '@/lib/utils';

// Tipos para las variantes de tipografía
type TypographyVariant = 
  | 'h1' | 'h2' | 'h3' | 'h4' 
  | 'body' | 'body-sm' | 'caption' | 'micro'
  | 'button' | 'input';

type TypographyWeight = 'normal' | 'medium' | 'semibold' | 'bold';

interface TypographyProps {
  variant?: TypographyVariant;
  weight?: TypographyWeight;
  className?: string;
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';
}

// Definición de estilos para cada variante
const variantStyles: Record<TypographyVariant, string> = {
  // Títulos - más pequeños que antes
  h1: 'text-lg font-semibold leading-tight',     // era text-3xl
  h2: 'text-base font-semibold leading-tight',   // era text-2xl
  h3: 'text-sm font-semibold leading-tight',     // era text-xl
  h4: 'text-sm font-medium leading-tight',       // era text-lg
  
  // Cuerpo de texto
  body: 'text-sm leading-relaxed',               // texto principal
  'body-sm': 'text-xs leading-relaxed',          // texto secundario
  
  // Texto pequeño
  caption: 'text-xs leading-normal',             // etiquetas, metadatos
  micro: 'text-[10px] leading-tight',            // texto muy pequeño
  
  // Elementos específicos
  button: 'text-xs font-medium leading-none',    // botones
  input: 'text-sm leading-none',                 // inputs y formularios
};

// Pesos de fuente
const weightStyles: Record<TypographyWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export function Typography({ 
  variant = 'body', 
  weight, 
  className, 
  children, 
  as 
}: TypographyProps) {
  // Determinar el elemento HTML por defecto basado en la variante
  const defaultElement = (() => {
    switch (variant) {
      case 'h1': return 'h1';
      case 'h2': return 'h2';
      case 'h3': return 'h3';
      case 'h4': return 'h4';
      case 'caption':
      case 'micro': return 'span';
      default: return 'p';
    }
  })();

  const Component = as || defaultElement;
  
  return (
    <Component
      className={cn(
        variantStyles[variant],
        weight && weightStyles[weight],
        className
      )}
    >
      {children}
    </Component>
  );
}

// Componentes específicos para uso común
export const Heading = ({ level = 1, ...props }: Omit<TypographyProps, 'variant'> & { level?: 1 | 2 | 3 | 4 }) => (
  <Typography variant={`h${level}` as TypographyVariant} {...props} />
);

export const Text = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body" {...props} />
);

export const SmallText = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="body-sm" {...props} />
);

export const Caption = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="caption" {...props} />
);

export const Micro = (props: Omit<TypographyProps, 'variant'>) => (
  <Typography variant="micro" {...props} />
);