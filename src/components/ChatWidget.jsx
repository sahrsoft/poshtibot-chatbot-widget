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

const ChatWidget = ({ chatbotId: propChatbotId, setOpen }) => {
  const chatEndRef = useRef(null)

  const chatbotId = propChatbotId

  const { config, loading, chatId, userId, allMessages, setAllMessages, starterMessages } =
    usePoshtibotSetup(chatbotId)

  const persistedChatData = useMemo(
    () => (chatbotId ? storage.getJSON(Keys.chatData(chatbotId)) ?? {} : {}),
    [chatbotId]
  )

  const {
    sendUserMessage,
    messages,
    isTyping,
    agentStatus,
    setAgentStatus,
    cancelRequestForAgent,
    agentName,
    setAgentName,
    emitTyping,
    emitStopTyping
  } = useChat({ chatbotId, userId, chatId })

  const [showInitMsg, setShowInitMsg] = useState(true)

  const needsLeads = Boolean(
    config &&
      (config?.leads_from_name || config?.leads_from_email || config?.leads_from_mobile) &&
      !persistedChatData.leads_collected
  )

  const initRef = useRef(false)
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
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages, isTyping])

  const handleSendMessage = useCallback(
    (messageText) => {
      if (!messageText?.trim() || !chatbotId) return
      const newMsg = { sender: 'user', message: messageText, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }
      setAllMessages((prev) => {
        const next = [...prev, newMsg]
        storage.setJSON(Keys.messages(chatbotId), next)
        return next
      })
      setShowInitMsg(false)
      sendUserMessage(config?.user_flows_data, chatId, messageText)
    },
    [chatbotId, chatId, config?.user_flows_data, sendUserMessage, setAllMessages]
  )

  const handleStarterClick = useCallback(
    (text) => handleSendMessage(text),
    [handleSendMessage]
  )

  const handleCloseChat = useCallback(() => {
    setOpen(false)
    window.parent.postMessage({ type: 'CLOSE_CHAT_WIDGET' }, '*')
  }, [setOpen])

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
    <Box sx={{ height: '600px', display: 'flex', flexDirection: 'column', borderRadius: 7, overflow: 'hidden', backgroundImage: 'linear-gradient(0deg, rgba(0,0,0,0.5), rgba(0,0,0,0.8)),url(./images/widgetBg1.jpg)', backgroundSize: 'cover' }}>
      <ChatHeader
        notifications
        onToggleNotifications={() => {}}
        onCloseChat={handleCloseChat}
        agentStatus={agentStatus}
        agentName={agentName}
      />

      {needsLeads ? (
        <CollectLeads config={config} chatbotId={chatbotId} />
      ) : (
        <>
          <MessageList allMessages={allMessages} isTyping={isTyping} chatEndRef={chatEndRef} />

          {agentStatus === 'none' && (
            <AgentButton
              chatbotId={chatbotId}
              isVisible={isAgentButtonVisible}
              userId={userId}
              chatId={chatId}
              userFlowsData={config?.user_flows_data}
            />
          )}

          <Box sx={{ px: 0.5, borderTop: '1px solid #e3eded', bgcolor: '#fff' }}>
            {showInitMsg && agentStatus === 'none' && (
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
