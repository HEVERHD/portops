"use client"

import { useState, useEffect } from "react"
import { X, Search, Users } from "lucide-react"

export interface WorkerOption {
  id: string
  name: string
  cedula: string
  role: string | null
  signatureData: string | null
}

interface WorkerPickerModalProps {
  onSelect: (worker: WorkerOption) => void
  onClose: () => void
}

export function WorkerPickerModal({ onSelect, onClose }: WorkerPickerModalProps) {
  const [workers, setWorkers] = useState<WorkerOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)
  const [search, setSearch]   = useState("")

  useEffect(() => {
    fetch("/api/workers")
      .then((r) => {
        if (!r.ok) throw new Error("error")
        return r.json()
      })
      .then((d) => setWorkers(d.workers ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const filtered = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.cedula.includes(search)
  )

  // Click en un trabajador → aplica inmediatamente y cierra
  const handlePick = (worker: WorkerOption) => {
    onSelect(worker)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-end sm:items-center justify-center bg-black/70 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-400" />
            Seleccionar trabajador
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o cédula…"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl
                         pl-8 pr-3 py-2 text-sm placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {loading ? (
            <p className="text-center text-xs text-slate-500 py-8">Cargando…</p>
          ) : error ? (
            <p className="text-center text-xs text-red-400 py-8">
              Error al cargar trabajadores. Intenta de nuevo.
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-8">
              {workers.length === 0
                ? "No hay trabajadores en el banco. Agrégalos en la sección Trabajadores."
                : "Sin resultados para esa búsqueda"}
            </p>
          ) : (
            <>
              <p className="text-xs text-slate-500 pb-1">
                Toca un trabajador para seleccionarlo
              </p>
              {filtered.map((worker) => (
                <button
                  key={worker.id}
                  type="button"
                  onClick={() => handlePick(worker)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left
                             border border-slate-800 hover:border-orange-500/60
                             hover:bg-orange-600/10 text-slate-300 transition-all active:scale-[0.98]"
                >
                  {/* Firma / inicial */}
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-slate-700">
                    {worker.signatureData ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={worker.signatureData}
                        alt="firma"
                        className="w-full h-full object-contain p-0.5"
                      />
                    ) : (
                      <span className="text-base font-bold text-slate-400">
                        {worker.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{worker.name}</p>
                    <p className="text-xs text-slate-400">
                      CC {worker.cedula}
                      {worker.role && <span className="text-slate-500"> · {worker.role}</span>}
                    </p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 pt-2 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300
                       font-medium py-2 rounded-xl text-sm transition-colors border border-slate-700"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
