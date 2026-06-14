'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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
  const initializedRef = useRef(false)

  const chatData = chatbotId ? storage.getJSON(Keys.chatData(chatbotId)) : null

  const { unreadCount } = useChat({
    chatbotId,
    userId: chatData?.poshtibot_user_id,
    chatId: chatData?.poshtibot_chat_id,
    isOpen: open
  })

  useEffect(() => {
    if (!chatbotId || !config?.user_flows_data || initializedRef.current) return
    if (storage.getJSON(Keys.chatData(chatbotId))) return

    initializedRef.current = true

    const newChatData = {
      poshtibot_chat_id: uuidv4(),
      poshtibot_user_id: uuidv4(),
      agent_status: 'none'
    }
    storage.setJSON(Keys.chatData(chatbotId), newChatData)

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/add_new_chat_on_widget_lunch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_flows_data: config.user_flows_data,
        chat_id: newChatData.poshtibot_chat_id
      })
    }).catch(() => {})
  }, [chatbotId, config])

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'CLOSE_CHAT_WIDGET' || event.data?.type === 'OUTSIDE_CLICK') {
        setOpen(false)
        window.parent.postMessage({ type: 'CLOSE_WIDGET' }, '*')
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const toggleWidget = useCallback(() => {
    setOpen((prev) => {
      const next = !prev
      window.parent.postMessage({ type: next ? 'OPEN_WIDGET' : 'CLOSE_WIDGET' }, '*')
      return next
    })
  }, [])

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
        {open && <ChatWidget chatbotId={chatbotId} setOpen={setOpen} />}
      </Box>
    </>
  )
}
