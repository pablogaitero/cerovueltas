import AdminSidebar from '@/components/dashboard/AdminSidebar'
import type { Profile } from '@/lib/supabase/types'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const fallbackProfile: Profile = {
    id: 'admin',
    role: 'admin',
    nombre: 'Admin',
    apellido: null,
    email: 'admin@cerovueltas.cl',
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
      <AdminSidebar profile={fallbackProfile} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
