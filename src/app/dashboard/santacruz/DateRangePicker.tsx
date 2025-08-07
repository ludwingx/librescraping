"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover } from "@/components/ui/popover";

interface DateRangePickerProps {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
}

export function DateRangePicker({ onDateRangeChange }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const handleApplyFilter = () => {
    // Convertir strings a objetos Date
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    // Si hay una fecha de fin, ajustarla para incluir todo el día
    if (end) {
      end.setHours(23, 59, 59, 999);
    }
    
    onDateRangeChange(start, end);
    setIsOpen(false);
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    onDateRangeChange(null, null);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <span className="hidden sm:inline">Filtrar por fecha</span>
        <span className="inline sm:hidden">Filtrar</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 p-4 bg-white border rounded-md shadow-md z-10 w-72">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Fecha inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">Fecha final</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={handleClearFilter}>
                Limpiar
              </Button>
              <Button onClick={handleApplyFilter}>
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}