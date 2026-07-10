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

// ── Flag emoji helpers ────────────────────────────────────────────────────────

/** ISO-3166-1 alpha-2 → flag emoji */
function iso2ToEmoji(code: string): string {
  return [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("")
}

/** Maps ISO-3 codes and common full country names → ISO-2 */
const FLAG_LOOKUP: Record<string, string> = {
  // ISO-3
  col: "CO", pan: "PA", bhs: "BS", lbr: "LR", mhl: "MH", nld: "NL",
  gbr: "GB", usa: "US", chl: "CL", bra: "BR", arg: "AR", mex: "MX",
  ven: "VE", ecu: "EC", per: "PE", cri: "CR", hnd: "HN", gtm: "GT",
  slv: "SV", nic: "NI", dom: "DO", cub: "CU", jam: "JM", hti: "HT",
  tto: "TT", brb: "BB", atg: "AG", lca: "LC", vct: "VC", grd: "GD",
  kna: "KN", dma: "DM", blz: "BZ", guy: "GY", sur: "SR", bol: "BO",
  pry: "PY", ury: "UY", nor: "NO", dnk: "DK", swe: "SE", fin: "FI",
  deu: "DE", fra: "FR", ita: "IT", esp: "ES", prt: "PT", grc: "GR",
  cyp: "CY", mlt: "MT", sgp: "SG", hkg: "HK", chn: "CN", jpn: "JP",
  kor: "KR", ind: "IN", are: "AE", sau: "SA", tur: "TR", rus: "RU",
  ukr: "UA", bel: "BE", che: "CH", aut: "AT", isl: "IS", irl: "IE",
  phl: "PH", idn: "ID", mys: "MY", tha: "TH", vnm: "VN", mng: "MN",
  // Full names (lowercase)
  colombia: "CO", panama: "PA", bahamas: "BS", liberia: "LR",
  "marshall islands": "MH", netherlands: "NL", "united kingdom": "GB",
  "united states": "US", chile: "CL", brazil: "BR", argentina: "AR",
  mexico: "MX", venezuela: "VE", ecuador: "EC", peru: "PE",
  "costa rica": "CR", honduras: "HN", guatemala: "GT", "el salvador": "SV",
  nicaragua: "NI", "dominican republic": "DO", cuba: "CU", jamaica: "JM",
  haiti: "HT", "trinidad and tobago": "TT", barbados: "BB",
  "antigua and barbuda": "AG", "saint lucia": "LC",
  "saint vincent": "VC", grenada: "GD", belize: "BZ", guyana: "GY",
  suriname: "SR", bolivia: "BO", paraguay: "PY", uruguay: "UY",
  norway: "NO", denmark: "DK", sweden: "SE", finland: "FI",
  germany: "DE", france: "FR", italy: "IT", spain: "ES",
  portugal: "PT", greece: "GR", cyprus: "CY", malta: "MT",
  singapore: "SG", china: "CN", japan: "JP", "south korea": "KR",
  india: "IN", russia: "RU", turkey: "TR", ukraine: "UA",
  belgium: "BE", switzerland: "CH", austria: "AT", iceland: "IS",
  ireland: "IE", philippines: "PH", indonesia: "ID", malaysia: "MY",
  thailand: "TH", vietnam: "VN",
}

/** Returns flag emoji string, or null if unknown */
function getFlagEmoji(flag: string | null): string | null {
  if (!flag) return null
  const key = flag.trim().toLowerCase()
  const upper = flag.trim().toUpperCase()

  // Direct ISO-2 (2 letters)
  if (upper.length === 2 && /^[A-Z]{2}$/.test(upper)) return iso2ToEmoji(upper)

  // Lookup table (ISO-3 or full name)
  const iso2 = FLAG_LOOKUP[key]
  if (iso2) return iso2ToEmoji(iso2)

  return null
}

// ─────────────────────────────────────────────────────────────────────────────

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
                Bandera — código o nombre
              </label>
              <div className="relative">
                <input
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  placeholder="COL / Colombia"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg
                             px-3 py-2 text-sm placeholder-slate-500
                             focus:outline-none focus:ring-2 focus:ring-orange-500
                             pr-10"
                />
                {flag && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none pointer-events-none">
                    {getFlagEmoji(flag) ?? "🏳️"}
                  </span>
                )}
              </div>
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
          {ships.map((ship, i) => {
            const emoji = getFlagEmoji(ship.flag)
            return (
              <div
                key={ship.id}
                className={`flex items-center gap-3 px-4 py-3.5 ${
                  i < ships.length - 1 ? "border-b border-slate-800" : ""
                }`}
              >
                {/* Icono: bandera emoji o ícono Ship */}
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                  {emoji
                    ? <span className="text-lg leading-none">{emoji}</span>
                    : <Ship className="w-4 h-4 text-slate-400" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{ship.name}</p>
                  <p className="text-xs text-slate-500">
                    {[
                      ship.imo  && `IMO: ${ship.imo}`,
                      ship.flag && `${emoji ?? ""}${emoji ? " " : ""}${ship.flag}`,
                    ].filter(Boolean).join(" · ") || "Sin datos adicionales"}
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
            )
          })}
        </div>
      )}
    </div>
  )
}
