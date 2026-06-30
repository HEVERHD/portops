import { auth } from "@auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Ship, Clock, CheckCircle2, AlertCircle, Circle, Lock, Download } from "lucide-react"
import { FORM_DEFINITIONS } from "@/lib/form-definitions"
import { FORM_TYPE_LABELS } from "@/lib/operation-templates"
import { FormFiller } from "@/components/forms/FormFiller"
import { ATSForm } from "@/components/forms/ATSForm"
import type { ATSData } from "@/components/forms/ATSForm"
import { TableForm } from "@/components/forms/TableForm"
import type { TablaData } from "@/components/forms/TableForm"
import { PhotoCapture } from "@/components/forms/PhotoCapture"
import type { FormType, FormStatus } from "@/generated/prisma/client"

const STATUS_CONFIG: Record<FormStatus, { label: string; icon: typeof Circle; color: string }> = {
  PENDING:     { label: "Pendiente",  icon: Circle,       color: "text-slate-500" },
  IN_PROGRESS: { label: "En curso",   icon: AlertCircle,  color: "text-amber-400" },
  COMPLETED:   { label: "Completado", icon: CheckCircle2, color: "text-blue-400" },
  SIGNED:      { label: "Firmado",    icon: Lock,         color: "text-green-400" },
}

export default async function FormDetailPage({
  params,
}: {
  params: Promise<{ id: string; formId: string }>
}) {
  const session = await auth()
  if (!session) return null

  const { id: operationId, formId } = await params

  const formInstance = await prisma.formInstance.findFirst({
    where: {
      id: formId,
      operationId,
      operation: { organizationId: session.user.organizationId },
    },
    include: {
      operation: { include: { ship: true } },
      service: true,
      filledBy: { select: { id: true, name: true } },
      supervisor: { select: { id: true, name: true } },
      signatures: {
        include: { signedBy: { select: { id: true, name: true } } },
        orderBy: { signedAt: "asc" },
      },
      responses: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!formInstance) notFound()

  const definition = FORM_DEFINITIONS[formInstance.formType as FormType]
  if (!definition) notFound()

  const statusConfig = STATUS_CONFIG[formInstance.status as FormStatus]
  const StatusIcon = statusConfig.icon
  const isReadOnly = session.user.role === "CLIENT" || formInstance.status === "SIGNED"
  const isATS   = definition.customType === "ATS"
  const isTABLA = definition.customType === "TABLA"

  // Mapa de respuestas para formularios checklist
  const responsesMap: Record<string, { checked: boolean | null; observation: string | null }> = {}
  if (!isATS) {
    for (const r of formInstance.responses) {
      responsesMap[r.itemCode] = { checked: r.checked, observation: r.observation }
    }
  }

  // Firmas serializadas
  const signatures = formInstance.signatures.map((s) => ({
    id: s.id,
    type: s.type,
    signedBy: { name: s.signedBy.name },
    signedAt: s.signedAt.toISOString(),
  }))

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Navegación */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href={`/operations/${operationId}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white
                     transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la operación
        </Link>

        {/* Botón PDF — disponible desde COMPLETED */}
        {(formInstance.status === "COMPLETED" || formInstance.status === "SIGNED") && (
          <a
            href={`/api/forms/${formId}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium
                       text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700
                       border border-slate-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar PDF
          </a>
        )}
      </div>

      {/* Cabecera */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md">
            {definition.formCode}
          </span>
          <div className={`flex items-center gap-1.5 text-xs font-medium ${statusConfig.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusConfig.label}
          </div>
        </div>

        <h1 className="text-base font-bold text-white mb-1">{definition.title}</h1>

        <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
          <Ship className="w-3.5 h-3.5 shrink-0" />
          <span className="font-medium text-slate-300">{formInstance.operation.ship.name}</span>
          <span>·</span>
          <span>{FORM_TYPE_LABELS[formInstance.formType as FormType]}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>{formInstance.operation.shift}</span>
          <span>·</span>
          <span>{new Date(formInstance.operation.date).toLocaleDateString("es-CO")}</span>
          {formInstance.service && (
            <>
              <span>·</span>
              <span>{formInstance.service.label}</span>
            </>
          )}
        </div>

        {formInstance.filledBy && (
          <p className="text-xs text-slate-500 mt-2">
            Diligenciado por{" "}
            <span className="text-slate-400">{formInstance.filledBy.name}</span>
            {formInstance.startedAt && (
              <> · {new Date(formInstance.startedAt).toLocaleTimeString("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/Bogota",
              })}</>
            )}
          </p>
        )}

        {isReadOnly && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/30
                          border border-amber-800/30 rounded-lg px-2.5 py-1.5">
            <Lock className="w-3 h-3 shrink-0" />
            {session.user.role === "CLIENT"
              ? "Modo visualización"
              : "Formulario firmado — solo lectura"}
          </div>
        )}
      </div>

      {/* ── Renderizar componente según el tipo de formulario ── */}
      {isATS ? (
        <ATSForm
          formId={formId}
          operationId={operationId}
          initialStatus={formInstance.status}
          initialData={formInstance.formData as ATSData | null}
          signatures={signatures}
          userRole={session.user.role}
          readOnly={isReadOnly}
        />
      ) : isTABLA ? (
        <TableForm
          formId={formId}
          operationId={operationId}
          tableConfig={definition.tableConfig!}
          initialStatus={formInstance.status}
          initialData={formInstance.formData as TablaData | null}
          signatures={signatures}
          userRole={session.user.role}
          readOnly={isReadOnly}
        />
      ) : (
        <FormFiller
          formId={formId}
          operationId={operationId}
          formType={formInstance.formType}
          initialStatus={formInstance.status}
          requiresSignature={formInstance.requiresSignature}
          definition={definition}
          initialResponses={responsesMap}
          signatures={signatures}
          userRole={session.user.role}
          readOnly={isReadOnly}
        />
      )}

      {/* ── Fotos de evidencia ── */}
      <PhotoCapture
        formId={formId}
        readOnly={isReadOnly}
      />
    </div>
  )
}
