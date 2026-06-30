"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { OPERATION_TEMPLATES, countForms } from "@/lib/operation-templates"
import type { OperationType } from "@/generated/prisma/client"
import type { Ship } from "@/generated/prisma/client"

const OPERATION_TYPES = Object.entries(OPERATION_TEMPLATES).map(([key, val]) => ({
  value: key as OperationType,
  label: val.label,
  description: val.description,
}))

export default function NewOperationForm({ ships }: { ships: Ship[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [type, setType] = useState<OperationType>("GRANEL")
  const [shipId, setShipId] = useState(ships[0]?.id ?? "")
  const [shift, setShift] = useState("DIURNO")
  const [serviceCount, setServiceCount] = useState(1)
  const [notes, setNotes] = useState("")

  const totalForms = countForms(type, serviceCount)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, shipId, shift, serviceCount, notes }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Error al crear la operación")
        return
      }

      const op = await res.json()
      router.push(`/operations/${op.id}`)
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tipo de operación */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Tipo de operación
        </label>
        <div className="grid grid-cols-2 gap-2">
          {OPERATION_TYPES.map((op) => (
            <button
              key={op.value}
              type="button"
              onClick={() => setType(op.value)}
              className={`text-left p-3 rounded-xl border text-sm transition-all
                ${type === op.value
                  ? "border-blue-500 bg-blue-500/10 text-white"
                  : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600"
                }`}
            >
              <p className="font-medium">{op.label}</p>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{op.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Barco */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Motonave (MN)
        </label>
        <select
          value={shipId}
          onChange={(e) => setShipId(e.target.value)}
          required
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ships.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.imo ? `(IMO: ${s.imo})` : ""}
            </option>
          ))}
        </select>
        {ships.length === 0 && (
          <p className="text-xs text-amber-400 mt-1">No hay barcos registrados. Crea uno primero.</p>
        )}
      </div>

      {/* Turno + Servicios */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Turno</label>
          <select
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="DIURNO">Diurno</option>
            <option value="NOCTURNO">Nocturno</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Nº de servicios
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={serviceCount}
            onChange={(e) => setServiceCount(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Vista previa de formularios */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <p className="text-sm font-medium text-slate-300 mb-2">
          Se generarán <span className="text-blue-400 font-bold">{totalForms} formularios</span>
        </p>
        <div className="space-y-1">
          {OPERATION_TEMPLATES[type].forms.map((f) => (
            <div key={f.formType} className="flex items-center justify-between text-xs text-slate-400">
              <span>{f.label}</span>
              <span className="text-slate-500">
                {f.scope === "PER_OPERATION" ? "× 1" : `× ${serviceCount}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Notas (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Observaciones generales de la operación..."
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm
                     placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300
                     font-medium py-2.5 rounded-xl text-sm transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !shipId}
          className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
                     text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
        >
          {loading ? "Creando..." : `Crear operación (${totalForms} forms)`}
        </button>
      </div>
    </form>
  )
}
