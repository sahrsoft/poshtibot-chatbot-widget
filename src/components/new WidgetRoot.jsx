"use client"

import { useEffect, useState, useCallback } from "react"
import { Box } from "@mui/material"
import { AnimatePresence } from "framer-motion"
import { v4 as uuidv4 } from 'uuid'

// Import hooks and components
import { useWidgetConfig } from "@/hooks/useWidgetConfig"
import { WidgetLauncher } from "@/components/WidgetLauncher"
import { getChatDataKey } from "@/lib/constants"
import { useChat } from "@/hooks/useChat"
import ChatWidget from "./ChatWidget"

// For easier switching between dev and prod
// const WIDGET_URL = process.env.NODE_ENV === 'production'
//   ? 'https://widget.poshtibot.com/chat'
//   : 'http://localhost:3000/chat'

export default function WidgetRoot({ chatbotId }) {
  const [open, setOpen] = useState(false)
  const { config } = useWidgetConfig(chatbotId) // Custom hook handles all config logic

  // Get chat data from localStorage
  const [chatData, setChatData] = useState(null)

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
      if (
        event.data?.type === "CLOSE_CHAT_WIDGET" ||
        event.data?.type === "OUTSIDE_CLICK"
      ) {
        setOpen(false)
        window.parent.postMessage(
          {
            type: "CLOSE_WIDGET"
          },
          "*"
        )
      }
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {

      if (!open) return

      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }
  }, [open])

  // Memoize the toggle function
  const toggleWidget = useCallback(() => {

    setOpen(prev => {

      const next = !prev

      window.parent.postMessage(
        {
          type: next
            ? "OPEN_WIDGET"
            : "CLOSE_WIDGET"
        },
        "*"
      )

      return next
    })

  }, [])

  return (
    <>
      <AnimatePresence>
        {!open && <WidgetLauncher config={config} onClick={toggleWidget} unreadCount={unreadCount} />}
      </AnimatePresence>

      <Box
        sx={{
          width: "100%",
          height: "100%",
          borderRadius: { xs: 0, sm: "28px" },
          overflow: "hidden",
          background: "#fff",
          boxShadow:
            "0 12px 28px rgba(0,0,0,.2)",
        }}
      >
        {open && (
          <ChatWidget chatbotId={chatbotId} />
        )}

        {/* {open && (
          <iframe
            src={`${WIDGET_URL}?chatbot_id=${chatbotId}`}
            title="Poshtibot chat"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        )} */}
      </Box>
    </>
  )
}