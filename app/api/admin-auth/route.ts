import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return Response.json({ error: 'Admin password not configured' }, { status: 500 })
    }

    if (password !== adminPassword) {
      return Response.json({ error: 'Incorrect password' }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set('admin_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
      path: '/',
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('[ADMIN-AUTH] error:', error)
    return Response.json({ error: 'Auth failed' }, { status: 500 })
  }
}
