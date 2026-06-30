import { auth } from "@auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Ship, Clock, CheckCircle2, Circle, AlertCircle } from "lucide-react"
import { FORM_TYPE_LABELS, OPERATION_TEMPLATES } from "@/lib/operation-templates"
import type { FormStatus, OperationType } from "@/generated/prisma/client"

const FORM_STATUS_CONFIG: Record<FormStatus, { label: string; icon: typeof Circle; className: string }> = {
  PENDING:     { label: "Pendiente",  icon: Circle,       className: "text-slate-500" },
  IN_PROGRESS: { label: "En curso",   icon: AlertCircle,  className: "text-amber-400" },
  COMPLETED:   { label: "Completado", icon: CheckCircle2, className: "text-blue-400" },
  SIGNED:      { label: "Firmado",    icon: CheckCircle2, className: "text-green-400" },
}

export default async function OperationDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return null

  const { id } = await params

  const operation = await prisma.operation.findFirst({
    where: { id, organizationId: session.user.organizationId },
    include: {
      ship: true,
      services: { orderBy: { number: "asc" } },
      formInstances: {
        include: {
          service:  true,
          filledBy: { select: { name: true } },
          _count:   { select: { responses: true, signatures: true } },
        },
        orderBy: [{ scope: "asc" }, { serviceId: "asc" }, { formType: "asc" }],
      },
    },
  })

  if (!operation) notFound()

  const templateLabel = OPERATION_TEMPLATES[operation.type as OperationType]?.label ?? operation.type
  const perOpForms    = operation.formInstances.filter((f) => f.scope === "PER_OPERATION")
  const perSvcForms   = operation.formInstances.filter((f) => f.scope === "PER_SERVICE")
  const completed     = operation.formInstances.filter(
    (f) => f.status === "COMPLETED" || f.status === "SIGNED"
  ).length
  const total    = operation.formInstances.length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/operations"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white
                   transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a operaciones
      </Link>

      {/* Info card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 bg-blue-600/10 border border-blue-500/20 rounded-xl
                          flex items-center justify-center shrink-0">
            <Ship className="w-5 h-5 text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base md:text-lg font-bold text-white">{operation.ship.name}</h1>
            <p className="text-sm text-slate-400">{templateLabel}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {operation.shift}
              </span>
              <span>{new Date(operation.date).toLocaleDateString("es-CO")}</span>
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>{completed} de {total} formularios completados</span>
            <span className="font-medium text-white">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Formularios por operación */}
      {perOpForms.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Formularios generales
          </h2>
          <div className="space-y-2">
            {perOpForms.map((form) => {
              const config = FORM_STATUS_CONFIG[form.status as FormStatus]
              const Icon   = config.icon
              return (
                <Link
                  key={form.id}
                  href={`/operations/${id}/forms/${form.id}`}
                  className="flex items-center justify-between bg-slate-900 border border-slate-800
                             hover:border-slate-700 active:bg-slate-800 rounded-xl px-4 py-3
                             transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${config.className}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {FORM_TYPE_LABELS[form.formType]}
                      </p>
                      {form.filledBy && (
                        <p className="text-xs text-slate-500">{form.filledBy.name}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-medium shrink-0 ml-2 ${config.className}`}>
                    {config.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Formularios por servicio */}
      {operation.services.map((service) => {
        const serviceForms = perSvcForms.filter((f) => f.serviceId === service.id)
        if (!serviceForms.length) return null

        return (
          <section key={service.id} className="mb-5">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              {service.label}
            </h2>
            <div className="space-y-2">
              {serviceForms.map((form) => {
                const config = FORM_STATUS_CONFIG[form.status as FormStatus]
                const Icon   = config.icon
                return (
                  <Link
                    key={form.id}
                    href={`/operations/${id}/forms/${form.id}`}
                    className="flex items-center justify-between bg-slate-900 border border-slate-800
                               hover:border-slate-700 active:bg-slate-800 rounded-xl px-4 py-3
                               transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${config.className}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {FORM_TYPE_LABELS[form.formType]}
                        </p>
                        {form.filledBy && (
                          <p className="text-xs text-slate-500">{form.filledBy.name}</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-medium shrink-0 ml-2 ${config.className}`}>
                      {config.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
