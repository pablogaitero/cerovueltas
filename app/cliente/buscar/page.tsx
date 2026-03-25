import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Topbar from '@/components/dashboard/Topbar'
import BuscarCliente from './BuscarCliente'
import type { ProfesionalConPerfil } from '@/lib/supabase/types'

interface SearchParams { q?: string; esp?: string; disponible?: string }

type ConexionRow = { profesional_id: string }

export default async function BuscarPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let query = supabase
    .from('profesionales')
    .select(`
      *,
      profiles ( nombre, apellido, avatar_url, email )
    `)
    .order('rating', { ascending: false })

  if (searchParams.esp && searchParams.esp !== 'todos') {
    query = query.contains('especialidades', [searchParams.esp])
  }
  if (searchParams.disponible === 'true') {
    query = query.eq('disponible', true)
  }

  const { data: rawProfesionales } = await query
  const profesionales = (rawProfesionales ?? []) as unknown as ProfesionalConPerfil[]

  const q = searchParams.q?.toLowerCase() ?? ''
  const filtered = q
    ? profesionales.filter(p =>
        `${p.profiles.nombre} ${p.profiles.apellido ?? ''} ${p.titulo} ${p.bio ?? ''}`
          .toLowerCase().includes(q)
      )
    : profesionales

  const { data: rawConexiones } = await supabase
    .from('conexiones')
    .select('profesional_id')
    .eq('cliente_id', user.id)

  const conexiones = (rawConexiones ?? []) as unknown as ConexionRow[]
  const conectadosSet = new Set(conexiones.map(c => c.profesional_id))

  return (
    <div>
      <Topbar
        title="Buscar Profesional"
        subtitle={`${filtered.length} profesionales encontrados`}
      />
      <div className="p-8">
        <BuscarCliente
          profesionales={filtered}
          clienteId={user.id}
          conectadosSet={Array.from(conectadosSet)}
          filtrosActivos={{
            q: searchParams.q,
            esp: searchParams.esp,
            disponible: searchParams.disponible,
          }}
        />
      </div>
    </div>
  )
}
