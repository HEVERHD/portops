import { auth } from "@auth"
import { prisma } from "@/lib/prisma"
import { getAllItemCodes, FORM_DEFINITIONS } from "@/lib/form-definitions"
import type { FormType } from "@/generated/prisma/client"

// POST /api/forms/[formId]/complete
// Marca como COMPLETED. Para checklist: verifica todos los ítems. Para ATS: verifica formData.
export async function POST(
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
      responses: { select: { itemCode: true } },
    },
  })

  if (!formInstance) {
    return Response.json({ error: "Formulario no encontrado" }, { status: 404 })
  }

  if (formInstance.status === "SIGNED") {
    return Response.json({ error: "El formulario ya fue firmado" }, { status: 409 })
  }

  if (formInstance.status === "COMPLETED") {
    return Response.json({ success: true, alreadyCompleted: true })
  }

  const definition = FORM_DEFINITIONS[formInstance.formType as FormType]

  // ── Formularios ATS: validar actividad + al menos 1 paso
  if (definition?.customType === "ATS") {
    const data = formInstance.formData as {
      activity?: string
      rows?: unknown[]
    } | null

    if (!data?.activity?.trim()) {
      return Response.json(
        { error: "Debe describir la actividad a ejecutar" },
        { status: 422 }
      )
    }
    if (!data?.rows?.length) {
      return Response.json(
        { error: "Debe agregar al menos un paso en el ATS" },
        { status: 422 }
      )
    }
  } else if (definition?.customType === "TABLA") {
    // ── Formularios de tabla: validar que exista al menos 1 fila con datos
    const data = formInstance.formData as {
      rows?: Record<string, string>[]
    } | null

    const hasData = data?.rows?.some((row) =>
      Object.entries(row)
        .filter(([k]) => k !== "_id")
        .some(([, v]) => v?.trim?.())
    )

    if (!hasData) {
      return Response.json(
        { error: "Debe ingresar al menos un registro en la tabla" },
        { status: 422 }
      )
    }
  } else {
    // ── Formularios checklist: verificar que todos los ítems tienen respuesta
    const requiredCodes = getAllItemCodes(formInstance.formType as FormType)
    const answeredCodes = new Set(formInstance.responses.map((r) => r.itemCode))
    const missing = requiredCodes.filter((c) => !answeredCodes.has(c))

    if (missing.length > 0) {
      return Response.json(
        { error: `Faltan ${missing.length} ítem(s) por responder`, missing },
        { status: 422 }
      )
    }
  }

  await prisma.formInstance.update({
    where: { id: formId },
    data: { status: "COMPLETED", completedAt: new Date() },
  })

  return Response.json({ success: true })
}
