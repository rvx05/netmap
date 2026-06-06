import { JSDOM } from "jsdom"
import DOMPurify from "dompurify"
import type { DOMPurify as DOMPurifyType } from "dompurify"

let purify: DOMPurifyType | null = null

export function sanitize(input: string): string {
  if (!purify) {
    const window = new JSDOM("").window
    purify = DOMPurify(window as any)
  }
  return purify.sanitize(input)
}
