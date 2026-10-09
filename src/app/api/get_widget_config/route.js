import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get('chatbot_id')

    if (!chatbotId || chatbotId.length > 128 || !/^[\w-]+$/.test(chatbotId)) {
      return NextResponse.json({ error: 'chatbot_id is required' }, { status: 400 })
    }
    if (!process.env.API_SERVER_URL) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const apiUrl = `${process.env.API_SERVER_URL}.get_widget_config?chatbot_id=${encodeURIComponent(chatbotId)}`
    const response = await fetch(apiUrl, { cache: 'no-store' })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream API returned ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API get_widget_config]', error)
    return NextResponse.json({ error: 'Unable to load widget configuration' }, { status: 502 })
  }
}
