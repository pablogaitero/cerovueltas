import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import type { Profile } from '@/lib/supabase/types'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Sin sesión → login
  if (!user) redirect('/login')

  const { data: rawProfile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const profile = rawProfile as unknown as Profile | null

  // Fallback si no puede leer el perfil
  const fallbackProfile: Profile = {
    id: user.id,
    role: 'admin',
    nombre: user.email?.split('@')[0] ?? 'Admin',
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
      <AdminSidebar profile={profile ?? fallbackProfile} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
