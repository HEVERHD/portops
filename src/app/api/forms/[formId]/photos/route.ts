import { auth } from "@auth"
import { prisma } from "@/lib/prisma"
import { cloudinary } from "@/lib/cloudinary"
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

  // Subir a Cloudinary
  const photoId = cuid()
  const buffer  = Buffer.from(await file.arrayBuffer())

  const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder:    `portops/forms/${formId}`,
            public_id: photoId,
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result) return reject(error ?? new Error("Upload failed"))
            resolve(result as { secure_url: string; public_id: string })
          }
        )
        .end(buffer)
    }
  )

  const fileName  = `${photoId}.${file.type === "image/png" ? "png" : "jpg"}`
  const publicUrl = uploadResult.secure_url

  // Guardar en BD
  const photo = await prisma.formPhoto.create({
    data: {
      formInstanceId: formId,
      uploadedById:   session.user.id,
      url:            publicUrl,
      fileName,
      latitude:       lat      ? parseFloat(lat      as string) : null,
      longitude:      lng      ? parseFloat(lng      as string) : null,
      accuracy:       accuracy ? parseFloat(accuracy as string) : null,
      ipAddress:      ip,
      userAgent:      ua,
    },
    include: { uploadedBy: { select: { name: true } } },
  })

  return Response.json({ photo })
}
