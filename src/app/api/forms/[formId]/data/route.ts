import { auth } from "@auth"
import { prisma } from "@/lib/prisma"

// GET /api/forms/[formId]/data
// Retorna el formData (JSON) guardado para formularios especiales (ATS)
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
    select: { id: true, formData: true, status: true },
  })

  if (!formInstance) {
    return Response.json({ error: "Formulario no encontrado" }, { status: 404 })
  }

  return Response.json({ formData: formInstance.formData ?? null })
}

// POST /api/forms/[formId]/data
// Guarda el JSON del ATS y transiciona a IN_PROGRESS si estaba PENDING
export async function POST(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { formId } = await params
  const body = await request.json()

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Datos requeridos" }, { status: 400 })
  }

  const formInstance = await prisma.formInstance.findFirst({
    where: {
      id: formId,
      operation: { organizationId: session.user.organizationId },
    },
    select: { id: true, status: true, filledById: true },
  })

  if (!formInstance) {
    return Response.json({ error: "Formulario no encontrado" }, { status: 404 })
  }

  if (formInstance.status === "SIGNED") {
    return Response.json({ error: "El formulario ya fue firmado" }, { status: 409 })
  }

  const now = new Date()
  const updateData: Record<string, unknown> = { formData: body }

  if (formInstance.status === "PENDING") {
    updateData.status = "IN_PROGRESS"
    updateData.filledById = session.user.id
    updateData.startedAt = now
  } else if (!formInstance.filledById) {
    updateData.filledById = session.user.id
  }

  await prisma.formInstance.update({
    where: { id: formId },
    data: updateData,
  })

  return Response.json({ success: true })
}
