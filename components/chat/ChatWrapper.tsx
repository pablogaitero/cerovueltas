'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Send, MessageSquare } from 'lucide-react'
import { getInitials, formatDate } from '@/lib/utils'
import type { Mensaje } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

interface Conexion {
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

interface Props {
  conexiones:       Conexion[]
  mensajes:         Mensaje[]
  conexionActivaId: string | null
  userId:           string
  userRole:         'cliente' | 'profesional'
}

export default function ChatWrapper({ conexiones, mensajes: initialMensajes, conexionActivaId, userId, userRole }: Props) {
  const router    = useRouter()
  const supabase  = createClient()
  const bottomRef = useRef<HTMLDivElement>(null)

  const [mensajes, setMensajes] = useState<Mensaje[]>(initialMensajes)
  const [texto, setTexto]       = useState('')
  const [sending, setSending]   = useState(false)

  const conexionActiva = conexiones.find(c => c.id === conexionActivaId)
  const prof = conexionActiva?.profesionales

  // Scroll al fondo al cargar
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  // Suscripción realtime a nuevos mensajes
  useEffect(() => {
    if (!conexionActivaId) return

    const channel = supabase
      .channel(`mensajes:${conexionActivaId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'mensajes',
          filter: `conexion_id=eq.${conexionActivaId}`,
        },
        payload => {
          const nuevo = payload.new as Mensaje
          setMensajes(prev => {
            if (prev.find(m => m.id === nuevo.id)) return prev
            return [...prev, nuevo]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conexionActivaId, supabase])

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault()
    if (!texto.trim() || !conexionActivaId) return

    setSending(true)
    const contenido = texto.trim()
    setTexto('')

    await supabase.from('mensajes').insert({
      conexion_id: conexionActivaId,
      emisor_id:   userId,
      contenido,
    })

    setSending(false)
  }

  function seleccionarConexion(id: string) {
    router.push(`?conexion=${id}`)
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Lista de conversaciones */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Conversaciones ({conexiones.length})
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conexiones.length === 0 ? (
            <div className="py-10 text-center px-4">
              <MessageSquare size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-xs">Sin conversaciones activas.</p>
            </div>
          ) : (
            conexiones.map(c => {
              const p = c.profesionales
              if (!p) return null
              const nombre = `${p.profiles.nombre} ${p.profiles.apellido ?? ''}`.trim()
              const activa = c.id === conexionActivaId
              return (
                <button
                  key={c.id}
                  onClick={() => seleccionarConexion(c.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50',
                    activa ? 'bg-navy/5 border-l-2 border-l-navy' : 'hover:bg-gray-50'
                  )}
                >
                  <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {getInitials(p.profiles.nombre, p.profiles.apellido)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium truncate', activa ? 'text-navy' : 'text-gray-700')}>
                      {nombre}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{p.titulo}</p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </aside>

      {/* Panel de chat */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {!conexionActiva ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Selecciona una conversación</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header del chat */}
            <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3">
              {prof && (
                <>
                  <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(prof.profiles.nombre, prof.profiles.apellido)}
                  </div>
                  <div>
                    <p className="font-semibold text-navy text-sm">
                      {prof.profiles.nombre} {prof.profiles.apellido ?? ''}
                      {prof.badge && <span className="ml-2 text-xs bg-navy/8 text-navy px-1.5 py-0.5 rounded font-bold">{prof.badge}</span>}
                    </p>
                    <p className="text-gray-400 text-xs">{prof.titulo}</p>
                  </div>
                </>
              )}
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {mensajes.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-sm">Aún no hay mensajes. ¡Saluda!</p>
                </div>
              ) : (
                mensajes.map(m => {
                  const esMio = m.emisor_id === userId
                  return (
                    <div key={m.id} className={cn('flex', esMio ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        'max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm',
                        esMio
                          ? 'bg-navy text-white rounded-br-sm'
                          : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                      )}>
                        <p className="leading-relaxed">{m.contenido}</p>
                        <p className={cn('text-xs mt-1', esMio ? 'text-white/50' : 'text-gray-400')}>
                          {new Date(m.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleEnviar} className="bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
              <input
                type="text"
                value={texto}
                onChange={e => setTexto(e.target.value)}
                placeholder="Escribe un mensaje…"
                className="input-field flex-1"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!texto.trim() || sending}
                className="btn-gold px-4 py-2.5 flex items-center gap-2 disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
