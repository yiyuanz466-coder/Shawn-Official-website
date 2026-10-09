type StoreName = 'local' | 'session'

function store(name: StoreName): Storage {
  return name === 'local' ? window.localStorage : window.sessionStorage
}

/** 無痕模式或瀏覽器封鎖儲存空間時會丟錯，這裡一律吞掉，讓網站照常運作。 */
export function readStorage(key: string, name: StoreName = 'local'): string | null {
  try {
    return store(name).getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string, name: StoreName = 'local'): void {
  try {
    store(name).setItem(key, value)
  } catch {
    // 無法儲存時就不記住偏好
  }
}
