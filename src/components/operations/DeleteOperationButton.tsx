"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"
import { useLoading } from "@/contexts/LoadingContext"

export function DeleteOperationButton({ operationId }: { operationId: string }) {
  const router = useRouter()
  const { startLoading } = useLoading()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState("")

  async function handleDelete() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/operations/${operationId}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Error al eliminar")
        setConfirming(false)
      } else {
        startLoading()
        router.push("/operations")
        router.refresh()
      }
    } catch {
      setError("Error de conexión")
      setConfirming(false)
    } finally {
      setLoading(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-col gap-2">
        {error && (
          <p className="text-xs text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg px-2.5 py-1.5">
            {error}
          </p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">¿Confirmar eliminación?</span>
          <button
            onClick={() => setConfirming(false)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg
                       border border-slate-700 hover:border-slate-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium text-white
                       bg-red-700 hover:bg-red-600 disabled:opacity-50
                       px-2.5 py-1 rounded-lg transition-colors"
          >
            {loading
              ? <><Loader2 className="w-3 h-3 animate-spin" /> Eliminando…</>
              : "Sí, eliminar"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400
                 border border-slate-800 hover:border-red-800/50
                 px-3 py-1.5 rounded-lg transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
      Eliminar operación
    </button>
  )
}
