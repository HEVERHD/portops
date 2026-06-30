import { auth } from "@auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { cuid } from "@/lib/cuid"

// GET /api/forms/[formId]/photos
// Lista las fotos del formulario
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  const { formId } = await params

  const photos = await prisma.formPhoto.findMany({
    where: {
      formInstanceId: formId,
      formInstance: { operation: { organizationId: session.user.organizationId } },
    },
    include: { uploadedBy: { select: { name: true } } },
    orderBy: { uploadedAt: "desc" },
  })

  return Response.json({ photos })
}

// POST /api/forms/[formId]/photos
// Sube una foto al formulario (multipart/form-data)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 })

  // Solo supervisores y coordinadores pueden subir fotos
  if (session.user.role === "CLIENT") {
    return Response.json({ error: "Sin permiso" }, { status: 403 })
  }

  const { formId } = await params

  // Verificar que el formulario pertenece a la organización
  const formInstance = await prisma.formInstance.findFirst({
    where: {
      id: formId,
      operation: { organizationId: session.user.organizationId },
    },
    select: { id: true, status: true },
  })

  if (!formInstance) {
    return Response.json({ error: "Formulario no encontrado" }, { status: 404 })
  }

  if (formInstance.status === "SIGNED") {
    return Response.json({ error: "El formulario ya fue firmado" }, { status: 409 })
  }

  // Parsear FormData
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return Response.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const file = formData.get("photo") as File | null
  if (!file || file.size === 0) {
    return Response.json({ error: "No se recibió ninguna foto" }, { status: 400 })
  }

  // Validar tipo de archivo
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Solo se permiten imágenes" }, { status: 400 })
  }

  // Limitar tamaño a 10 MB
  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: "La foto supera el límite de 10 MB" }, { status: 413 })
  }

  // Metadatos GPS
  const lat      = formData.get("lat")
  const lng      = formData.get("lng")
  const accuracy = formData.get("accuracy")

  // IP y User-Agent del request
  const ip = (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "desconocida"
  )
  const ua = req.headers.get("user-agent") ?? undefined

  // Guardar archivo en public/uploads/photos/{formId}/
  const ext      = file.type === "image/png" ? "png" : "jpg"
  const photoId  = cuid()
  const fileName = `${photoId}.${ext}`
  const dir      = join(process.cwd(), "public", "uploads", "photos", formId)
  const filePath = join(dir, fileName)
  const publicUrl = `/uploads/photos/${formId}/${fileName}`

  await mkdir(dir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filePath, buffer)

  // Guardar en BD
  const photo = await prisma.formPhoto.create({
    data: {
      formInstanceId: formId,
      uploadedById:   session.user.id,
      url:            publicUrl,
      fileName,
      latitude:       lat  ? parseFloat(lat  as string) : null,
      longitude:      lng  ? parseFloat(lng  as string) : null,
      accuracy:       accuracy ? parseFloat(accuracy as string) : null,
      ipAddress:      ip,
      userAgent:      ua,
    },
    include: { uploadedBy: { select: { name: true } } },
  })

  return Response.json({ photo })
}
