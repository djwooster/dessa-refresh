"use client";

import { useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = "Pick a date" }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const parsed = value ? parseISO(value) : undefined;
  const selected = parsed && isValid(parsed) ? parsed : undefined;

  const handleSelect = (date: Date | undefined) => {
    onChange(date ? format(date, "yyyy-MM-dd") : "");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={(o) => setOpen(o)}>
      <PopoverTrigger className="flex h-9 w-full items-center justify-between rounded-lg border border-[#d1d5db] px-3 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1565c0]/30 focus:border-[#1565c0] transition-colors cursor-pointer">
        <span className={`text-[13px] ${selected ? "text-gray-700" : "text-gray-400"}`}>
          {selected ? format(selected, "MMM d, yyyy") : placeholder}
        </span>
        <CalendarIcon size={13} className="text-gray-400 shrink-0" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" side="bottom">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={selected}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}
