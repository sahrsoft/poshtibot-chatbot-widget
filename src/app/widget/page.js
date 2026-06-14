import WidgetRootWrapper from '@/components/WidgetRootWrapper'

const page = async ({ searchParams }) => {
  const { chatbot_id } = await searchParams

  if (!chatbot_id) {
    return <div>Chatbot ID is required</div>
  }

  return <WidgetRootWrapper chatbotId={chatbot_id} />
}

export default page
