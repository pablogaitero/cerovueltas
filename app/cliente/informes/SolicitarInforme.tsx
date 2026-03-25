'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import type { TipoInforme } from '@/lib/supabase/types'

interface Props {
  tipo:      TipoInforme
  precio:    number
  clienteId: string
}

export default function SolicitarInforme({ tipo, precio, clienteId }: Props) {
  const [loading, setLoading] = useState(false)
  const [ok, setOk]           = useState(false)
  const [error, setError]     = useState('')
  const router   = useRouter()
  const supabase = createClient()

  async function handleSolicitar() {
    setError('')
    setLoading(true)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as any)
      .from('informes')
      .insert({
        cliente_id: clienteId,
        tipo,
        precio,
        estado: 'solicitado',
      })

    if (err) {
      setError('Error al solicitar. Intenta de nuevo.')
    } else {
      setOk(true)
      router.refresh()
    }
    setLoading(false)
  }

  if (ok) {
    return (
      <div className="bg-green-50 text-green-700 text-sm font-medium text-center py-2.5 rounded-lg border border-green-200">
        ✓ Informe solicitado
      </div>
    )
  }

  return (
    <>
      <button
        onClick={handleSolicitar}
        disabled={loading}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
          tipo === 'completo'
            ? 'bg-gold text-white hover:bg-gold-dark'
            : 'bg-navy text-white hover:bg-navy-mid'
        } disabled:opacity-50`}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? 'Procesando…' : 'Solicitar'}
      </button>
      {error && <p className="text-red-500 text-xs mt-1.5 text-center">{error}</p>}
    </>
  )
}