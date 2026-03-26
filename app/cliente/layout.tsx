import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClienteSidebar from '@/components/dashboard/ClienteSidebar'
import type { Profile } from '@/lib/supabase/types'

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = rawProfile as unknown as Profile | null

  // NO redirigir si no hay perfil — evita loop
  const fallbackProfile: Profile = {
    id: user.id,
    role: 'cliente',
    nombre: user.email?.split('@')[0] ?? 'Usuario',
    apellido: null,
    email: user.email ?? '',
    telefono: null,
    empresa: null,
    rut: null,
    avatar_url: null,
    ciudad: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ClienteSidebar profile={profile ?? fallbackProfile} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}