import ChatWidget from "@/components/ChatWidget"

export default function WidgetFrame({ searchParams }) {
    const appId = searchParams?.app_id || "unknown"
    return <ChatWidget appId={appId} />
}