import { auth } from "@auth"
import { prisma } from "@/lib/prisma"

// DELETE /api/ships/[id] — elimina un barco (solo ADMIN, sin operaciones)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  if (!["ADMIN", "COORDINATOR"].includes(session.user.role)) {
    return Response.json({ error: "Sin permisos para eliminar naves" }, { status: 403 })
  }

  const { id } = await params

  const ship = await prisma.ship.findFirst({
    where: { id, organizationId: session.user.organizationId },
    include: { _count: { select: { operations: true } } },
  })

  if (!ship) {
    return Response.json({ error: "Barco no encontrado" }, { status: 404 })
  }

  if (ship._count.operations > 0) {
    return Response.json(
      { error: "No se puede eliminar una nave con operaciones registradas" },
      { status: 409 }
    )
  }

  await prisma.ship.delete({ where: { id } })

  return Response.json({ success: true })
}
