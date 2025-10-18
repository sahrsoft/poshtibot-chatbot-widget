import { io } from "socket.io-client"

let socket
let currentSocketUserId = null // Track which user the socket is for

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL

export default function getSocket(userId) {
  if (!userId) return null

  // 1. If socket exists but for a DIFFERENT user, disconnect and create a new one
  if (socket && currentSocketUserId !== userId) {
    socket.disconnect()
    socket = null
  }

  // 2. If socket doesn't exist (or was just disconnected), create a new one
  if (!socket) {
    socket = io(SOCKET_URL, {
      path: "/fsocket/socket.io",
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,     // Jitter to prevent all clients hammering at once
      // timeout: 20_000
    })

    currentSocketUserId = userId // Store the user for this socket
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    currentSocketUserId = null
  }
}