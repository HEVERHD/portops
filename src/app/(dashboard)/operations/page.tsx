import { auth } from "@auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, Ship, ChevronRight, Clock } from "lucide-react"
import { OPERATION_TEMPLATES, FORM_TYPE_LABELS } from "@/lib/operation-templates"
import type { FormStatus, OperationStatus, OperationType } from "@/generated/prisma/client"

const STATUS_STYLES: Record<OperationStatus, string> = {
  OPEN:        "bg-blue-500/10 text-blue-400 border-blue-500/20",
  IN_PROGRESS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  COMPLETED:   "bg-green-500/10 text-green-400 border-green-500/20",
  CLOSED:      "bg-slate-500/10 text-slate-400 border-slate-500/20",
}

const STATUS_LABELS: Record<OperationStatus, string> = {
  OPEN:        "Abierta",
  IN_PROGRESS: "En curso",
  COMPLETED:   "Completada",
  CLOSED:      "Cerrada",
}

const FORM_STATUS_COLOR: Record<FormStatus, string> = {
  PENDING:     "bg-slate-600",
  IN_PROGRESS: "bg-amber-500",
  COMPLETED:   "bg-blue-500",
  SIGNED:      "bg-green-500",
}

function progressOf(forms: { status: FormStatus }[]) {
  if (!forms.length) return 0
  const done = forms.filter((f) => f.status === "COMPLETED" || f.status === "SIGNED").length
  return Math.round((done / forms.length) * 100)
}

export default async function OperationsPage() {
  const session = await auth()
  if (!session) return null

  const today = new Date()
  const start = new Date(today); start.setHours(0, 0, 0, 0)
  const end   = new Date(today); end.setHours(23, 59, 59, 999)

  const operations = await prisma.operation.findMany({
    where: {
      organizationId: session.user.organizationId,
      date: { gte: start, lte: end },
    },
    include: {
      ship: true,
      services: { orderBy: { number: "asc" } },
      formInstances: {
        select: { id: true, formType: true, status: true, scope: true, serviceId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const canCreate = ["ADMIN", "COORDINATOR"].includes(session.user.role)

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="min-w-0 mr-3">
          <h1 className="text-lg md:text-xl font-bold text-white">Operaciones del día</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5 capitalize">
            {today.toLocaleDateString("es-CO", {
              weekday: "long",
              day:     "numeric",
              month:   "long",
              year:    "numeric",
            })}
          </p>
        </div>
        {canCreate && (
          <Link
            href="/operations/new"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700
                       text-white text-sm font-medium px-3 md:px-4 py-2 rounded-xl transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva operación</span>
            <span className="sm:hidden">Nueva</span>
          </Link>
        )}
      </div>

      {/* Lista */}
      {operations.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Ship className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No hay operaciones registradas hoy</p>
          {canCreate && (
            <p className="text-sm mt-1">
              <Link href="/operations/new" className="text-blue-400 hover:underline">
                Crear primera operación
              </Link>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {operations.map((op) => {
            const progress      = progressOf(op.formInstances)
            const templateLabel = OPERATION_TEMPLATES[op.type as OperationType]?.label ?? op.type

            return (
              <Link
                key={op.id}
                href={`/operations/${op.id}`}
                className="block bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5
                           hover:border-slate-700 active:bg-slate-800/80 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                      <Ship className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{op.ship.name}</p>
                      <p className="text-sm text-slate-400 truncate">{templateLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border
                                  ${STATUS_STYLES[op.status as OperationStatus]}`}
                    >
                      {STATUS_LABELS[op.status as OperationStatus]}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </div>

                {/* Progreso */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {op.shift} · {op.services.length} servicio{op.services.length !== 1 ? "s" : ""}
                    </span>
                    <span>{progress}% completado</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Indicadores de formularios */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {op.formInstances.slice(0, 12).map((f) => (
                    <div
                      key={f.id}
                      title={FORM_TYPE_LABELS[f.formType]}
                      className={`w-2.5 h-2.5 rounded-full ${FORM_STATUS_COLOR[f.status as FormStatus]}`}
                    />
                  ))}
                  {op.formInstances.length > 12 && (
                    <span className="text-xs text-slate-500">+{op.formInstances.length - 12}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
