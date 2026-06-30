"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Plus, Trash2, CheckCircle2, Pen, GripVertical } from "lucide-react"
import { SignatureModal } from "./SignatureModal"

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ATSRow {
  id: string
  step: string
  hazard: string
  consequence: string
  controls: string
  environmentalAspect: string
  responsible: string
}

export interface ATSTeamMember {
  id: string
  name: string
  role: string
  documentId: string
}

export interface ATSData {
  activity: string
  startDate: string
  endDate: string
  workCenter: string
  location: string
  tools: string
  ppe: string
  rows: ATSRow[]
  team: ATSTeamMember[]
  observations: string
}

interface Signature {
  id: string
  type: string
  signedBy: { name: string }
  signedAt: string
}

interface ATSFormProps {
  formId: string
  operationId: string
  initialStatus: string
  initialData: ATSData | null
  signatures: Signature[]
  userRole: string
  readOnly?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

const EMPTY_DATA: ATSData = {
  activity: "",
  startDate: "",
  endDate: "",
  workCenter: "",
  location: "",
  tools: "",
  ppe: "",
  rows: [],
  team: [],
  observations: "",
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function FieldInput({
  label,
  value,
  onChange,
  readOnly,
  placeholder,
  multiline,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  readOnly: boolean
  placeholder?: string
  multiline?: boolean
}) {
  const cls =
    "w-full text-sm bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 " +
    "text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500 " +
    "disabled:opacity-60 disabled:cursor-default resize-none"

  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          placeholder={placeholder}
          rows={3}
          className={cls}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  )
}

function RowCard({
  row,
  index,
  onChange,
  onDelete,
  readOnly,
}: {
  row: ATSRow
  index: number
  onChange: (updated: ATSRow) => void
  onDelete: () => void
  readOnly: boolean
}) {
  const update = (field: keyof ATSRow) => (v: string) =>
    onChange({ ...row, [field]: v })

  const cellCls =
    "w-full text-xs bg-slate-800/40 border border-slate-700/60 rounded-lg px-2.5 py-1.5 " +
    "text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500 " +
    "disabled:opacity-60 resize-none"

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header de fila */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/40 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {!readOnly && <GripVertical className="w-3.5 h-3.5 text-slate-600" />}
          <span className="text-xs font-semibold text-slate-400">Paso {index + 1}</span>
        </div>
        {!readOnly && (
          <button
            onClick={onDelete}
            className="p-1 text-slate-600 hover:text-red-400 transition-colors rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Campos de la fila */}
      <div className="p-3 grid grid-cols-1 gap-2.5">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Secuencia / Paso</label>
          <textarea
            value={row.step}
            onChange={(e) => update("step")(e.target.value)}
            disabled={readOnly}
            placeholder="Descripción detallada del paso..."
            rows={2}
            className={cellCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Peligro</label>
            <textarea
              value={row.hazard}
              onChange={(e) => update("hazard")(e.target.value)}
              disabled={readOnly}
              placeholder="Tipo de peligro..."
              rows={2}
              className={cellCls}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Posible consecuencia</label>
            <textarea
              value={row.consequence}
              onChange={(e) => update("consequence")(e.target.value)}
              disabled={readOnly}
              placeholder="Consecuencia esperada..."
              rows={2}
              className={cellCls}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Controles (preventivos, protectivos y reactivos)
          </label>
          <textarea
            value={row.controls}
            onChange={(e) => update("controls")(e.target.value)}
            disabled={readOnly}
            placeholder="Medidas de control a implementar..."
            rows={2}
            className={cellCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Aspecto ambiental</label>
            <input
              type="text"
              value={row.environmentalAspect}
              onChange={(e) => update("environmentalAspect")(e.target.value)}
              disabled={readOnly}
              placeholder="Aspecto ambiental..."
              className={cellCls}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Responsable de controles</label>
            <input
              type="text"
              value={row.responsible}
              onChange={(e) => update("responsible")(e.target.value)}
              disabled={readOnly}
              placeholder="Responsable..."
              className={cellCls}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function TeamMemberCard({
  member,
  index,
  onChange,
  onDelete,
  readOnly,
}: {
  member: ATSTeamMember
  index: number
  onChange: (updated: ATSTeamMember) => void
  onDelete: () => void
  readOnly: boolean
}) {
  const update = (field: keyof ATSTeamMember) => (v: string) =>
    onChange({ ...member, [field]: v })

  const cls =
    "w-full text-xs bg-slate-800/40 border border-slate-700/60 rounded-lg px-2.5 py-1.5 " +
    "text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500 disabled:opacity-60"

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400">Integrante {index + 1}</span>
        {!readOnly && (
          <button
            onClick={onDelete}
            className="p-1 text-slate-600 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Nombre y apellido</label>
          <input
            value={member.name}
            onChange={(e) => update("name")(e.target.value)}
            disabled={readOnly}
            placeholder="Nombre completo"
            className={cls}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Cargo</label>
          <input
            value={member.role}
            onChange={(e) => update("role")(e.target.value)}
            disabled={readOnly}
            placeholder="Cargo"
            className={cls}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-slate-500 mb-1">Cédula de ciudadanía</label>
          <input
            value={member.documentId}
            onChange={(e) => update("documentId")(e.target.value)}
            disabled={readOnly}
            placeholder="Número de documento"
            className={cls}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ATSForm({
  formId,
  operationId,
  initialStatus,
  initialData,
  signatures,
  userRole,
  readOnly = false,
}: ATSFormProps) {
  const [data, setData] = useState<ATSData>(initialData ?? EMPTY_DATA)
  const [status, setStatus] = useState(initialStatus)
  const [sigs, setSigs] = useState(signatures)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [completing, setCompleting] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)
  const [showSignModal, setShowSignModal] = useState(false)

  const pendingRef = useRef(false)
  const debouncedData = useDebounce(data, 900)

  // Validación para habilitar "Completar"
  const canComplete =
    data.activity.trim().length > 0 && data.rows.length > 0

  // Auto-guardado debounced
  useEffect(() => {
    if (!pendingRef.current) {
      pendingRef.current = true
      return
    }
    if (readOnly || status === "SIGNED") return

    setSaveState("saving")
    fetch(`/api/forms/${formId}/data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(debouncedData),
    })
      .then((r) => {
        if (r.ok) {
          setSaveState("saved")
          if (status === "PENDING") setStatus("IN_PROGRESS")
        } else {
          setSaveState("error")
        }
      })
      .catch(() => setSaveState("error"))
      .finally(() => setTimeout(() => setSaveState("idle"), 2000))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedData])

  const updateField = useCallback(
    <K extends keyof ATSData>(field: K, value: ATSData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const addRow = () => {
    const newRow: ATSRow = {
      id: uid(),
      step: "",
      hazard: "",
      consequence: "",
      controls: "",
      environmentalAspect: "",
      responsible: "",
    }
    setData((prev) => ({ ...prev, rows: [...prev.rows, newRow] }))
  }

  const updateRow = (id: string, updated: ATSRow) => {
    setData((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => (r.id === id ? updated : r)),
    }))
  }

  const deleteRow = (id: string) => {
    setData((prev) => ({ ...prev, rows: prev.rows.filter((r) => r.id !== id) }))
  }

  const addMember = () => {
    setData((prev) => ({
      ...prev,
      team: [...prev.team, { id: uid(), name: "", role: "", documentId: "" }],
    }))
  }

  const updateMember = (id: string, updated: ATSTeamMember) => {
    setData((prev) => ({
      ...prev,
      team: prev.team.map((m) => (m.id === id ? updated : m)),
    }))
  }

  const deleteMember = (id: string) => {
    setData((prev) => ({ ...prev, team: prev.team.filter((m) => m.id !== id) }))
  }

  const handleComplete = async () => {
    setCompleting(true)
    setCompleteError(null)
    // Guardar datos antes de completar
    await fetch(`/api/forms/${formId}/data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    try {
      const res = await fetch(`/api/forms/${formId}/complete`, { method: "POST" })
      const json = await res.json()
      if (res.ok) {
        setStatus("COMPLETED")
      } else {
        setCompleteError(json.error ?? "Error al completar")
      }
    } catch {
      setCompleteError("Error de conexión")
    } finally {
      setCompleting(false)
    }
  }

  const handleSigned = async () => {
    setShowSignModal(false)
    setStatus("SIGNED")
    try {
      const res = await fetch(`/api/forms/${formId}`)
      if (res.ok) {
        const json = await res.json()
        setSigs(json.formInstance.signatures)
      }
    } catch { /* silencioso */ }
  }

  const isReadOnly = readOnly || status === "SIGNED"

  return (
    <>
      {/* ── Sección 1: Encabezado general ─────────────────────── */}
      <div className="space-y-4 mb-6">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Información general
        </h3>

        <FieldInput
          label="Descripción detallada de la actividad a ejecutar *"
          value={data.activity}
          onChange={(v) => updateField("activity", v)}
          readOnly={isReadOnly}
          placeholder="Describir con detalle la actividad que se va a realizar..."
          multiline
        />

        <div className="grid grid-cols-2 gap-3">
          <FieldInput
            label="Fecha de inicio"
            value={data.startDate}
            onChange={(v) => updateField("startDate", v)}
            readOnly={isReadOnly}
            placeholder="DD/MM/AAAA"
          />
          <FieldInput
            label="Fecha de finalización"
            value={data.endDate}
            onChange={(v) => updateField("endDate", v)}
            readOnly={isReadOnly}
            placeholder="DD/MM/AAAA"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FieldInput
            label="Centro de trabajo"
            value={data.workCenter}
            onChange={(v) => updateField("workCenter", v)}
            readOnly={isReadOnly}
            placeholder="Puerto Palermo..."
          />
          <FieldInput
            label="Lugar"
            value={data.location}
            onChange={(v) => updateField("location", v)}
            readOnly={isReadOnly}
            placeholder="Muelle N°..."
          />
        </div>

        <FieldInput
          label="Herramientas y/o equipos"
          value={data.tools}
          onChange={(v) => updateField("tools", v)}
          readOnly={isReadOnly}
          placeholder="Grúa, eslingas, cucharas..."
          multiline
        />

        <FieldInput
          label="Elementos de Protección Personal (EPP)"
          value={data.ppe}
          onChange={(v) => updateField("ppe", v)}
          readOnly={isReadOnly}
          placeholder="Casco, chaleco reflectivo, botas de seguridad, guantes..."
          multiline
        />
      </div>

      {/* ── Sección 2: Pasos de la tarea ──────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Análisis de pasos ({data.rows.length})
          </h3>
          {!isReadOnly && (
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                         bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-700/40
                         rounded-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar paso
            </button>
          )}
        </div>

        {data.rows.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
            <p className="text-sm text-slate-600">Sin pasos agregados</p>
            {!isReadOnly && (
              <p className="text-xs text-slate-700 mt-1">
                Agrega al menos un paso para poder completar el ATS
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {data.rows.map((row, i) => (
              <RowCard
                key={row.id}
                row={row}
                index={i}
                onChange={(updated) => updateRow(row.id, updated)}
                onDelete={() => deleteRow(row.id)}
                readOnly={isReadOnly}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Sección 3: Equipo que elabora el ATS ──────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Equipo que elabora el ATS ({data.team.length})
          </h3>
          {!isReadOnly && (
            <button
              onClick={addMember}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                         bg-slate-700/40 hover:bg-slate-700/60 text-slate-300 border border-slate-700
                         rounded-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar integrante
            </button>
          )}
        </div>

        {data.team.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
            <p className="text-sm text-slate-600">Sin integrantes registrados</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.team.map((member, i) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                index={i}
                onChange={(updated) => updateMember(member.id, updated)}
                onDelete={() => deleteMember(member.id)}
                readOnly={isReadOnly}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Sección 4: Observaciones ───────────────────────────── */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Observaciones
        </h3>
        <FieldInput
          label=""
          value={data.observations}
          onChange={(v) => updateField("observations", v)}
          readOnly={isReadOnly}
          placeholder="Observaciones generales del ATS..."
          multiline
        />
      </div>

      {/* ── Firmas registradas ────────────────────────────────── */}
      {sigs.length > 0 && (
        <div className="mb-6 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Firmas registradas
          </h3>
          <div className="space-y-2">
            {sigs.map((sig) => (
              <div
                key={sig.id}
                className="flex items-center justify-between bg-slate-900 border border-slate-800
                           rounded-xl px-3 py-2"
              >
                <div>
                  <p className="text-xs font-medium text-slate-300">{sig.signedBy.name}</p>
                  <p className="text-xs text-slate-500">
                    {sig.type === "OPERATOR" ? "Operador" : "Supervisor"} ·{" "}
                    {new Date(sig.signedAt).toLocaleString("es-CO", { timeZone: "America/Bogota" })}
                  </p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer de acciones ────────────────────────────────── */}
      {!isReadOnly && (
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="h-4 text-center">
            {saveState === "saving" && <p className="text-xs text-slate-500">Guardando…</p>}
            {saveState === "saved"  && <p className="text-xs text-green-500">Guardado</p>}
            {saveState === "error"  && <p className="text-xs text-red-400">Error al guardar</p>}
          </div>

          {status !== "COMPLETED" && (
            <>
              {completeError && (
                <p className="text-xs text-red-400 text-center">{completeError}</p>
              )}
              <button
                onClick={handleComplete}
                disabled={!canComplete || completing}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all
                           bg-blue-600 hover:bg-blue-500 text-white
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {completing
                  ? "Completando…"
                  : !data.activity.trim()
                    ? "Falta describir la actividad"
                    : data.rows.length === 0
                      ? "Agrega al menos un paso"
                      : "Completar ATS"}
              </button>
            </>
          )}

          {status === "COMPLETED" && (
            <button
              onClick={() => setShowSignModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                         text-sm font-semibold bg-green-600 hover:bg-green-500 text-white
                         transition-all"
            >
              <Pen className="w-4 h-4" />
              Firmar ATS
            </button>
          )}
        </div>
      )}

      {showSignModal && (
        <SignatureModal
          formId={formId}
          operationId={operationId}
          userRole={userRole}
          onClose={() => setShowSignModal(false)}
          onSigned={handleSigned}
        />
      )}
    </>
  )
}
