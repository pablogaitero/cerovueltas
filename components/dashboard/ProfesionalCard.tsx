'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Star, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { getInitials, formatCLP, ESPECIALIDAD_LABELS } from '@/lib/utils'
import type { ProfesionalConPerfil } from '@/lib/supabase/types'

interface Props {
  profesional: ProfesionalConPerfil
  clienteId:   string
  yaConectado: boolean
}

export default function ProfesionalCard({ profesional, clienteId, yaConectado }: Props) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [conectado, setConectado] = useState(yaConectado)
  const [error, setError] = useState('')
  const supabase = createClient()

  const p = profesional
  const nombre = `${p.profiles.nombre} ${p.profiles.apellido ?? ''}`.trim()
  const initials = getInitials(p.profiles.nombre, p.profiles.apellido)

  async function handleConectar() {
    setError('')
    setLoading(true)
    const { error: err } = await supabase.from('conexiones').insert({
      cliente_id:     clienteId,
      profesional_id: p.id,
      estado:         'pendiente',
      monto:          29000,
    })
    if (err) {
      setError('Error al conectar. Intenta de nuevo.')
    } else {
      setConectado(true)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center text-white font-bold text-sm shrink-0">
          {p.profiles.avatar_url
            ? <img src={p.profiles.avatar_url} className="w-full h-full rounded-full object-cover" alt={nombre} />
            : initials
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-navy text-sm truncate">{nombre}</h3>
            {p.verificado && <CheckCircle size={13} className="text-green-500 shrink-0" />}
          </div>
          <p className="text-gray-500 text-xs truncate">{p.titulo}</p>
          {p.badge && (
            <span className="inline-block mt-1 bg-navy/8 text-navy text-xs font-bold px-2 py-0.5 rounded">
              {p.badge}
            </span>
          )}
        </div>
        {/* Rating */}
        <div className="flex items-center gap-1 shrink-0">
          <Star size={13} className="text-gold fill-gold" />
          <span className="text-sm font-semibold text-gray-700">{p.rating?.toFixed(1) ?? '—'}</span>
          <span className="text-gray-400 text-xs">({p.total_reviews})</span>
        </div>
      </div>

      {/* Especialidades */}
      <div className="flex flex-wrap gap-1.5">
        {p.especialidades.map(esp => (
          <span
            key={esp}
            className="bg-gold/8 text-gold-dark border border-gold/20 text-xs px-2 py-0.5 rounded-full font-medium"
          >
            {ESPECIALIDAD_LABELS[esp] ?? esp}
          </span>
        ))}
      </div>

      {/* Bio */}
      {p.bio && (
        <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{p.bio}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <Clock size={12} />
          <span>{p.disponible ? 'Disponible' : 'Ocupado'}</span>
          {p.tarifa_hora && (
            <span className="ml-2 text-gray-500 font-medium">
              {formatCLP(p.tarifa_hora)}/hr
            </span>
          )}
        </div>

        {conectado ? (
          <button
            onClick={() => router.push('/cliente/mensajes')}
            className="text-xs bg-green-50 text-green-700 border border-green-200 font-semibold px-3 py-1.5 rounded-lg"
          >
            ✓ Conectado
          </button>
        ) : (
          <button
            onClick={handleConectar}
            disabled={loading || !p.disponible}
            className="text-xs bg-gold text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading && <Loader2 size={11} className="animate-spin" />}
            Conectar — {formatCLP(29000)}
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}
