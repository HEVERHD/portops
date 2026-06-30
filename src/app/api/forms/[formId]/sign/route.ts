import { auth } from "@auth"
import { prisma } from "@/lib/prisma"

// POST /api/forms/[formId]/sign
// Registra la firma (operador o supervisor) y transiciona a SIGNED
export async function POST(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { formId } = await params
  const body = await request.json()
  const { type, signatureData } = body as {
    type: "OPERATOR" | "SUPERVISOR"
    signatureData: string
  }

  if (!type || !signatureData) {
    return Response.json({ error: "Tipo y datos de firma requeridos" }, { status: 400 })
  }

  if (!["OPERATOR", "SUPERVISOR"].includes(type)) {
    return Response.json({ error: "Tipo de firma inválido" }, { status: 400 })
  }

  const formInstance = await prisma.formInstance.findFirst({
    where: {
      id: formId,
      operation: { organizationId: session.user.organizationId },
    },
    select: { id: true, status: true },
  })

  if (!formInstance) {
    return Response.json({ error: "Formulario no encontrado" }, { status: 404 })
  }

  // Solo se puede firmar si está COMPLETED o ya SIGNED (para agregar segunda firma)
  if (formInstance.status === "PENDING" || formInstance.status === "IN_PROGRESS") {
    return Response.json(
      { error: "El formulario debe completarse antes de firmar" },
      { status: 409 }
    )
  }

  // Guardar firma y marcar como SIGNED
  await prisma.$transaction([
    prisma.signature.create({
      data: {
        formInstanceId: formId,
        type,
        signatureData,
        signedById: session.user.id,
        signedAt: new Date(),
      },
    }),
    prisma.formInstance.update({
      where: { id: formId },
      data: { status: "SIGNED" },
    }),
  ])

  return Response.json({ success: true })
}
