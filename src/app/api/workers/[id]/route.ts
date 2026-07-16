import { auth } from "@auth"
import { prisma } from "@/lib/prisma"

// PUT /api/workers/[id] — actualiza nombre, cédula, cargo y/o firma
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  if (!["ADMIN", "COORDINATOR"].includes(session.user.role)) {
    return Response.json({ error: "Sin permisos" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, cedula, role, signatureData } = body as {
    name?: string
    cedula?: string
    role?: string
    signatureData?: string | null
  }

  const worker = await prisma.worker.findFirst({
    where: { id, organizationId: session.user.organizationId },
  })
  if (!worker) {
    return Response.json({ error: "Trabajador no encontrado" }, { status: 404 })
  }

  const updated = await prisma.worker.update({
    where: { id },
    data: {
      ...(name            && { name: name.trim() }),
      ...(cedula          && { cedula: cedula.trim() }),
      ...(role !== undefined && { role: role?.trim() || null }),
      ...(signatureData !== undefined && { signatureData: signatureData || null }),
    },
    select: { id: true, name: true, cedula: true, role: true, signatureData: true },
  })

  return Response.json({ worker: updated })
}

// DELETE /api/workers/[id] — elimina un trabajador
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  if (!["ADMIN", "COORDINATOR"].includes(session.user.role)) {
    return Response.json({ error: "Sin permisos" }, { status: 403 })
  }

  const { id } = await params

  const worker = await prisma.worker.findFirst({
    where: { id, organizationId: session.user.organizationId },
  })
  if (!worker) {
    return Response.json({ error: "Trabajador no encontrado" }, { status: 404 })
  }

  await prisma.worker.delete({ where: { id } })

  return Response.json({ success: true })
}
