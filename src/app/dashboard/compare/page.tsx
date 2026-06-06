import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CompareView } from "@/components/scans/CompareView"
import type { ParsedNetworkData, AiReport } from "@/types"

export default async function ComparePage(props: {
  searchParams?: Promise<{ ids?: string }>
}) {
  const searchParams = await props.searchParams
  const idsParam = searchParams?.ids

  if (!idsParam || !idsParam.includes(",")) {
    redirect("/dashboard")
  }

  const [id1, id2] = idsParam.split(",").map((s) => s.trim())
  if (!id1 || !id2) redirect("/dashboard")

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: scan1 } = await supabase
    .from("scans")
    .select("id, target_name, created_at, parsed_data, ai_report, user_id")
    .eq("id", id1)
    .single()

  const { data: scan2 } = await supabase
    .from("scans")
    .select("id, target_name, created_at, parsed_data, ai_report, user_id")
    .eq("id", id2)
    .single()

  if (!scan1 || !scan2) notFound()

  if (scan1.user_id !== user.id || scan2.user_id !== user.id) {
    redirect("/dashboard")
  }

  return (
    <div className="py-6">
      <CompareView
        scan1={{
          id: scan1.id,
          target_name: scan1.target_name,
          created_at: scan1.created_at,
          parsed_data: scan1.parsed_data as unknown as ParsedNetworkData,
          ai_report: scan1.ai_report as unknown as AiReport | null,
        }}
        scan2={{
          id: scan2.id,
          target_name: scan2.target_name,
          created_at: scan2.created_at,
          parsed_data: scan2.parsed_data as unknown as ParsedNetworkData,
          ai_report: scan2.ai_report as unknown as AiReport | null,
        }}
      />
    </div>
  )
}
