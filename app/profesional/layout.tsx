import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfesionalSidebar from '@/components/dashboard/ProfesionalSidebar'

export default async function ProfesionalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role === 'cliente') redirect('/cliente')

  // Datos del profesional (rating, verificado)
  const { data: profData } = await supabase
    .from('profesionales')
    .select('rating, total_reviews, verificado')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ProfesionalSidebar
        profile={profile}
        rating={profData?.rating}
        totalReviews={profData?.total_reviews}
        verificado={profData?.verificado}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
