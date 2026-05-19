import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Topbar from '@/components/dashboard/Topbar'
import { formatDate, formatCLP } from '@/lib/utils'
import { Users } from 'lucide-react'

type ClienteAdmin = {
  id: string; nombre: string; apellido: string | null
  email: string; empresa: string | null; rut_empresa: string | null
  giro: string | null; relacion_empresa: string | null
  trabajadores_contrato: number | null; trabajadores_honorarios: number | null
  promedio_ventas: number | null; created_at: string
}

export default async function AdminClientesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawClientes } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'cliente')
    .order('created_at', { ascending: false })

  const clientes = (rawClientes ?? []) as unknown as ClienteAdmin[]

  return (
    <div>
      <Topbar title="Clientes / PYMEs" subtitle={`${clientes.length} empresas registradas`} />
      <div className="p-8">
        {!clientes.length ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <Users size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Aún no hay clientes registrados.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Empresa', 'Representante', 'RUT Empresa', 'Giro', 'Trabajadores', 'Prom. Ventas', 'Registro'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clientes.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-navy">{c.empresa ?? '—'}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-800">{c.nombre} {c.apellido ?? ''}</p>
                      <p className="text-xs text-gray-400">{c.relacion_empresa ?? '—'}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{c.rut_empresa ?? '—'}</td>
                    <td className="px-5 py-4 text-gray-600 max-w-32 truncate">{c.giro ?? '—'}</td>
                    <td className="px-5 py-4">
                      <p className="text-gray-700 text-xs">
                        Contrato: <strong>{c.trabajadores_contrato ?? 0}</strong>
                      </p>
                      <p className="text-gray-700 text-xs">
                        Honorarios: <strong>{c.trabajadores_honorarios ?? 0}</strong>
                      </p>
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-700">
                      {c.promedio_ventas ? formatCLP(c.promedio_ventas) : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{formatDate(c.created_at)}</td>
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
