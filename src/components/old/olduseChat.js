"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import GetSocket from "@/utils/socket/Socket"


export function useChat({ userId }) {
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])

  const socketRef = useRef(null)

  // Initialize socket & common listeners once (safe)
  useEffect(() => {
    const socket = GetSocket()
    socketRef.current = socket

    if (!socket) return

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id)
      console.log("Socket connected:", socket.connect())
    })

    // const onPrivate = (msg) => setMessages(prev => [...prev, { ...msg, type: "private" }])
    // const onGroup = (msg) => setMessages(prev => [...prev, { ...msg, type: "group" }])
    // const onUser = (msg) => setMessages(prev => [...prev, { ...msg, sender: "user" }])
    const onPoshtibot = (message) => setMessages(prev => [...prev, { message, sender: "poshtibot", id: Date.now() }])

    const onError = (e) => console.error("socket error", e)

    // socket.on("message:private", onPrivate)
    // socket.on("message:group", onGroup)
    // socket.on("message:user", onUser)
    socket.on("message:poshtibot", onPoshtibot)
    socket.on("message:error", onError)

    return () => {
      // socket.off("message:private", onPrivate)
      // socket.off("message:group", onGroup)
      // socket.off("message:user", onUser)
      socket.off("message:poshtibot", onPoshtibot)
      socket.off("message:error", onError)
    }
  }, []) // run once

  // Register user when userId becomes available
  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return
    if (!userId) return

    socket.emit("register", userId)
  }, [userId])

  // Listen to typing updates
  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    // get user who is typing, and set true on setIsTyping
    const onUserTyping = ({ userId }) => {
      setTypingUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
      )
      setIsTyping(true)
    }

    // remove user who is typing, and set false on setIsTyping
    const onUserStopTyping = ({ userId }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== userId))
      setIsTyping(false)
    }

    socket.on("user_typing", onUserTyping)
    socket.on("user_stop_typing", onUserStopTyping)

    return () => {
      socket.off("user_typing", onUserTyping)
      socket.off("user_stop_typing", onUserStopTyping)
    }
  }, [])

  // const sendPrivate = useCallback((receiver, message) => {
  //   const socket = socketRef.current
  //   if (!socket || !userId) {
  //     console.warn("Cannot send private — socket or userId missing")
  //     return
  //   }
  //   socket.emit("private_message", { sender: userId, receiver, message })
  //   setMessages(prev => [...prev, { sender: userId, receiver, message, type: "private", local: true }])
  // }, [userId])

  const joinedRoomsRef = useRef(new Set())

  const joinGroup = useCallback((groupId) => {
    const socket = socketRef.current
    if (!socket || !userId) return

    if (joinedRoomsRef.current.has(groupId)) {
      console.log("Already joined room:", groupId)
      return
    }

    socket.emit("join_room", groupId);
    joinedRoomsRef.current.add(groupId);
    console.log("Joined room:", groupId);
  }, [userId])

  // const sendGroup = useCallback((userFlowsData, conversationId, message) => {
  //   console.log(userFlowsData, conversationId, message)
  //   const socket = socketRef.current
  //   if (!socket || !userId) {
  //     console.warn("Cannot send group — socket or userId missing")
  //     return
  //   }
  //   socket.emit("group_message", { user_flows_data: userFlowsData, conversation_id: conversationId, message })
  //   setMessages(prev => [...prev, { sender: "Agent", chat_room: conversationId, message, type: "group", local: true }])
  // }, [userId])

  const sendUser = useCallback((userFlowsData, conversationId, message) => {
    console.log(userFlowsData, conversationId, message)
    const socket = socketRef.current
    if (!socket || !userId) {
      console.warn("Cannot send group — socket or userId missing")
      return
    }

    // Ensure user has joined the room first
    joinGroup(conversationId)

    socket.emit("user_message", { user_flows_data: userFlowsData, conversation_id: conversationId, message })
    // setMessages(prev => [...prev, { sender: "User", chat_room: conversationId, message, type: "user", local: true }])
  }, [joinGroup, userId])


  return { messages, sendUser, joinGroup, typingUsers, isTyping }
}