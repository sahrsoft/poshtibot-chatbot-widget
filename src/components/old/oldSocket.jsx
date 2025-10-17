import { io } from "socket.io-client"

export default function GetSocket() {
  return io("https://server.poshtibot.com", {
    path: "/fsocket/socket.io",
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  })
}