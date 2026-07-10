import { auth } from "@auth"
import { prisma } from "@/lib/prisma"

// GET /api/ships — lista los barcos de la organización
export async function GET(_request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const ships = await prisma.ship.findMany({
    where:   { organizationId: session.user.organizationId },
    orderBy: { name: "asc" },
  })

  return Response.json({ ships })
}

// POST /api/ships — crea un barco (solo ADMIN)
export async function POST(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  if (!["ADMIN", "COORDINATOR"].includes(session.user.role)) {
    return Response.json({ error: "Sin permisos para crear naves" }, { status: 403 })
  }

  const body = await request.json()
  const { name, imo, flag } = body as { name?: string; imo?: string; flag?: string }

  if (!name?.trim()) {
    return Response.json({ error: "El nombre de la nave es obligatorio" }, { status: 400 })
  }

  const ship = await prisma.ship.create({
    data: {
      name:           name.trim(),
      imo:            imo?.trim()  || null,
      flag:           flag?.trim() || null,
      organizationId: session.user.organizationId,
    },
  })

  return Response.json({ ship }, { status: 201 })
}
