"use client"

import { useState } from "react"
import { Ship, Plus, Trash2, Loader2, X } from "lucide-react"

interface ShipRecord {
  id: string
  name: string
  imo: string | null
  flag: string | null
  _count: { operations: number }
}

export function ShipsManager({ initialShips, canManage = false }: { initialShips: ShipRecord[]; canManage?: boolean }) {
  const [ships, setShips]     = useState<ShipRecord[]>(initialShips)
  const [showForm, setShowForm] = useState(false)
  const [name, setName]       = useState("")
  const [imo, setImo]         = useState("")
  const [flag, setFlag]       = useState("")
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/ships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, imo, flag }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Error al crear")
      } else {
        setShips((prev) => [...prev, { ...data.ship, _count: { operations: 0 } }]
          .sort((a, b) => a.name.localeCompare(b.name)))
        setName(""); setImo(""); setFlag("")
        setShowForm(false)
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/ships/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error ?? "No se pudo eliminar")
      } else {
        setShips((prev) => prev.filter((s) => s.id !== id))
      }
    } catch {
      alert("Error de conexión")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Botón agregar */}
      {canManage && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-medium text-white
                     bg-orange-600 hover:bg-orange-500 px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar nave
        </button>
      )}

      {/* Formulario */}
      {canManage && showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Nueva nave</h3>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError("") }}
              className="text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Nombre <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="MN NOMBRE NAVE"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg
                         px-3 py-2 text-sm placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                IMO (opcional)
              </label>
              <input
                value={imo}
                onChange={(e) => setImo(e.target.value)}
                placeholder="1234567"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg
                           px-3 py-2 text-sm placeholder-slate-500
                           focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Bandera (opcional)
              </label>
              <input
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder="COL"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg
                           px-3 py-2 text-sm placeholder-slate-500
                           focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setShowForm(false); setError("") }}
              className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700
                         text-slate-300 font-medium py-2 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:opacity-50
                         text-white font-medium py-2 rounded-lg text-sm transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Guardar"}
            </button>
          </div>
        </form>
      )}

      {/* Lista */}
      {ships.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-600 text-sm text-center">
          <Ship className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-medium text-slate-400">No hay naves registradas</p>
          <p className="text-xs mt-1">Agrega la primera nave para poder crear operaciones</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {ships.map((ship, i) => (
            <div
              key={ship.id}
              className={`flex items-center gap-3 px-4 py-3.5 ${
                i < ships.length - 1 ? "border-b border-slate-800" : ""
              }`}
            >
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                <Ship className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{ship.name}</p>
                <p className="text-xs text-slate-500">
                  {[ship.imo && `IMO: ${ship.imo}`, ship.flag && `Bandera: ${ship.flag}`]
                    .filter(Boolean).join(" · ") || "Sin datos adicionales"}
                  {ship._count.operations > 0 && (
                    <span className="ml-2 text-slate-600">
                      · {ship._count.operations} operación{ship._count.operations !== 1 ? "es" : ""}
                    </span>
                  )}
                </p>
              </div>
              {canManage && ship._count.operations === 0 && (
                <button
                  onClick={() => handleDelete(ship.id)}
                  disabled={deletingId === ship.id}
                  className="text-slate-600 hover:text-red-400 transition-colors disabled:opacity-50"
                  title="Eliminar nave"
                >
                  {deletingId === ship.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
