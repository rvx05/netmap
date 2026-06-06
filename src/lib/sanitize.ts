let purify: Awaited<ReturnType<typeof DOMPurifyInit>> | null = null

async function DOMPurifyInit() {
  const { JSDOM } = await import("jsdom")
  const DOMPurify = (await import("dompurify")).default
  const window = new JSDOM("").window
  return DOMPurify(window as any)
}

export async function sanitize(input: string): Promise<string> {
  if (!purify) {
    purify = await DOMPurifyInit()
  }
  return purify.sanitize(input)
}
