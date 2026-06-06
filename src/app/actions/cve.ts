"use server"

interface CveItem {
  id: string
  description: string
  severity: string
  score: number | null
}

interface ServiceCves {
  service: string
  cves: CveItem[]
  error?: string
}

function extractServices(parsedData: {
  nodes: { label: string }[]
  edges: { label: string }[]
}): string[] {
  const seen = new Set<string>()
  for (const edge of parsedData.edges) {
    const m = edge.label.match(/\((.+)\)/)
    if (!m) continue
    const raw = m[1].trim()
    const parts = raw.split(/\s+/)
    const banner = parts.slice(1).join(" ")
    if (banner && !seen.has(banner)) {
      seen.add(banner)
    }
  }
  return Array.from(seen)
}

async function queryNvd(
  keyword: string,
): Promise<CveItem[]> {
  const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=3`

  const res = await fetch(url, {
    headers: { "User-Agent": "NetMapAI/1.0" },
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) return []

  const body = await res.json()
  const vulns = body.vulnerabilities || []

  return vulns.map((v: Record<string, unknown>) => {
    const cve = v.cve as Record<string, unknown>
    const metrics = ((cve.metrics as Record<string, unknown>)?.cvssMetricV31 as Array<Record<string, unknown>> | undefined)?.[0]?.cvssData as Record<string, unknown> | undefined
    return {
      id: cve.id as string,
      description: (cve.descriptions as Array<Record<string, unknown>>)?.find((d) => d.lang === "en")?.value as string || "",
      severity: (metrics?.baseSeverity as string) || "N/A",
      score: (metrics?.baseScore as number) ?? null,
    }
  })
}

export async function lookupCves(
  scanId: string,
): Promise<ServiceCves[]> {
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: scan } = await supabase
    .from("scans")
    .select("parsed_data")
    .eq("id", scanId)
    .single()

  if (!scan) return []

  const services = extractServices(scan.parsed_data as unknown as Parameters<typeof extractServices>[0])
  const results: ServiceCves[] = []

  for (let i = 0; i < Math.min(services.length, 8); i++) {
    try {
      const cves = await queryNvd(services[i])
      results.push({ service: services[i], cves })
    } catch {
      results.push({ service: services[i], cves: [], error: "Query failed" })
    }
    if (i < services.length - 1) {
      await new Promise((r) => setTimeout(r, 600))
    }
  }

  return results
}
