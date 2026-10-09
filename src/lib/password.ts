import { PROTECTED_PASSWORD_SHA256 } from '../config'
import { readStorage, writeStorage } from './storage'

const KEY = 'case-unlocked'

async function sha256(text: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** crypto.subtle 只在 https 或 localhost 可用；其他情況一律視為密碼錯誤。 */
export async function checkPassword(input: string): Promise<boolean> {
  try {
    return (await sha256(input.trim())) === PROTECTED_PASSWORD_SHA256
  } catch {
    return false
  }
}

export const isUnlocked = () => readStorage(KEY, 'session') === '1'
export const markUnlocked = () => writeStorage(KEY, '1', 'session')
