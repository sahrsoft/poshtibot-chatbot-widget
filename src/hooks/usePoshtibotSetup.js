import { useEffect, useState } from "react"

const DEFAULT_BOT_MESSAGE = { sender: "poshtibot", message: "سلام، چطور می‌تونم کمکتون کنم؟" }

export function usePoshtibotSetup() {
    const [config, setConfig] = useState(null)
    const [conversationId, setConversationId] = useState(null)
    const [userId, setUserId] = useState(null)
    const [allMessages, setAllMessages] = useState([DEFAULT_BOT_MESSAGE])

    useEffect(() => {
        let intervalId = null

        const loadFromLocalStorage = () => {
            try {
                const conversationData = JSON.parse(localStorage.getItem("poshtibot-conversation-data") || "{}")
                const pwc = JSON.parse(localStorage.getItem("poshtibot-widget-config") || "null")
                const savedMessages = JSON.parse(localStorage.getItem("poshtibot-messages") || "[]")

                if (pwc) {
                    setConfig(pwc)
                    setConversationId(conversationData.poshtibot_conversation_id)
                    setUserId(conversationData.poshtibot_user_id)
                    setAllMessages(savedMessages.length > 0 ? savedMessages : [DEFAULT_BOT_MESSAGE])
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

        // return () => {
        //     if (intervalId) clearInterval(intervalId)
        // window.removeEventListener("message", handleMessage)
        // }
    }, [])

    return { config, conversationId, userId, allMessages, setAllMessages }
}