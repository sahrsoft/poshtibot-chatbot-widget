import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const body = await request.json()

        const { user_flows_data, conversation_id } = body

        const data = {
            user_flows_data,
            conversation_id
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}.add_new_conversation_on_widget_lunch`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })

        const apiResponse = await res.json()

        return NextResponse.json(apiResponse, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { error },
            { status: 400 }
        )
    }
}