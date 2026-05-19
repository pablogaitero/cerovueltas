import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Topbar from '@/components/dashboard/Topbar'
import { formatCLP, formatDate } from '@/lib/utils'
import { FileText } from 'lucide-react'

type InformeAdmin = {
  id: string; tipo: string; estado: string; precio: number
  created_at: string; entregado_at: string | null
  cliente:      { nombre: string; apellido: string | null; empresa: string | null } | null
  profesional:  { titulo: string; profiles: { nombre: string; apellido: string | null } | null } | null
}

export default async function AdminInformesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawInformes } = await supabase
    .from('informes')
    .select(`
      id, tipo, estado, precio, created_at, entregado_at,
      cliente:profiles!informes_cliente_id_fkey ( nombre, apellido, empresa ),
      profesional:profesionales ( titulo, profiles!profesionales_user_id_fkey ( nombre, apellido ) )
    `)
    .order('created_at', { ascending: false })

  const informes = (rawInformes ?? []) as unknown as InformeAdmin[]

  const totalIngresos = informes
    .filter(i => i.estado === 'entregado')
    .reduce((acc, i) => acc + i.precio, 0)

  const estadoStyle: Record<string, string> = {
    solicitado: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    en_proceso: 'bg-blue-50  text-blue-700  border-blue-200',
    entregado:  'bg-green-50 text-green-700 border-green-200',
    cancelado:  'bg-gray-100 text-gray-500  border-gray-200',
  }

  return (
    <div>
      <Topbar title="Informes Financieros" subtitle="Todos los informes de la plataforma" />
      <div className="p-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Total',       count: informes.length,                                       color: 'text-navy' },
            { label: 'Solicitados', count: informes.filter(i=>i.estado==='solicitado').length,    color: 'text-yellow-600' },
            { label: 'En proceso',  count: informes.filter(i=>i.estado==='en_proceso').length,    color: 'text-blue-600' },
            { label: 'Entregados',  count: informes.filter(i=>i.estado==='entregado').length,     color: 'text-green-600' },
            { label: 'Ingresos',    count: formatCLP(totalIngresos),                              color: 'text-gold' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-gray-400 text-xs mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            </div>
          ))}
        </div>

        {/* Tabla */}
        {!informes.length ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <FileText size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No hay informes aún.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Tipo', 'Estado', 'Cliente', 'Profesional', 'Precio', 'Fecha', 'Entrega'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {informes.map(inf => (
                  <tr key={inf.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-navy capitalize">{inf.tipo}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${estadoStyle[inf.estado]}`}>
                        {inf.estado.replace('_',' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-800">{inf.cliente?.nombre} {inf.cliente?.apellido ?? ''}</p>
                      <p className="text-xs text-gray-400">{inf.cliente?.empresa ?? '—'}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {inf.profesional
                        ? `${inf.profesional.profiles?.nombre ?? ''} ${inf.profesional.profiles?.apellido ?? ''}`
                        : <span className="text-gray-400 italic">Sin asignar</span>
                      }
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-700">{formatCLP(inf.precio)}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{formatDate(inf.created_at)}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {inf.entregado_at ? formatDate(inf.entregado_at) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
