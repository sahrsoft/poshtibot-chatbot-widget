"use client"

import { useEffect, useState, useCallback } from "react"
import { Box } from "@mui/material"
import { AnimatePresence } from "framer-motion"
import { v4 as uuidv4 } from 'uuid'

// Import hooks and components
import { useWidgetConfig } from "@/hooks/useWidgetConfig"
import { WidgetLauncher } from "@/components/WidgetLauncher"
import { LOCAL_STORAGE_CHAT_DATA_KEY } from "@/lib/constants"

// For easier switching between dev and prod
const WIDGET_URL = process.env.NODE_ENV === 'production'
  ? 'https://widget.poshtibot.com/chat'
  : 'http://localhost:3000/chat'

export default function WidgetRoot({ chatbotId }) {
  const [open, setOpen] = useState(false)
  const { config } = useWidgetConfig(chatbotId) // Custom hook handles all config logic

  // Effect for initializing chat/user IDs
  useEffect(() => {
    if (!config.user_flows_data) return

    if (localStorage.getItem(LOCAL_STORAGE_CHAT_DATA_KEY)) return

    const chat_id = uuidv4()
    const user_id = uuidv4()
    const chatData = {
      poshtibot_chat_id: chat_id,
      poshtibot_user_id: user_id,
      agent_status: "none"
    }
    localStorage.setItem(LOCAL_STORAGE_CHAT_DATA_KEY, JSON.stringify(chatData))

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
  }, [config])

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

  // Memoize the toggle function
  const toggleWidget = useCallback(() => setOpen(prev => !prev), [])

  return (
    <>
      <AnimatePresence>
        {!open && <WidgetLauncher config={config} onClick={toggleWidget} />}
      </AnimatePresence>

      <Box
        sx={{
          position: "fixed",
          bottom: { xs: 0, sm: 40 },
          [config?.widget_position || "right"]: { xs: 0, sm: 40 },
          width: { xs: '100%', sm: 380 },
          height: { xs: '100%', sm: 600 },
          borderRadius: { xs: 0, sm: 7 },
          // overflow: "hidden",
          boxShadow: '0 12px 28px 0 hsla(0,0%,0%,.2), 0 2px 4px 0 hsla(0,0%,0%,.1)',
          transformOrigin: config?.widget_position === 'left' ? 'bottom left' : 'bottom right',
          transition: "all 0.3s ease-in-out",
          // Animate with opacity and scale for better performance
          opacity: open ? 1 : 0,
          transform: open ? "scale(1)" : "scale(0)",
          visibility: open ? 'visible' : 'hidden',
          zIndex: 9998,
          background: "#fff",
        }}
      >
        {/* Conditionally render iframe only when opening to save resources */}
        {open && (
          <iframe
            src={`${WIDGET_URL}?chatbot_id=${chatbotId}`}
            title="Poshtibot chat"
            style={{ width: "100%", height: "100%", border: "none", borderRadius: "28px" }}
          />
        )}
      </Box>
    </>
  )
}