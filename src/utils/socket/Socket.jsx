import { io } from "socket.io-client"

let socket
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL

export default function getSocket() {
  if (!socket) {
  socket = io(SOCKET_URL, {
    path: "/fsocket/socket.io",
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  })
}
  return socket
}

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}