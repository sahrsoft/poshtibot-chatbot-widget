import { NextResponse } from 'next/server'

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const chatbotId = searchParams.get('chatbot_id')

        if (!chatbotId) {
            return NextResponse.json({ error: 'chatbot_id is required' }, { status: 400 })
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_API_SERVER_URL}.get_widget_config?chatbot_id=${chatbotId}`
        const response = await fetch(apiUrl)

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch widget config', status: response.status },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
