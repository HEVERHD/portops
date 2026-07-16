import { auth } from "@auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Users } from "lucide-react"
import { WorkersManager } from "@/components/workers/WorkersManager"

export default async function WorkersPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const canManage = ["ADMIN", "COORDINATOR"].includes(session.user.role)

  const workers = await prisma.worker.findMany({
    where: { organizationId: session.user.organizationId, active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, cedula: true, role: true, signatureData: true },
  })

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-orange-600/20 rounded-xl flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Banco de Trabajadores</h1>
          <p className="text-xs text-slate-400">
            {workers.length} trabajador{workers.length !== 1 ? "es" : ""} registrado{workers.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <WorkersManager initialWorkers={workers} canManage={canManage} />
    </div>
  )
}
