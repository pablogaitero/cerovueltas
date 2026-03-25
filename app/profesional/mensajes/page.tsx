import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Topbar from '@/components/dashboard/Topbar'
import ChatWrapperProfesional from './ChatWrapperProfesional'

export default async function MensajesProfesionalPage({
  searchParams,
}: {
  searchParams: { conexion?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profesional } = await supabase
    .from('profesionales').select('id').eq('user_id', user.id).single()
  if (!profesional) redirect('/profesional/perfil')

  // Conexiones activas del profesional con datos del cliente
  const { data: conexiones } = await supabase
    .from('conexiones')
    .select(`
      id, estado, created_at,
      profiles!conexiones_cliente_id_fkey (
        id, nombre, apellido, empresa, avatar_url
      )
    `)
    .eq('profesional_id', profesional.id)
    .in('estado', ['activa', 'pagada'])
    .order('created_at', { ascending: false })

  const conexionActiva = searchParams.conexion ?? conexiones?.[0]?.id ?? null

  const { data: mensajes } = conexionActiva
    ? await supabase
        .from('mensajes')
        .select('*')
        .eq('conexion_id', conexionActiva)
        .order('created_at', { ascending: true })
    : { data: [] }

  // Marcar como leídos
  if (conexionActiva && mensajes?.length) {
    await supabase
      .from('mensajes')
      .update({ leido: true })
      .eq('conexion_id', conexionActiva)
      .neq('emisor_id', user.id)
  }

  return (
    <div className="flex flex-col h-screen">
      <Topbar title="Mensajes" subtitle="Conversaciones con tus clientes" />
      <div className="flex flex-1 overflow-hidden">
        <ChatWrapperProfesional
          conexiones={conexiones ?? []}
          mensajes={mensajes ?? []}
          conexionActivaId={conexionActiva}
          userId={user.id}
        />
      </div>
    </div>
  )
}
