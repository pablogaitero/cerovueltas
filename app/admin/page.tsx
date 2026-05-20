//import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Topbar from '@/components/dashboard/Topbar'
import { UserCheck, Users, FileText, ArrowRight, Clock } from 'lucide-react'
import { formatCLP, formatDate } from '@/lib/utils'

type ProfPendiente = {
  id: string
  titulo: string
  user_id: string
  created_at: string
}

type ProfileRow = {
  id: string
  nombre: string
  apellido: string | null
  email: string
  created_at: string
}

export default async function AdminDashboard() {
 const supabase = createAdminClient()

// Agregar esto justo después:
const { data: testData, error: testError } = await supabase
  .from('profesionales')
  .select('id')
  .limit(1)

console.log('ADMIN CLIENT TEST:', JSON.stringify({ testData, testError }))

  // Stats simples — queries separadas sin joins
  /*const { count: totalProfesionales } = await supabase
    .from('profesionales')
    .select('*', { count: 'exact', head: true })*/

  const { count: totalProfesionales, error: err1 } = await supabase
  .from('profesionales')
  .select('*', { count: 'exact', head: true })

  const { count: profesionalesPendientes } = await supabase
    .from('profesionales')
    .select('*', { count: 'exact', head: true })
    .eq('verificado', false)

  /*const { count: totalClientes } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'cliente')
  */
  const { count: totalClientes, error: err2 } = await supabase
  .from('profiles')
  .select('*', { count: 'exact', head: true })
  .eq('role', 'cliente')

  console.log('PROF:', totalProfesionales, err1)
  console.log('CLIENTES:', totalClientes, err2)

  const { count: totalConexiones } = await supabase
    .from('conexiones')
    .select('*', { count: 'exact', head: true })

  const { count: informesPendientes } = await supabase
    .from('informes')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'solicitado')

  // Profesionales pendientes
  const { data: rawPendientes } = await supabase
    .from('profesionales')
    .select('id, titulo, user_id, created_at')
    .eq('verificado', false)
    .order('created_at', { ascending: false })
    .limit(5)
  const pendientes = (rawPendientes ?? []) as unknown as ProfPendiente[]

  // Obtener perfiles de los profesionales pendientes
  const userIds = pendientes.map(p => p.user_id)
  const { data: rawProfilesPend } = userIds.length > 0
    ? await supabase.from('profiles').select('id, nombre, apellido, email, created_at').in('id', userIds)
    : { data: [] }
  const profilesPend = (rawProfilesPend ?? []) as unknown as ProfileRow[]

  // Últimas conexiones
  const { data: rawConexiones } = await supabase
    .from('conexiones')
    .select('id, estado, monto, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  const conexiones = (rawConexiones ?? []) as unknown as Array<{
    id: string; estado: string; monto: number; created_at: string
  }>

  const totalIngresos = conexiones.reduce((acc, c) => acc + (c.monto ?? 0), 0)

  return (
    <div>
      <Topbar title="Panel de Administración" subtitle="Resumen general de Cerovueltas" />
      <div className="p-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Profesionales',      value: totalProfesionales ?? 0,      color: 'text-navy' },
            { label: 'Por Verificar',      value: profesionalesPendientes ?? 0, color: 'text-yellow-600',
              alert: (profesionalesPendientes ?? 0) > 0 },
            { label: 'Clientes / PYMEs',   value: totalClientes ?? 0,           color: 'text-green-600' },
            { label: 'Conexiones Totales', value: totalConexiones ?? 0,         color: 'text-blue-600' },
            { label: 'Informes Pendientes',value: informesPendientes ?? 0,      color: 'text-gold' },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-xl border p-5 ${s.alert ? 'border-yellow-300' : 'border-gray-100'}`}>
              <p className="text-gray-400 text-xs font-medium mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              {s.alert && <p className="text-yellow-600 text-xs mt-1 font-medium">⚠ Requiere atención</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-6">

          {/* Profesionales pendientes */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-navy text-sm">Pendientes de Verificación</h2>
                {(profesionalesPendientes ?? 0) > 0 && (
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {profesionalesPendientes}
                  </span>
                )}
              </div>
              <Link href="/admin/profesionales" className="text-xs text-gold font-medium hover:underline flex items-center gap-1">
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>
            {!pendientes.length ? (
              <div className="py-10 text-center">
                <UserCheck size={32} className="text-green-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">¡Todos verificados!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pendientes.map(p => {
                  const perfil = profilesPend.find(pr => pr.id === p.user_id)
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-9 h-9 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {perfil?.nombre?.[0] ?? '?'}{perfil?.apellido?.[0] ?? ''}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {perfil?.nombre ?? '—'} {perfil?.apellido ?? ''}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{p.titulo}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Clock size={11} />
                          {perfil ? formatDate(perfil.created_at) : '—'}
                        </div>
                        <Link href="/admin/profesionales"
                          className="text-xs bg-navy text-white px-2.5 py-1 rounded-lg font-medium hover:bg-navy-mid transition-colors">
                          Revisar
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Panel derecho */}
          <div className="col-span-2 space-y-4">
            <div className="bg-gradient-to-br from-navy to-navy-mid rounded-xl p-6 text-white">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">
                Ingresos Totales
              </p>
              <p className="font-display text-3xl font-bold">{formatCLP(totalIngresos)}</p>
              <p className="text-white/40 text-xs mt-1">{conexiones.length} conexiones recientes</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50">
                <h3 className="font-semibold text-navy text-sm">Acciones Rápidas</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { href: '/admin/profesionales', label: 'Verificar profesionales', icon: '✓', color: 'text-green-600' },
                  { href: '/admin/clientes',      label: 'Ver clientes registrados', icon: '👥', color: 'text-blue-600' },
                  { href: '/admin/informes',      label: 'Gestionar informes',       icon: '📄', color: 'text-gold' },
                ].map(a => (
                  <Link key={a.href} href={a.href}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors group">
                    <span className="text-base">{a.icon}</span>
                    <span className={`text-sm font-medium ${a.color}`}>{a.label}</span>
                    <ArrowRight size={13} className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
