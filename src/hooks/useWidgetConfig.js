"use client"

import { useState, useEffect } from 'react'
import { LOCAL_STORAGE_CONFIG_KEY, LOCAL_STORAGE_STARTER_KEY } from '@/lib/constants'

// A default config to ensure the widget is always usable, even on API failure.
const DEFAULT_CONFIG = {
    primary_color: "#00d285",
    label_text: "از من بپرس 😊",
    label_color: "#fff",
    label_background_color: "#00d285",
    icon_color: "#fff",
    icon_background_color: "#00d285",
    widget_position: "right",
}

export function useWidgetConfig(chatbotId) {
    // 1. Use lazy initialization for state from localStorage.
    // This function only runs ONCE on the initial render.
    const [config, setConfig] = useState(() => {
        try {
            const cachedConfig = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY)
            return cachedConfig ? JSON.parse(cachedConfig) : DEFAULT_CONFIG
        } catch (error) {
            console.error("Failed to parse cached config:", error)
            return DEFAULT_CONFIG
        }
    })

    const [starterMessages, setStarterMessages] = useState(() => {
        try {
            const cachedStarter = localStorage.getItem(LOCAL_STORAGE_STARTER_KEY)
            return cachedStarter ? JSON.parse(cachedStarter) : []
        } catch (error) {
            console.error("Failed to parse cached config:", error)
            return []
        }
    })

    useEffect(() => {
        if (!chatbotId) return

        const fetchConfig = async () => {
            try {
                const res = await fetch(
                    `https://server.poshtibot.com/api/method/poshtibot.api.get_widget_config?chatbot_id=${chatbotId}`
                );
                if (!res.ok) {
                    throw new Error(`API request failed with status ${res.status}`)
                }
                const data = await res.json()

                if (data?.message) {
                    if (data?.message?.widget_config) {
                        setConfig(data.message.widget_config)
                        localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(data.message.widget_config))
                    }

                    if (data?.message?.starter_messages) {
                        setStarterMessages(data.message.starter_messages)
                        localStorage.setItem(LOCAL_STORAGE_STARTER_KEY, JSON.stringify(data.message.starter_messages))
                    }
                } else {
                    // If the API returns a valid but empty response, use default.
                    setConfig(DEFAULT_CONFIG)
                    setStarterMessages([])
                }
            } catch (e) {
                console.warn("Failed to fetch widget config, using cached or default.", e)
                // The state already holds the cached or default config, so no state update is needed here.
            }
        }

        fetchConfig()
    }, [chatbotId])

    return { config, starterMessages }
}