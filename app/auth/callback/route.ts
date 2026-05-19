import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
              })
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: rawProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const profile = rawProfile as { role: string } | null
        const role = profile?.role ?? 'cliente'

        const dashboard =
          role === 'profesional' ? '/profesional'
          : role === 'admin'     ? '/admin'
          : '/cliente'

        return NextResponse.redirect(`${origin}${dashboard}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
