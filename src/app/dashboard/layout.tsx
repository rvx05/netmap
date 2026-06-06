import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/Sidebar"
import { AutoRefresh } from "@/components/layout/AutoRefresh"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data?.user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AutoRefresh />
      <Sidebar />
      <main className="flex-1 overflow-auto p-4 pt-16 md:pt-4 md:p-8 bg-grid">
        {children}
      </main>
    </div>
  )
}
