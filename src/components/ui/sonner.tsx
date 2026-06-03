"use client"

import { Toaster as Sonner, type ToasterProps, toast } from "sonner"
import { Check, X } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={{ "--width": "420px" } as React.CSSProperties}
      {...props}
    />
  )
}

type SuccessToastProps = {
  id: string | number;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

function SuccessToast({ id, title, description, actionLabel, onAction }: SuccessToastProps) {
  return (
    <div className="flex items-center gap-3 w-full rounded-xl shadow-xl px-4 py-3.5 min-w-[340px]" style={{ background: "#1c2b22" }}>
      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#22c55e" }}>
        <Check size={16} color="white" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-white leading-snug">{title}</p>
        {description && (
          <p className="text-[13px] text-white/60 mt-0.5 leading-snug">{description}</p>
        )}
        {actionLabel && (
          <button
            onClick={() => { onAction?.(); toast.dismiss(id); }}
            className="mt-1.5 text-[12px] font-semibold text-[#86efac] cursor-pointer hover:text-white transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
      <button
        onClick={() => toast.dismiss(id)}
        className="shrink-0 text-white/50 hover:text-white transition-colors cursor-pointer"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export { Toaster, SuccessToast }
