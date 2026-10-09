import type { z } from 'zod'

export class ContentError extends Error {
  name = 'ContentError'
}

/** 把 Zod 的錯誤整理成「檔案路徑 + 欄位: 訊息」，讓內容作者一眼看出哪裡要改。 */
export function formatIssues(file: string, error: z.ZodError): string {
  const lines = error.issues.map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
  return `${file}\n${lines.join('\n')}`
}
