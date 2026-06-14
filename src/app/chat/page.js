import ChatWidgetFallback from '@/components/ChatWidgetFallback'

const page = async ({ searchParams }) => {
  const { chatbot_id } = await searchParams

  if (!chatbot_id) {
    return <div>Chatbot ID is required</div>
  }

  return <ChatWidgetFallback chatbotId={chatbot_id} />
}

export default page
