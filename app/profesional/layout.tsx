import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfesionalSidebar from '@/components/dashboard/ProfesionalSidebar'
import type { Profile } from '@/lib/supabase/types'

type ProfData = { rating: number; total_reviews: number; verificado: boolean }

export default async function ProfesionalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: rawProfile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const profile = rawProfile as unknown as Profile | null

  // Si no puede leer el perfil, mostrar el dashboard igual
  // NO redirigir para evitar loops
  const fallbackProfile: Profile = {
    id: user.id,
    role: 'profesional',
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

  const { data: rawProf } = await supabase
    .from('profesionales')
    .select('rating, total_reviews, verificado')
    .eq('user_id', user.id)
    .single()

  const profData = rawProf as unknown as ProfData | null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ProfesionalSidebar
        profile={profile ?? fallbackProfile}
        rating={profData?.rating}
        totalReviews={profData?.total_reviews}
        verificado={profData?.verificado}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}