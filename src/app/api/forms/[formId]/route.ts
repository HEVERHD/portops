import { auth } from "@auth"
import { prisma } from "@/lib/prisma"
import { FORM_DEFINITIONS } from "@/lib/form-definitions"
import type { FormType } from "@/generated/prisma/client"

// GET /api/forms/[formId]
// Retorna: instancia + operación/barco + definición de ítems + respuestas existentes
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { formId } = await params

  const formInstance = await prisma.formInstance.findFirst({
    where: {
      id: formId,
      operation: { organizationId: session.user.organizationId },
    },
    include: {
      operation: {
        include: { ship: true },
      },
      service: true,
      filledBy: { select: { id: true, name: true } },
      supervisor: { select: { id: true, name: true } },
      signatures: {
        include: { signedBy: { select: { id: true, name: true } } },
        orderBy: { signedAt: "asc" },
      },
      responses: {
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!formInstance) {
    return Response.json({ error: "Formulario no encontrado" }, { status: 404 })
  }

  // Definición estática de ítems para este tipo de formulario
  const definition = FORM_DEFINITIONS[formInstance.formType as FormType]

  // Mapa de respuestas existentes: itemCode → { checked, observation }
  const responsesMap: Record<string, { checked: boolean | null; observation: string | null }> = {}
  for (const r of formInstance.responses) {
    responsesMap[r.itemCode] = { checked: r.checked, observation: r.observation ?? null }
  }

  return Response.json({
    formInstance: {
      id: formInstance.id,
      formType: formInstance.formType,
      status: formInstance.status,
      scope: formInstance.scope,
      requiresSignature: formInstance.requiresSignature,
      startedAt: formInstance.startedAt,
      completedAt: formInstance.completedAt,
      operation: {
        id: formInstance.operation.id,
        type: formInstance.operation.type,
        shift: formInstance.operation.shift,
        date: formInstance.operation.date,
        ship: { name: formInstance.operation.ship.name },
      },
      service: formInstance.service
        ? { id: formInstance.service.id, label: formInstance.service.label }
        : null,
      filledBy: formInstance.filledBy,
      supervisor: formInstance.supervisor,
      signatures: formInstance.signatures.map((s) => ({
        id: s.id,
        type: s.type,
        signedBy: s.signedBy,
        signedAt: s.signedAt,
      })),
    },
    definition,
    responses: responsesMap,
  })
}
