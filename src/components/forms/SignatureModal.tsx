"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { X, Trash2, Check } from "lucide-react"

interface SignatureModalProps {
  formId: string
  operationId: string
  userRole: string
  onClose: () => void
  onSigned: () => void
}

type SignatureType = "OPERATOR" | "SUPERVISOR"

export function SignatureModal({
  formId,
  operationId,
  userRole,
  onClose,
  onSigned,
}: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)
  const [sigType, setSigType] = useState<SignatureType>("OPERATOR")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSign = (type: SignatureType) => {
    if (type === "OPERATOR") return true
    return ["ADMIN", "COORDINATOR", "FIELD_SUPERVISOR"].includes(userRole)
  }

  // Inicializar canvas con fondo blanco
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [])

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDraw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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
    },
    []
  )

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      if (!isDrawing) return
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const { x, y } = getPos(e, canvas)
      ctx.lineTo(x, y)
      ctx.stroke()
    },
    [isDrawing]
  )

  const stopDraw = useCallback(() => setIsDrawing(false), [])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
  }

  const handleConfirm = async () => {
    const canvas = canvasRef.current
    if (!canvas || isEmpty) return
    if (!canSign(sigType)) {
      setError("No tienes permisos para firmar como supervisor")
      return
    }

    setSaving(true)
    setError(null)

    try {
      const signatureData = canvas.toDataURL("image/png")
      const res = await fetch(`/api/forms/${formId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: sigType, signatureData }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Error al guardar la firma")
        return
      }

      onSigned()
    } catch {
      setError("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-white">Firma digital</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tipo de firma */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-xs text-slate-400 mb-2">Tipo de firma</p>
          <div className="grid grid-cols-2 gap-2">
            {(["OPERATOR", "SUPERVISOR"] as SignatureType[]).map((t) => (
              <button
                key={t}
                onClick={() => setSigType(t)}
                disabled={!canSign(t)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all
                  ${!canSign(t) ? "opacity-30 cursor-not-allowed border-slate-700 text-slate-500" : ""}
                  ${sigType === t && canSign(t)
                    ? "bg-blue-600 border-blue-500 text-white"
                    : canSign(t)
                      ? "border-slate-700 text-slate-300 hover:border-slate-600"
                      : ""
                  }`}
              >
                {t === "OPERATOR" ? "Operador" : "Supervisor"}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="px-4 pb-2">
          <p className="text-xs text-slate-400 mb-2">Firma aquí</p>
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-white">
            <canvas
              ref={canvasRef}
              className="w-full touch-none"
              style={{ height: 160 }}
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
            <p className="text-center text-xs text-slate-500 mt-1">
              Dibuja tu firma en el área blanca
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="mx-4 text-xs text-red-400 text-center">{error}</p>
        )}

        {/* Acciones */}
        <div className="flex gap-2 px-4 pb-4 pt-2">
          <button
            onClick={clearCanvas}
            disabled={isEmpty || saving}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400
                       border border-slate-700 rounded-xl hover:border-slate-600 hover:text-white
                       transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpiar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isEmpty || saving}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold
                       bg-green-600 hover:bg-green-500 text-white rounded-xl transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-3.5 h-3.5" />
            {saving ? "Guardando..." : "Confirmar firma"}
          </button>
        </div>
      </div>
    </div>
  )
}
