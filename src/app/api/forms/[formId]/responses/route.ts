import { auth } from "@auth"
import { prisma } from "@/lib/prisma"

interface ResponseItem {
  itemCode: string
  itemLabel: string
  checked: boolean | null   // true=Cumple, false=No Cumple, null=N/A
  observation?: string | null
}

// POST /api/forms/[formId]/responses
// Upserta respuestas del formulario y transiciona a IN_PROGRESS si estaba PENDING
export async function POST(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { formId } = await params
  const body = await request.json()
  const { responses } = body as { responses: ResponseItem[] }

  if (!Array.isArray(responses) || responses.length === 0) {
    return Response.json({ error: "Respuestas requeridas" }, { status: 400 })
  }

  // Verifica que el formulario pertenece a la organización
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

  // No se puede editar un formulario ya firmado
  if (formInstance.status === "SIGNED") {
    return Response.json({ error: "El formulario ya fue firmado" }, { status: 409 })
  }

  const now = new Date()

  // Upsert de todas las respuestas enviadas
  await prisma.$transaction(
    responses.map((r) =>
      prisma.checklistResponse.upsert({
        where: {
          formInstanceId_itemCode: {
            formInstanceId: formId,
            itemCode: r.itemCode,
          },
        },
        create: {
          formInstanceId: formId,
          itemCode: r.itemCode,
          itemLabel: r.itemLabel,
          checked: r.checked,
          observation: r.observation ?? null,
          checkedBy: session.user.id,
          checkedAt: now,
        },
        update: {
          checked: r.checked,
          observation: r.observation ?? null,
          checkedBy: session.user.id,
          checkedAt: now,
        },
      })
    )
  )

  // Transición PENDING → IN_PROGRESS al primer guardado
  // Registra quién está llenando el formulario
  if (formInstance.status === "PENDING") {
    await prisma.formInstance.update({
      where: { id: formId },
      data: {
        status: "IN_PROGRESS",
        filledById: session.user.id,
        startedAt: now,
      },
    })
  } else if (!formInstance.filledById) {
    await prisma.formInstance.update({
      where: { id: formId },
      data: { filledById: session.user.id },
    })
  }

  return Response.json({ success: true })
}
