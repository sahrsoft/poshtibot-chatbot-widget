"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import GetSocket from "@/utils/socket/Socket"


export function useChat({ userId }) {
  const [messages, setMessages] = useState([])

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

    const onPrivate = (msg) => setMessages(prev => [...prev, { ...msg, type: "private" }])
    const onGroup = (msg) => setMessages(prev => [...prev, { ...msg, type: "group" }])
    const onUser = (msg) => setMessages(prev => [...prev, { ...msg, type: "user" }])
    const onSaved = (m) => console.debug("message:saved", m)
    const onError = (e) => console.error("socket error", e)

    socket.on("message:private", onPrivate)
    socket.on("message:group", onGroup)
    socket.on("message:user", onUser)
    socket.on("message:saved", onSaved)
    socket.on("message:error", onError)
    return () => {
      socket.off("message:private", onPrivate)
      socket.off("message:group", onGroup)
      socket.off("message:user", onUser)
      socket.off("message:saved", onSaved)
      socket.off("message:error", onError)
    }
  }, []) // run once

  // Register user when userId becomes available
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (!userId) return; // wait until userId exists

    socket.emit("register", userId);
    // DON'T send secrets from client in production. Prefer server-side auth.
    // If you *must* send keys, do socket.emit("auth_keys", { apiKey, apiSecret }) carefully.

    // no cleanup needed for register
  }, [userId])

  const sendPrivate = useCallback((receiver, message) => {
    const socket = socketRef.current
    if (!socket || !userId) {
      console.warn("Cannot send private — socket or userId missing")
      return
    }
    socket.emit("private_message", { sender: userId, receiver, message })
    setMessages(prev => [...prev, { sender: userId, receiver, message, type: "private", local: true }])
  }, [userId])

  const joinGroup = useCallback((groupId) => {
    const socket = socketRef.current
    if (!socket || !userId) return
    socket.emit("join_room", groupId)
  }, [userId])

  const sendGroup = useCallback((userFlowsData, conversationId, message) => {
    console.log(userFlowsData, conversationId, message)
    const socket = socketRef.current
    if (!socket || !userId) {
      console.warn("Cannot send group — socket or userId missing")
      return
    }
    socket.emit("group_message", { user_flows_data: userFlowsData, conversation_id:conversationId, message })
    setMessages(prev => [...prev, { sender: "Agent", chat_room: conversationId, message, type: "group", local: true }])
  }, [userId])

  const sendUser = useCallback((userFlowsData, conversationId, message) => {
    console.log(userFlowsData, conversationId, message)
    const socket = socketRef.current
    if (!socket || !userId ) {
      console.warn("Cannot send group — socket or userId missing")
      return
    }
    socket.emit("user_message", { user_flows_data: userFlowsData, conversation_id:conversationId, message })
    setMessages(prev => [...prev, { sender: "User", chat_room: conversationId, message, type: "user", local: true }])
  }, [userId])

  return { messages, sendPrivate, sendGroup, sendUser, joinGroup }
}