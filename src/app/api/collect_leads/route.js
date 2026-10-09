import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { chat_id, name, email, mobile } = body

    if (typeof chat_id !== 'string' || chat_id.length === 0 || chat_id.length > 128) {
      return NextResponse.json({ error: 'chat_id is required' }, { status: 400 })
    }
    if (!process.env.API_SERVER_URL) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const res = await fetch(`${process.env.API_SERVER_URL}.collect_leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, name, email, mobile })
    })

    const apiResponse = await res.json().catch(() => ({}))
    return NextResponse.json(apiResponse, { status: res.ok ? 200 : res.status })
  } catch (error) {
    console.error('[API collect_leads]', error)
    return NextResponse.json({ error: 'Unable to submit lead information' }, { status: 502 })
  }
}
