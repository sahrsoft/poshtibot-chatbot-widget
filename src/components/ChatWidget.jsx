'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { Box } from "@mui/material"
import { useChat } from "@/hooks/useChat"
import { usePoshtibotSetup } from "../hooks/usePoshtibotSetup"
import ChatHeader from "./ChatHeader"
import MessageList from "./MessageList"
import ChatStarters from "./ChatStarters"
import AgentButton from "./AgentButton"
import ChatInput from "./ChatInput"
import CollectLeads from "./CollectLeads"
import { getChatDataKey, getMessagesKey } from "@/lib/constants"
import PendingForAgent from "./PendingForAgent"

const ChatWidget = ({ chatbotId: propChatbotId }) => {
  const [notifications, setNotifications] = useState(true)
  const [showInitMsg, setShowInitMsg] = useState(true)
  const [leadsStatus, setLeadsStatus] = useState()

  const chatEndRef = useRef(null)

  // Get chatbotId from prop or URL params
  const [chatbotId, setChatbotId] = useState(() => {
    if (propChatbotId) return propChatbotId
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      return params.get('chatbot_id')
    }
    return null
  })

  const { config, chatbotId: configChatbotId, chatId, userId, allMessages, setAllMessages, starterMessages } = usePoshtibotSetup(chatbotId)
  
  // Use chatbotId from prop/URL, fallback to config if needed
  const activeChatbotId = chatbotId || configChatbotId

  const { sendUserMessage, messages, isTyping, agentStatus, setAgentStatus, cancelRequestForAgent, agentName, setAgentName, emitTyping, emitStopTyping } = useChat({ chatbotId: activeChatbotId, userId, chatId })

  // Memoize the chat starters array to prevent re-renders
  const chatStarters = useMemo(() => starterMessages, [starterMessages])

  useEffect(() => {
    if (!messages?.length || !activeChatbotId) return
    setAllMessages(prev => {
      const seen = new Set(prev.map(m => m.id))
      const newOnes = messages.filter(m => !seen.has(m.id))
      if (newOnes.length === 0) return prev
      const merged = [...prev, ...newOnes]
      const messagesKey = getMessagesKey(activeChatbotId)
      localStorage.setItem(messagesKey, JSON.stringify(merged))
      return merged
    })
  }, [messages, setAllMessages, activeChatbotId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages, isTyping])

  useEffect(() => {
    if (!activeChatbotId || !config) return
    const chatDataKey = getChatDataKey(activeChatbotId)
    const chatData = JSON.parse(localStorage.getItem(chatDataKey) || '{}')
    if ((config?.leads_from_name || config?.leads_from_email || config?.leads_from_mobile) &&
      (!chatData.leads_collected)) {
      setLeadsStatus(true)
    }

    if (chatData?.agent_status === "pending") {
      setAgentStatus("pending")
    }
    if (chatData?.agent_status === "joined") {
      setAgentStatus("joined")
      setAgentName(chatData?.agent_name)
    }
  }, [config, activeChatbotId, setAgentStatus, setAgentName])


  // Memoized callback for sending a message
  const handleSendMessage = useCallback((messageText) => {
    console.log("messageText", messageText)
    if (!messageText || !activeChatbotId) return
    const newMsg = { sender: "user", message: messageText, id: Date.now() }
    setAllMessages(prev => {
      const updated = [...prev, newMsg]
      const messagesKey = getMessagesKey(activeChatbotId)
      localStorage.setItem(messagesKey, JSON.stringify(updated))
      return updated
    })
    setShowInitMsg(false) // Hide starters after first message
    sendUserMessage(config.user_flows_data, chatId, messageText)
  }, [chatId, config, sendUserMessage, setAllMessages, activeChatbotId])

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
    if (!activeChatbotId) return
    cancelRequestForAgent(chatId)
    const chatDataKey = getChatDataKey(activeChatbotId)
    const chatData = JSON.parse(localStorage.getItem(chatDataKey) || 'null')
    if (chatData) {
      const updated = {
        ...chatData,
        agent_status: "none"
      }
      localStorage.setItem(chatDataKey, JSON.stringify(updated))
    }
  }, [cancelRequestForAgent, chatId, activeChatbotId])


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
        agentName={agentName}
      />

      {leadsStatus ? (
        <CollectLeads config={config} chatbotId={activeChatbotId} />
      ) : (
        <>
          <MessageList
            allMessages={allMessages}
            isTyping={isTyping}
            chatEndRef={chatEndRef}
          />

          {agentStatus === "none" &&
            <AgentButton chatbotId={activeChatbotId} isVisible={isAgentButtonVisible} userId={userId} chatId={chatId} userFlowsData={config.user_flows_data} />
          }

          <Box sx={{ px: .5, borderTop: '1px solid #e3eded', bgcolor: '#fff' }}>
            {showInitMsg && (agentStatus === "none") && (
              <ChatStarters
                starters={chatStarters}
                onStarterClick={handleStarterClick}
              />
            )}

            {agentStatus === "pending" ? (
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