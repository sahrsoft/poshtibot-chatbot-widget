import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const body = await request.json()

        const { conversation_id, name, email, mobile } = body

        const data = {
            conversation_id,
            name,
            email,
            mobile
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}.collect_leads`, {
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