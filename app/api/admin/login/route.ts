import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 })
    }

    const sessionToken = process.env.ADMIN_SESSION_TOKEN || 'dev-token'

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400
    })

    return response
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Something went wrong' }, { status: 500 })
  }
}
