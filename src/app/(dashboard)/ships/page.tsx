import { auth } from "@auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Ship } from "lucide-react"
import { ShipsManager } from "@/components/ships/ShipsManager"

export default async function ShipsPage() {
  const session = await auth()
  if (!session) return null

  if (!["ADMIN", "COORDINATOR"].includes(session.user.role)) redirect("/operations")

  const ships = await prisma.ship.findMany({
    where:   { organizationId: session.user.organizationId },
    orderBy: { name: "asc" },
    include: { _count: { select: { operations: true } } },
  })

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-600/15 border border-orange-700/30 rounded-xl
                        flex items-center justify-center">
          <Ship className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Naves registradas</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Administra las motonaves disponibles para crear operaciones
          </p>
        </div>
      </div>

      <ShipsManager initialShips={ships} canManage={["ADMIN", "COORDINATOR"].includes(session.user.role)} />
    </div>
  )
}
