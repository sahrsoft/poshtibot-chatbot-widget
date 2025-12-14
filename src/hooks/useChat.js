"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import getSocket from "@/utils/socket/socket"
import { LOCAL_STORAGE_CHAT_DATA_KEY } from "@/lib/constants"

export function useChat({ chatbotId, userId, chatId }) {
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState([])
  const [agentStatus, setAgentStatus] = useState("none")
  const [agentName, setAgentName] = useState("")

  const socketRef = useRef(null)

  // Initialize socket and listeners
  useEffect(() => {
    if (!chatbotId || !userId || !chatId) return

    // Get the singleton socket instance
    const socket = getSocket(userId)
    socketRef.current = socket

    // This handler runs on the *initial* connection AND *every* reconnection.
    const onConnect = () => {
      console.log(`Socket connected: ${socket.id}. Joining room: ${chatId}`)
      // socket.emit("join_room", chatId)
      // socket.emit("user_start_chat", chatbotId, userId)

      socket.emit("user:start_chat", {
        chatbot_id: chatbotId,
        chat_id: chatId
      })

      // socket.emit("register", userId)
    }

    const onAgentAssigned = (data) => {
      console.log("Agent assigned:", data)
      setAgentStatus("joined")
      setAgentName(data.agent_name ?? "پشتیبان")
      const chatData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CHAT_DATA_KEY))
      const updated = {
        ...chatData,
        agent_status: "joined",
        agent_name: data.agent_name ?? "پشتیبان"
      }
      chatData && localStorage.setItem(LOCAL_STORAGE_CHAT_DATA_KEY, JSON.stringify(updated))
    }

    const onAgentMessage = (data) => {
      console.log("Agent sent:", data)
      const newMessage = { message: data, sender: agentName, id: Date.now() }
      setMessages((prev) => [...prev, newMessage])
    }

    const onError = (error) => console.error("Socket error:", error)

    const onPoshtibotMessage = (message) => {
      console.log(message)
      const newMessage = { message, sender: "poshtibot", id: Date.now() }
      setMessages((prev) => [...prev, newMessage])
    }

    const onRequestForAgent = (msg) => {
      console.log(msg)
      setAgentStatus("pending")
    }

    const onCancelRequestForAgent = (msg) => {
      console.log(msg)
      setAgentStatus("none")
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
    socket.on("chat:assigned", onAgentAssigned)
    socket.on("message:agent", onAgentMessage)



    socket.on("message:error", onError)
    socket.on("message:poshtibot", onPoshtibotMessage)
    socket.on("message:request_for_agent", onRequestForAgent)
    socket.on("message:cancel_request_for_agent", onCancelRequestForAgent)
    socket.on("poshtibot:typing", onUserTyping)
    socket.on("poshtibot:stop_typing", onUserStopTyping)
    socket.on('disconnect', onDisconnect)
    socket.on('reconnect_attempt', onReconnectAttempt)
    socket.on('reconnect', onReconnect)

    socket.onAny((event, ...args) => {
      console.log(`Socket event: ${event}`, args)
    })

    // If the socket is already connected when this effect runs,
    // (e.g., `chatId` changed), manually call onConnect.
    if (socket.connected) {
      onConnect()
    }

    // Cleanup listeners on component unmount
    return () => {
      socket.off("connect", onConnect)
      socket.off("chat:assigned", onAgentAssigned)
      socket.off("message:agent", onAgentMessage)

      socket.off("message:error", onError)
      socket.off("message:poshtibot", onPoshtibotMessage)
      socket.off("message:request_for_agent", onRequestForAgent)
      socket.off("message:cancel_request_for_agent", onRequestForAgent)
      socket.off("poshtibot:typing", onUserTyping)
      socket.off("poshtibot:stop_typing", onUserStopTyping)
      socket.off('disconnect', onDisconnect)
      socket.off('reconnect_attempt', onReconnectAttempt)
      socket.off('reconnect', onReconnect)
    }
  }, [chatbotId, chatId, userId, agentName])


  const sendUserMessage = useCallback((userFlowsData, chatId, message) => {
    const socket = socketRef.current
    if (!socket || !userId || !chatId) {
      console.warn("Cannot send message: socket, userId, or chatId is missing.")
      return
    }

    // socket.emit("user_message", {
    //   to_agent: agentStatus === "joined",
    //   user_flows_data: userFlowsData,
    //   chat_id: chatId,
    //   message
    // })
    console.log(agentStatus === "joined")

    socket.emit("user:message", {
      chatbot_id: chatbotId,
      to_agent: agentStatus === "joined",
      user_flows_data: userFlowsData,
      chat_id: chatId,
      message
    })
  }, [agentStatus, chatbotId, userId])


  const requestForAgent = useCallback((chatId, userFlowsData) => {
    const socket = socketRef.current
    console.log(socket)
    // if (!socket || !userId || !chatId) {
    //   console.warn("Cannot send message: socket, userId, or chatId is missing.")
    //   return
    // }

    socket.emit("user:request_for_agent", {
      userId,
      chat_id: chatId,
      chatbotId
    })

  }, [chatbotId, userId])


  const cancelRequestForAgent = useCallback((chatId, userFlowsData) => {
    const socket = socketRef.current
    if (!socket || !userId || !chatId) {
      console.warn("Cannot send message: socket, userId, or chatId is missing.")
      return
    }

    socket.emit("user:cancel_request_for_agent", {
      // userId,
      chat_id: chatId,
      // chatbot_id: chatbotId
    })
  }, [userId])


  const isTyping = typingUsers.length > 0


  return { messages, sendUserMessage, requestForAgent, isTyping, typingUsers, agentStatus, setAgentStatus, cancelRequestForAgent, agentName, setAgentName }
}