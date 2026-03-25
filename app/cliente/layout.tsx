import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClienteSidebar from '@/components/dashboard/ClienteSidebar'

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role === 'profesional') redirect('/profesional')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ClienteSidebar profile={profile} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
