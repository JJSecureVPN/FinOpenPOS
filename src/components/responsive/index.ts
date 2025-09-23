// Exportar todos los componentes responsivos
export { ResponsiveContainer } from "./ResponsiveContainer";
export { ResponsiveGrid } from "./ResponsiveGrid";
export { ResponsiveLayout } from "./ResponsiveLayout";
export { ResponsiveCard } from "./ResponsiveCard";
export { MobileAdaptive, useResponsiveBreakpoint, ResponsiveShow } from "./MobileAdaptive";

// Tipos comunes
export interface BreakpointConfig {
  sm?: string | number;
  md?: string | number;
  lg?: string | number;
  xl?: string | number;
}

export interface ResponsiveConfig {
  mobile: any;
  tablet: any;
  desktop: any;
}