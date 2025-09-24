"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { es } from "date-fns/locale";

type Props = {
  from?: string; // ISO yyyy-mm-dd
  to?: string;   // ISO yyyy-mm-dd
  onChange: (next: { from: string; to: string }) => void;
  className?: string;
};

function toISO(d: Date) {
  const d2 = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  return d2.toISOString().slice(0, 10);
}

function parseISO(s?: string): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  // Interpretar como fecha local a medianoche para evitar offsets
  return new Date(y, m - 1, d);
}

export function DateRangePicker({ from, to, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"menu" | "custom">("menu");
  const [tempRange, setTempRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => setMounted(true), []);

  const fromDate = useMemo(() => parseISO(from), [from]);
  const toDate = useMemo(() => parseISO(to), [to]);
  const selected: DateRange | undefined = useMemo(() => {
    if (!fromDate && !toDate) return undefined;
    return { from: fromDate, to: toDate };
  }, [fromDate, toDate]);

  const fmtShort = (d: Date, withYear = false) => {
    const s = d.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: withYear ? "numeric" : undefined,
    });
    return s.replaceAll(".", "");
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

  const yearNow = useMemo(() => new Date().getFullYear(), []);

  const apply = (range?: DateRange) => {
    if (!range?.from || !range?.to) return;
    onChange({ from: toISO(range.from), to: toISO(range.to) });
    setOpen(false);
    setMode("menu");
  };

  // Presets estilo MercadoPago
  const today = new Date();
  const makeRange = (start: Date, end: Date) => ({ from: start, to: end });
  const ranges = {
    today: makeRange(today, today),
    last7: makeRange(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6), today),
    last15: makeRange(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14), today),
    last30: makeRange(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29), today),
  } as const;

  const MenuView = () => (
    <div className="min-w-[260px]">
      <div className="flex flex-col">
        <button
          className="text-left px-3 py-2 hover:bg-muted rounded-md"
          onClick={() => apply(ranges.today)}
        >
          <div className="font-medium">Hoy</div>
          <div className="text-xs text-muted-foreground">{fmtShort(today, true)}</div>
        </button>
        <button
          className="text-left px-3 py-2 hover:bg-muted rounded-md"
          onClick={() => apply(ranges.last7)}
        >
          <div className="font-medium">Últimos 7 días</div>
          <div className="text-xs text-muted-foreground">{fmtRangeShort(ranges.last7.from, ranges.last7.to)}</div>
        </button>
        <button
          className="text-left px-3 py-2 hover:bg-muted rounded-md"
          onClick={() => apply(ranges.last15)}
        >
          <div className="font-medium">Últimos 15 días</div>
          <div className="text-xs text-muted-foreground">{fmtRangeShort(ranges.last15.from, ranges.last15.to)}</div>
        </button>
        <button
          className="text-left px-3 py-2 hover:bg-muted rounded-md"
          onClick={() => apply(ranges.last30)}
        >
          <div className="font-medium">Últimos 30 días</div>
          <div className="text-xs text-muted-foreground">{fmtRangeShort(ranges.last30.from, ranges.last30.to)}</div>
        </button>
        <div className="border-t my-1" />
        <button
          className="text-left px-3 py-2 hover:bg-muted rounded-md"
          onClick={() => {
            setMode("custom");
            setTempRange(selected ?? { from: today, to: today });
          }}
        >
          <div className="font-medium">Fecha personalizada</div>
          <div className="text-xs text-muted-foreground">Selecciona un rango en el calendario</div>
        </button>
      </div>
    </div>
  );

  const CustomView = () => (
    <div className="flex flex-col gap-3 w-fit">
      <div className="flex items-center justify-between">
        <button className="text-sm text-muted-foreground hover:underline" onClick={() => setMode("menu")}>
          ← Volver
        </button>
        <div className="text-sm font-medium">Fecha personalizada</div>
      </div>
      <div className="text-xs text-muted-foreground text-center">
        Selecciona fecha de inicio y fin en el calendario
      </div>
      <div className="flex items-center justify-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/40"></div>
          <span className="text-muted-foreground">Desde:</span>
          <span className="font-medium">
            {tempRange?.from ? fmtShort(tempRange.from, true) : "—"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/40"></div>
          <span className="text-muted-foreground">Hasta:</span>
          <span className="font-medium">
            {tempRange?.to ? fmtShort(tempRange.to, true) : "—"}
          </span>
        </div>
      </div>
      <div className="flex justify-center">
        {mounted ? (
          <DayPicker
            mode="range"
            selected={tempRange}
            onSelect={(range) => setTempRange(range)}
            weekStartsOn={1}
            numberOfMonths={2}
            locale={es}
            showOutsideDays={true}
            captionLayout="buttons"
            fromYear={yearNow - 5}
            toYear={yearNow + 5}
            defaultMonth={tempRange?.from || fromDate || new Date()}
            className="rdp-compact"
          />
        ) : (
          <div className="w-[580px] h-[280px] bg-muted/20 rounded animate-pulse" />
        )}
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => setTempRange(undefined)}>
          Limpiar
        </Button>
        <Button
          size="sm"
          onClick={() => apply(tempRange)}
          disabled={!tempRange?.from || !tempRange?.to}
        >
          Aplicar rango
        </Button>
      </div>
    </div>
  );

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setMode("menu"); }}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`gap-2 ${className ?? ""}`}>
          <CalendarIcon className="w-4 h-4" />
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
