import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/dashboard/AdminSidebar'
import type { Profile } from '@/lib/supabase/types'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawProfile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  const profile = rawProfile as unknown as Profile | null

  if (!profile || profile.role !== 'admin') redirect('/')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar profile={profile} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
