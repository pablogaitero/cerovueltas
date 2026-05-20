import { createAdminClient } from '@/lib/supabase/admin'
import Topbar from '@/components/dashboard/Topbar'
import { formatCLP, formatDate } from '@/lib/utils'
import { FileText } from 'lucide-react'

type InformeAdmin = {
  id: string; tipo: string; estado: string; precio: number
  created_at: string; entregado_at: string | null
  cliente_id: string; profesional_id: string | null
}

type ProfileRow = { id: string; nombre: string; apellido: string | null; empresa: string | null }
type ProfRow = { id: string; titulo: string; user_id: string }

export default async function AdminInformesPage() {
  const supabase = createAdminClient()

  const { data: rawInformes } = await supabase
    .from('informes')
    .select('id, tipo, estado, precio, created_at, entregado_at, cliente_id, profesional_id')
    .order('created_at', { ascending: false })
  const informes = (rawInformes ?? []) as unknown as InformeAdmin[]

  // Obtener perfiles de clientes
  const clienteIds = [...new Set(informes.map(i => i.cliente_id))]
  const { data: rawClientes } = clienteIds.length > 0
    ? await supabase.from('profiles').select('id, nombre, apellido, empresa').in('id', clienteIds)
    : { data: [] }
  const clientes = (rawClientes ?? []) as unknown as ProfileRow[]

  // Obtener profesionales
  const profIds = [...new Set(informes.map(i => i.profesional_id).filter(Boolean))] as string[]
  const { data: rawProfs } = profIds.length > 0
    ? await supabase.from('profesionales').select('id, titulo, user_id').in('id', profIds)
    : { data: [] }
  const profs = (rawProfs ?? []) as unknown as ProfRow[]

  const profUserIds = profs.map(p => p.user_id)
  const { data: rawProfProfiles } = profUserIds.length > 0
    ? await supabase.from('profiles').select('id, nombre, apellido').in('id', profUserIds)
    : { data: [] }
  const profProfiles = (rawProfProfiles ?? []) as unknown as ProfileRow[]

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

        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Total',      count: informes.length,                                      color: 'text-navy' },
            { label: 'Solicitados',count: informes.filter(i=>i.estado==='solicitado').length,   color: 'text-yellow-600' },
            { label: 'En proceso', count: informes.filter(i=>i.estado==='en_proceso').length,   color: 'text-blue-600' },
            { label: 'Entregados', count: informes.filter(i=>i.estado==='entregado').length,    color: 'text-green-600' },
            { label: 'Ingresos',   count: formatCLP(totalIngresos),                             color: 'text-gold' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
              <p className="text-gray-400 text-xs mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            </div>
          ))}
        </div>

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
                {informes.map(inf => {
                  const cli = clientes.find(c => c.id === inf.cliente_id)
                  const prof = profs.find(p => p.id === inf.profesional_id)
                  const profProfile = profProfiles.find(p => p.id === prof?.user_id)
                  return (
                    <tr key={inf.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4"><span className="font-semibold text-navy capitalize">{inf.tipo}</span></td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${estadoStyle[inf.estado]}`}>
                          {inf.estado.replace('_',' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-gray-800">{cli?.nombre} {cli?.apellido ?? ''}</p>
                        <p className="text-xs text-gray-400">{cli?.empresa ?? '—'}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {profProfile ? `${profProfile.nombre} ${profProfile.apellido ?? ''}` : <span className="text-gray-400 italic">Sin asignar</span>}
                      </td>
                      <td className="px-5 py-4 font-medium text-gray-700">{formatCLP(inf.precio)}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{formatDate(inf.created_at)}</td>
                      <td className="px-5 py-4 text-gray-400 text-xs">{inf.entregado_at ? formatDate(inf.entregado_at) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
