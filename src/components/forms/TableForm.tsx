"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, CheckCircle2, Pen } from "lucide-react"
import { SignatureModal } from "./SignatureModal"
import type { TableConfig } from "@/lib/form-definitions"

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface TablaData {
  headerFields: Record<string, string>
  rows: Record<string, string>[]
  observations?: string
}

interface Signature {
  id: string
  type: string
  signedBy: { name: string }
  signedAt: string
}

interface TableFormProps {
  formId: string
  operationId: string
  tableConfig: TableConfig
  initialStatus: string
  initialData: TablaData | null
  signatures: Signature[]
  userRole: string
  readOnly?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function emptyRow(tableConfig: TableConfig): Record<string, string> {
  const row: Record<string, string> = { _id: uid() }
  for (const col of tableConfig.columns) {
    row[col.key] = col.options ? col.options[0] : ""
  }
  return row
}

function buildInitialData(
  tableConfig: TableConfig,
  saved: TablaData | null
): TablaData {
  if (saved) return saved
  const hf: Record<string, string> = {}
  for (const f of tableConfig.headerFields) {
    hf[f.key] = f.type === "date"
      ? new Date().toISOString().slice(0, 10)
      : f.type === "time"
        ? new Date().toTimeString().slice(0, 5)
        : f.options
          ? f.options[0]
          : ""
  }
  return { headerFields: hf, rows: [emptyRow(tableConfig)], observations: "" }
}

// ─── Ancho de columna ─────────────────────────────────────────────────────────

function colWidth(width?: string): string {
  switch (width) {
    case "xs": return "w-20 min-w-[5rem]"
    case "sm": return "w-28 min-w-[7rem]"
    case "md": return "w-36 min-w-[9rem]"
    case "lg": return "w-48 min-w-[12rem]"
    default:   return "w-36 min-w-[9rem]"
  }
}

// ─── Componente principal ──────────────────────────────────────────────────────

export function TableForm({
  formId,
  operationId,
  tableConfig,
  initialStatus,
  initialData,
  signatures: initialSigs,
  userRole,
  readOnly = false,
}: TableFormProps) {
  const [data, setData]             = useState<TablaData>(() => buildInitialData(tableConfig, initialData))
  const [status, setStatus]         = useState(initialStatus)
  const [saving, setSaving]         = useState(false)
  const [saveError, setSaveError]   = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)
  const [completeErr, setCompleteErr] = useState<string | null>(null)
  const [showSign, setShowSign]     = useState(false)
  const [signatures, setSignatures] = useState(initialSigs)

  // ── Auto-save ──────────────────────────────────────────────────────────────
  const saveData = useCallback(async (payload: TablaData) => {
    if (readOnly) return
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/forms/${formId}/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setSaveError(j.error ?? "Error al guardar")
      } else {
        setStatus((s) => (s === "PENDING" ? "IN_PROGRESS" : s))
      }
    } catch {
      setSaveError("Sin conexión")
    } finally {
      setSaving(false)
    }
  }, [formId, readOnly])

  // Debounce 800ms
  useEffect(() => {
    if (readOnly || status === "SIGNED") return
    const t = setTimeout(() => saveData(data), 800)
    return () => clearTimeout(t)
  }, [data, readOnly, status, saveData])

  // ── Handlers de cabecera ───────────────────────────────────────────────────
  const setHeader = (key: string, val: string) =>
    setData((d) => ({ ...d, headerFields: { ...d.headerFields, [key]: val } }))

  // ── Handlers de filas ──────────────────────────────────────────────────────
  const setCell = (rowIdx: number, key: string, val: string) =>
    setData((d) => {
      const rows = [...d.rows]
      rows[rowIdx] = { ...rows[rowIdx], [key]: val }
      return { ...d, rows }
    })

  const addRow = () =>
    setData((d) => ({ ...d, rows: [...d.rows, emptyRow(tableConfig)] }))

  const removeRow = (idx: number) =>
    setData((d) => ({ ...d, rows: d.rows.filter((_, i) => i !== idx) }))

  // ── Completar ──────────────────────────────────────────────────────────────
  async function handleComplete() {
    setCompleting(true)
    setCompleteErr(null)
    try {
      const res = await fetch(`/api/forms/${formId}/complete`, { method: "POST" })
      const j   = await res.json()
      if (!res.ok) { setCompleteErr(j.error ?? "Error"); return }
      setStatus("COMPLETED")
    } finally {
      setCompleting(false)
    }
  }

  const isSigned   = status === "SIGNED"
  const isComplete = status === "COMPLETED" || isSigned

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Indicador de guardado ── */}
      {!readOnly && !isSigned && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          {saving
            ? <><span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" /> Guardando…</>
            : saveError
              ? <><span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> {saveError}</>
              : <><span className="w-1.5 h-1.5 bg-green-400 rounded-full" /> Guardado automáticamente</>
          }
        </div>
      )}

      {/* ── Campos de cabecera ── */}
      {tableConfig.headerFields.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Datos del registro
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {tableConfig.headerFields.map((field) => (
              <div
                key={field.key}
                className={field.span === "full" ? "col-span-2" : "col-span-1"}
              >
                <label className="block text-xs text-slate-500 mb-1">{field.label}</label>
                {field.type === "select" ? (
                  <select
                    value={data.headerFields[field.key] ?? ""}
                    onChange={(e) => setHeader(field.key, e.target.value)}
                    disabled={readOnly || isSigned}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg
                               px-3 py-1.5 text-sm text-white focus:outline-none
                               focus:border-blue-500 disabled:opacity-50"
                  >
                    {field.options?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={data.headerFields[field.key] ?? ""}
                    onChange={(e) => setHeader(field.key, e.target.value)}
                    readOnly={readOnly || isSigned}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg
                               px-3 py-1.5 text-sm text-white focus:outline-none
                               focus:border-blue-500 read-only:opacity-60"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabla de registros ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 pb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Registros — {data.rows.length} fila{data.rows.length !== 1 ? "s" : ""}
          </h2>
          {!readOnly && !isSigned && (
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300
                         bg-blue-950/50 border border-blue-800/50 px-2.5 py-1 rounded-lg
                         transition-colors"
            >
              <Plus className="w-3 h-3" />
              Agregar fila
            </button>
          )}
        </div>

        {/* Tabla con scroll horizontal en móvil */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-t border-slate-800 bg-slate-950/50">
                <th className="px-3 py-2 text-left text-slate-500 font-medium w-10">#</th>
                {tableConfig.columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-2 py-2 text-left text-slate-500 font-medium ${colWidth(col.width)}`}
                  >
                    {col.label}
                  </th>
                ))}
                {!readOnly && !isSigned && (
                  <th className="px-2 py-2 w-8" />
                )}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, idx) => (
                <tr
                  key={row._id ?? idx}
                  className="border-t border-slate-800/60 hover:bg-slate-800/20"
                >
                  <td className="px-3 py-1.5 text-slate-500">{idx + 1}</td>
                  {tableConfig.columns.map((col) => (
                    <td key={col.key} className={`px-1.5 py-1 ${colWidth(col.width)}`}>
                      {col.type === "select" ? (
                        <select
                          value={row[col.key] ?? col.options?.[0] ?? ""}
                          onChange={(e) => setCell(idx, col.key, e.target.value)}
                          disabled={readOnly || isSigned}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md
                                     px-2 py-1 text-white focus:outline-none focus:border-blue-500
                                     disabled:opacity-50 text-xs"
                        >
                          {col.options?.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          type={col.type}
                          value={row[col.key] ?? ""}
                          onChange={(e) => setCell(idx, col.key, e.target.value)}
                          readOnly={readOnly || isSigned}
                          className="w-full bg-slate-800 border border-slate-700 rounded-md
                                     px-2 py-1 text-white focus:outline-none focus:border-blue-500
                                     read-only:opacity-60 text-xs"
                        />
                      )}
                    </td>
                  ))}
                  {!readOnly && !isSigned && (
                    <td className="px-1.5 py-1">
                      <button
                        onClick={() => removeRow(idx)}
                        disabled={data.rows.length <= 1}
                        className="p-1 text-slate-600 hover:text-red-400 disabled:opacity-30
                                   transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Observaciones ── */}
      {tableConfig.observations && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Observaciones
          </label>
          <textarea
            rows={3}
            value={data.observations ?? ""}
            onChange={(e) => setData((d) => ({ ...d, observations: e.target.value }))}
            readOnly={readOnly || isSigned}
            placeholder="Observaciones generales del registro…"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg
                       px-3 py-2 text-sm text-white focus:outline-none
                       focus:border-blue-500 read-only:opacity-60 resize-none
                       placeholder:text-slate-600"
          />
        </div>
      )}

      {/* ── Nota al pie ── */}
      {tableConfig.footerNote && (
        <p className="text-xs text-slate-500 leading-relaxed px-1">
          {tableConfig.footerNote}
        </p>
      )}

      {/* ── Firmas ── */}
      {signatures.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Firmas registradas
          </h2>
          {signatures.map((sig) => (
            <div key={sig.id} className="flex items-center justify-between text-xs">
              <span className="text-slate-300">{sig.signedBy.name}</span>
              <div className="flex items-center gap-2 text-slate-500">
                <span className="capitalize">{sig.type.toLowerCase()}</span>
                <span>·</span>
                <span>{new Date(sig.signedAt).toLocaleTimeString("es-CO", {
                  hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota",
                })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Acciones ── */}
      {!readOnly && !isSigned && (
        <div className="space-y-2 pb-4">
          {completeErr && (
            <p className="text-xs text-red-400 text-center">{completeErr}</p>
          )}

          {!isComplete && (
            <button
              onClick={handleComplete}
              disabled={completing || data.rows.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-blue-600
                         hover:bg-blue-500 disabled:opacity-50 text-white font-semibold
                         py-3 rounded-xl transition-colors text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              {completing ? "Completando…" : "Marcar como completado"}
            </button>
          )}

          {isComplete && (
            <button
              onClick={() => setShowSign(true)}
              className="w-full flex items-center justify-center gap-2 bg-green-700
                         hover:bg-green-600 text-white font-semibold py-3 rounded-xl
                         transition-colors text-sm"
            >
              <Pen className="w-4 h-4" />
              Firmar formulario
            </button>
          )}
        </div>
      )}

      {/* ── Modal de firma ── */}
      {showSign && (
        <SignatureModal
          formId={formId}
          operationId={operationId}
          userRole={userRole}
          onClose={() => setShowSign(false)}
          onSigned={() => {
            setStatus("SIGNED")
            setShowSign(false)
          }}
        />
      )}
    </div>
  )
}
