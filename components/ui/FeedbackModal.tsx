"use client";

import { X, CheckCircle2, AlertCircle, Info, Trash2, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type ModalType = "success" | "error" | "info" | "confirm" | "delete";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  type: ModalType;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  onConfirm,
  type,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isLoading = false
}: FeedbackModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const icons = {
    success: <CheckCircle2 className="text-green-500" size={40} />,
    error: <AlertCircle className="text-red-500" size={40} />,
    info: <Info className="text-blue-500" size={40} />,
    confirm: <AlertTriangle className="text-amber-500" size={40} />,
    delete: <Trash2 className="text-red-500" size={40} />,
  };

  const isConfirmAction = type === "confirm" || type === "delete";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className={cn(
              "p-4 rounded-full border",
              type === "success" && "bg-green-500/10 border-green-500/20",
              type === "error" && "bg-red-500/10 border-red-500/20",
              type === "info" && "bg-blue-500/10 border-blue-500/20",
              type === "confirm" && "bg-amber-500/10 border-amber-500/20",
              type === "delete" && "bg-red-500/10 border-red-500/20",
            )}>
              {icons[type]}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
            <p className="text-zinc-400 leading-relaxed">{message}</p>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-3">
            {isConfirmAction ? (
              <>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(
                    "flex-1 px-6 py-2.5 font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2",
                    type === "delete" ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20" : "bg-zinc-100 hover:bg-white text-zinc-950 shadow-lg shadow-white/5"
                  )}
                >
                  {isLoading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                  {confirmLabel}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-white/5"
              >
                Entendido
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
