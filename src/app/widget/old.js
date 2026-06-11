import WidgetRoot from "@/components/WidgetRoot"

const page = async ({ searchParams }) => {
    // const chatbotId = await searchParams?.chatbot_id || "unknown"

    const { chatbot_id } = await searchParams

    return (
        <WidgetRoot chatbotId={chatbot_id} />
    )
}

export default page