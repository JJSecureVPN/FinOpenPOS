"use client";
import React from "react";
import { ResponsiveGrid } from "@/components/responsive";
import { Typography } from "@/components/ui/typography";

type Props = {
  totalValue: number;
  totalUnits: number;
  totalSkus: number;
};

export const StatsCards: React.FC<Props> = ({ totalValue, totalUnits, totalSkus }) => {
  const stats = [
    {
      label: "Valor inventario",
      value: `$${totalValue.toFixed(2)}`,
      className: "text-green-600"
    },
    {
      label: "Unidades",
      value: totalUnits.toLocaleString(),
      className: "text-blue-600"
    },
    {
      label: "SKUs",
      value: totalSkus.toLocaleString(),
      className: "text-purple-600"
    }
  ];

  return (
    <div className="mb-6">
      <ResponsiveGrid
        cols={{ default: 1, sm: 3 }}
        gap="md"
        className="w-full"
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col space-y-1">
              <Typography variant="body-sm" weight="medium" className="text-muted-foreground">
                {stat.label}
              </Typography>
              <Typography variant="h2" weight="bold" className={`leading-none ${stat.className}`}>
                {stat.value}
              </Typography>
            </div>
          </div>
        ))}
      </ResponsiveGrid>
    </div>
  );
};

export default StatsCards;
