"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import getSocket from "@/utils/socket/Socket"

export function useChat({ userId, conversationId }) {
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState([])

  const socketRef = useRef(null)

  // Initialize socket and listeners
  useEffect(() => {
    if (!userId) return

    // Get the singleton socket instance
    const socket = getSocket()
    socketRef.current = socket

    const onConnect = () => console.log("Socket connected:", socket.id)
    const onError = (error) => console.error("Socket error:", error)

    const onPoshtibotMessage = (message) => {
      const newMessage = { message, sender: "poshtibot", id: Date.now() }
      setMessages((prev) => [...prev, newMessage])
    }

    // --- Typing Indicator Handlers ---
    const onUserTyping = ({ userId: typingUserId }) => {
      setTypingUsers((prev) =>
        prev.includes(typingUserId) ? prev : [...prev, typingUserId]
      )
    }

    // The logic is now correct. It only stops "typing" if no one is left.
    const onUserStopTyping = ({ userId: typingUserId }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== typingUserId))
    }

    socket.on("connect", onConnect)
    socket.on("message:error", onError)
    socket.on("message:poshtibot", onPoshtibotMessage)
    socket.on("user_typing", onUserTyping)
    socket.on("user_stop_typing", onUserStopTyping)

    // Cleanup listeners on component unmount
    return () => {
      socket.off("connect", onConnect)
      socket.off("message:error", onError)
      socket.off("message:poshtibot", onPoshtibotMessage)
      socket.off("user_typing", onUserTyping)
      socket.off("user_stop_typing", onUserStopTyping)
    }
  }, [userId])

  // Join the room once when conversationId is available
  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return
    if (!userId) return

    socket.emit("register", userId)

    if (socketRef.current && conversationId) {
      console.log(`Joining room: ${conversationId}`)
      socketRef.current.emit("join_room", conversationId)
    }
  }, [conversationId, userId])


  const sendUserMessage = useCallback((userFlowsData, conversationId, message) => {
    const socket = socketRef.current;
    if (!socket || !userId || !conversationId) {
      console.warn("Cannot send message: socket, userId, or conversationId is missing.")
      return
    }

    socket.emit("user_message", {
      user_flows_data: userFlowsData,
      conversation_id: conversationId,
      message
    })
  }, [userId])

  const isTyping = typingUsers.length > 0

  return { messages, sendUserMessage, isTyping, typingUsers }
}