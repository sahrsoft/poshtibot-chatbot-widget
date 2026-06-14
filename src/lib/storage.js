const STORAGE_PREFIX = 'pbt'

const isBrowser = typeof window !== 'undefined'

function makeKey(...parts) {
  return [STORAGE_PREFIX, ...parts].join(':')
}

export const Keys = {
  config: (cid) => makeKey('config', cid),
  chatData: (cid) => makeKey('chat', cid),
  messages: (cid) => makeKey('msgs', cid),
  starters: (cid) => makeKey('starters', cid)
}

export function createStorage() {
  function getItem(key) {
    if (!isBrowser) return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }

  function setItem(key, value) {
    if (!isBrowser) return false
    try {
      localStorage.setItem(key, value)
      return true
    } catch {
      return false
    }
  }

  function removeItem(key) {
    if (!isBrowser) return
    try {
      localStorage.removeItem(key)
    } catch {
      // Silently fail
    }
  }

  function getJSON(key) {
    const raw = getItem(key)
    if (raw === null || raw === undefined) return undefined
    try {
      return JSON.parse(raw)
    } catch {
      return undefined
    }
  }

  function setJSON(key, value) {
    try {
      return setItem(key, JSON.stringify(value))
    } catch {
      return false
    }
  }

  return { getItem, setItem, removeItem, getJSON, setJSON }
}

export const storage = createStorage()
