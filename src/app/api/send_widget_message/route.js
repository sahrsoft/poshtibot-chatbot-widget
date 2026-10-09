import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { user_flows_data, chatbot_id, chat_id, message } = body

    if (!chatbot_id || typeof chatbot_id !== 'string' || chatbot_id.length > 128) {
      return NextResponse.json({ error: 'chatbot_id is required' }, { status: 400 })
    }
    if (!chat_id || typeof chat_id !== 'string' || chat_id.length > 128) {
      return NextResponse.json({ error: 'chat_id is required' }, { status: 400 })
    }
    if (!user_flows_data) {
      return NextResponse.json({ error: 'user_flows_data is required' }, { status: 400 })
    }
    if (!process.env.API_SERVER_URL) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const res = await fetch(`${process.env.API_SERVER_URL}.get_message_from_user_on_widget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_agent: Boolean(body.to_agent),
        user_flows_data,
        chatbot_id,
        chat_id,
        message: message || '',
        audio_url: body.audio_url || undefined,
        file_url: body.file_url || undefined,
        message_type: body.message_type || undefined,
        audio_duration: body.audio_duration || undefined,
        audio_mime_type: body.audio_mime_type || undefined
      })
    })

    const apiResponse = await res.json().catch(() => ({}))
    return NextResponse.json(apiResponse, { status: res.ok ? 200 : res.status })
  } catch (error) {
    console.error('[API send_widget_message]', error)
    return NextResponse.json({ error: 'Unable to send message' }, { status: 502 })
  }
}
