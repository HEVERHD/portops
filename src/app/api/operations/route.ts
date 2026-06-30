import { NextRequest } from "next/server"
import { auth } from "@auth"
import { prisma } from "@/lib/prisma"
import { OPERATION_TEMPLATES } from "@/lib/operation-templates"
import type { OperationType } from "@/generated/prisma/client"

// GET /api/operations — lista operaciones del día (o por fecha)
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = request.nextUrl
  const dateParam = searchParams.get("date")

  const date = dateParam ? new Date(dateParam) : new Date()
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  const operations = await prisma.operation.findMany({
    where: {
      organizationId: session.user.organizationId,
      date: { gte: start, lte: end },
    },
    include: {
      ship: true,
      services: { orderBy: { number: "asc" } },
      formInstances: {
        select: {
          id: true,
          formType: true,
          scope: true,
          status: true,
          serviceId: true,
          filledById: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return Response.json(operations)
}

// POST /api/operations — crea operación + genera formularios automáticamente
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  // Solo ADMIN y COORDINATOR pueden crear operaciones
  if (!["ADMIN", "COORDINATOR"].includes(session.user.role)) {
    return Response.json({ error: "Sin permisos" }, { status: 403 })
  }

  const body = await request.json()
  const { type, shipId, shift, serviceCount, notes } = body as {
    type: OperationType
    shipId: string
    shift: string
    serviceCount: number
    notes?: string
  }

  if (!type || !shipId || !shift || !serviceCount) {
    return Response.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }

  if (serviceCount < 1 || serviceCount > 10) {
    return Response.json({ error: "Número de servicios inválido (1-10)" }, { status: 400 })
  }

  const template = OPERATION_TEMPLATES[type]
  if (!template) {
    return Response.json({ error: "Tipo de operación inválido" }, { status: 400 })
  }

  // Verifica que el barco pertenece a la organización
  const ship = await prisma.ship.findFirst({
    where: { id: shipId, organizationId: session.user.organizationId },
  })
  if (!ship) return Response.json({ error: "Barco no encontrado" }, { status: 404 })

  // Transacción: operación + servicios + formularios
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const operation = await prisma.$transaction(async (tx: any) => {
    // 1. Crear operación
    const op = await tx.operation.create({
      data: {
        type,
        shift,
        notes,
        shipId,
        organizationId: session.user.organizationId,
        status: "OPEN",
      },
    })

    // 2. Crear servicios
    const services = await Promise.all(
      Array.from({ length: serviceCount }, (_, i) =>
        tx.service.create({
          data: {
            operationId: op.id,
            number: i + 1,
            label: `Servicio ${i + 1}`,
          },
        })
      )
    )

    // 3. Generar formularios según la plantilla
    const formData = []

    for (const formTemplate of template.forms) {
      if (formTemplate.scope === "PER_OPERATION") {
        formData.push({
          formType: formTemplate.formType,
          scope: formTemplate.scope,
          requiresSignature: formTemplate.requiresSignature,
          operationId: op.id,
          serviceId: null,
          status: "PENDING" as const,
        })
      } else {
        // PER_SERVICE: una instancia por cada servicio
        for (const service of services) {
          formData.push({
            formType: formTemplate.formType,
            scope: formTemplate.scope,
            requiresSignature: formTemplate.requiresSignature,
            operationId: op.id,
            serviceId: service.id,
            status: "PENDING" as const,
          })
        }
      }
    }

    await tx.formInstance.createMany({ data: formData })

    return op
  })

  const created = await prisma.operation.findUnique({
    where: { id: (operation as { id: string }).id },
    include: {
      ship: true,
      services: { orderBy: { number: "asc" } },
      formInstances: {
        select: {
          id: true,
          formType: true,
          scope: true,
          status: true,
          serviceId: true,
        },
        orderBy: [{ scope: "asc" }, { formType: "asc" }],
      },
    },
  })

  return Response.json(created, { status: 201 })
}
