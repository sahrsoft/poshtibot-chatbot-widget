import WidgetRoot from "@/components/WidgetRoot"

const page = async ({ searchParams }) => {
  const { chatbot_id } = await searchParams

  if (!chatbot_id) {
    return <div>Chatbot ID is required</div>
  }

  return <WidgetRoot chatbotId={chatbot_id} />
}

export default page
