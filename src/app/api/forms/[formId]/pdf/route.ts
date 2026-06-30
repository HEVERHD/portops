import { auth } from "@auth"
import { prisma } from "@/lib/prisma"
import { FORM_DEFINITIONS } from "@/lib/form-definitions"
import { generatePDF } from "@/lib/pdf/generate"
import type { FormType } from "@/generated/prisma/client"

// GET /api/forms/[formId]/pdf
// Genera y retorna el PDF del formulario
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
      operation: { include: { ship: true } },
      service: true,
      filledBy:   { select: { id: true, name: true } },
      supervisor: { select: { id: true, name: true } },
      signatures: {
        include: { signedBy: { select: { id: true, name: true } } },
        orderBy: { signedAt: "asc" },
      },
      responses: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!formInstance) {
    return Response.json({ error: "Formulario no encontrado" }, { status: 404 })
  }

  const definition = FORM_DEFINITIONS[formInstance.formType as FormType]
  if (!definition) {
    return Response.json({ error: "Definición no encontrada" }, { status: 404 })
  }

  try {
    const pdfBuffer = await generatePDF({ formInstance })

    const filename = `${definition.formCode}_${formInstance.operation.ship.name.replace(/\s+/g, "_")}_${
      new Date(formInstance.operation.date).toISOString().slice(0, 10)
    }.pdf`

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (err) {
    console.error("[PDF generation error]", err)
    return Response.json({ error: "Error al generar el PDF" }, { status: 500 })
  }
}
