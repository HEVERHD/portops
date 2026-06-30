"use client"

import { useState, useEffect, useRef } from "react"
import { CheckCircle2, XCircle, Circle, MinusCircle, ChevronDown, ChevronUp, Pen } from "lucide-react"
import type { FormDefinition, FormItem } from "@/lib/form-definitions"
import { SignatureModal } from "./SignatureModal"

// ─── Tipos ────────────────────────────────────────────────────────────────────

// checked: true=Cumple/SI, false=No Cumple/NO, null=N/A, undefined=sin respuesta
type CheckedState = boolean | null | undefined

type ResponseState = {
  checked: CheckedState
  observation: string
}

type ResponseMap = Record<string, ResponseState>

interface Signature {
  id: string
  type: string
  signedBy: { name: string }
  signedAt: string
}

interface FormFillerProps {
  formId: string
  operationId: string
  formType: string
  initialStatus: string
  requiresSignature: boolean
  definition: FormDefinition
  initialResponses: Record<string, { checked: boolean | null; observation: string | null }>
  signatures: Signature[]
  userRole: string
  readOnly?: boolean
}

// ─── Debounce hook ────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ─── Ítem individual ──────────────────────────────────────────────────────────

function ChecklistItem({
  item,
  state,
  labels,
  onChange,
  readOnly,
}: {
  item: FormItem
  state: ResponseState
  labels: FormDefinition["labels"]
  onChange: (code: string, checked: CheckedState, observation: string) => void
  readOnly: boolean
}) {
  const [showObs, setShowObs] = useState(
    () => state.checked === false || (state.observation?.length ?? 0) > 0
  )

  const isAnswered = state.checked !== undefined
  // N/A es cuando checked es exactamente null Y el registro existe (isAnswered=true)
  const isNA = isAnswered && state.checked === null

  const handleCheck = (value: CheckedState) => {
    if (readOnly) return
    // Toggle: si ya está seleccionado, quitar la respuesta (undefined = sin respuesta)
    const newChecked = state.checked === value ? undefined : value
    onChange(item.code, newChecked, state.observation)
    if (newChecked === false) setShowObs(true)
  }

  const bgClass = !isAnswered
    ? "border-slate-800 bg-slate-900"
    : isNA
      ? "border-slate-700/60 bg-slate-800/40"
      : state.checked
        ? "border-green-800/40 bg-green-950/20"
        : "border-red-800/40 bg-red-950/20"

  return (
    <div className={`rounded-xl border transition-all ${bgClass}`}>
      <div className="px-3 py-3 flex items-start gap-3">
        {/* Indicador visual */}
        <div className="shrink-0 mt-0.5">
          {!isAnswered ? (
            <Circle className="w-4 h-4 text-slate-600" />
          ) : isNA ? (
            <MinusCircle className="w-4 h-4 text-slate-500" />
          ) : state.checked ? (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200 leading-snug">{item.label}</p>

          {/* Botones de respuesta */}
          {!readOnly && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                onClick={() => handleCheck(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium
                            border transition-all ${
                              state.checked === true
                                ? "bg-green-600 border-green-500 text-white"
                                : "border-slate-700 text-slate-400 hover:border-green-700 hover:text-green-400"
                            }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                {labels.cumple}
              </button>

              <button
                onClick={() => handleCheck(false)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium
                            border transition-all ${
                              state.checked === false
                                ? "bg-red-600 border-red-500 text-white"
                                : "border-slate-700 text-slate-400 hover:border-red-700 hover:text-red-400"
                            }`}
              >
                <XCircle className="w-3 h-3" />
                {labels.noCumple}
              </button>

              <button
                onClick={() => handleCheck(null)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium
                            border transition-all ${
                              isNA
                                ? "bg-slate-600 border-slate-500 text-white"
                                : "border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                            }`}
              >
                <MinusCircle className="w-3 h-3" />
                {labels.na}
              </button>

              <button
                onClick={() => setShowObs((p) => !p)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500
                           hover:text-slate-300 transition-colors ml-auto"
              >
                {showObs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                Obs.
              </button>
            </div>
          )}

          {/* Textarea de observación */}
          {(showObs || state.observation) && (
            <textarea
              value={state.observation}
              onChange={(e) => onChange(item.code, state.checked, e.target.value)}
              disabled={readOnly}
              placeholder="Observación…"
              rows={2}
              className="mt-2 w-full text-xs bg-slate-800/60 border border-slate-700 rounded-lg
                         px-2.5 py-1.5 text-slate-300 placeholder-slate-600 resize-none
                         focus:outline-none focus:border-slate-500 disabled:opacity-60"
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function FormFiller({
  formId,
  operationId,
  definition,
  initialResponses,
  initialStatus,
  signatures,
  userRole,
  readOnly = false,
}: FormFillerProps) {
  // Estado inicial: respuestas existentes en BD → si no hay registro, `undefined` (sin responder)
  const buildInitial = (): ResponseMap => {
    const map: ResponseMap = {}
    for (const section of definition.sections) {
      for (const item of section.items) {
        const existing = initialResponses[item.code]
        // existing.checked puede ser true, false, o null (N/A). Si no existe → undefined
        map[item.code] = existing !== undefined
          ? { checked: existing.checked, observation: existing.observation ?? "" }
          : { checked: undefined, observation: "" }
      }
    }
    return map
  }

  const [responses, setResponses] = useState<ResponseMap>(buildInitial)
  const [status, setStatus] = useState(initialStatus)
  const [sigs, setSigs] = useState(signatures)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [completing, setCompleting] = useState(false)
  const [showSignModal, setShowSignModal] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)

  const pendingRef = useRef<ResponseMap | null>(null)
  const debouncedResponses = useDebounce(responses, 800)

  // Progreso: cuenta ítems donde checked !== undefined (true, false, o null = todos válidos)
  const allItems = definition.sections.flatMap((s) => s.items)
  const answered = allItems.filter((i) => responses[i.code]?.checked !== undefined).length
  const total = allItems.length
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0
  const allAnswered = answered === total

  // Auto-guardado debounced
  useEffect(() => {
    if (pendingRef.current === null) {
      pendingRef.current = debouncedResponses
      return
    }
    if (readOnly || status === "SIGNED") return

    const changed: Array<{
      itemCode: string
      itemLabel: string
      checked: boolean | null
      observation: string | null
    }> = []

    for (const section of definition.sections) {
      for (const item of section.items) {
        const r = debouncedResponses[item.code]
        if (r?.checked !== undefined) {
          changed.push({
            itemCode: item.code,
            itemLabel: item.label,
            checked: r.checked ?? null,   // undefined ya filtrado arriba; null = N/A
            observation: r.observation || null,
          })
        }
      }
    }
    if (changed.length === 0) return

    setSaveState("saving")
    fetch(`/api/forms/${formId}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ responses: changed }),
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
  }, [debouncedResponses])

  const handleResponseChange = (code: string, checked: CheckedState, observation: string) => {
    setResponses((prev) => ({ ...prev, [code]: { checked, observation } }))
    pendingRef.current = responses
  }

  const handleComplete = async () => {
    setCompleting(true)
    setCompleteError(null)
    try {
      const res = await fetch(`/api/forms/${formId}/complete`, { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        setStatus("COMPLETED")
      } else {
        setCompleteError(data.error ?? "Error al completar")
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
        const data = await res.json()
        setSigs(data.formInstance.signatures)
      }
    } catch { /* silencioso */ }
  }

  const isReadOnly = readOnly || status === "SIGNED"

  return (
    <>
      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>{answered} de {total} ítems respondidos</span>
          <span className="font-medium text-white">{progress}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              allAnswered ? "bg-green-500" : "bg-blue-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Leyenda de estados */}
        <div className="flex gap-4 mt-1.5 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" />{definition.labels.cumple}
          </span>
          <span className="flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-500" />{definition.labels.noCumple}
          </span>
          <span className="flex items-center gap-1">
            <MinusCircle className="w-3 h-3 text-slate-500" />{definition.labels.na}
          </span>
        </div>
      </div>

      {/* Secciones */}
      <div className="space-y-5 pb-2">
        {definition.sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
              {section.title}
            </h3>
            <div className="space-y-2">
              {section.items.map((item) => (
                <ChecklistItem
                  key={item.code}
                  item={item}
                  state={responses[item.code] ?? { checked: undefined, observation: "" }}
                  labels={definition.labels}
                  onChange={handleResponseChange}
                  readOnly={isReadOnly}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Firmas registradas */}
      {sigs.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-800">
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

      {/* Footer de acciones */}
      {!isReadOnly && (
        <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
          {/* Indicador de guardado */}
          <div className="h-4 text-center">
            {saveState === "saving" && <p className="text-xs text-slate-500">Guardando…</p>}
            {saveState === "saved"  && <p className="text-xs text-green-500">Guardado</p>}
            {saveState === "error"  && <p className="text-xs text-red-400">Error al guardar</p>}
          </div>

          {/* Completar */}
          {status !== "COMPLETED" && (
            <>
              {completeError && (
                <p className="text-xs text-red-400 text-center">{completeError}</p>
              )}
              <button
                onClick={handleComplete}
                disabled={!allAnswered || completing}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all
                           bg-blue-600 hover:bg-blue-500 text-white
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {completing
                  ? "Completando…"
                  : !allAnswered
                    ? `Faltan ${total - answered} ítem(s) por responder`
                    : "Completar formulario"}
              </button>
            </>
          )}

          {/* Firmar */}
          {status === "COMPLETED" && (
            <button
              onClick={() => setShowSignModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                         text-sm font-semibold bg-green-600 hover:bg-green-500 text-white
                         transition-all"
            >
              <Pen className="w-4 h-4" />
              Firmar formulario
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
