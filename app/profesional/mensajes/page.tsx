import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Topbar from '@/components/dashboard/Topbar'
import ChatWrapper from '@/components/chat/ChatWrapper'
import type { Mensaje } from '@/lib/supabase/types'

type ConexionConCliente = {
  id: string
  estado: string
  created_at: string
  profesionales: null
  profiles?: {
    id: string; nombre: string; apellido: string | null
    empresa: string | null; avatar_url: string | null
  } | null
}

// Adaptamos la estructura para que ChatWrapper la consuma correctamente
type ConexionParaChat = {
  id: string
  estado: string
  created_at: string
  profesionales: {
    id: string
    titulo: string
    badge: string | null
    profiles: { nombre: string; apellido: string | null; avatar_url: string | null }
  } | null
}

export default async function MensajesProfesionalPage({
  searchParams,
}: {
  searchParams: { conexion?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawProfesional } = await supabase
    .from('profesionales').select('id, titulo').eq('user_id', user.id).single()
  const profesional = rawProfesional as unknown as { id: string; titulo: string } | null
  if (!profesional) redirect('/profesional/perfil')

  const { data: rawConexiones } = await supabase
    .from('conexiones')
    .select(`id, estado, created_at,
      profiles!conexiones_cliente_id_fkey ( id, nombre, apellido, empresa, avatar_url )`)
    .eq('profesional_id', profesional.id)
    .in('estado', ['activa', 'pagada'])
    .order('created_at', { ascending: false })

  // Mapeamos al formato que espera ChatWrapper (usa el campo profesionales para mostrar el nombre)
  const rawRows = (rawConexiones ?? []) as unknown as Array<{
    id: string; estado: string; created_at: string
    profiles: { id: string; nombre: string; apellido: string | null; empresa: string | null; avatar_url: string | null } | null
  }>

  const conexiones: ConexionParaChat[] = rawRows.map(c => ({
    id: c.id,
    estado: c.estado,
    created_at: c.created_at,
    profesionales: {
      id: c.profiles?.id ?? '',
      titulo: c.profiles?.empresa ?? 'Cliente',
      badge: null,
      profiles: {
        nombre:     c.profiles?.nombre ?? '',
        apellido:   c.profiles?.apellido ?? null,
        avatar_url: c.profiles?.avatar_url ?? null,
      },
    },
  }))

  const conexionActiva = searchParams.conexion ?? conexiones?.[0]?.id ?? null

  const { data: rawMensajes } = conexionActiva
    ? await supabase
        .from('mensajes').select('*')
        .eq('conexion_id', conexionActiva)
        .order('created_at', { ascending: true })
    : { data: [] }

  const mensajes = (rawMensajes ?? []) as unknown as Mensaje[]

  if (conexionActiva && mensajes.length) {
    await supabase
      .from('mensajes')
      .update({ leido: true } as never)
      .eq('conexion_id', conexionActiva)
      .neq('emisor_id', user.id)
  }

  return (
    <div className="flex flex-col h-screen">
      <Topbar title="Mensajes" subtitle="Conversaciones con tus clientes" />
      <div className="flex flex-1 overflow-hidden">
        <ChatWrapper
          conexiones={conexiones}
          mensajes={mensajes}
          conexionActivaId={conexionActiva}
          userId={user.id}
          userRole="profesional"
        />
      </div>
    </div>
  )
}
