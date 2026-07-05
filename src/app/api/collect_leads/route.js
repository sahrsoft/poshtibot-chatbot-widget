import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { chat_id, name, email, mobile } = body

    if (chat_id === undefined || chat_id === null) {
      return NextResponse.json({ error: 'chat_id is required' }, { status: 400 })
    }

    const res = await fetch(`${process.env.API_SERVER_URL}.collect_leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, name, email, mobile })
    })

    const apiResponse = await res.json()
    return NextResponse.json(apiResponse, { status: res.ok ? 200 : res.status })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
