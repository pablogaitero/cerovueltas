'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'
import {
  LayoutDashboard, Users, UserCheck,
  FileText, BarChart2, LogOut, ChevronRight, Shield, Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin',                        label: 'Resumen',           icon: LayoutDashboard },
  { href: '/admin/profesionales',          label: 'Profesionales',     icon: UserCheck },
  { href: '/admin/clientes',               label: 'Clientes / PYMEs',  icon: Users },
  { href: '/admin/informes',               label: 'Informes',          icon: FileText },
  { href: '/admin/informes/configuracion', label: 'Config. Informes',  icon: Settings },  
]

export default function AdminSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 min-h-screen flex flex-col sticky top-0 shrink-0"
      style={{ background: '#0f0f2e' }}>

      {/* Logo + badge admin */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/">
          <img src="/logo.png" alt="Cerovueltas" className="h-9 object-contain" />
        </Link>
        <div className="flex items-center gap-1.5 mt-2">
          <Shield size={11} className="text-gold" />
          <span className="text-xs text-gold font-bold uppercase tracking-widest">Panel Admin</span>
        </div>
      </div>

      {/* Perfil */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-white text-sm font-bold shrink-0">
            {profile.nombre?.[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-semibold truncate">{profile.nombre}</p>
            <p className="text-white/40 text-xs">Administrador</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                active
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
              )}>
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-gold" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/8 transition-all w-full">
          <LogOut size={17} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
