'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { getSocket } from '@/utils/socket/socket'
import { storage, Keys } from '@/lib/constants'

function buildMessage(sender, message, id) {
  return { sender, message, id: id ?? Date.now() + Math.random() }
}

export function useChat({ chatbotId, userId, chatId, isOpen = true, enabled = true }) {
  const [messages, setMessages] = useState([])
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [botTyping, setBotTyping] = useState(false)
  const [agentStatus, setAgentStatus] = useState('none')
  const [agentName, setAgentName] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [connected, setConnected] = useState(false)

  const socketRef = useRef(null)
  const agentStatusRef = useRef(agentStatus)
  const agentNameRef = useRef(agentName)
  const isOpenRef = useRef(isOpen)
  const chatbotIdRef = useRef(chatbotId)

  const resetUnread = useCallback(() => setUnreadCount(0), [])

  useEffect(() => {
    agentStatusRef.current = agentStatus
  }, [agentStatus])
  useEffect(() => {
    agentNameRef.current = agentName
  }, [agentName])
  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])
  useEffect(() => {
    chatbotIdRef.current = chatbotId
  }, [chatbotId])

  useEffect(() => {
    if (!enabled || !chatbotId || !userId || !chatId) return

    const socket = getSocket(userId)
    if (!socket) return
    socketRef.current = socket

    const onConnect = () => {
      setConnected(true)
      resetUnread()
      socket.emit('user:start_chat', { chatbot_id: chatbotId, chat_id: chatId })
    }

    const onDisconnect = () => setConnected(false)

    const onAgentAssigned = (data) => {
      setAgentStatus('joined')
      const name = data?.agent_name ?? 'پشتیبان'
      setAgentName(name)
      const cid = chatbotIdRef.current
      if (!cid) return
      const chatData = storage.getJSON(Keys.chatData(cid))
      if (chatData) {
        storage.setJSON(Keys.chatData(cid), {
          ...chatData,
          agent_status: 'joined',
          agent_name: name
        })
      }
    }

    const appendMessage = (sender, messageText) => {
      const msg = buildMessage(sender, messageText)
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        const next = [...prev, msg]
        const cid = chatbotIdRef.current
        if (cid) storage.setJSON(Keys.messages(cid), next)
        return next
      })
      if (!isOpenRef.current) {
        setUnreadCount((prev) => prev + 1)
      }
    }

    const onAgentMessage = (data) => {
      const sender = data?.agent_name || agentNameRef.current || 'پشتیبان'
      appendMessage(sender, data?.message ?? data)
    }

    const onPoshtibotMessage = (message) => {
      const text = typeof message === 'string' ? message : (message?.message ?? JSON.stringify(message))
      appendMessage('poshtibot', text)
    }

    const onRequestForAgent = () => setAgentStatus('pending')
    const onCancelRequestForAgent = () => setAgentStatus('none')
    const onError = (err) => console.error('[Chat] Socket error:', err)

    const onUserTyping = (data) => {
      const id = data?.chat_id || data
      setTypingUsers((prev) => {
        const next = new Set(prev)
        next.add(id)
        return next
      })
    }

    const onUserStopTyping = (data) => {
      const id = data?.chat_id || data
      setTypingUsers((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }

    const onBotTyping = () => setBotTyping(true)
    const onBotStopTyping = () => setBotTyping(false)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('chat:assigned', onAgentAssigned)
    socket.on('message:agent', onAgentMessage)
    socket.on('message:poshtibot', onPoshtibotMessage)
    socket.on('message:error', onError)
    socket.on('message:request_for_agent', onRequestForAgent)
    socket.on('message:cancel_request_for_agent', onCancelRequestForAgent)
    socket.on('user_typing', onUserTyping)
    socket.on('user_stop_typing', onUserStopTyping)
    socket.on('poshtibot:typing', onBotTyping)
    socket.on('poshtibot:stop_typing', onBotStopTyping)

    if (socket.connected) onConnect()

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('chat:assigned', onAgentAssigned)
      socket.off('message:agent', onAgentMessage)
      socket.off('message:poshtibot', onPoshtibotMessage)
      socket.off('message:error', onError)
      socket.off('message:request_for_agent', onRequestForAgent)
      socket.off('message:cancel_request_for_agent', onCancelRequestForAgent)
      socket.off('user_typing', onUserTyping)
      socket.off('user_stop_typing', onUserStopTyping)
      socket.off('poshtibot:typing', onBotTyping)
      socket.off('poshtibot:stop_typing', onBotStopTyping)
    }
  }, [chatbotId, chatId, userId, enabled, resetUnread])

  const sendUserMessage = useCallback(
    (userFlowsData, message) => {
      const socket = socketRef.current
      if (!socket || !userId || !chatId) return
      socket.emit('user:message', {
        to_agent: agentStatusRef.current === 'joined',
        user_flows_data: userFlowsData,
        message
      })
    },
    [chatId, userId]
  )

  const requestForAgent = useCallback(
    (requestedChatId = chatId) => {
      const socket = socketRef.current
      if (!socket || !userId || !requestedChatId) return
      socket.emit('user:request_for_agent', { userId, chat_id: requestedChatId, chatbotId })
    },
    [chatbotId, chatId, userId]
  )

  const cancelRequestForAgent = useCallback(
    (chatId) => {
      const socket = socketRef.current
      if (!socket || !userId || !chatId) return
      socket.emit('user:cancel_request_for_agent', { chat_id: chatId })
    },
    [userId]
  )

  const emitTyping = useCallback(() => {
    socketRef.current?.emit('typing', { chat_id: chatId })
  }, [chatId])

  const emitStopTyping = useCallback(() => {
    socketRef.current?.emit('stop_typing', { chat_id: chatId })
  }, [chatId])

  const isTyping = botTyping || typingUsers.size > 0

  return {
    messages,
    sendUserMessage,
    requestForAgent,
    cancelRequestForAgent,
    isTyping,
    typingUsers: [...typingUsers],
    agentStatus,
    setAgentStatus,
    agentName,
    setAgentName,
    unreadCount,
    emitTyping,
    emitStopTyping,
    connected
  }
}
