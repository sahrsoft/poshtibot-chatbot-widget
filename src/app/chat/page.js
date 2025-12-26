import ChatWidget from "@/components/ChatWidget"

const page = async ({ searchParams }) => {
    const { chatbot_id } = await searchParams

    return (
        <ChatWidget chatbotId={chatbot_id} />
    )
}

export default page