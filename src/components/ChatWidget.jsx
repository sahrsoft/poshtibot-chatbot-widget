'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { Box } from "@mui/material"
import { useChat } from "@/hooks/useChat"
import { usePoshtibotSetup } from "../hooks/usePoshtibotSetup"
import ChatHeader from "./ChatHeader"
import MessageList from "./MessageList"
import ConversationStarters from "./ConversationStarters"
import SupportButton from "./SupportButton"
import ChatInput from "./ChatInput"

const ChatWidget = () => {
    const [notifications, setNotifications] = useState(true)
    const [botTypingText, setBotTypingText] = useState('')
    const [showSupportBtn, setShowSupportBtn] = useState(true)
    const [showInitMsg, setShowInitMsg] = useState(true)

    const chatEndRef = useRef(null)

    const { config, conversationId, userId, allMessages, setAllMessages } = usePoshtibotSetup()

    const { sendUserMessage, messages, isTyping } = useChat({ userId, conversationId})

    // Memoize the conversation starters array to prevent re-renders
    const conversationStarters = useMemo(() => [
        { id: '1', message: 'در مورد محصولات سوال دارم', enabled: true },
        { id: '2', message: 'وضعیت سفارش من', enabled: true },
        { id: '3', message: 'وضعیت سفارش من', enabled: true },
        { id: '4', message: 'وضعیت سفارش من', enabled: true },
        { id: '5', message: 'وضعیت سفارش من', enabled: true }
    ], [])

    useEffect(() => {
        if (!messages?.length) return
        setAllMessages(prev => {
            const seen = new Set(prev.map(m => m.id))
            const newOnes = messages.filter(m => !seen.has(m.id))
            if (newOnes.length === 0) return prev
            const merged = [...prev, ...newOnes]
            localStorage.setItem("poshtibot-messages", JSON.stringify(merged))
            return merged
        })
    }, [messages, setAllMessages])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [allMessages, isTyping])

    // Memoized callback for sending a message
    const handleSendMessage = useCallback((messageText) => {
        console.log("messageText",messageText)
        if (!messageText) return
        const newMsg = { sender: "user", message: messageText, id: Date.now() }
        setAllMessages(prev => {
            const updated = [...prev, newMsg]
            localStorage.setItem("poshtibot-messages", JSON.stringify(updated))
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
    const isSupportButtonVisible = useMemo(() => {
        const userMessageCount = allMessages.filter(msg => msg.sender === "user").length
        return config?.enable_agent_handoff === 1 && userMessageCount > 0 && userMessageCount % 4 === 0 && showSupportBtn
    }, [allMessages, config, showSupportBtn])

    if (!config) {
        return <Box sx={{ p: 4, textAlign: "center" }}>در حال بارگذاری...</Box>
    }

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
            <ChatHeader
                notifications={notifications}
                onToggleNotifications={toggleNotifications}
                onCloseChat={handleCloseChat}
            />

            <MessageList
                allMessages={allMessages}
                isTyping={isTyping}
                botTypingText={botTypingText}
                chatEndRef={chatEndRef}
            />

            <SupportButton isVisible={isSupportButtonVisible} />

            <Box sx={{ px: .5, borderTop: '1px solid #e3eded', bgcolor: '#fff' }}>
                {showInitMsg && (
                    <ConversationStarters
                        starters={conversationStarters}
                        onStarterClick={handleStarterClick}
                    />
                )}

                <ChatInput
                    isTyping={isTyping}
                    onSendMessage={handleSendMessage}
                />
            </Box>
        </Box>
    )
}

export default ChatWidget