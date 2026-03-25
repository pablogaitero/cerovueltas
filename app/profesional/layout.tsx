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

  if (!profile || profile.role === 'cliente') redirect('/cliente')

  const { data: rawProf } = await supabase
    .from('profesionales')
    .select('rating, total_reviews, verificado')
    .eq('user_id', user.id)
    .single()
  const profData = rawProf as unknown as ProfData | null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ProfesionalSidebar
        profile={profile}
        rating={profData?.rating}
        totalReviews={profData?.total_reviews}
        verificado={profData?.verificado}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
