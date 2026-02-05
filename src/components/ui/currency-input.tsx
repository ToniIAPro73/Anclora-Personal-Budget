"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number;
  onChange?: (value: number) => void;
  currency?: string;
}

export function CurrencyInput({
  value = 0,
  onChange,
  currency = "EUR",
  className,
  ...props
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState("");

  React.useEffect(() => {
    if (value === 0 && displayValue === "") return;
    setDisplayValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Allow empty input
    if (input === "") {
      setDisplayValue("");
      onChange?.(0);
      return;
    }

    // Remove non-numeric characters except decimal point
    const cleaned = input.replace(/[^\d.]/g, "");
    
    // Prevent multiple decimal points
    const parts = cleaned.split(".");
    const formatted = parts.length > 2 
      ? parts[0] + "." + parts.slice(1).join("")
      : cleaned;

    setDisplayValue(formatted);
    
    const numericValue = parseFloat(formatted) || 0;
    onChange?.(numericValue);
  };

  const handleBlur = () => {
    if (displayValue === "") {
      setDisplayValue("0");
      onChange?.(0);
    } else {
      const numericValue = parseFloat(displayValue) || 0;
      setDisplayValue(numericValue.toFixed(2));
      onChange?.(numericValue);
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn("pr-12", className)}
        {...props}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
        {currency}
      </div>
    </div>
  );
}
