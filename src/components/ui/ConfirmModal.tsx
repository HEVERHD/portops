"use client"

import { useEffect } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"

interface ConfirmModalProps {
  open:          boolean
  title:         string
  description?:  string
  confirmLabel?: string
  cancelLabel?:  string
  dangerous?:    boolean
  loading?:      boolean
  onConfirm:     () => void
  onCancel:      () => void
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel  = "Cancelar",
  dangerous    = false,
  loading      = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-4
                 bg-slate-950/80 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl
                   shadow-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icono + título */}
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                          ${dangerous ? "bg-red-900/30 border border-red-800/40" : "bg-amber-900/30 border border-amber-800/40"}`}>
            <AlertTriangle className={`w-4 h-4 ${dangerous ? "text-red-400" : "text-amber-400"}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white leading-snug">{title}</h3>
            {description && (
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700
                       text-slate-300 font-medium py-2.5 rounded-xl text-sm transition-colors
                       disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2
                        text-white font-medium py-2.5 rounded-xl text-sm transition-colors
                        disabled:opacity-50
                        ${dangerous
                          ? "bg-red-700 hover:bg-red-600"
                          : "bg-amber-600 hover:bg-amber-500"}`}
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando…</>
              : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
