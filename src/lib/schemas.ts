import { z } from "zod"

export const scanInputSchema = z.object({
  targetName: z
    .string()
    .min(1, "Scan name is required")
    .max(100, "Scan name must be under 100 characters")
    .trim(),
  rawOutput: z
    .string()
    .min(1, "Raw Nmap output is required")
    .max(50000, "Raw output exceeds the 50,000 character limit")
    .trim(),
  tags: z.string().optional(),
})

export type ScanInput = z.infer<typeof scanInputSchema>

export const aiReportSchema = z.object({
  attackPath: z
    .string()
    .describe("Plain-English explanation of the compromise sequence based on open ports."),
  remediationCode: z
    .string()
    .describe("Copy-pasteable, syntax-correct firewall or security rule to mitigate the vulnerability."),
  codeType: z
    .enum(["iptables", "ufw", "aws_sg", "other"])
    .describe("The specific type of remediation code provided for syntax highlighting."),
})

export type AiReport = z.infer<typeof aiReportSchema>
