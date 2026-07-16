import { auth } from "@auth"
import { prisma } from "@/lib/prisma"

// GET /api/workers — lista todos los trabajadores activos de la organización
export async function GET(_req: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const workers = await prisma.worker.findMany({
    where: { organizationId: session.user.organizationId, active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, cedula: true, role: true, signatureData: true },
  })

  return Response.json({ workers })
}

// POST /api/workers — crea un nuevo trabajador
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  if (!["ADMIN", "COORDINATOR"].includes(session.user.role)) {
    return Response.json({ error: "Sin permisos para crear trabajadores" }, { status: 403 })
  }

  const body = await req.json()
  const { name, cedula, role, signatureData } = body as {
    name: string
    cedula: string
    role?: string
    signatureData?: string
  }

  if (!name?.trim() || !cedula?.trim()) {
    return Response.json({ error: "Nombre y cédula son requeridos" }, { status: 400 })
  }

  const existing = await prisma.worker.findFirst({
    where: {
      cedula: cedula.trim(),
      organizationId: session.user.organizationId,
      active: true,
    },
  })
  if (existing) {
    return Response.json({ error: "Ya existe un trabajador con esa cédula" }, { status: 409 })
  }

  const worker = await prisma.worker.create({
    data: {
      name: name.trim(),
      cedula: cedula.trim(),
      role: role?.trim() || null,
      signatureData: signatureData || null,
      organizationId: session.user.organizationId,
    },
    select: { id: true, name: true, cedula: true, role: true, signatureData: true },
  })

  return Response.json({ worker }, { status: 201 })
}
