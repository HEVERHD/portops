import { auth } from "@auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/operations/[id]">
) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await ctx.params

  const operation = await prisma.operation.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      ship: true,
      services: { orderBy: { number: "asc" } },
      formInstances: {
        include: {
          service: true,
          filledBy: { select: { id: true, name: true } },
          supervisor: { select: { id: true, name: true } },
          _count: {
            select: {
              responses: true,
              signatures: true,
            },
          },
        },
        orderBy: [{ scope: "asc" }, { serviceId: "asc" }, { formType: "asc" }],
      },
    },
  })

  if (!operation) return Response.json({ error: "No encontrado" }, { status: 404 })

  return Response.json(operation)
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/operations/[id]">
) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  if (!["ADMIN", "COORDINATOR"].includes(session.user.role)) {
    return Response.json({ error: "Sin permisos" }, { status: 403 })
  }

  const { id } = await ctx.params
  const body = await request.json()
  const { status, notes } = body as { status?: string; notes?: string }

  const operation = await prisma.operation.updateMany({
    where: { id, organizationId: session.user.organizationId },
    data: { ...(status && { status: status as never }), ...(notes !== undefined && { notes }) },
  })

  if (operation.count === 0) {
    return Response.json({ error: "No encontrado" }, { status: 404 })
  }

  return Response.json({ success: true })
}
