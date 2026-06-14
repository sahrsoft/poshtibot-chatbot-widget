'use client'

import dynamic from 'next/dynamic'

const ChatWidget = dynamic(() => import('@/components/ChatWidget'), { ssr: false })

export default function ChatWidgetFallback({ chatbotId }) {
  return <ChatWidget chatbotId={chatbotId} />
}
