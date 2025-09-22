"use client";
import React from "react";

type Props = {
  totalValue: number;
  totalUnits: number;
  totalSkus: number;
};

export const StatsCards: React.FC<Props> = ({ totalValue, totalUnits, totalSkus }) => {
  return (
    <div className="mb-4 flex flex-wrap gap-3 md:flex-nowrap">
      <div className="min-w-[220px] flex-1 shrink-0 rounded-md border bg-card text-card-foreground shadow-sm px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Valor inventario</span>
          <span className="text-xl font-semibold leading-none">${totalValue.toFixed(2)}</span>
        </div>
      </div>
      <div className="min-w-[220px] flex-1 shrink-0 rounded-md border bg-card text-card-foreground shadow-sm px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Unidades</span>
          <span className="text-xl font-semibold leading-none">{totalUnits}</span>
        </div>
      </div>
      <div className="min-w-[220px] flex-1 shrink-0 rounded-md border bg-card text-card-foreground shadow-sm px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">SKUs</span>
          <span className="text-xl font-semibold leading-none">{totalSkus}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
