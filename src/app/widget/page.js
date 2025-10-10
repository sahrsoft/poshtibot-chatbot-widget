import WidgetRoot from "@/components/WidgetRoot"

const page = async ({ searchParams }) => {
    const appId = await searchParams?.app_id || "unknown";

    // ✅ Decode theme from query
    let theme = {};
    try {
        theme = await searchParams?.theme
            ? JSON.parse(decodeURIComponent(await searchParams.theme))
            : {};
    } catch (e) {
        console.error("Error parsing theme", e);
    }

    return (
        <WidgetRoot appId={appId} theme={theme} />
    )
}

export default page
