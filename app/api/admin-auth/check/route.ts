import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')

  if (authCookie?.value === 'authenticated') {
    return Response.json({ authenticated: true })
  }

  return Response.json({ authenticated: false }, { status: 401 })
}
