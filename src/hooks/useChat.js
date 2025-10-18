"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import getSocket from "@/utils/socket/Socket"

export function useChat({ userId, conversationId }) {
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [pendingForAgent, setPendingForAgent] = useState(false)

  const socketRef = useRef(null)

  // Initialize socket and listeners
  useEffect(() => {
    if (!userId || !conversationId) return

    // Get the singleton socket instance
    const socket = getSocket(userId)
    socketRef.current = socket

    // This handler runs on the *initial* connection AND *every* reconnection.
    const onConnect = () => {
      console.log(`Socket connected: ${socket.id}. Joining room: ${conversationId}`)
      socket.emit("join_room", conversationId)

      socket.emit("register", userId)
    }

    const onError = (error) => console.error("Socket error:", error)

    const onPoshtibotMessage = (message) => {
      const newMessage = { message, sender: "poshtibot", id: Date.now() }
      setMessages((prev) => [...prev, newMessage])
    }

    const onRequestForAgent = (msg) => {
      console.log(msg)
      setPendingForAgent(true)
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

    // --- Debug Listeners (Good to keep) ---
    const onDisconnect = (reason) => console.log('Disconnected:', reason)
    const onReconnectAttempt = (attempt) => console.log(`Reconnection attempt ${attempt}`)
    const onReconnect = (attempt) => console.log(`Successfully reconnected after ${attempt} attempts`)

    socket.on("connect", onConnect)
    socket.on("message:error", onError)
    socket.on("message:poshtibot", onPoshtibotMessage)
    socket.on("message:request_for_agent", onRequestForAgent)
    socket.on("user_typing", onUserTyping)
    socket.on("user_stop_typing", onUserStopTyping)
    socket.on('disconnect', onDisconnect)
    socket.on('reconnect_attempt', onReconnectAttempt)
    socket.on('reconnect', onReconnect)

    // If the socket is already connected when this effect runs,
    // (e.g., `conversationId` changed), manually call onConnect.
    if (socket.connected) {
      onConnect()
    }

    // Cleanup listeners on component unmount
    return () => {
      socket.off("connect", onConnect)
      socket.off("message:error", onError)
      socket.off("message:poshtibot", onPoshtibotMessage)
      socket.off("message:request_for_agent", onRequestForAgent)
      socket.off("user_typing", onUserTyping)
      socket.off("user_stop_typing", onUserStopTyping)
      socket.off('disconnect', onDisconnect)
      socket.off('reconnect_attempt', onReconnectAttempt)
      socket.off('reconnect', onReconnect)
    }
  }, [conversationId, userId])


  const sendUserMessage = useCallback((userFlowsData, conversationId, message) => {
    const socket = socketRef.current
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

  const requestForAgent = useCallback((conversationId) => {
    const socket = socketRef.current
    if (!socket || !userId || !conversationId) {
      console.warn("Cannot send message: socket, userId, or conversationId is missing.")
      return
    }

    socket.emit("request_for_agent", {
      conversation_id: conversationId
    })
  }, [userId])

  const isTyping = typingUsers.length > 0

  return { messages, sendUserMessage, requestForAgent, isTyping, typingUsers, pendingForAgent }
}