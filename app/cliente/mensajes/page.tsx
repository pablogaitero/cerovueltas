import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Topbar from '@/components/dashboard/Topbar'
import ChatWrapper from '@/components/chat/ChatWrapper'

export default async function MensajesClientePage({
  searchParams,
}: {
  searchParams: { conexion?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Traer todas las conexiones activas del cliente con datos del profesional
  const { data: conexiones } = await supabase
    .from('conexiones')
    .select(`
      id, estado, created_at,
      profesionales (
        id, titulo, badge,
        profiles ( nombre, apellido, avatar_url )
      )
    `)
    .eq('cliente_id', user.id)
    .in('estado', ['activa', 'pagada'])
    .order('created_at', { ascending: false })

  const conexionActiva = searchParams.conexion ?? conexiones?.[0]?.id ?? null

  // Mensajes de la conexión activa
  const { data: mensajes } = conexionActiva
    ? await supabase
        .from('mensajes')
        .select('*')
        .eq('conexion_id', conexionActiva)
        .order('created_at', { ascending: true })
    : { data: [] }

  // Marcar mensajes como leídos
  if (conexionActiva && mensajes?.length) {
    await supabase
      .from('mensajes')
      .update({ leido: true })
      .eq('conexion_id', conexionActiva)
      .neq('emisor_id', user.id)
  }

  return (
    <div className="flex flex-col h-screen">
      <Topbar title="Mensajes" subtitle="Conversaciones con tus profesionales" />
      <div className="flex flex-1 overflow-hidden">
        <ChatWrapper
          conexiones={conexiones ?? []}
          mensajes={mensajes ?? []}
          conexionActivaId={conexionActiva}
          userId={user.id}
          userRole="cliente"
        />
      </div>
    </div>
  )
}
