import { auth } from "@auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import MobileHeader from "@/components/layout/MobileHeader"
import BottomNav from "@/components/layout/BottomNav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="flex h-full">
      {/* Sidebar — visible only on md+ */}
      <Sidebar user={session.user} />

      {/* Right column: header (mobile) + main + bottom nav (mobile) */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <MobileHeader
          organizationName={session.user.organizationName}
          userName={session.user.name ?? ""}
        />

        <main className="flex-1 overflow-auto bg-slate-950">
          {children}
        </main>

        <BottomNav role={session.user.role} />
      </div>
    </div>
  )
}
