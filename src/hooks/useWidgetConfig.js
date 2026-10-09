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
  welcome_message: 'سلام، چطور می‌تونم کمکتون کنم؟',
  bot_name: '',
  starter_messages: [],
  show_starter_messages: 1
}

function isEnabledStarter(starter) {
  if (!starter || typeof starter !== 'object') return false
  const flag = starter.enabled ?? starter.enable
  return (flag === true || flag === 1 || flag === '1') && Boolean(String(starter.message || '').trim())
}

export function useWidgetConfig(chatbotId) {
  const [config, setConfig] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_CONFIG
    return storage.getJSON(Keys.config(chatbotId)) ?? DEFAULT_CONFIG
  })

  const [starterMessages, setStarterMessages] = useState(() => {
    if (typeof window === 'undefined' || !chatbotId) return []
    const saved = storage.getJSON(Keys.starters(chatbotId))
    return Array.isArray(saved) ? saved.filter(isEnabledStarter) : []
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!chatbotId) return

    let cancelled = false

    async function fetchConfig() {
      try {
        const data = await api.get(`/get_widget_config?chatbot_id=${encodeURIComponent(chatbotId)}`)

        if (cancelled) return

        const payload = data?.message || data || {}
        const remoteConfig = payload.widget_config
        const remoteStarters = payload.starter_messages

        if (remoteConfig) {
          const widgetConfig = {
            ...DEFAULT_CONFIG,
            ...remoteConfig,
            chatbot_id: chatbotId
          }
          storage.setJSON(Keys.config(chatbotId), widgetConfig)
          setConfig(widgetConfig)
        }

        if (Array.isArray(remoteStarters)) {
          storage.setJSON(Keys.starters(chatbotId), remoteStarters)
          setStarterMessages(remoteStarters.filter(isEnabledStarter))
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

  return { config, loading, error, starterMessages }
}
