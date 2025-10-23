'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { Box } from "@mui/material"
import { useChat } from "@/hooks/useChat"
import { usePoshtibotSetup } from "../hooks/usePoshtibotSetup"
import ChatHeader from "./ChatHeader"
import MessageList from "./MessageList"
import ConversationStarters from "./ConversationStarters"
import AgentButton from "./AgentButton"
import ChatInput from "./ChatInput"
import CollectLeads from "./CollectLeads"
import { LOCAL_STORAGE_CONVERSATION_DATA_KEY, LOCAL_STORAGE_MESSAGES_KEY } from "@/lib/constants"
import PendingForAgent from "./PendingForAgent"

const ChatWidget = () => {
  const [notifications, setNotifications] = useState(true)
  const [showInitMsg, setShowInitMsg] = useState(true)
  const [leadsStatus, setLeadsStatus] = useState()

  const chatEndRef = useRef(null)

  const { config, conversationId, userId, allMessages, setAllMessages, starterMessages } = usePoshtibotSetup()

  const { sendUserMessage, messages, isTyping, agentStatus, setAgentStatus, cancelRequestForAgent } = useChat({ userId, conversationId })

  // Memoize the conversation starters array to prevent re-renders
  const conversationStarters = useMemo(() => starterMessages, [starterMessages])

  useEffect(() => {
    if (!messages?.length) return
    setAllMessages(prev => {
      const seen = new Set(prev.map(m => m.id))
      const newOnes = messages.filter(m => !seen.has(m.id))
      if (newOnes.length === 0) return prev
      const merged = [...prev, ...newOnes]
      localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(merged))
      return merged
    })
  }, [messages, setAllMessages])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages, isTyping])

  useEffect(() => {
    const conversationData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONVERSATION_DATA_KEY))
    if ((config?.leads_from_name || config?.leads_from_email || config?.leads_from_mobile) &&
      (!conversationData.leads_collected)) {
      setLeadsStatus(true)
    }

    if (conversationData?.agent_status === "pending") {
      setAgentStatus("pending")
    }
  }, [config])


  // Memoized callback for sending a message
  const handleSendMessage = useCallback((messageText) => {
    console.log("messageText", messageText)
    if (!messageText) return
    const newMsg = { sender: "user", message: messageText, id: Date.now() }
    setAllMessages(prev => {
      const updated = [...prev, newMsg]
      localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(updated))
      return updated
    })
    setShowInitMsg(false) // Hide starters after first message
    sendUserMessage(config.user_flows_data, conversationId, messageText)
  }, [conversationId, config, sendUserMessage, setAllMessages])

  // Memoized callback for clicking a starter prompt
  const handleStarterClick = useCallback((starterText) => {
    handleSendMessage(starterText)
  }, [handleSendMessage])

  const toggleNotifications = useCallback(() => setNotifications(prev => !prev), [])

  const handleCloseChat = useCallback(() => {
    window.parent.postMessage({ type: "CLOSE_CHAT_WIDGET" }, "*")
  }, [])

  // Memoize the calculation for showing the support button
  const isAgentButtonVisible = useMemo(() => {
    const userMessageCount = allMessages.filter(msg => msg.sender === "user").length
    return config?.agent_handoff === 1 && userMessageCount > 0 && userMessageCount % 4 === 0
  }, [allMessages, config])

  const handleCancelRequest = useCallback(() => {
    cancelRequestForAgent(conversationId)
    const conversationData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONVERSATION_DATA_KEY))
    const updated = {
      ...conversationData,
      agent_status: "none"
    }
    conversationData && localStorage.setItem(LOCAL_STORAGE_CONVERSATION_DATA_KEY, JSON.stringify(updated))
  }, [cancelRequestForAgent, conversationId])


  if (!config) {
    return <Box sx={{ p: 4, textAlign: "center" }}>در حال بارگذاری...</Box>
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundImage: 'linear-gradient(0deg, rgba(0,0,0,0.5), rgba(0,0,0,0.8)),url(./images/widgetBg1.jpg)', backgroundSize: 'cover' }}>
      <ChatHeader
        notifications={notifications}
        onToggleNotifications={toggleNotifications}
        onCloseChat={handleCloseChat}
        agentStatus={agentStatus}
      />

      {leadsStatus ? (
        <CollectLeads config={config} />
      ) : (
        <>
          <MessageList
            allMessages={allMessages}
            isTyping={isTyping}
            chatEndRef={chatEndRef}
          />

          {agentStatus === "none" &&
            <AgentButton isVisible={isAgentButtonVisible} userId={userId} conversationId={conversationId} />
          }

          <Box sx={{ px: .5, borderTop: '1px solid #e3eded', bgcolor: '#fff' }}>
            {showInitMsg && (agentStatus === "none") && (
              <ConversationStarters
                starters={conversationStarters}
                onStarterClick={handleStarterClick}
              />
            )}

            {agentStatus === "pending" ? (
              <PendingForAgent handleCancelRequest={handleCancelRequest} />
            ) : (
              <ChatInput
                isTyping={isTyping}
                onSendMessage={handleSendMessage}
              />
            )}

          </Box>
        </>
      )}
    </Box>
  )
}

export default ChatWidget