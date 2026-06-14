"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & {
    variant?: "default" | "outline";
    size?: "sm" | "default" | "lg";
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex items-center gap-1", className)}
    {...props}
  />
));
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & {
    variant?: "default" | "outline";
    size?: "sm" | "default" | "lg";
  }
>(({ className, variant = "outline", size = "default", ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-lg border border-[#e8ecf0] bg-white px-4 py-2 text-[13.5px] font-medium text-gray-600 transition-all cursor-pointer",
      "hover:border-gray-300 hover:text-gray-800",
      "data-[state=on]:border-[#1a4e8a] data-[state=on]:bg-[#eef2f8] data-[state=on]:text-[#1a4e8a]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a4e8a] focus-visible:ring-offset-1",
      size === "sm" && "px-3 py-1.5 text-[12px]",
      size === "lg" && "px-5 py-2.5 text-[15px]",
      className
    )}
    {...props}
  />
));
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
