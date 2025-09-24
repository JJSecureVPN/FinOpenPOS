"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";

type Props = {
  from?: string; // ISO yyyy-mm-dd
  to?: string;   // ISO yyyy-mm-dd
  onChange: (next: { from: string; to: string }) => void;
  className?: string;
};

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

function parseISO(s?: string): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

export function DateRangePicker({ from, to, onChange, className }: Props) {
  const [open, setOpen] = useState(false);

  const fromDate = useMemo(() => parseISO(from), [from]);
  const toDate = useMemo(() => parseISO(to), [to]);

  const fmtShort = (d: Date, withYear = false) => {
    const s = d.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: withYear ? "numeric" : undefined,
    });
    return s.replace(/\./g, "");
  };
  
  const fmtRangeShort = (a: Date, b: Date) => {
    if (a.getFullYear() === b.getFullYear()) {
      return `${fmtShort(a)} al ${fmtShort(b, true)}`;
    }
    return `${fmtShort(a, true)} al ${fmtShort(b, true)}`;
  };

  const label = useMemo(() => {
    if (fromDate && toDate) return fmtRangeShort(fromDate, toDate);
    if (fromDate) return `Desde ${fmtShort(fromDate, true)}`;
    if (toDate) return `Hasta ${fmtShort(toDate, true)}`;
    return "Seleccionar rango";
  }, [fromDate, toDate]);

  const applyRange = (startDate: Date, endDate: Date) => {
    onChange({ from: toISO(startDate), to: toISO(endDate) });
    setOpen(false);
  };

  // Presets estilo MercadoPago
  const today = new Date();
  const presets = [
    {
      label: "Hoy",
      description: fmtShort(today, true),
      start: today,
      end: today,
    },
    {
      label: "Últimos 7 días", 
      description: fmtRangeShort(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6),
        today
      ),
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6),
      end: today,
    },
    {
      label: "Últimos 15 días",
      description: fmtRangeShort(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14),
        today
      ),
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14),
      end: today,
    },
    {
      label: "Últimos 30 días",
      description: fmtRangeShort(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29),
        today
      ),
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29),
      end: today,
    },
  ];

  const MenuView = () => (
    <div className="min-w-[260px]">
      <div className="flex flex-col">
        {presets.map((preset, i) => (
          <button
            key={i}
            className="text-left px-3 py-2 hover:bg-muted rounded-md"
            onClick={() => applyRange(preset.start, preset.end)}
          >
            <div className="font-medium">{preset.label}</div>
            <div className="text-xs text-muted-foreground">{preset.description}</div>
          </button>
        ))}
      </div>
    </div>
  );



  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`gap-2 ${className ?? ""}`}>
          <CalendarIcon className="w-4 h-4" />
          <span className="text-sm truncate max-w-[60vw] sm:max-w-[260px]">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-2 w-auto">
        <MenuView />
      </PopoverContent>
    </Popover>
  );
}

export default DateRangePicker;
