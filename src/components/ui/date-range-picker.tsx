"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const [mode, setMode] = useState<"menu" | "custom">("menu");
  const [draftFrom, setDraftFrom] = useState<string | undefined>(from);
  const [draftTo, setDraftTo] = useState<string | undefined>(to);

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
    setMode("menu");
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
        <div className="border-t my-1" />
        <button
          className="text-left px-3 py-2 hover:bg-muted rounded-md"
          onClick={() => {
            setDraftFrom(from ?? toISO(new Date()));
            setDraftTo(to ?? toISO(new Date()));
            setMode("custom");
          }}
        >
          <div className="font-medium">Personalizado</div>
          <div className="text-xs text-muted-foreground">Elegir inicio y fin</div>
        </button>
      </div>
    </div>
  );

  const isValidISO = (s?: string) => {
    if (!s) return false;
    const d = parseISO(s);
    return !!d && !isNaN(d.getTime());
  };

  const CustomView = () => {
    const fromVal = draftFrom ?? from ?? toISO(new Date());
    const toVal = draftTo ?? to ?? toISO(new Date());
    const canApply = isValidISO(fromVal) && isValidISO(toVal) && parseISO(fromVal)! <= parseISO(toVal)!;

    return (
      <div className="min-w-[280px] max-w-[320px]">
        <div className="flex items-center justify-between px-1 pb-2">
          <button className="text-sm text-muted-foreground hover:underline" onClick={() => setMode("menu")}>← Volver</button>
          <div className="text-sm font-medium">Personalizado</div>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2">
            <label className="text-xs text-muted-foreground">Inicio</label>
            <Input
              type="date"
              value={fromVal}
              onChange={(e) => setDraftFrom(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <label className="text-xs text-muted-foreground">Fin</label>
            <Input
              type="date"
              value={toVal}
              min={fromVal}
              onChange={(e) => setDraftTo(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-between items-center mt-3">
          <Button variant="ghost" size="sm" onClick={() => { setMode("menu"); }}>
            Cancelar
          </Button>
          <Button
            size="sm"
            disabled={!canApply}
            onClick={() => {
              const s = parseISO(fromVal)!;
              const e = parseISO(toVal)!;
              applyRange(s, e);
            }}
          >
            Aplicar
          </Button>
        </div>
      </div>
    );
  };



  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setMode("menu"); }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label="Seleccionar rango de fechas"
          className={`gap-2 h-9 w-full sm:w-auto rounded-md border border-border bg-card text-foreground hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring ${className ?? ""}`}
        >
          <CalendarIcon className="w-4 h-4 text-foreground" />
          <span className="text-sm truncate max-w-[60vw] sm:max-w-[260px]">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-2 w-auto">
        {mode === "menu" ? <MenuView /> : <CustomView />}
      </PopoverContent>
    </Popover>
  );
}

export default DateRangePicker;
