import Link from "next/link"
import Image from "next/image"
import {
  Anchor,
  ShieldCheck,
  ClipboardList,
  Users,
  FileSignature,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  Eye,
  Lock,
  Smartphone,
  Camera,
  FileDown,
  MapPin,
  Table2,
} from "lucide-react"

// ─── Datos ──────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Checklists HSE con 3 estados",
    desc: "Cumple / NC / N/A por ítem, observaciones incluidas. Validación antes de completar: no se puede firmar con ítems sin responder.",
  },
  {
    icon: Table2,
    title: "Formularios de tabla dinámica",
    desc: "Registro de Asistencia (F-GH-01) y Control de Ingreso/Salida (F-GI-21) como tablas con filas dinámicas, igual que el formato físico.",
  },
  {
    icon: FileSignature,
    title: "Firmas digitales en canvas",
    desc: "Operario y supervisor firman con el dedo directamente en el celular. Trazabilidad de quién firmó, a qué hora y desde dónde.",
  },
  {
    icon: Camera,
    title: "Fotos de evidencia con GPS",
    desc: "Cámara forzada (no galería), coordenadas GPS capturadas al momento. Cada foto queda registrada con latitud, longitud y mapa del punto.",
  },
  {
    icon: FileDown,
    title: "Exportación a PDF",
    desc: "PDF con membrete INGECOL, código del formulario, ítems, respuestas y firmas. Disponible desde que el formulario está completado.",
  },
  {
    icon: Eye,
    title: "Visibilidad en tiempo real",
    desc: "El cliente accede al estado de cada operación y formulario al instante. Cero correos con adjuntos.",
  },
  {
    icon: ShieldCheck,
    title: "Cumplimiento HSE demostrable",
    desc: "Registro inmutable de cada verificación. Auditable, trazable y exportable. El historial no se puede borrar ni editar una vez firmado.",
  },
  {
    icon: BarChart3,
    title: "Reportes del mes",
    desc: "KPIs de operaciones, formularios firmados y tasa de cumplimiento. Vista por tipo de operación y estado de formularios.",
  },
  {
    icon: Zap,
    title: "Autoguardado inteligente",
    desc: "Cada respuesta y fila se guarda en milisegundos. Sin pérdida de datos por caídas de red o cierres inesperados del navegador.",
  },
]

const OPERATION_TYPES = [
  {
    code: "ACERO LARGO",
    forms: 7,
    tipos: "Inspección HSE · Grúa · Aparejos · Entorno · ATS · Alturas · Asistencia",
    color: "from-blue-600/20 to-blue-500/5 border-blue-700/40",
    tag: "text-blue-400 bg-blue-950",
  },
  {
    code: "GRANEL",
    forms: 8,
    tipos: "Inspección HSE · Grúa · Aparejos · Entorno · ATS · Alturas · Asistencia · Ingreso",
    color: "from-amber-600/20 to-amber-500/5 border-amber-700/40",
    tag: "text-amber-400 bg-amber-950",
  },
  {
    code: "COQUE",
    forms: 12,
    tipos: "Todos los anteriores + Entorno Vial · Tolva · Plan de Izaje",
    color: "from-slate-600/20 to-slate-500/5 border-slate-600/40",
    tag: "text-slate-300 bg-slate-800",
  },
]

const FORM_TYPES = [
  { code: "F-GI-68", name: "Inspección HSE a la Operación",       items: 52, type: "checklist" },
  { code: "F-GI-80", name: "Inspección para Grúa",                items: 29, type: "checklist" },
  { code: "F-GI-107",name: "Inspección de Aparejos",              items: 31, type: "checklist" },
  { code: "F-GI-104",name: "Análisis Seguro del Entorno (Grúa)", items: 18, type: "checklist" },
  { code: "F-GI-103",name: "Análisis Seguro del Entorno Vial",   items: 16, type: "checklist" },
  { code: "F-GI-19", name: "Permiso de Trabajo en Alturas",       items: 37, type: "checklist" },
  { code: "F-GI-18", name: "Análisis de Trabajo Seguro (ATS)",   items: null, type: "tabla-ats" },
  { code: "F-GH-01", name: "Registro de Asistencia y Charla",    items: null, type: "tabla" },
  { code: "F-GI-21", name: "Control de Ingreso y Salida",         items: null, type: "tabla" },
  { code: "F-GI-PIZ",name: "Plan de Izaje",                       items: 16, type: "checklist" },
]

const ROLES = [
  {
    label: "Administrador",
    icon: Lock,
    color: "text-purple-400",
    desc: "Gestiona organización, usuarios, buques y operaciones.",
  },
  {
    label: "Coordinador",
    icon: ClipboardList,
    color: "text-blue-400",
    desc: "Crea operaciones, asigna formularios y supervisa el avance.",
  },
  {
    label: "Supervisor de Campo",
    icon: Users,
    color: "text-green-400",
    desc: "Diligencia checklists en sitio, toma fotos de evidencia y firma.",
  },
  {
    label: "Cliente",
    icon: Eye,
    color: "text-amber-400",
    desc: "Visualización en tiempo real sin acceso de edición.",
  },
]

const STEPS = [
  {
    n: "01",
    title: "Se crea la operación",
    desc: "El coordinador registra el buque, tipo de carga, turno y fecha. El sistema genera automáticamente todos los formularios requeridos según el tipo de operación.",
  },
  {
    n: "02",
    title: "Supervisor diligencia en campo",
    desc: "Desde el celular marca Cumple/NC/N/A en cada ítem, llena tablas de asistencia e ingreso, y completa el ATS con los pasos de la tarea. Se autoguarda en tiempo real.",
  },
  {
    n: "03",
    title: "Evidencia fotográfica",
    desc: "Con un toque, abre la cámara del celular y toma una foto. El sistema registra automáticamente las coordenadas GPS y muestra el punto en el mapa.",
  },
  {
    n: "04",
    title: "Firma y PDF disponible",
    desc: "Operario y supervisor firman digitalmente. El cliente puede ver el resultado al instante y descargar el PDF con membrete oficial.",
  },
]

// ─── Componentes internos ────────────────────────────────────────────────────

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
      {children}
    </span>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <span className="inline-block text-xs font-semibold tracking-widest uppercase
                     text-blue-400 bg-blue-950/60 border border-blue-800/50
                     px-3 py-1 rounded-full mb-4">
      {children}
    </span>
  )
}

function TypeBadge({ type }: { type: string }) {
  if (type === "tabla-ats") return (
    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded
                     bg-violet-950 text-violet-400">TABLA ATS</span>
  )
  if (type === "tabla") return (
    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded
                     bg-amber-950 text-amber-400">TABLA</span>
  )
  return (
    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded
                     bg-blue-950 text-blue-400">CHECKLIST</span>
  )
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function IntroPage() {
  return (
    <div className="min-h-full bg-slate-950 text-slate-100 overflow-x-hidden">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 backdrop-blur-md bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logoPORTOPS.png"
              alt="PortOps"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="font-bold text-white tracking-tight">PortOps</span>
            <span className="hidden sm:block text-[10px] text-slate-500 border border-slate-700
                             px-1.5 py-0.5 rounded ml-1 font-mono">
              v1.0
            </span>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm font-medium text-white
                       bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg
                       transition-colors"
          >
            Ingresar
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]
                          bg-blue-600/10 blur-3xl rounded-full" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs text-green-400
                          bg-green-950/50 border border-green-800/50 px-3 py-1
                          rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Puerto de Palermo — Ingecol · Sistema activo
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight
                         tracking-tight text-white mb-6">
            Operaciones portuarias
            <br />
            <GradientText>sin papel, sin riesgo</GradientText>
          </h1>

          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            PortOps digitaliza todos los formularios HSE del puerto. Checklists, tablas
            de registro, ATS, firmas digitales, fotos con GPS y exportación a PDF —
            todo desde el celular, en tiempo real.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white
                         font-semibold px-6 py-3 rounded-xl transition-colors text-sm
                         w-full sm:w-auto justify-center"
            >
              Acceder al sistema
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#formularios"
              className="flex items-center gap-2 border border-slate-700 hover:border-slate-500
                         text-slate-300 hover:text-white px-6 py-3 rounded-xl
                         transition-colors text-sm w-full sm:w-auto justify-center"
            >
              Ver formularios incluidos
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      <section className="border-y border-slate-800/60 bg-slate-900/40 py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "10",   label: "Formularios HSE digitalizados" },
            { value: "4",    label: "Roles de acceso diferenciados" },
            { value: "GPS",  label: "Geolocalización en cada foto" },
            { value: "PDF",  label: "Exportación con membrete oficial" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-extrabold text-white">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tipos de operación ───────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Operaciones soportadas</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Paquete de formularios por tipo de carga
            </h2>
            <p className="text-slate-400 mt-3 text-sm max-w-md mx-auto">
              Al crear la operación el sistema asigna automáticamente todos
              los formularios requeridos según el tipo de carga.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {OPERATION_TYPES.map((op) => (
              <div
                key={op.code}
                className={`bg-gradient-to-b ${op.color} border rounded-2xl p-6`}
              >
                <Anchor className="w-6 h-6 text-slate-400 mb-3" />
                <h3 className="font-bold text-white text-lg mb-1">{op.code}</h3>
                <div className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md ${op.tag} mb-3`}>
                  {op.forms} formularios
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{op.tipos}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Catálogo de formularios ──────────────────────────────────────── */}
      <section id="formularios" className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Catálogo completo</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              10 formularios digitalizados
            </h2>
            <p className="text-slate-400 mt-3 text-sm max-w-md mx-auto">
              Ítems extraídos directamente de los formatos físicos de Ingecol.
              Tres modos de renderizado: checklist, tabla y ATS.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {FORM_TYPES.map((f, i) => (
              <div
                key={f.code}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i < FORM_TYPES.length - 1 ? "border-b border-slate-800/60" : ""
                }`}
              >
                <span className="font-mono text-xs text-slate-500 w-20 shrink-0">{f.code}</span>
                <span className="text-sm text-slate-200 flex-1">{f.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {f.items && (
                    <span className="text-xs text-slate-500">{f.items} ítems</span>
                  )}
                  <TypeBadge type={f.type} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Características ─────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Funcionalidades</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Todo lo que necesita el equipo en campo
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5
                             hover:border-slate-700 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-700/30
                                  flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1.5">{f.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Flujo de trabajo</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              De la operación a la firma en 4 pasos
            </h2>
          </div>

          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <div key={i} className="relative flex gap-5 bg-slate-900 border border-slate-800
                                      rounded-2xl p-5 hover:border-slate-700 transition-colors">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-600 flex items-center
                                justify-center font-mono font-bold text-xs text-white">
                  {step.n}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1 text-sm">{step.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Evidencia fotográfica highlight ─────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6
                          flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-600/15 border border-green-700/30
                            flex items-center justify-center">
              <Camera className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="font-bold text-white">Foto antifraude</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Cámara forzada — no permite seleccionar de galería. Cada foto registra
              las coordenadas GPS del momento exacto, con mapa del punto y precisión
              en metros.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-slate-400">Geolocalización en tiempo real</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6
                          flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-700/30
                            flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-bold text-white">Mobile-first</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Diseñado para usarse con guantes en el muelle. Funciona en cualquier
              celular moderno sin instalar nada. El autoguardado protege el trabajo
              ante cortes de señal.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-slate-400">Sin instalación · Solo el navegador</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Roles ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Control de acceso</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Cada persona ve exactamente lo que necesita
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES.map((r) => {
              const Icon = r.icon
              return (
                <div
                  key={r.label}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5
                             text-center hover:border-slate-700 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                   mx-auto mb-3 bg-slate-800 ${r.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className={`font-semibold text-sm mb-1.5 ${r.color}`}>{r.label}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{r.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                              w-[500px] h-[200px] bg-blue-600/15 blur-3xl rounded-full" />
            </div>

            <div className="relative">
              <div className="inline-flex items-center gap-2 text-xs text-blue-400
                              bg-blue-950/60 border border-blue-800/50 px-3 py-1
                              rounded-full mb-6">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sistema activo — todas las funcionalidades disponibles
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                Listo para usar <GradientText>hoy mismo</GradientText>
              </h2>

              <p className="text-slate-400 mb-8 text-sm leading-relaxed max-w-md mx-auto">
                Accede al sistema con tus credenciales para gestionar
                operaciones, formularios, firmas y reportes.
              </p>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500
                           text-white font-semibold px-8 py-3.5 rounded-xl
                           transition-colors text-sm"
              >
                Iniciar sesión
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/60 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center
                        justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Image src="/logoPORTOPS.png" alt="PortOps" width={16} height={16} className="opacity-40" />
            <span>PortOps · Puerto de Palermo — Ingecol S.A.S.</span>
          </div>
          <span>Sistema de gestión de operaciones portuarias · {new Date().getFullYear()}</span>
        </div>
      </footer>

    </div>
  )
}
