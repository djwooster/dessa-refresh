"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Field = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }
>(({ className, orientation = "vertical", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group rounded-xl border border-[#e8ecf0] bg-white p-4 transition-all",
      "has-[[data-state=checked]]:border-[#1a4e8a] has-[[data-state=checked]]:bg-[#eef2f8]",
      "hover:border-gray-300 has-[[data-state=checked]]:hover:border-[#1a4e8a]",
      orientation === "horizontal" && "flex items-start justify-between gap-3",
      className
    )}
    {...props}
  />
));
Field.displayName = "Field";

const FieldContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col min-w-0", className)} {...props} />
));
FieldContent.displayName = "FieldContent";

const FieldTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-[14px] font-semibold leading-snug text-gray-700",
      "group-has-[[data-state=checked]]:text-[#1a4e8a]",
      className
    )}
    {...props}
  />
));
FieldTitle.displayName = "FieldTitle";

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-[12px] text-gray-500 leading-snug mt-0.5", className)} {...props} />
));
FieldDescription.displayName = "FieldDescription";

const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("cursor-pointer block", className)} {...props} />
));
FieldLabel.displayName = "FieldLabel";

export { Field, FieldContent, FieldTitle, FieldDescription, FieldLabel };
