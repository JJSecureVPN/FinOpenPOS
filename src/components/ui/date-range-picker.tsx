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

  useEffect(() => setMounted(true), []);

  const fromDate = useMemo(() => parseISO(from), [from]);
  const toDate = useMemo(() => parseISO(to), [to]);
  const selected: DateRange | undefined = useMemo(() => {
    if (!fromDate && !toDate) return undefined;
    return { from: fromDate, to: toDate };
  }, [fromDate, toDate]);

  const label = useMemo(() => {
    const fmt = (d?: Date) => (d ? d.toLocaleDateString("es-ES") : "");
    if (fromDate && toDate) return `${fmt(fromDate)} — ${fmt(toDate)}`;
    if (fromDate) return `Desde ${fmt(fromDate)}`;
    if (toDate) return `Hasta ${fmt(toDate)}`;
    return "Seleccionar rango";
  }, [fromDate, toDate]);

  const yearNow = useMemo(() => new Date().getFullYear(), []);

  const apply = (range?: DateRange) => {
    if (!range?.from || !range?.to) return;
    onChange({ from: toISO(range.from), to: toISO(range.to) });
  };

  // Presets helpers
  const now = new Date();
  const presets = [
    {
      key: "today",
      label: "Hoy",
      run: () => {
        const d = new Date();
        onChange({ from: toISO(d), to: toISO(d) });
        setOpen(false);
      },
    },
    {
      key: "last7",
      label: "Últimos 7 días",
      run: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 6);
        onChange({ from: toISO(start), to: toISO(end) });
        setOpen(false);
      },
    },
    {
      key: "thisWeek",
      label: "Esta semana",
      run: () => {
        const end = new Date();
        const dow = (end.getDay() + 6) % 7; // Lunes=0
        const start = new Date(end);
        start.setDate(end.getDate() - dow);
        onChange({ from: toISO(start), to: toISO(end) });
        setOpen(false);
      },
    },
    {
      key: "thisMonth",
      label: "Este mes",
      run: () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth(), 1);
        onChange({ from: toISO(start), to: toISO(end) });
        setOpen(false);
      },
    },
    {
      key: "lastMonth",
      label: "Mes pasado",
      run: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        onChange({ from: toISO(start), to: toISO(lastDay) });
        setOpen(false);
      },
    },
    {
      key: "last30",
      label: "Últimos 30 días",
      run: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 29);
        onChange({ from: toISO(start), to: toISO(end) });
        setOpen(false);
      },
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`gap-2 ${className ?? ""}`}>
          <CalendarIcon className="w-4 h-4" />
          <span className="text-sm truncate max-w-[60vw] sm:max-w-[260px]">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-2 w-auto">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Presets */}
          <div className="flex sm:flex-col gap-1 sm:min-w-[150px]">
            {presets.map((p) => (
              <Button key={p.key} variant="ghost" size="sm" onClick={p.run}>
                {p.label}
              </Button>
            ))}
            {(fromDate || toDate) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  // Reset al último 30 por defecto
                  const end = new Date();
                  const start = new Date();
                  start.setDate(end.getDate() - 29);
                  onChange({ from: toISO(start), to: toISO(end) });
                }}
              >
                Reiniciar
              </Button>
            )}
          </div>

          {/* Calendario doble */}
          <div className="p-1">
            {mounted ? (
              <DayPicker
                mode="range"
                selected={selected}
                onSelect={(range) => apply(range)}
                weekStartsOn={1}
                numberOfMonths={2}
                locale={es}
                showOutsideDays
                captionLayout="dropdown"
                fromYear={yearNow - 5}
                toYear={yearNow + 5}
                defaultMonth={fromDate || toDate || new Date()}
              />
            ) : (
              <div className="w-[640px] h-[320px]" />
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DateRangePicker;
