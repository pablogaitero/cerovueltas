import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = rawProfile as { role: string } | null
  const role = profile?.role ?? 'cliente'

  if (role === 'admin')       redirect('/admin')
  if (role === 'profesional') redirect('/profesional')
  redirect('/cliente')
}