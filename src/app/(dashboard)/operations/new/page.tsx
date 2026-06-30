import { auth } from "@auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import NewOperationForm from "@/components/operations/NewOperationForm"

export default async function NewOperationPage() {
  const session = await auth()
  if (!session) return null

  if (!["ADMIN", "COORDINATOR"].includes(session.user.role)) {
    redirect("/operations")
  }

  const ships = await prisma.ship.findMany({
    where:   { organizationId: session.user.organizationId },
    orderBy: { name: "asc" },
  })

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-lg md:text-xl font-bold text-white">Nueva operación</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Los formularios se generarán automáticamente según el tipo y cantidad de servicios
        </p>
      </div>
      <NewOperationForm ships={ships} />
    </div>
  )
}
