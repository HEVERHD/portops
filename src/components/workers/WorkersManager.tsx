"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Users, Plus, Trash2, Loader2, X, Check, Pen } from "lucide-react"
import { ConfirmModal } from "@/components/ui/ConfirmModal"

export interface WorkerRecord {
  id: string
  name: string
  cedula: string
  role: string | null
  signatureData: string | null
}

// ─── Canvas de firma ──────────────────────────────────────────────────────────

function SignatureCanvas({
  value,
  onChange,
}: {
  value: string | null
  onChange: (data: string | null) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(!value)

  // Inicializar canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Si hay firma guardada, dibujarla
    if (value) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      img.src = value
      setIsEmpty(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const { x, y } = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
    setIsEmpty(false)
  }, [])

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const { x, y } = getPos(e, canvas)
    ctx.lineTo(x, y)
    ctx.stroke()
  }, [isDrawing])

  const stopDraw = useCallback(() => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (!canvas) return
    onChange(canvas.toDataURL("image/png"))
  }, [onChange])

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
    onChange(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-slate-400">Firma digital (opcional)</p>
        {!isEmpty && (
          <button
            type="button"
            onClick={clear}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Limpiar
          </button>
        )}
      </div>
      <div className="rounded-xl overflow-hidden border border-slate-700 bg-white">
        <canvas
          ref={canvasRef}
          className="w-full touch-none"
          style={{ height: 100 }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
      {isEmpty && (
        <p className="text-center text-xs text-slate-600 mt-1">
          Dibuja la firma del trabajador
        </p>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function WorkersManager({
  initialWorkers,
  canManage = false,
}: {
  initialWorkers: WorkerRecord[]
  canManage?: boolean
}) {
  const [workers, setWorkers] = useState<WorkerRecord[]>(initialWorkers)
  const [showForm, setShowForm]   = useState(false)
  const [name, setName]           = useState("")
  const [cedula, setCedula]       = useState("")
  const [role, setRole]           = useState("")
  const [sigData, setSigData]     = useState<string | null>(null)
  const [consented, setConsented] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState("")
  const [deletingId, setDeletingId]     = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [search, setSearch]       = useState("")

  function resetForm() {
    setName(""); setCedula(""); setRole(""); setSigData(null); setConsented(false); setError("")
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (sigData && !consented) {
      setError("Debes confirmar el consentimiento del trabajador para guardar la firma")
      return
    }
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, cedula, role: role || undefined, signatureData: sigData }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Error al crear")
      } else {
        setWorkers((prev) =>
          [...prev, data.worker].sort((a, b) => a.name.localeCompare(b.name))
        )
        resetForm()
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
      const res = await fetch(`/api/workers/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "No se pudo eliminar")
      } else {
        setWorkers((prev) => prev.filter((w) => w.id !== id))
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  const filtered = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.cedula.includes(search)
  )

  return (
    <div className="space-y-4">
      {/* Buscador */}
      {workers.length > 0 && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o cédula…"
          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl
                     px-3 py-2.5 text-sm placeholder-slate-500
                     focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      )}

      {/* Botón agregar */}
      {canManage && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-sm font-medium text-white
                     bg-orange-600 hover:bg-orange-500 px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar trabajador
        </button>
      )}

      {/* Formulario de creación */}
      {canManage && showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Pen className="w-3.5 h-3.5 text-orange-400" />
              Nuevo trabajador
            </h3>
            <button
              type="button"
              onClick={() => { setShowForm(false); resetForm() }}
              className="text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Nombre completo <span className="text-red-400">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Juan Pérez"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg
                           px-3 py-2 text-sm placeholder-slate-500
                           focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Cédula <span className="text-red-400">*</span>
              </label>
              <input
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                required
                placeholder="12345678"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg
                           px-3 py-2 text-sm placeholder-slate-500
                           focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Perfil / Cargo
              </label>
              <input
                list="worker-profiles"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Estibador, Gruero…"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg
                           px-3 py-2 text-sm placeholder-slate-500
                           focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <datalist id="worker-profiles">
                <option value="Estibador" />
                <option value="Gruero" />
                <option value="Señalero" />
                <option value="Winchero" />
                <option value="Portalonero" />
                <option value="Supervisor HSE" />
                <option value="Supervisor de Trabajo" />
                <option value="Inspector HSE" />
                <option value="Jefe de Operaciones" />
                <option value="Mecánico" />
                <option value="Electricista" />
                <option value="Operador Portuario" />
                <option value="Rescatador" />
                <option value="Auxiliar de Bodega" />
                <option value="Conductor" />
              </datalist>
            </div>
          </div>

          <SignatureCanvas value={sigData} onChange={setSigData} />

          {/* Consentimiento — requerido si hay firma */}
          {sigData && (
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <div className="relative shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={consented}
                  onChange={(e) => setConsented(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                  ${consented
                    ? "bg-orange-600 border-orange-500"
                    : "border-slate-600 group-hover:border-orange-500/60"
                  }`}
                >
                  {consented && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-slate-400 leading-relaxed">
                El trabajador autoriza el almacenamiento y uso de su firma digital en los formularios
                de la operación portuaria, conforme a la política de gestión integrada.
              </span>
            </label>
          )}

          {error && (
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setShowForm(false); resetForm() }}
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

      {/* Error global */}
      {error && !showForm && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-600 text-sm text-center">
          <Users className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-medium text-slate-400">
            {workers.length === 0 ? "No hay trabajadores registrados" : "Sin resultados"}
          </p>
          {workers.length === 0 && (
            <p className="text-xs mt-1">Agrega trabajadores para agilizar el llenado de formularios</p>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {filtered.map((worker, i) => (
            <div
              key={worker.id}
              className={`flex items-center gap-3 px-4 py-3.5 ${
                i < filtered.length - 1 ? "border-b border-slate-800" : ""
              }`}
            >
              {/* Avatar firma */}
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                {worker.signatureData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={worker.signatureData}
                    alt="firma"
                    className="w-full h-full object-contain p-0.5"
                  />
                ) : (
                  <span className="text-sm font-bold text-slate-400">
                    {worker.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{worker.name}</p>
                <p className="text-xs text-slate-500">
                  CC {worker.cedula}
                  {worker.role && <> · {worker.role}</>}
                  {worker.signatureData && (
                    <span className="ml-1.5 text-green-500 inline-flex items-center gap-0.5">
                      <Check className="w-3 h-3" />firma
                    </span>
                  )}
                </p>
              </div>

              {canManage && (
                <button
                  onClick={() => setConfirmDeleteId(worker.id)}
                  disabled={deletingId === worker.id}
                  className="text-slate-600 hover:text-red-400 transition-colors disabled:opacity-50"
                  title="Eliminar trabajador"
                >
                  {deletingId === worker.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={confirmDeleteId !== null}
        title="¿Eliminar este trabajador?"
        description="Se eliminará del banco de trabajadores. Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        dangerous
        loading={deletingId !== null}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}
