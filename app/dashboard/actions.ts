'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const submitted = formData.get('password') as string
  const expected = process.env.DASHBOARD_DEMO_PASSWORD

  if (!expected) {
    return { error: 'Demo password is not configured on the server.' }
  }

  if (submitted !== expected) {
    return { error: 'Incorrect password.' }
  }

  const cookieStore = await cookies()
  cookieStore.set('tabletalk_demo_auth', expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  redirect('/dashboard')
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('tabletalk_demo_auth')
  redirect('/dashboard/login')
}
