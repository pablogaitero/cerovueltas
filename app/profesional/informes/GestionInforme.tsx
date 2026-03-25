'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Upload, CheckCircle } from 'lucide-react'
import type { EstadoInforme } from '@/lib/supabase/types'

interface Props {
  informeId:    string
  estadoActual: EstadoInforme
  profesionalId:string
  archivoUrl:   string | null
  modo:         'tomar' | 'gestionar'
}

export default function GestionInforme({ informeId, estadoActual, profesionalId, archivoUrl, modo }: Props) {
  const [loading,  setLoading]  = useState(false)
  const [estado,   setEstado]   = useState<EstadoInforme>(estadoActual)
  const [archivo,  setArchivo]  = useState(archivoUrl)
  const [error,    setError]    = useState('')
  const router  = useRouter()
  const supabase = createClient()

  async function tomarInforme() {
    setLoading(true)
    const { error: err } = await supabase
      .from('informes')
      .update({ profesional_id: profesionalId, estado: 'en_proceso' } as never)
      .eq('id', informeId)
    if (!err) { setEstado('en_proceso'); router.refresh() }
    else setError('Error al tomar el informe.')
    setLoading(false)
  }

  async function avanzarEstado() {
    const siguiente: Record<string, EstadoInforme> = {
      en_proceso: 'entregado',
    }
    const nuevoEstado = siguiente[estado]
    if (!nuevoEstado) return
    setLoading(true)
    const update: Record<string, unknown> = { estado: nuevoEstado }
    if (nuevoEstado === 'entregado') update.entregado_at = new Date().toISOString()
    const { error: err } = await supabase.from('informes').update(update as never).eq('id', informeId)
    if (!err) { setEstado(nuevoEstado); router.refresh() }
    else setError('Error al actualizar estado.')
    setLoading(false)
  }

  async function subirArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) { setError('Máximo 20MB.'); return }
    setLoading(true)
    setError('')
    const ext  = file.name.split('.').pop()
    const path = `informes/${informeId}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('informes')
      .upload(path, file, { upsert: true })
    if (upErr) { setError('Error al subir archivo.'); setLoading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('informes').getPublicUrl(path)
    await supabase.from('informes').update({ archivo_url: publicUrl } as never).eq('id', informeId)
    setArchivo(publicUrl)
    router.refresh()
    setLoading(false)
  }

  if (modo === 'tomar') {
    return (
      <button
        onClick={tomarInforme} disabled={loading}
        className="flex items-center gap-1.5 text-xs bg-navy text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-navy-mid transition-colors disabled:opacity-50"
      >
        {loading && <Loader2 size={11} className="animate-spin" />}
        Tomar informe
      </button>
    )
  }

  // Modo gestionar
  return (
    <div className="flex items-center gap-2">
      {error && <p className="text-red-500 text-xs">{error}</p>}

      {/* Subir PDF */}
      {estado === 'en_proceso' && (
        <label className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 border border-gray-200 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <Upload size={12} />
          {archivo ? 'Resubir' : 'Subir PDF'}
          <input type="file" accept=".pdf" className="hidden" onChange={subirArchivo} />
        </label>
      )}

      {/* Avanzar estado */}
      {estado === 'en_proceso' && archivo && (
        <button
          onClick={avanzarEstado} disabled={loading}
          className="flex items-center gap-1.5 text-xs bg-green-600 text-white font-semibold px-2.5 py-1.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
          Marcar entregado
        </button>
      )}

      {estado === 'entregado' && (
        <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
          <CheckCircle size={13} /> Entregado
        </span>
      )}
    </div>
  )
}
