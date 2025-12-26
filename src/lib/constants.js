export const LOCAL_STORAGE_CONFIG_KEY = "poshtibot-widget-config"
export const LOCAL_STORAGE_STARTER_KEY = "poshtibot-starter-messages"
export const LOCAL_STORAGE_CHAT_DATA_KEY = "poshtibot-chat-data"
export const LOCAL_STORAGE_MESSAGES_KEY = "poshtibot-messages"

// Helper functions to get localStorage keys with chatbot_id suffix
export const getStorageKey = (baseKey, chatbotId) => {
  if (!chatbotId) return baseKey
  return `${baseKey}-${chatbotId}`
}

export const getConfigKey = (chatbotId) => getStorageKey(LOCAL_STORAGE_CONFIG_KEY, chatbotId)
export const getStarterKey = (chatbotId) => getStorageKey(LOCAL_STORAGE_STARTER_KEY, chatbotId)
export const getChatDataKey = (chatbotId) => getStorageKey(LOCAL_STORAGE_CHAT_DATA_KEY, chatbotId)
export const getMessagesKey = (chatbotId) => getStorageKey(LOCAL_STORAGE_MESSAGES_KEY, chatbotId)