import WidgetRoot from "@/components/WidgetRoot"

const page = ({ searchParams }) => {
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

    return (
        <WidgetRoot appId={appId} theme={theme} />
    )
}

export default page
