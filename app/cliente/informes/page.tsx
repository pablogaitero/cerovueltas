import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Topbar from '@/components/dashboard/Topbar'
import SolicitarInforme from './SolicitarInforme'
import { formatCLP, formatDate } from '@/lib/utils'
import { Download, FileText } from 'lucide-react'
import type { TipoInforme, EstadoInforme } from '@/lib/supabase/types'

type InformeRow = {
  id: string; tipo: TipoInforme; estado: EstadoInforme
  precio: number; titulo: string | null; archivo_url: string | null; created_at: string
}

export default async function InformesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawInformes } = await supabase
    .from('informes').select('id, tipo, estado, precio, titulo, archivo_url, created_at')
    .eq('cliente_id', user.id)
    .order('created_at', { ascending: false })
  const informes = (rawInformes ?? []) as unknown as InformeRow[]

  const estadoStyle: Record<string, string> = {
    solicitado: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    en_proceso: 'bg-blue-50 text-blue-700 border-blue-200',
    entregado:  'bg-green-50 text-green-700 border-green-200',
    cancelado:  'bg-gray-100 text-gray-500 border-gray-200',
  }

  return (
    <div>
      <Topbar title="Mis Informes" subtitle="Historial de informes financieros solicitados" />
      <div className="p-8 space-y-8">

        <div>
          <h2 className="font-display text-lg text-navy mb-4">Solicitar nuevo informe</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { tipo: 'basico' as TipoInforme, label: 'Básico', precio: 49900, dias: '5-7',
                items: ['Balance general', 'Estado de resultados', 'Flujo de caja básico', 'Entrega PDF'] },
              { tipo: 'completo' as TipoInforme, label: 'Completo', precio: 129900, dias: '3-5', popular: true,
                items: ['Todo lo del Básico', 'Análisis de ratios', 'Comparativo anual', 'IFRS básico', 'Reunión incluida'] },
              { tipo: 'premium' as TipoInforme, label: 'Premium', precio: 249900, dias: '2-3',
                items: ['Todo lo del Completo', 'Auditoría interna', 'Due diligence', 'Proyecciones 12 meses', 'Soporte 30 días'] },
            ].map(plan => (
              <div key={plan.tipo} className={`bg-white rounded-xl border-2 p-6 relative ${plan.popular ? 'border-gold' : 'border-gray-100'}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-xs font-bold px-3 py-0.5 rounded-full">
                    Más popular
                  </span>
                )}
                <h3 className="font-display text-lg text-navy mb-1">{plan.label}</h3>
                <div className="text-2xl font-bold text-gray-800 mb-0.5">{formatCLP(plan.precio)}</div>
                <p className="text-gray-400 text-xs mb-4">Entrega en {plan.dias} días hábiles</p>
                <ul className="space-y-1.5 mb-5">
                  {plan.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500 text-xs">✓</span> {item}
                    </li>
                  ))}
                </ul>
                <SolicitarInforme tipo={plan.tipo} precio={plan.precio} clienteId={user.id} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg text-navy mb-4">Historial</h2>
          {!informes.length ? (
            <div className="bg-white rounded-xl border border-gray-100 py-12 text-center">
              <FileText size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Aún no has solicitado informes.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    {['Tipo', 'Estado', 'Precio', 'Fecha', ''].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {informes.map(inf => (
                    <tr key={inf.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-navy capitalize">{inf.tipo}</span>
                        {inf.titulo && <p className="text-xs text-gray-400 mt-0.5">{inf.titulo}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${estadoStyle[inf.estado]}`}>
                          {inf.estado.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">{formatCLP(inf.precio)}</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">{formatDate(inf.created_at)}</td>
                      <td className="px-6 py-4">
                        {inf.archivo_url && (
                          <a href={inf.archivo_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-gold text-xs font-semibold hover:underline">
                            <Download size={13} /> Descargar
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
