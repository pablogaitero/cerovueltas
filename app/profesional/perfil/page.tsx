import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Topbar from '@/components/dashboard/Topbar'
import PerfilForm from './PerfilForm'

export default async function PerfilPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: profesional } = await supabase
    .from('profesionales').select('*').eq('user_id', user.id).single()

  return (
    <div>
      <Topbar
        title="Mi Perfil"
        subtitle="Completa tu información para aparecer en búsquedas"
      />
      <div className="p-8 max-w-3xl">
        <PerfilForm profile={profile} profesional={profesional} userId={user.id} />
      </div>
    </div>
  )
}
