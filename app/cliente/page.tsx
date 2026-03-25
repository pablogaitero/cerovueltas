import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Topbar from '@/components/dashboard/Topbar'
import StatCard from '@/components/dashboard/StatCard'
import { Search, MessageSquare, FileText, ArrowRight, Star } from 'lucide-react'
import { formatCLP, formatDate } from '@/lib/utils'
import type { Profile } from '@/lib/supabase/types'

type ConexionRow = {
  id: string
  estado: string
  monto: number
  created_at: string
  profesionales: {
    id: string
    titulo: string
    badge: string | null
    verificado: boolean
    profiles: { nombre: string; apellido: string | null; avatar_url: string | null }
  } | null
}

type InformeRow = {
  id: string
  tipo: string
  estado: string
  created_at: string
}

export default async function ClienteDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = rawProfile as unknown as Profile | null

  const [{ count: totalConexiones }, { count: mensajesNoLeidos }, { count: totalInformes }] =
    await Promise.all([
      supabase.from('conexiones').select('*', { count: 'exact', head: true }).eq('cliente_id', user.id),
      supabase.from('mensajes').select('*', { count: 'exact', head: true })
        .eq('leido', false)
        .neq('emisor_id', user.id),
      supabase.from('informes').select('*', { count: 'exact', head: true }).eq('cliente_id', user.id),
    ])

  const { data: rawConexiones } = await supabase
    .from('conexiones')
    .select(`
      id, estado, monto, created_at,
      profesionales (
        id, titulo, badge, verificado,
        profiles ( nombre, apellido, avatar_url )
      )
    `)
    .eq('cliente_id', user.id)
    .order('created_at', { ascending: false })
    .limit(4)

  const conexiones = (rawConexiones ?? []) as unknown as ConexionRow[]

  const { data: rawInformes } = await supabase
    .from('informes')
    .select('id, tipo, estado, created_at')
    .eq('cliente_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const informes = (rawInformes ?? []) as unknown as InformeRow[]

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  const estadoColor: Record<string, string> = {
    pendiente: 'bg-yellow-50 text-yellow-700',
    activa:    'bg-green-50 text-green-700',
    pagada:    'bg-blue-50 text-blue-700',
    cerrada:   'bg-gray-100 text-gray-500',
  }

  return (
    <div>
      <Topbar
        title={`${saludo}, ${profile?.nombre ?? ''}`}
        subtitle={profile?.empresa ?? 'Panel de cliente'}
      />

      <div className="p-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Profesionales Conectados"
            value={totalConexiones ?? 0}
            icon={Search}
            color="navy"
            sub="conexiones activas"
          />
          <StatCard
            label="Mensajes No Leídos"
            value={mensajesNoLeidos ?? 0}
            icon={MessageSquare}
            color="gold"
            sub="sin respuesta"
          />
          <StatCard
            label="Informes Solicitados"
            value={totalInformes ?? 0}
            icon={FileText}
            color="green"
            sub="en la plataforma"
          />
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              href: '/cliente/buscar',
              icon: '🔍',
              title: 'Buscar Profesional',
              desc: '247 profesionales verificados disponibles',
              color: 'border-navy/20 hover:border-navy',
            },
            {
              href: '/cliente/informes',
              icon: '📊',
              title: 'Solicitar Informe',
              desc: 'Informes financieros desde $49.900',
              color: 'border-gold/30 hover:border-gold',
            },
            {
              href: '/cliente/mensajes',
              icon: '💬',
              title: 'Mis Mensajes',
              desc: `${mensajesNoLeidos ?? 0} mensajes sin leer`,
              color: 'border-gray-200 hover:border-gray-400',
            },
          ].map(a => (
            <Link
              key={a.href} href={a.href}
              className={`bg-white rounded-xl border-2 p-5 transition-all group ${a.color}`}
            >
              <div className="text-2xl mb-2">{a.icon}</div>
              <h3 className="font-semibold text-navy text-sm mb-1">{a.title}</h3>
              <p className="text-gray-400 text-xs">{a.desc}</p>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 mt-3 transition-colors" />
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-6">

          {/* Conexiones recientes */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-navy text-sm">Mis Profesionales</h2>
              <Link href="/cliente/buscar" className="text-xs text-gold font-medium hover:underline flex items-center gap-1">
                Ver más <ArrowRight size={12} />
              </Link>
            </div>
            {!conexiones.length ? (
              <div className="py-12 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-gray-400 text-sm">Aún no tienes profesionales conectados.</p>
                <Link href="/cliente/buscar" className="btn-gold inline-block mt-4 text-sm px-5 py-2">
                  Buscar ahora
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {conexiones.map(c => {
                  const prof = c.profesionales
                  if (!prof) return null
                  const nombre = `${prof.profiles.nombre} ${prof.profiles.apellido ?? ''}`.trim()
                  return (
                    <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-9 h-9 rounded-full bg-navy/10 flex items-center justify-center text-navy text-xs font-bold shrink-0">
                        {nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{nombre}</p>
                        <p className="text-xs text-gray-400 truncate">{prof.titulo}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estadoColor[c.estado]}`}>
                          {c.estado}
                        </span>
                        <Link href="/cliente/mensajes" className="text-xs text-gray-400 hover:text-navy">
                          <MessageSquare size={14} />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Informes recientes */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-navy text-sm">Informes Recientes</h2>
              <Link href="/cliente/informes" className="text-xs text-gold font-medium hover:underline flex items-center gap-1">
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>
            {!informes.length ? (
              <div className="py-10 text-center px-4">
                <p className="text-3xl mb-2">📄</p>
                <p className="text-gray-400 text-xs">Sin informes aún.</p>
                <Link href="/cliente/informes" className="btn-outline inline-block mt-3 text-xs px-4 py-1.5">
                  Solicitar
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {informes.map(inf => {
                  const colorEstado: Record<string, string> = {
                    solicitado: 'text-yellow-600',
                    en_proceso: 'text-blue-600',
                    entregado:  'text-green-600',
                    cancelado:  'text-red-400',
                  }
                  return (
                    <div key={inf.id} className="px-5 py-3">
                      <p className="text-xs font-semibold text-navy capitalize">{inf.tipo}</p>
                      <p className={`text-xs font-medium mt-0.5 ${colorEstado[inf.estado]}`}>
                        {inf.estado.replace('_', ' ')}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">{formatDate(inf.created_at)}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
