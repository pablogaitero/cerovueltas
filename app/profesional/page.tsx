import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Topbar from '@/components/dashboard/Topbar'
import StatCard from '@/components/dashboard/StatCard'
import DisponibilidadToggle from './DisponibilidadToggle'
import { Users, MessageSquare, FileText, Star, ArrowRight, TrendingUp } from 'lucide-react'
import { formatCLP, formatDate, ESPECIALIDAD_LABELS } from '@/lib/utils'
import type { Profile, Profesional } from '@/lib/supabase/types'

type ConexionRow = {
  id: string; estado: string; monto: number; created_at: string
  profiles: { nombre: string; apellido: string | null; empresa: string | null; avatar_url: string | null } | null
}
type ReviewRow = {
  rating: number; comentario: string | null; created_at: string
  profiles: { nombre: string; apellido: string | null } | null
}
type IngresoRow = { monto: number }

export default async function ProfesionalDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const profile = rawProfile as unknown as Profile | null

  const { data: rawProfesional } = await supabase.from('profesionales').select('*').eq('user_id', user.id).single()
  const profesional = rawProfesional as unknown as Profesional | null

  if (!profesional) redirect('/profesional/perfil')

  const [
    { count: totalClientes },
    { count: mensajesNoLeidos },
    { count: informesPendientes },
  ] = await Promise.all([
    supabase.from('conexiones').select('*', { count: 'exact', head: true }).eq('profesional_id', profesional.id).eq('estado', 'activa'),
    supabase.from('mensajes').select('*', { count: 'exact', head: true }).eq('leido', false).neq('emisor_id', user.id),
    supabase.from('informes').select('*', { count: 'exact', head: true }).eq('profesional_id', profesional.id).eq('estado', 'en_proceso'),
  ])

  const { data: rawConexiones } = await supabase
    .from('conexiones')
    .select(`id, estado, monto, created_at, profiles!conexiones_cliente_id_fkey ( nombre, apellido, empresa, avatar_url )`)
    .eq('profesional_id', profesional.id)
    .order('created_at', { ascending: false })
    .limit(5)
  const conexiones = (rawConexiones ?? []) as unknown as ConexionRow[]

  const { data: rawReviews } = await supabase
    .from('reviews')
    .select('rating, comentario, created_at, profiles!reviews_cliente_id_fkey(nombre, apellido)')
    .eq('profesional_id', profesional.id)
    .order('created_at', { ascending: false })
    .limit(3)
  const reviews = (rawReviews ?? []) as unknown as ReviewRow[]

  const inicio = new Date(); inicio.setDate(1); inicio.setHours(0,0,0,0)
  const { data: rawIngresos } = await supabase
    .from('conexiones').select('monto')
    .eq('profesional_id', profesional.id).eq('estado', 'activa')
    .gte('created_at', inicio.toISOString())
  const ingresos = (rawIngresos ?? []) as unknown as IngresoRow[]
  const totalMes = ingresos.reduce((acc, c) => acc + (c.monto ?? 0), 0)

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
      <Topbar title={`${saludo}, ${profile?.nombre ?? ''}`} subtitle={profesional.titulo} />
      <div className="p-8 space-y-8">

        {/* Banner disponibilidad */}
        <div className="bg-white rounded-xl border border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-navy text-sm">Estado de disponibilidad</p>
            <p className="text-gray-400 text-xs mt-0.5">
              {profesional.disponible ? 'Visible para clientes — recibirás nuevas conexiones' : 'Oculto — no aparecerás en búsquedas'}
            </p>
          </div>
          <DisponibilidadToggle profesionalId={profesional.id} disponibleInicial={profesional.disponible} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Clientes Activos"    value={totalClientes ?? 0}     icon={Users}         color="navy"  sub="conexiones activas" />
          <StatCard label="Mensajes Sin Leer"   value={mensajesNoLeidos ?? 0}  icon={MessageSquare} color="gold"  sub="pendientes" />
          <StatCard label="Informes en Proceso" value={informesPendientes ?? 0} icon={FileText}     color="green" sub="por entregar" />
          <StatCard label="Rating Promedio"     value={`${profesional.rating?.toFixed(1) ?? '—'}★`} icon={Star} color="gray" sub={`${profesional.total_reviews} reseñas`} />
        </div>

        {/* Ingresos del mes */}
        <div className="bg-gradient-to-r from-navy to-navy-mid rounded-xl p-6 flex items-center justify-between text-white">
          <div>
            <p className="text-white/60 text-sm mb-1">Ingresos este mes</p>
            <p className="font-display text-3xl font-bold">{formatCLP(totalMes)}</p>
            <p className="text-white/50 text-xs mt-1">Por conexiones activas</p>
          </div>
          <TrendingUp size={40} className="text-white/20" />
        </div>

        <div className="grid grid-cols-5 gap-6">

          {/* Últimos clientes */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-navy text-sm">Últimos Clientes</h2>
              <Link href="/profesional/clientes" className="text-xs text-gold font-medium hover:underline flex items-center gap-1">
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>
            {!conexiones.length ? (
              <div className="py-12 text-center">
                <p className="text-3xl mb-2">👥</p>
                <p className="text-gray-400 text-sm">Aún no tienes clientes conectados.</p>
                <Link href="/profesional/perfil" className="btn-gold inline-block mt-3 text-xs px-4 py-2">Completar perfil</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {conexiones.map(c => {
                  const cli = c.profiles
                  const nombre = `${cli?.nombre ?? ''} ${cli?.apellido ?? ''}`.trim()
                  return (
                    <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-9 h-9 rounded-full bg-gold/15 text-gold flex items-center justify-center text-xs font-bold shrink-0">
                        {nombre.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{nombre}</p>
                        <p className="text-xs text-gray-400 truncate">{cli?.empresa ?? 'Sin empresa'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estadoColor[c.estado]}`}>{c.estado}</span>
                        <span className="text-xs text-gray-400">{formatCLP(c.monto)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-navy text-sm">Reseñas Recientes</h2>
              <div className="flex items-center gap-1 text-gold">
                <Star size={13} className="fill-gold" />
                <span className="text-sm font-bold">{profesional.rating?.toFixed(1)}</span>
              </div>
            </div>
            {!reviews.length ? (
              <div className="py-10 text-center px-4">
                <Star size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-xs">Aún sin reseñas.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {reviews.map((r, i) => (
                  <div key={i} className="px-5 py-3">
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, s) => (
                        <Star key={s} size={11} className={s < r.rating ? 'text-gold fill-gold' : 'text-gray-200 fill-gray-200'} />
                      ))}
                      <span className="text-gray-400 text-xs ml-1">{formatDate(r.created_at)}</span>
                    </div>
                    {r.comentario && <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">"{r.comentario}"</p>}
                    <p className="text-gray-400 text-xs mt-1">— {r.profiles?.nombre} {r.profiles?.apellido ?? ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Especialidades */}
        <div className="bg-white rounded-xl border border-gray-100 px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-navy text-sm">Mis Especialidades</h2>
            <Link href="/profesional/perfil" className="text-xs text-gold hover:underline">Editar perfil →</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {profesional.especialidades?.map((esp: string) => (
              <span key={esp} className="bg-navy/8 text-navy text-xs font-semibold px-3 py-1.5 rounded-full">
                {ESPECIALIDAD_LABELS[esp] ?? esp}
              </span>
            ))}
            {!profesional.especialidades?.length && <p className="text-gray-400 text-xs">Sin especialidades configuradas.</p>}
          </div>
        </div>

      </div>
    </div>
  )
}
