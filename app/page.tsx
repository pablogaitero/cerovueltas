import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Intentar leer perfil
  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = rawProfile as { role: string } | null

  // Si no puede leer el perfil, usar metadata del usuario
  const role = profile?.role 
    ?? (user.user_metadata?.role as string | undefined)
    ?? 'cliente'

  if (role === 'admin')       redirect('/admin')
  if (role === 'profesional') redirect('/profesional')
  redirect('/cliente')
}
