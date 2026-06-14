import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { user_flows_data, chat_id } = body

    if (!chat_id) {
      return NextResponse.json({ error: 'chat_id is required' }, { status: 400 })
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}.add_new_chat_on_widget_lunch`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_flows_data, chat_id })
      }
    )

    const apiResponse = await res.json()
    return NextResponse.json(apiResponse, { status: res.ok ? 200 : res.status })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
