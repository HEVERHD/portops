import { auth } from "@auth"
import { prisma } from "@/lib/prisma"
import { OPERATION_TEMPLATES } from "@/lib/operation-templates"
import type { OperationStatus, OperationType, FormStatus } from "@/generated/prisma/client"
import { CheckCircle2, FileText, TrendingUp, Ship } from "lucide-react"
import Link from "next/link"

const STATUS_LABELS: Record<OperationStatus, string> = {
  OPEN:        "Abierta",
  IN_PROGRESS: "En curso",
  COMPLETED:   "Completada",
  CLOSED:      "Cerrada",
}

const STATUS_STYLES: Record<OperationStatus, string> = {
  OPEN:        "bg-blue-500/10 text-blue-400 border-blue-500/20",
  IN_PROGRESS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  COMPLETED:   "bg-green-500/10 text-green-400 border-green-500/20",
  CLOSED:      "bg-slate-500/10 text-slate-400 border-slate-500/20",
}

function progressOf(forms: { status: FormStatus }[]) {
  if (!forms.length) return 0
  const done = forms.filter((f) => f.status === "COMPLETED" || f.status === "SIGNED").length
  return Math.round((done / forms.length) * 100)
}

export default async function ReportsPage() {
  const session = await auth()
  if (!session) return null

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const operations = await prisma.operation.findMany({
    where: {
      organizationId: session.user.organizationId,
      date: { gte: monthStart, lte: monthEnd },
    },
    include: {
      ship:          { select: { name: true } },
      formInstances: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  // ─── Aggregations ────────────────────────────────────────────────────────────
  const totalOps     = operations.length
  const completedOps = operations.filter(
    (o) => o.status === "COMPLETED" || o.status === "CLOSED"
  ).length

  const allForms       = operations.flatMap((o) => o.formInstances)
  const totalForms     = allForms.length
  const signedForms    = allForms.filter((f) => f.status === "SIGNED").length
  const completedForms = allForms.filter(
    (f) => f.status === "COMPLETED" || f.status === "SIGNED"
  ).length
  const completionRate = totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0

  const byType = Object.entries(
    operations.reduce<Record<string, number>>((acc, op) => {
      acc[op.type] = (acc[op.type] ?? 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])

  const formsByStatus = allForms.reduce<Record<string, number>>((acc, f) => {
    acc[f.status] = (acc[f.status] ?? 0) + 1
    return acc
  }, {})

  const monthLabel = now.toLocaleDateString("es-CO", { month: "long", year: "numeric" })

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-lg md:text-xl font-bold text-white">Reportes</h1>
        <p className="text-sm text-slate-400 mt-0.5 capitalize">{monthLabel}</p>
      </div>

      {/* KPI Cards — 2 cols on mobile, 4 on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
        <KpiCard
          label="Total operaciones"
          value={totalOps}
          icon={<Ship className="w-4 h-4" />}
          color="blue"
        />
        <KpiCard
          label="Completadas"
          value={completedOps}
          sub={totalOps > 0 ? `${Math.round((completedOps / totalOps) * 100)}% del total` : "—"}
          icon={<CheckCircle2 className="w-4 h-4" />}
          color="green"
        />
        <KpiCard
          label="Formularios firmados"
          value={signedForms}
          sub={`de ${totalForms} totales`}
          icon={<FileText className="w-4 h-4" />}
          color="violet"
        />
        <KpiCard
          label="Cumplimiento"
          value={`${completionRate}%`}
          sub="formularios completados"
          icon={<TrendingUp className="w-4 h-4" />}
          color="amber"
        />
      </div>

      {/* Middle row — 1 col on mobile, 2 on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 mb-5">
        {/* By type */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Operaciones por tipo</h2>
          {byType.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">Sin datos este mes</p>
          ) : (
            <div className="space-y-3">
              {byType.map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-300 truncate pr-2">
                      {OPERATION_TEMPLATES[type as OperationType]?.label ?? type}
                    </span>
                    <span className="text-slate-400 shrink-0">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.round((count / totalOps) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form status breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Estado de formularios</h2>
          {totalForms === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">Sin formularios este mes</p>
          ) : (
            <div className="space-y-3">
              {(
                [
                  ["SIGNED",      "Firmados",     "bg-green-500",  "text-green-400"],
                  ["COMPLETED",   "Completados",  "bg-blue-500",   "text-blue-400"],
                  ["IN_PROGRESS", "En progreso",  "bg-amber-500",  "text-amber-400"],
                  ["PENDING",     "Pendientes",   "bg-slate-600",  "text-slate-400"],
                ] as const
              ).map(([status, label, barColor, textColor]) => {
                const count = formsByStatus[status] ?? 0
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className={textColor}>{label}</span>
                      <span className="text-slate-400">
                        {count} <span className="text-slate-600">/ {totalForms}</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full`}
                        style={{ width: `${Math.round((count / totalForms) * 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent operations */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5">
        <h2 className="text-sm font-semibold text-white mb-4">
          Operaciones recientes{" "}
          <span className="text-slate-500 font-normal">
            ({Math.min(operations.length, 10)} de {operations.length})
          </span>
        </h2>

        {operations.length === 0 ? (
          <p className="text-slate-500 text-sm py-4 text-center">Sin operaciones este mes</p>
        ) : (
          <div className="space-y-1">
            {operations.slice(0, 10).map((op) => {
              const progress = progressOf(op.formInstances)
              return (
                <Link
                  key={op.id}
                  href={`/operations/${op.id}`}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-800
                             active:bg-slate-800 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{op.ship.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {OPERATION_TEMPLATES[op.type as OperationType]?.label ?? op.type} · {op.shift}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 shrink-0 hidden sm:block">
                    {new Date(op.date).toLocaleDateString("es-CO", {
                      day:   "numeric",
                      month: "short",
                    })}
                  </p>

                  <div className="w-14 shrink-0 hidden xs:block">
                    <p className="text-xs text-slate-500 mb-1 text-right">{progress}%</p>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0
                                ${STATUS_STYLES[op.status as OperationStatus]}`}
                  >
                    {STATUS_LABELS[op.status as OperationStatus]}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
const KPI_COLORS = {
  blue:   { bg: "bg-blue-500/10",   icon: "text-blue-400",   value: "text-blue-400" },
  green:  { bg: "bg-green-500/10",  icon: "text-green-400",  value: "text-green-400" },
  amber:  { bg: "bg-amber-500/10",  icon: "text-amber-400",  value: "text-amber-400" },
  violet: { bg: "bg-violet-500/10", icon: "text-violet-400", value: "text-violet-400" },
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  color: keyof typeof KPI_COLORS
}) {
  const c = KPI_COLORS[color]
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5">
      <div className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center mb-3 ${c.icon}`}>
        {icon}
      </div>
      <p className={`text-2xl font-bold ${c.value}`}>{value}</p>
      <p className="text-xs text-white font-medium mt-0.5 leading-tight">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}
