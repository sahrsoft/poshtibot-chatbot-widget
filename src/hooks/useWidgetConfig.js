'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { storage, Keys } from '@/lib/constants'

const DEFAULT_CONFIG = {
  primary_color: '#00d285',
  label_text: '',
  label_color: '#fff',
  label_background_color: '#00d285',
  icon_color: '#fff',
  icon_background_color: '#00d285',
  widget_position: 'right',
  user_flows_data: null,
  starter_messages: []
}

export function useWidgetConfig(chatbotId) {
  const [config, setConfig] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_CONFIG
    return storage.getJSON(Keys.config(chatbotId)) ?? DEFAULT_CONFIG
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!chatbotId) return

    let cancelled = false

    async function fetchConfig() {
      try {
        const data = await api.get(`/get_widget_config?chatbot_id=${chatbotId}`)

        if (cancelled) return

        if (data?.message?.widget_config) {
          const widgetConfig = {
            ...DEFAULT_CONFIG,
            ...data.message.widget_config,
            chatbot_id: chatbotId
          }
          storage.setJSON(Keys.config(chatbotId), widgetConfig)
          setConfig(widgetConfig)
        }

        if (data?.message?.starter_messages) {
          storage.setJSON(Keys.starters(chatbotId), data.message.starter_messages)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchConfig()
    return () => { cancelled = true }
  }, [chatbotId])

  const starterMessages = storage.getJSON(Keys.starters(chatbotId)) ?? []

  return { config, loading, error, starterMessages }
}
