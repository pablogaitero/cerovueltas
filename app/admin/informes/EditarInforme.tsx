'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { Loader2, CheckCircle, ChevronDown } from 'lucide-react'

const ESTADOS = [
  { value: 'solicitado', label: 'Solicitado',  color: 'text-yellow-600' },
  { value: 'en_proceso', label: 'En proceso',  color: 'text-blue-600' },
  { value: 'entregado',  label: 'Entregado',   color: 'text-green-600' },
  { value: 'rechazado',  label: 'Rechazado',   color: 'text-red-600' },
  { value: 'cancelado',  label: 'Cancelado',   color: 'text-gray-500' },
]

interface Props {
  informeId:   string
  estadoActual: string
  entregadoAt: string | null
}

export default function EditarInforme({ informeId, estadoActual, entregadoAt }: Props) {
  const router  = useRouter()
  const [estado,      setEstado]      = useState(estadoActual)
  const [fechaEntrega, setFechaEntrega] = useState(
    entregadoAt ? new Date(entregadoAt).toISOString().split('T')[0] : ''
  )
  const [loading, setLoading] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')
  const [open,    setOpen]    = useState(false)

  async function handleGuardar() {
    setLoading(true)
    setError('')
    setSaved(false)

    const supabase = createAdminClient()

    const update: Record<string, unknown> = { estado }
    if (fechaEntrega) {
      update.entregado_at = new Date(fechaEntrega).toISOString()
    } else {
      update.entregado_at = null
    }

    const { error: err } = await supabase
      .from('informes')
      .update(update as never)
      .eq('id', informeId)

    if (err) {
      setError('Error al guardar.')
    } else {
      setSaved(true)
      router.refresh()
      setTimeout(() => { setSaved(false); setOpen(false) }, 2000)
    }
    setLoading(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 border border-gray-200 font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        Editar <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-64">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Editar informe</p>

          {/* Estado */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Estado</label>
            <select
              value={estado}
              onChange={e => setEstado(e.target.value)}
              className="input-field text-sm py-2"
            >
              {ESTADOS.map(e => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>

          {/* Fecha de entrega */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Fecha de entrega</label>
            <input
              type="date"
              value={fechaEntrega}
              onChange={e => setFechaEntrega(e.target.value)}
              className="input-field text-sm py-2"
            />
          </div>

          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 py-2 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={loading}
              className="flex-1 py-2 text-xs font-semibold bg-navy text-white rounded-lg hover:bg-navy-mid transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading
                ? <Loader2 size={12} className="animate-spin" />
                : saved
                  ? <><CheckCircle size={12} /> Guardado</>
                  : 'Guardar'
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
