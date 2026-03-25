'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'
import type { Profile } from '@/lib/supabase/types'
import {
  LayoutDashboard, Users, MessageSquare,
  FileText, UserCog, LogOut, ChevronRight,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/profesional',           label: 'Inicio',         icon: LayoutDashboard },
  { href: '/profesional/clientes',  label: 'Mis Clientes',   icon: Users },
  { href: '/profesional/mensajes',  label: 'Mensajes',       icon: MessageSquare },
  { href: '/profesional/informes',  label: 'Informes',       icon: FileText },
  { href: '/profesional/perfil',    label: 'Mi Perfil',      icon: UserCog },
]

interface Props {
  profile:     Profile
  rating?:     number
  totalReviews?: number
  verificado?: boolean
}

export default function ProfesionalSidebar({ profile, rating, totalReviews, verificado }: Props) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 bg-navy min-h-screen flex flex-col sticky top-0 shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/">
          <img src="/logo.png" alt="Cerovueltas" className="h-9 object-contain" />
        </Link>
      </div>

      {/* Perfil del profesional */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-white text-sm font-bold shrink-0">
            {getInitials(profile.nombre, profile.apellido)}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-semibold truncate">
              {profile.nombre} {profile.apellido ?? ''}
            </p>
            <p className="text-white/40 text-xs">Profesional</p>
          </div>
        </div>
        {/* Rating */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-0.5">
            <Star size={11} className="text-gold fill-gold" />
            <span className="text-white text-xs font-semibold">{rating?.toFixed(1) ?? '—'}</span>
            <span className="text-white/40 text-xs">({totalReviews ?? 0})</span>
          </div>
          {verificado && (
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium">
              ✓ Verificado
            </span>
          )}
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/profesional' && pathname.startsWith(href))
          return (
            <Link
              key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                active
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
              )}
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-gold" />}
            </Link>
          )
        })}
      </nav>

      {/* Disponibilidad toggle + logout */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/8 transition-all w-full"
        >
          <LogOut size={17} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
