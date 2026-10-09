'use client'

import { useState, useCallback, useEffect } from 'react'
import { storage, Keys } from '@/lib/constants'
import { useWidgetConfig } from './useWidgetConfig'

const DEFAULT_WELCOME = 'سلام، چطور می‌تونم کمکتون کنم؟'

function defaultBotMessage(text) {
  return {
    sender: 'poshtibot',
    message: text || DEFAULT_WELCOME,
    id: 'default-welcome'
  }
}

function loadMessages(cid) {
  const saved = storage.getJSON(Keys.messages(cid))
  return Array.isArray(saved) && saved.length > 0 ? saved : [defaultBotMessage()]
}

function loadChatData(cid) {
  return storage.getJSON(Keys.chatData(cid)) ?? null
}

export function usePoshtibotSetup(chatbotId) {
  const { config, loading, starterMessages } = useWidgetConfig(chatbotId)
  const [allMessages, setAllMessages] = useState(() =>
    chatbotId ? loadMessages(chatbotId) : [defaultBotMessage()]
  )

  const chatData = chatbotId ? loadChatData(chatbotId) : null
  const chatId = chatData?.poshtibot_chat_id ?? null
  const userId = chatData?.poshtibot_user_id ?? null

  useEffect(() => {
    const welcome = config?.welcome_message
    if (!welcome) return
    setAllMessages((prev) => {
      if (prev.length !== 1 || prev[0]?.id !== 'default-welcome') return prev
      if (prev[0].message === welcome) return prev
      const next = [defaultBotMessage(welcome)]
      if (chatbotId) storage.setJSON(Keys.messages(chatbotId), next)
      return next
    })
  }, [chatbotId, config?.welcome_message])

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
