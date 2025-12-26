import { useEffect, useState } from "react"
import { getConfigKey, getChatDataKey, getMessagesKey, getStarterKey } from '@/lib/constants'


const DEFAULT_BOT_MESSAGE = { sender: "poshtibot", message: "سلام، چطور می‌تونم کمکتون کنم؟" }

export function usePoshtibotSetup(chatbotId) {
    const [config, setConfig] = useState(null)
    const [chatId, setChatId] = useState(null)
    const [userId, setUserId] = useState(null)
    const [allMessages, setAllMessages] = useState([DEFAULT_BOT_MESSAGE])
    const [starterMessages, setStarterMessages] = useState(null)

    useEffect(() => {
        if (!chatbotId) return
        
        let intervalId = null

        const loadFromLocalStorage = () => {
            try {
                const configKey = getConfigKey(chatbotId)
                const chatDataKey = getChatDataKey(chatbotId)
                const messagesKey = getMessagesKey(chatbotId)
                const starterKey = getStarterKey(chatbotId)
                
                const chatData = JSON.parse(localStorage.getItem(chatDataKey) || '{}')
                const pwc = JSON.parse(localStorage.getItem(configKey) || '{}')
                const savedMessages = JSON.parse(localStorage.getItem(messagesKey) || '[]')
                const starter = JSON.parse(localStorage.getItem(starterKey) || '[]')

                if (pwc && Object.keys(pwc).length > 0) {
                    setConfig(pwc)
                    setChatId(chatData.poshtibot_chat_id)
                    setUserId(chatData.poshtibot_user_id)
                    setAllMessages(savedMessages?.length > 0 ? savedMessages : [DEFAULT_BOT_MESSAGE])
                    setStarterMessages(starter)
                    return true
                }
            } catch (err) {
                console.error("Error loading chat data:", err)
                setAllMessages([DEFAULT_BOT_MESSAGE])
            }
            return false
        }

        // 1️. Try immediately
        const loaded = loadFromLocalStorage()

        // const loaded = setTimeout(() => {
        //     loadFromLocalStorage()
        // }, 500)

        // 2️. If not found, poll for a short time (e.g., up to 5s)
        if (!loaded) {
            let tries = 0
            intervalId = setInterval(() => {
                if (loadFromLocalStorage() || tries > 10) {
                    clearInterval(intervalId)
                }
                tries++
            }, 500)
        }

        // 3️. Listen for postMessage updates from parent
        // const handleMessage = (event) => {
        //     if (event.data?.type === "POSHTIBOT_CONFIG" && event.data.data) {
        //         const data = event.data
        //         setConfig(data)
        //         localStorage.setItem("poshtibot-widget-config", JSON.stringify(data))
        //         // Optional: reload other data when config arrives
        //         loadFromLocalStorage()
        //     }
        // }

        // window.addEventListener("message", handleMessage)

        return () => {
            if (intervalId) clearInterval(intervalId)
        }
    }, [chatbotId])

    return { config, chatbotId, chatId, userId, allMessages, setAllMessages, starterMessages }
}