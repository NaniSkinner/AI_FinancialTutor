import React from "react";
import { cn } from "@/lib/utils";

interface SliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      className,
      value,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const currentValue = value[0] || min;
    const percentage = ((currentValue - min) / (max - min)) * 100;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      onValueChange([newValue]);
    };

    return (
      <div ref={ref} className={cn("relative w-full", className)} {...props}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:w-5",
            "[&::-webkit-slider-thumb]:h-5",
            "[&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-indigo-600",
            "[&::-webkit-slider-thumb]:cursor-pointer",
            "[&::-webkit-slider-thumb]:border-2",
            "[&::-webkit-slider-thumb]:border-white",
            "[&::-webkit-slider-thumb]:shadow-md",
            "[&::-moz-range-thumb]:w-5",
            "[&::-moz-range-thumb]:h-5",
            "[&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:bg-indigo-600",
            "[&::-moz-range-thumb]:cursor-pointer",
            "[&::-moz-range-thumb]:border-2",
            "[&::-moz-range-thumb]:border-white",
            "[&::-moz-range-thumb]:shadow-md"
          )}
          style={{
            background: `linear-gradient(to right, rgb(79 70 229) 0%, rgb(79 70 229) ${percentage}%, rgb(229 231 235) ${percentage}%, rgb(229 231 235) 100%)`,
          }}
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";
