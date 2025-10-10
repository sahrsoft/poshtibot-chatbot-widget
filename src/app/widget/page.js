import WidgetRoot from "@/components/WidgetRoot"

const page = async ({ searchParams }) => {
    const chatbotId = await searchParams?.chatbot_id || "unknown"

    return (
        <WidgetRoot chatbotId={chatbotId} />
    )
}

export default page