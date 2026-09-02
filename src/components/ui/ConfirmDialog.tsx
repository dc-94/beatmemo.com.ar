"use client";
import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open, title, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar",
  danger = false, loading = false, onConfirm, onCancel,
}: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={loading ? undefined : onCancel} />
      <div role="alertdialog" aria-modal="true" className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 flex items-start gap-3">
          {danger && (
            <span className="flex-none mt-0.5 w-9 h-9 rounded-full bg-red-500/15 text-red-400 grid place-items-center">
              <AlertTriangle size={18} />
            </span>
          )}
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="mt-1.5 text-sm text-neutral-400 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-neutral-800 bg-neutral-900">
          <button type="button" onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors disabled:opacity-50">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className={`px-4 py-2 text-sm font-bold rounded transition-colors disabled:opacity-60 ${danger ? "bg-red-600 hover:bg-red-500 text-white" : "bg-white text-black hover:bg-neutral-200"}`}>
            {loading ? "Procesando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}