'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  profesionalId:     string
  disponibleInicial: boolean
}

export default function DisponibilidadToggle({ profesionalId, disponibleInicial }: Props) {
  const [disponible, setDisponible] = useState(disponibleInicial)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function toggle() {
    setLoading(true)
    const nuevo = !disponible
    const { error } = await supabase
      .from('profesionales')
      .update({ disponible: nuevo })
      .eq('id', profesionalId)

    if (!error) setDisponible(nuevo)
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
        focus:outline-none disabled:opacity-60
        ${disponible ? 'bg-green-500' : 'bg-gray-300'}
      `}
      aria-label="Toggle disponibilidad"
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200
          ${disponible ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  )
}
