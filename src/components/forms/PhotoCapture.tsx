"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Loader2, MapPin, X, AlertCircle, ImageIcon } from "lucide-react"
import Image from "next/image"

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PhotoRecord {
  id: string
  url: string
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  uploadedAt: string
  uploadedBy: { name: string }
}

interface PhotoCaptureProps {
  formId: string
  readOnly?: boolean
}

// ─── Mapa estático con Google Maps ───────────────────────────────────────────

function StaticMap({ lat, lng }: { lat: number; lng: number }) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) return null

  const mapUrl =
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${lat},${lng}` +
    `&zoom=16` +
    `&size=280x130` +
    `&scale=2` +
    `&markers=color:red%7C${lat},${lng}` +
    `&style=feature:all%7Celement:labels%7Cvisibility:simplified` +
    `&key=${key}`

  return (
    <div className="mt-2 rounded-lg overflow-hidden border border-slate-700">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mapUrl}
        alt="Ubicación GPS"
        className="w-full h-auto"
        width={280}
        height={130}
      />
    </div>
  )
}

// ─── Tarjeta de foto ──────────────────────────────────────────────────────────

function PhotoCard({ photo }: { photo: PhotoRecord }) {
  const hasGPS = photo.latitude !== null && photo.longitude !== null

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-900">
        <Image
          src={photo.url}
          alt="Foto de evidencia"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Metadatos */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">
            {photo.uploadedBy.name}
          </span>
          <span className="text-xs text-slate-500">
            {new Date(photo.uploadedAt).toLocaleTimeString("es-CO", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "America/Bogota",
            })}
          </span>
        </div>

        {hasGPS ? (
          <>
            <a
              href={`https://www.google.com/maps?q=${photo.latitude},${photo.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors"
            >
              <MapPin className="w-3 h-3 shrink-0" />
              <span>Ver ubicación en mapa</span>
              {photo.accuracy && (
                <span className="text-slate-500">
                  ±{Math.round(photo.accuracy)}m
                </span>
              )}
            </a>
            <StaticMap lat={photo.latitude!} lng={photo.longitude!} />
          </>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3 h-3" />
            GPS no disponible
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function PhotoCapture({ formId, readOnly = false }: PhotoCaptureProps) {
  const [photos, setPhotos]       = useState<PhotoRecord[]>([])
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [gpsStatus, setGpsStatus] = useState<"idle" | "getting" | "ok" | "denied">("idle")
  const inputRef = useRef<HTMLInputElement>(null)

  // Cargar fotos existentes
  useEffect(() => {
    fetch(`/api/forms/${formId}/photos`)
      .then((r) => r.json())
      .then((j) => { if (j.photos) setPhotos(j.photos) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [formId])

  // ── Capturar GPS y luego abrir cámara ─────────────────────────────────────
  async function handleCameraClick() {
    setError(null)
    setGpsStatus("getting")

    let lat: number | null = null
    let lng: number | null = null
    let accuracy: number | null = null

    // Intentar obtener GPS (timeout de 8 s)
    await new Promise<void>((resolve) => {
      if (!navigator.geolocation) {
        setGpsStatus("denied")
        resolve()
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          lat      = pos.coords.latitude
          lng      = pos.coords.longitude
          accuracy = pos.coords.accuracy
          setGpsStatus("ok")
          resolve()
        },
        () => {
          setGpsStatus("denied")
          resolve()
        },
        { timeout: 8000, enableHighAccuracy: true }
      )
    })

    // Guardar coords en data attributes del input para usarlos al seleccionar foto
    if (inputRef.current) {
      inputRef.current.dataset.lat      = lat      !== null ? String(lat)      : ""
      inputRef.current.dataset.lng      = lng      !== null ? String(lng)      : ""
      inputRef.current.dataset.accuracy = accuracy !== null ? String(accuracy) : ""
      inputRef.current.click()
    }
  }

  // ── Subir foto al seleccionar ─────────────────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const fd = new FormData()
    fd.append("photo", file)

    const lat      = inputRef.current?.dataset.lat
    const lng      = inputRef.current?.dataset.lng
    const accuracy = inputRef.current?.dataset.accuracy
    if (lat)      fd.append("lat",      lat)
    if (lng)      fd.append("lng",      lng)
    if (accuracy) fd.append("accuracy", accuracy)

    try {
      const res = await fetch(`/api/forms/${formId}/photos`, {
        method: "POST",
        body: fd,
      })
      const j = await res.json()
      if (!res.ok) {
        setError(j.error ?? "Error al subir la foto")
      } else {
        setPhotos((prev) => [j.photo, ...prev])
      }
    } catch {
      setError("Sin conexión")
    } finally {
      setUploading(false)
      setGpsStatus("idle")
      // Reset input para permitir subir la misma foto de nuevo
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-white">
            Fotos de evidencia
          </h3>
          {photos.length > 0 && (
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
              {photos.length}
            </span>
          )}
        </div>

        {!readOnly && (
          <button
            onClick={handleCameraClick}
            disabled={uploading}
            className="flex items-center gap-1.5 text-xs font-medium
                       text-white bg-blue-600 hover:bg-blue-500
                       disabled:opacity-50 px-3 py-1.5 rounded-lg
                       transition-colors"
          >
            {uploading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo…</>
            ) : gpsStatus === "getting" ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Obteniendo GPS…</>
            ) : (
              <><Camera className="w-3.5 h-3.5" /> Tomar foto</>
            )}
          </button>
        )}
      </div>

      {/* Input de cámara — oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Indicador GPS */}
      {gpsStatus === "denied" && !uploading && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400
                        bg-amber-950/30 border border-amber-800/30
                        rounded-lg px-2.5 py-1.5 mb-3">
          <AlertCircle className="w-3 h-3 shrink-0" />
          GPS no disponible — la foto se subirá sin coordenadas
        </div>
      )}
      {gpsStatus === "ok" && !uploading && (
        <div className="flex items-center gap-1.5 text-xs text-green-400 mb-3">
          <MapPin className="w-3 h-3" />
          Ubicación obtenida
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400
                        bg-red-950/30 border border-red-800/30
                        rounded-lg px-2.5 py-1.5 mb-3">
          <X className="w-3 h-3 shrink-0" />
          {error}
        </div>
      )}

      {/* Estado de carga inicial */}
      {loading && (
        <div className="flex items-center justify-center py-6 text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Cargando fotos…
        </div>
      )}

      {/* Sin fotos */}
      {!loading && photos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6
                        text-slate-600 text-xs text-center">
          <ImageIcon className="w-8 h-8 mb-2 opacity-40" />
          {readOnly
            ? "Sin fotos en este formulario"
            : "Toma una foto como evidencia del trabajo realizado"}
        </div>
      )}

      {/* Grid de fotos */}
      {photos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          {photos.map((p) => (
            <PhotoCard key={p.id} photo={p} />
          ))}
        </div>
      )}
    </div>
  )
}
