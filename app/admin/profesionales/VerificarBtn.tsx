'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface Props {
  profesionalId:   string
  verificadoActual: boolean
}

export default function VerificarBtn({ profesionalId, verificadoActual }: Props) {
  const [verificado, setVerificado] = useState(verificadoActual)
  const [loading,    setLoading]    = useState(false)
  const router  = useRouter()
  const supabase = createClient()

  async function toggleVerificado() {
    setLoading(true)
    const nuevo = !verificado
    const { error } = await supabase
      .from('profesionales')
      .update({ verificado: nuevo } as never)
      .eq('id', profesionalId)

    if (!error) {
      setVerificado(nuevo)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggleVerificado}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${
        verificado
          ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
          : 'bg-green-600 text-white hover:bg-green-700'
      }`}
    >
      {loading
        ? <Loader2 size={14} className="animate-spin" />
        : verificado
          ? <XCircle size={14} />
          : <CheckCircle size={14} />
      }
      {loading ? 'Procesando…' : verificado ? 'Revocar verificación' : 'Verificar profesional'}
    </button>
  )
}
