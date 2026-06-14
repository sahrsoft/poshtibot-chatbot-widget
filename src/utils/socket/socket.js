import { io } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL
const SOCKET_OPTIONS = {
  path: '/fsocket/socket.io',
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5
}

let socket = null
let currentUserId = null
let connectionListeners = []

function notifyListeners(event, ...args) {
  for (const listener of connectionListeners) {
    try {
      listener(event, ...args)
    } catch {
      // Swallow listener errors
    }
  }
}

export function getSocket(userId) {
  if (!userId) return null

  if (socket && currentUserId !== userId) {
    disconnectSocket()
  }

  if (!socket) {
    socket = io(SOCKET_URL, SOCKET_OPTIONS)
    currentUserId = userId

    socket.on('connect', () => {
      notifyListeners('connect', socket.id)
    })

    socket.on('disconnect', (reason) => {
      notifyListeners('disconnect', reason)
    })

    socket.on('connect_error', (err) => {
      notifyListeners('connect_error', err.message)
    })
  }

  return socket
}

export function getCurrentSocket() {
  return socket
}

export function onConnectionEvent(listener) {
  connectionListeners.push(listener)
  return () => {
    connectionListeners = connectionListeners.filter((l) => l !== listener)
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
  currentUserId = null
}

export function getCurrentUserId() {
  return currentUserId
}
