"use client"

import { Toaster as Sonner, type ToasterProps, toast } from "sonner"
import { CircleCheckIcon } from "lucide-react"

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
    <div className="flex gap-3 w-full bg-white rounded-xl border border-[#e8ecf0] shadow-lg px-4 py-3.5 min-w-[520px]">
      <CircleCheckIcon size={16} className="shrink-0 mt-0.5" style={{ color: "#008e26" }} strokeWidth={2} />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-gray-900 leading-snug">{title}</p>
        {description && (
          <p className="text-[13px] text-gray-500 mt-1 leading-snug">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => toast.dismiss(id)}
          className="text-[12px] font-semibold text-gray-400 border border-gray-200 rounded-lg px-3 h-8 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Dismiss
        </button>
        {actionLabel && (
          <button
            onClick={() => { onAction?.(); toast.dismiss(id); }}
            className="text-[12px] font-semibold text-[#1a4e8a] border border-[#1a4e8a] rounded-lg px-3 h-8 hover:bg-[#eef2f8] transition-colors cursor-pointer"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export { Toaster, SuccessToast }
