import ChatWidget from "@/components/ChatWidget";

export default function WidgetFrame({ searchParams }) {
    const appId = searchParams?.app_id || "unknown";

    // ✅ Decode theme from query
    let theme = {};
    try {
        theme = searchParams?.theme
            ? JSON.parse(decodeURIComponent(searchParams.theme))
            : {};
    } catch (e) {
        console.error("Error parsing theme", e);
    }

    return <ChatWidget appId={appId} theme={theme} />;
}
