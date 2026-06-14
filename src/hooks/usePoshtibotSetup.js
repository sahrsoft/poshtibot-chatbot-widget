'use client'

import { useState, useCallback } from 'react'
import { storage, Keys } from '@/lib/constants'
import { useWidgetConfig } from './useWidgetConfig'

const DEFAULT_BOT_MESSAGE = {
  sender: 'poshtibot',
  message: 'سلام، چطور می‌تونم کمکتون کنم؟',
  id: 'default-welcome'
}

function loadMessages(cid) {
  const saved = storage.getJSON(Keys.messages(cid))
  return Array.isArray(saved) && saved.length > 0 ? saved : [DEFAULT_BOT_MESSAGE]
}

function loadChatData(cid) {
  return storage.getJSON(Keys.chatData(cid)) ?? null
}

export function usePoshtibotSetup(chatbotId) {
  const { config, loading, starterMessages } = useWidgetConfig(chatbotId)
  const [allMessages, setAllMessages] = useState(() =>
    chatbotId ? loadMessages(chatbotId) : [DEFAULT_BOT_MESSAGE]
  )

  const chatData = chatbotId ? loadChatData(chatbotId) : null
  const chatId = chatData?.poshtibot_chat_id ?? null
  const userId = chatData?.poshtibot_user_id ?? null

  const persistMessages = useCallback(
    (updater) => {
      setAllMessages((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        if (chatbotId) {
          storage.setJSON(Keys.messages(chatbotId), next)
        }
        return next
      })
    },
    [chatbotId]
  )

  return {
    config,
    loading,
    chatbotId,
    chatId,
    userId,
    allMessages,
    setAllMessages: persistMessages,
    starterMessages
  }
}
