"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { useLoading } from "@/contexts/LoadingContext"
import { ConfirmModal } from "@/components/ui/ConfirmModal"

export function DeleteOperationButton({ operationId }: { operationId: string }) {
  const router           = useRouter()
  const { startLoading } = useLoading()
  const [open, setOpen]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  async function handleConfirm() {
    setLoading(true)
    setError("")
    try {
      const res  = await fetch(`/api/operations/${operationId}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Error al eliminar")
        setOpen(false)
      } else {
        setOpen(false)
        startLoading()
        router.push("/operations")
        router.refresh()
      }
    } catch {
      setError("Error de conexión")
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {error && (
        <p className="text-xs text-red-400 bg-red-950/30 border border-red-800/40
                       rounded-lg px-2.5 py-1.5">
          {error}
        </p>
      )}

      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400
                   border border-slate-800 hover:border-red-800/50
                   px-3 py-1.5 rounded-lg transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Eliminar operación
      </button>

      <ConfirmModal
        open={open}
        title="¿Eliminar esta operación?"
        description="Esta acción es permanente y no se puede deshacer. Se eliminarán todos los formularios asociados."
        confirmLabel="Sí, eliminar"
        dangerous
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
