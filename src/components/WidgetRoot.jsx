'use client'

import { useEffect, useState, useCallback, useRef, useMemo, useReducer } from 'react'
import { Box } from '@mui/material'
import { AnimatePresence } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'

import { useWidgetConfig } from '@/hooks/useWidgetConfig'
import { useChat } from '@/hooks/useChat'
import { WidgetLauncher } from '@/components/WidgetLauncher'
import ChatWidget from './ChatWidget'
import { storage, Keys } from '@/lib/constants'

export default function WidgetRoot({ chatbotId }) {
  const [open, setOpen] = useState(false)
  const { config } = useWidgetConfig(chatbotId)
  const lunchRef = useRef(false)
  const [, refreshChatData] = useReducer((version) => version + 1, 0)
  const chatData = chatbotId ? storage.getJSON(Keys.chatData(chatbotId)) : null
  const parentOrigin = useMemo(() => {
    if (typeof document === 'undefined') return ''
    try {
      return document.referrer ? new URL(document.referrer).origin : window.location.origin
    } catch {
      return window.location.origin
    }
  }, [])

  const chatSession = useChat({
    chatbotId,
    userId: chatData?.poshtibot_user_id,
    chatId: chatData?.poshtibot_chat_id,
    isOpen: open
  })
  const { unreadCount } = chatSession

  useEffect(() => {
    if (!chatbotId) return

    const existingChatData = storage.getJSON(Keys.chatData(chatbotId))
    if (existingChatData?.poshtibot_chat_id) {
      return
    }

    if (!config?.user_flows_data || lunchRef.current) return
    lunchRef.current = true

    const newChatData = {
      poshtibot_chat_id: uuidv4(),
      poshtibot_user_id: uuidv4(),
      agent_status: 'none'
    }
    storage.setJSON(Keys.chatData(chatbotId), newChatData)
    refreshChatData()

    fetch('/api/add_new_chat_on_widget_lunch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_flows_data: config.user_flows_data,
        chat_id: newChatData.poshtibot_chat_id
      })
    }).catch((error) => {
      lunchRef.current = false
      console.error('[Widget] Failed to initialize chat:', error)
    })
  }, [chatbotId, config?.user_flows_data])

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.source !== window.parent || (parentOrigin && event.origin !== parentOrigin)) return
      if (event.data?.type === 'CLOSE_CHAT_WIDGET' || event.data?.type === 'OUTSIDE_CLICK') {
        setOpen(false)
        window.parent.postMessage({ type: 'CLOSE_WIDGET' }, parentOrigin)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [parentOrigin])

  const toggleWidget = useCallback(() => {
    setOpen((prev) => {
      const next = !prev
      window.parent.postMessage({ type: next ? 'OPEN_WIDGET' : 'CLOSE_WIDGET' }, parentOrigin)
      return next
    })
  }, [parentOrigin])

  return (
    <>
      <AnimatePresence>
        {!open && (
          <WidgetLauncher config={config} onClick={toggleWidget} unreadCount={unreadCount} />
        )}
      </AnimatePresence>

      <Box
        sx={{
          position: 'fixed',
          bottom: 40,
          [config?.widget_position || 'right']: 40,
          width: 380,
          height: 600,
          borderRadius: 7,
          boxShadow: 'rgba(0, 0, 0, 0.2) 0px 5px 10px 0px',
          transformOrigin: config?.widget_position === 'left' ? 'bottom left' : 'bottom right',
          transition: 'all 0.3s ease-in-out',
          opacity: open ? 1 : 0,
          transform: open ? 'scale(1)' : 'scale(0)',
          visibility: open ? 'visible' : 'hidden',
          zIndex: 9998,
          background: '#fff'
        }}
      >
        {open && (
          <ChatWidget
            chatbotId={chatbotId}
            setOpen={setOpen}
            chatSession={chatSession}
            parentOrigin={parentOrigin}
          />
        )}
      </Box>
    </>
  )
}
