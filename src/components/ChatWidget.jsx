'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { Box } from '@mui/material'
import { useChat } from '@/hooks/useChat'
import { usePoshtibotSetup } from '@/hooks/usePoshtibotSetup'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import ChatStarters from './ChatStarters'
import AgentButton from './AgentButton'
import ChatInput from './ChatInput'
import CollectLeads from './CollectLeads'
import PendingForAgent from './PendingForAgent'
import { storage, Keys } from '@/lib/constants'

const ChatWidget = ({ chatbotId: propChatbotId, setOpen, chatSession, parentOrigin }) => {
  const chatEndRef = useRef(null)

  const chatbotId = propChatbotId

  const { config, loading, chatId, userId, allMessages, setAllMessages, starterMessages } = usePoshtibotSetup(chatbotId)

  const [leadsCollected, setLeadsCollected] = useState(false)

  const persistedChatData = useMemo(
    () => (chatbotId ? (storage.getJSON(Keys.chatData(chatbotId)) ?? {}) : {}),
    [chatbotId]
  )

  const fallbackChatSession = useChat({
    chatbotId,
    userId,
    chatId,
    isOpen: true,
    enabled: !chatSession
  })
  const {
    sendUserMessage,
    requestForAgent,
    messages,
    isTyping,
    agentStatus,
    setAgentStatus,
    cancelRequestForAgent,
    agentName,
    setAgentName,
    emitTyping,
    emitStopTyping
  } = chatSession ?? fallbackChatSession

  const [showInitMsg, setShowInitMsg] = useState(true)
  const resolvedChatId = chatId ?? persistedChatData?.poshtibot_chat_id ?? null
  const loadedHistoryRef = useRef(new Set())

  const extractMessagesFromPayload = useCallback((payload) => {
    const collected = []
    const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const getTextValue = (value) => {
      if (typeof value === 'string') return value.trim()
      if (typeof value === 'number' || typeof value === 'boolean') return String(value)
      if (value && typeof value === 'object') {
        if (typeof value.text === 'string') return value.text.trim()
        if (typeof value.message === 'string') return value.message.trim()
        if (typeof value.content === 'string') return value.content.trim()
        if (typeof value.body === 'string') return value.body.trim()
        if (typeof value.answer === 'string') return value.answer.trim()
      }
      return ''
    }

    const groupedMessages = payload?.message?.grouped_messages ?? payload?.grouped_messages
    if (!groupedMessages || typeof groupedMessages !== 'object') return collected

    Object.values(groupedMessages).forEach((dayMessages) => {
      if (!Array.isArray(dayMessages)) return

      dayMessages.forEach((item) => {
        if (!item || typeof item !== 'object') return

        const text = getTextValue(item.message) || getTextValue(item.content)
        const audioUrl = item.audio_url || null
        const fileUrl = item.file_url || null
        if (!text && !audioUrl && !fileUrl) return

        const senderRole = item.sender_role ?? item.sender ?? item.role ?? item.from ?? 'Poshtibot'
        const sender = String(senderRole).toLowerCase()

        const normalizedSender =
          sender === 'user' ? 'user' : sender === 'agent' ? 'agent' : sender === 'poshtibot' ? 'poshtibot' : 'poshtibot'

        collected.push({
          sender: normalizedSender,
          message: text,
          id: item.message_id ?? item.id ?? item._id ?? makeId(),
          audio_url: audioUrl,
          file_url: fileUrl,
          type: item.type
        })
      })
    })

    return collected
  }, [])

  useEffect(() => {
    if (!chatbotId || !resolvedChatId) return

    const historyKey = `${chatbotId}:${resolvedChatId}`
    if (loadedHistoryRef.current.has(historyKey)) return
    loadedHistoryRef.current.add(historyKey)

    // let isActive = true

    const loadChatMessages = async () => {
      try {
        const response = await fetch('/api/get_chat_messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: resolvedChatId })
        })

        if (!response.ok) return

        const payload = await response.json().catch(() => null)
        const formattedMessages = extractMessagesFromPayload(payload)

        // if (!isActive) return

        setShowInitMsg(false)
        if (formattedMessages.length > 0) {
          storage.setJSON(Keys.messages(chatbotId), formattedMessages)
          setAllMessages(formattedMessages)
        }
      } catch (error) {
        console.error('[Chat] Failed to load chat history:', error)
      }
    }

    loadChatMessages()

    // return () => {
    //   isActive = false
    // }
  }, [chatbotId, extractMessagesFromPayload, resolvedChatId, setAllMessages])

  const needsLeads = Boolean(
    config &&
    (config?.leads_from_name || config?.leads_from_email || config?.leads_from_mobile) &&
    !persistedChatData.leads_collected &&
    !leadsCollected
  )

  const initRef = useRef(false)
  const didInitialScrollRef = useRef(false)
  useEffect(() => {
    if (!chatbotId || !config || initRef.current) return
    initRef.current = true

    if (persistedChatData?.agent_status === 'pending') setAgentStatus('pending')
    if (persistedChatData?.agent_status === 'joined') {
      setAgentStatus('joined')
      setAgentName(persistedChatData?.agent_name)
    }
  }, [config, chatbotId, persistedChatData, setAgentStatus, setAgentName])

  useEffect(() => {
    if (!messages?.length || !chatbotId) return
    setAllMessages((prev) => {
      const existing = new Map(prev.map((m) => [m.id, m]))
      let changed = false
      for (const msg of messages) {
        if (!existing.has(msg.id)) {
          existing.set(msg.id, msg)
          changed = true
        }
      }
      if (!changed) return prev
      const merged = [...existing.values()]
      storage.setJSON(Keys.messages(chatbotId), merged)
      return merged
    })
  }, [messages, setAllMessages, chatbotId])

  useEffect(() => {
    const behavior = didInitialScrollRef.current ? 'smooth' : 'auto'
    const scrollToBottom = () => {
      chatEndRef.current?.scrollIntoView({ behavior, block: 'end' })
    }

    const frameId = requestAnimationFrame(scrollToBottom)
    const transitionId = setTimeout(scrollToBottom, 350)
    didInitialScrollRef.current = true

    return () => {
      cancelAnimationFrame(frameId)
      clearTimeout(transitionId)
    }
  }, [allMessages, isTyping])

  const handleSendMessage = useCallback(
    (messageText) => {
      if (!messageText?.trim() || !chatbotId) return
      const newMsg = {
        sender: 'user',
        message: messageText,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      }
      setAllMessages((prev) => {
        const next = [...prev, newMsg]
        storage.setJSON(Keys.messages(chatbotId), next)
        return next
      })
      setShowInitMsg(false)
      sendUserMessage(config?.user_flows_data, messageText)
    },
    [chatbotId, config?.user_flows_data, sendUserMessage, setAllMessages]
  )

  const handleStarterClick = useCallback((text) => handleSendMessage(text), [handleSendMessage])

  const handleCloseChat = useCallback(() => {
    setOpen?.(false)
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'CLOSE_CHAT_WIDGET' }, parentOrigin || '*')
    }
  }, [parentOrigin, setOpen])

  const isAgentButtonVisible = useMemo(() => {
    const userCount = allMessages.filter((m) => m.sender === 'user').length
    return config?.agent_handoff === 1 && userCount > 0 && userCount % 4 === 0
  }, [allMessages, config])

  const handleCancelRequest = useCallback(() => {
    if (!chatbotId) return
    cancelRequestForAgent(chatId)
    const chatData = storage.getJSON(Keys.chatData(chatbotId))
    if (chatData) {
      storage.setJSON(Keys.chatData(chatbotId), { ...chatData, agent_status: 'none' })
    }
  }, [cancelRequestForAgent, chatId, chatbotId])

  if (loading || !config) {
    return <Box sx={{ p: 4, textAlign: 'center' }}>در حال بارگذاری...</Box>
  }

  return (
    <Box
      sx={{
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 7,
        overflow: 'hidden',
        backgroundImage: 'linear-gradient(0deg, rgba(0,0,0,0.5), rgba(0,0,0,0.8)),url(/images/widgetBg1.jpg)',
        backgroundSize: 'cover'
      }}
    >
      <ChatHeader
        notifications
        onToggleNotifications={() => {}}
        onCloseChat={handleCloseChat}
        agentStatus={agentStatus}
        agentName={agentName}
        botName={config?.bot_name}
      />

      {needsLeads ? (
        <CollectLeads config={config} chatbotId={chatbotId} onLeadsCollected={() => {
          const chatData = storage.getJSON(Keys.chatData(chatbotId)) ?? {}
          storage.setJSON(Keys.chatData(chatbotId), { ...chatData, leads_collected: true })
          setLeadsCollected(true)
        }} />
      ) : (
        <>
          <MessageList
            allMessages={allMessages}
            isTyping={isTyping}
            chatEndRef={chatEndRef}
            agentStatus={agentStatus}
          />

          {agentStatus === 'none' && (
            <AgentButton
              chatbotId={chatbotId}
              isVisible={isAgentButtonVisible}
              chatId={chatId}
              requestForAgent={requestForAgent}
              agentStatus={agentStatus}
            />
          )}

          <Box sx={{ px: 0.5, borderTop: '1px solid #e3eded', bgcolor: '#fff' }}>
            {showInitMsg && agentStatus === 'none' && Number(config?.show_starter_messages) !== 0 && (
              <ChatStarters starters={starterMessages} onStarterClick={handleStarterClick} />
            )}

            {agentStatus === 'pending' ? (
              <PendingForAgent handleCancelRequest={handleCancelRequest} />
            ) : (
              <ChatInput
                isTyping={isTyping}
                onSendMessage={handleSendMessage}
                onTyping={emitTyping}
                onStopTyping={emitStopTyping}
              />
            )}
          </Box>
        </>
      )}
    </Box>
  )
}

export default ChatWidget
