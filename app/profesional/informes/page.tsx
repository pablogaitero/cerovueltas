import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Topbar from '@/components/dashboard/Topbar'
import GestionInforme from './GestionInforme'
import { formatCLP, formatDate } from '@/lib/utils'
import { FileText } from 'lucide-react'

export default async function InformesProfesionalPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profesional } = await supabase
    .from('profesionales').select('id').eq('user_id', user.id).single()
  if (!profesional) redirect('/profesional/perfil')

  const { data: informes } = await supabase
    .from('informes')
    .select(`
      *,
      profiles!informes_cliente_id_fkey ( nombre, apellido, empresa, email )
    `)
    .eq('profesional_id', profesional.id)
    .order('created_at', { ascending: false })

  // Informes sin profesional asignado (disponibles para tomar)
  const { data: disponibles } = await supabase
    .from('informes')
    .select(`
      *,
      profiles!informes_cliente_id_fkey ( nombre, apellido, empresa )
    `)
    .is('profesional_id', null)
    .eq('estado', 'solicitado')
    .order('created_at', { ascending: false })
    .limit(10)

  const estadoStyle: Record<string, string> = {
    solicitado: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    en_proceso: 'bg-blue-50  text-blue-700  border-blue-200',
    entregado:  'bg-green-50 text-green-700 border-green-200',
    cancelado:  'bg-gray-100 text-gray-500  border-gray-200',
  }

  const totalIngresos = informes
    ?.filter(i => i.estado === 'entregado')
    .reduce((acc, i) => acc + i.precio, 0) ?? 0

  return (
    <div>
      <Topbar title="Informes" subtitle="Gestiona los informes asignados y disponibles" />
      <div className="p-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 text-sm">
          {[
            { label: 'Solicitados',  count: informes?.filter(i=>i.estado==='solicitado').length  ?? 0, color: 'text-yellow-600' },
            { label: 'En proceso',   count: informes?.filter(i=>i.estado==='en_proceso').length  ?? 0, color: 'text-blue-600' },
            { label: 'Entregados',   count: informes?.filter(i=>i.estado==='entregado').length   ?? 0, color: 'text-green-600' },
            { label: 'Ingresos',     count: formatCLP(totalIngresos),                                 color: 'text-gold' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-gray-400 text-xs mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            </div>
          ))}
        </div>

        {/* Informes disponibles para tomar */}
        {!!disponibles?.length && (
          <div className="bg-white rounded-xl border-2 border-gold/30 overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gold/20 bg-gold/5">
              <span className="text-gold font-bold text-sm">⚡ Nuevos informes disponibles</span>
              <span className="text-xs text-gold/70">({disponibles.length} sin asignar)</span>
            </div>
            <div className="divide-y divide-gray-50">
              {disponibles.map((inf: any) => (
                <div key={inf.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy text-sm capitalize">{inf.tipo}
                      <span className="ml-2 text-xs bg-navy/8 text-navy px-2 py-0.5 rounded">{formatCLP(inf.precio)}</span>
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {inf.profiles?.nombre} {inf.profiles?.apellido} · {inf.profiles?.empresa ?? 'Sin empresa'}
                    </p>
                  </div>
                  <p className="text-gray-400 text-xs shrink-0">{formatDate(inf.created_at)}</p>
                  <GestionInforme
                    informeId={inf.id}
                    estadoActual={inf.estado}
                    profesionalId={profesional.id}
                    archivoUrl={inf.archivo_url}
                    modo="tomar"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mis informes asignados */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-navy text-sm">Mis Informes Asignados</h2>
          </div>
          {!informes?.length ? (
            <div className="py-14 text-center">
              <FileText size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Aún no tienes informes asignados.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Cliente', 'Tipo', 'Estado', 'Precio', 'Fecha', 'Acciones'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {informes.map((inf: any) => (
                  <tr key={inf.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{inf.profiles?.nombre} {inf.profiles?.apellido}</p>
                      <p className="text-xs text-gray-400">{inf.profiles?.empresa ?? '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-navy capitalize">{inf.tipo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${estadoStyle[inf.estado]}`}>
                        {inf.estado.replace('_',' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">{formatCLP(inf.precio)}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{formatDate(inf.created_at)}</td>
                    <td className="px-6 py-4">
                      <GestionInforme
                        informeId={inf.id}
                        estadoActual={inf.estado}
                        profesionalId={profesional.id}
                        archivoUrl={inf.archivo_url}
                        modo="gestionar"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}
