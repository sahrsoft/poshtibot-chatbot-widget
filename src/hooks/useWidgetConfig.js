"use client"

import { useState, useEffect } from 'react'
import { getConfigKey, getStarterKey, getChatDataKey, getMessagesKey } from '@/lib/constants'

// A default config to ensure the widget is always usable, even on API failure.
const DEFAULT_CONFIG = {
    primary_color: "#00d285",
    label_text: "",
    // label_text: "از من بپرس 😊",
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
        if (typeof window === "undefined") return // Prevent SSR issues

        try {
            const configKey = getConfigKey(chatbotId)
            const cachedConfig = localStorage.getItem(configKey)
            return cachedConfig ? JSON.parse(cachedConfig) : DEFAULT_CONFIG
        } catch (error) {
            console.error("Failed to parse cached config:", error)
            return DEFAULT_CONFIG
        }
    })

    const [starterMessages, setStarterMessages] = useState(() => {
        if (typeof window === "undefined") return // Prevent SSR issues

        try {
            const starterKey = getStarterKey(chatbotId)
            const cachedStarter = localStorage.getItem(starterKey)
            return cachedStarter ? JSON.parse(cachedStarter) : []
        } catch (error) {
            console.error("Failed to parse cached config:", error)
            return []
        }
    })


    useEffect(() => {
        if (!chatbotId) return

        const configKey = getConfigKey(chatbotId)
        const starterKey = getStarterKey(chatbotId)
        const chatDataKey = getChatDataKey(chatbotId)
        const messagesKey = getMessagesKey(chatbotId)

        // Check if this is a new chatbot by comparing chatbot_id from URL with stored config
        const cachedConfig = localStorage.getItem(configKey)
        let storedChatbotId = null
        
        if (cachedConfig) {
            try {
                const parsedConfig = JSON.parse(cachedConfig)
                storedChatbotId = parsedConfig.chatbot_id
            } catch (error) {
                console.error("Failed to parse cached config:", error)
            }
        }

        // If chatbot_id from URL doesn't match stored chatbot_id, clear old data
        const isNewChatbot = storedChatbotId && storedChatbotId !== chatbotId
        
        if (isNewChatbot) {
            console.log(`New chatbot detected (${chatbotId}). Clearing old data.`)
            // Clear all data for this chatbot_id key (they're already scoped, but clear to be safe)
            localStorage.removeItem(chatDataKey)
            localStorage.removeItem(messagesKey)
        }

        const fetchConfig = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/get_widget_config?chatbot_id=${chatbotId}`
                )
                if (!res.ok) {
                    throw new Error(`API request failed with status ${res.status}`)
                }
                const data = await res.json()

                if (data?.message) {
                    if (data?.message?.widget_config) {
                        // Store chatbot_id in config for future comparison
                        const configWithId = {
                            ...data.message.widget_config,
                            chatbot_id: chatbotId
                        }
                        setConfig(configWithId)
                        localStorage.setItem(configKey, JSON.stringify(configWithId))
                    }

                    if (data?.message?.starter_messages && data?.message?.starter_messages != null) {
                        setStarterMessages(data.message.starter_messages)
                        localStorage.setItem(starterKey, JSON.stringify(data.message.starter_messages))
                    } else {
                        setStarterMessages([])
                        localStorage.setItem(starterKey, "[]")
                    }
                } else {
                    // If the API returns a valid but empty response, use default.
                    const defaultConfigWithId = {
                        ...DEFAULT_CONFIG,
                        chatbot_id: chatbotId
                    }
                    setConfig(defaultConfigWithId)
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