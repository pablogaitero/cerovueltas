import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Topbar from '@/components/dashboard/Topbar'
import Link from 'next/link'
import { formatCLP, formatDate } from '@/lib/utils'
import { MessageSquare, CheckCircle } from 'lucide-react'

type ConexionRow = {
  id: string; estado: string; monto: number; created_at: string; pagado_at: string | null
  profiles: { id: string; nombre: string; apellido: string | null; empresa: string | null; email: string; telefono: string | null; avatar_url: string | null } | null
}

export default async function ClientesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawProfesional } = await supabase.from('profesionales').select('id').eq('user_id', user.id).single()
  const profesional = rawProfesional as unknown as { id: string } | null
  if (!profesional) redirect('/profesional/perfil')

  const { data: rawConexiones } = await supabase
    .from('conexiones')
    .select(`id, estado, monto, created_at, pagado_at,
      profiles!conexiones_cliente_id_fkey ( id, nombre, apellido, empresa, email, telefono, avatar_url )`)
    .eq('profesional_id', profesional.id)
    .order('created_at', { ascending: false })
  const conexiones = (rawConexiones ?? []) as unknown as ConexionRow[]

  const estadoStyle: Record<string, string> = {
    pendiente: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    activa:    'bg-green-50 text-green-700 border-green-200',
    pagada:    'bg-blue-50 text-blue-700 border-blue-200',
    cerrada:   'bg-gray-100 text-gray-500 border-gray-200',
  }

  const totalActivos  = conexiones.filter(c => c.estado === 'activa').length
  const totalIngresos = conexiones.filter(c => c.estado === 'activa').reduce((acc, c) => acc + c.monto, 0)

  return (
    <div>
      <Topbar title="Mis Clientes" subtitle="Empresas conectadas a tu perfil" />
      <div className="p-8 space-y-6">

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-gray-400 text-xs font-medium mb-1">Total Conexiones</p>
            <p className="text-2xl font-bold text-navy">{conexiones.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-gray-400 text-xs font-medium mb-1">Clientes Activos</p>
            <p className="text-2xl font-bold text-green-600">{totalActivos}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-gray-400 text-xs font-medium mb-1">Ingresos por Conexiones</p>
            <p className="text-2xl font-bold text-gold">{formatCLP(totalIngresos)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-navy text-sm">Listado de Clientes</h2>
          </div>
          {!conexiones.length ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">👥</p>
              <p className="text-gray-400 text-sm">Aún no tienes clientes conectados.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Cliente', 'Empresa', 'Estado', 'Monto', 'Fecha', 'Acciones'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {conexiones.map(c => {
                  const cli = c.profiles
                  const nombre = `${cli?.nombre ?? ''} ${cli?.apellido ?? ''}`.trim()
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-navy/10 text-navy flex items-center justify-center text-xs font-bold shrink-0">
                            {nombre.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{nombre}</p>
                            <p className="text-xs text-gray-400">{cli?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{cli?.empresa ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${estadoStyle[c.estado]}`}>
                          {c.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">{formatCLP(c.monto)}</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">{formatDate(c.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/profesional/mensajes?conexion=${c.id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-navy hover:bg-navy/8 transition-colors" title="Enviar mensaje">
                            <MessageSquare size={15} />
                          </Link>
                          {c.estado === 'pendiente' && <AceptarBtn conexionId={c.id} />}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function AceptarBtn({ conexionId }: { conexionId: string }) {
  return (
    <form action={async () => {
      'use server'
      const { createClient: createSrv } = await import('@/lib/supabase/server')
      const supabase = createSrv()
      await supabase.from('conexiones').update({ estado: 'activa' } as never).eq('id', conexionId)
    }}>
      <button type="submit"
        className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 font-semibold px-2 py-1 rounded-lg hover:bg-green-100 transition-colors">
        <CheckCircle size={12} /> Aceptar
      </button>
    </form>
  )
}
