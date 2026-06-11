"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Box } from "@mui/material"
import { AnimatePresence, motion } from "framer-motion"
import { v4 as uuidv4 } from 'uuid'

// Import hooks and components
import { useWidgetConfig } from "@/hooks/useWidgetConfig"
import { WidgetLauncher } from "@/components/WidgetLauncher"
import { getChatDataKey } from "@/lib/constants"
import { useChat } from "@/hooks/useChat"

// For easier switching between dev and prod
const WIDGET_URL = process.env.NODE_ENV === 'production'
  ? 'https://widget.poshtibot.com/chat'
  : 'http://localhost:3000/chat'

export default function WidgetRoot({ chatbotId, mode = "full" }) {  // Add mode prop
  const [open, setOpen] = useState(false)

  // Get chat data from localStorage
  const [chatData, setChatData] = useState(null)

  const { config } = useWidgetConfig(chatbotId)

  const widgetRef = useRef(null) // Reference for the widget container

  // Check if we're in embedded/bubble-only mode
  const isBubbleOnly = mode === "bubble" ||
    (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'bubble')

  useEffect(() => {
    if (!chatbotId) return

    const chatDataKey = getChatDataKey(chatbotId)
    const data = JSON.parse(localStorage.getItem(chatDataKey) || 'null')
    setChatData(data)

    // Listen for storage changes (in case chat data is updated elsewhere)
    const handleStorageChange = () => {
      const updated = JSON.parse(localStorage.getItem(chatDataKey) || 'null')
      setChatData(updated)
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [chatbotId])

  // Use the useChat hook to maintain socket connection and track unread messages
  const { unreadCount } = useChat({
    chatbotId,
    userId: chatData?.poshtibot_user_id,
    chatId: chatData?.poshtibot_chat_id,
    isOpen: open
  })

  // Effect for initializing chat/user IDs
  useEffect(() => {
    if (!config.user_flows_data || !chatbotId) return

    const chatDataKey = getChatDataKey(chatbotId)
    if (localStorage.getItem(chatDataKey)) return

    const chat_id = uuidv4()
    const user_id = uuidv4()
    const newChatData = {
      poshtibot_chat_id: chat_id,
      poshtibot_user_id: user_id,
      agent_status: "none"
    }

    localStorage.setItem(chatDataKey, JSON.stringify(newChatData))
    setChatData(newChatData)

    const data = {
      user_flows_data: config.user_flows_data,
      chat_id
    }

    const create_chat = async () => {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/add_new_chat_on_widget_lunch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(data => {
          console.log(data)
        })
        .catch(err => console.log(err))
    }

    create_chat()
  }, [config, chatbotId])

  // Effect for listening to close messages from the iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "CLOSE_CHAT_WIDGET") {
        setOpen(false)
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  // Handle click outside to close widget
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only apply when widget is open
      if (!open) return

      // Check if click is outside the widget container
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    // Add event listener with a small delay to avoid immediate closing
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // Close widget on ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (open && event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [open])

  // Memoize the toggle function
  const toggleWidget = useCallback(() => setOpen(prev => !prev), [])


  // For bubble-only mode (embedded in WordPress)
  if (isBubbleOnly) {
    return (
      <div ref={widgetRef}>
        <AnimatePresence>
          {!open && <WidgetLauncher config={config} onClick={toggleWidget} unreadCount={unreadCount} />}
        </AnimatePresence>

        <Box
          sx={{
            position: "fixed",
            bottom: { xs: 0, sm: 40 },
            [config?.widget_position || "right"]: { xs: 0, sm: 40 },
            width: { xs: '100%', sm: 380 },
            height: { xs: '100%', sm: 600 },
            borderRadius: { xs: 0, sm: 7 },
            boxShadow: '0 12px 28px 0 hsla(0,0%,0%,.2), 0 2px 4px 0 hsla(0,0%,0%,.1)',
            transformOrigin: config?.widget_position === 'left' ? 'bottom left' : 'bottom right',
            transition: "all 0.3s ease-in-out",
            opacity: open ? 1 : 0,
            transform: open ? "scale(1)" : "scale(0)",
            visibility: open ? 'visible' : 'hidden',
            zIndex: 9998,
            background: "#fff",
            pointerEvents: open ? 'auto' : 'none' // Important: prevents clicking when hidden
          }}
        >
          <iframe
            src={`${WIDGET_URL}?chatbot_id=${chatbotId}`}
            title="Poshtibot chat"
            style={{ width: "100%", height: "100%", border: "none", borderRadius: "28px" }}
          />
        </Box>
      </div>
    )
  }

  // Original full-page mode
  return (
    <div ref={widgetRef}>

      <AnimatePresence>
        {!open && <WidgetLauncher config={config} onClick={toggleWidget} unreadCount={unreadCount} />}
      </AnimatePresence>

      <Box
        sx={{
          position: "fixed",
          bottom: { xs: 0, sm: 40 },
          [config?.widget_position || "right"]: { xs: 0, sm: 40 },
          width: { xs: '100%', sm: 380 },
          height: { xs: '100%', sm: 600 },
          borderRadius: { xs: 0, sm: 7 },
          boxShadow: '0 12px 28px 0 hsla(0,0%,0%,.2), 0 2px 4px 0 hsla(0,0%,0%,.1)',
          transformOrigin: config?.widget_position === 'left' ? 'bottom left' : 'bottom right',
          transition: "all 0.3s ease-in-out",
          opacity: open ? 1 : 0,
          transform: open ? "scale(1)" : "scale(0)",
          visibility: open ? 'visible' : 'hidden',
          zIndex: 9998,
          background: "#fff"
        }}
      >
        {open && (
          <iframe
            src={`${WIDGET_URL}?chatbot_id=${chatbotId}`}
            title="Poshtibot chat"
            style={{ width: "100%", height: "100%", border: "none", borderRadius: "28px" }}
          />
        )}
      </Box>
    </div>
  )
}