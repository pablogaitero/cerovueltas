'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { Loader2, CheckCircle, ChevronDown, Upload, FileText, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const ESTADOS = [
  { value: 'solicitado', label: 'Solicitado' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'entregado',  label: 'Entregado'  },
  { value: 'rechazado',  label: 'Rechazado'  },
  { value: 'cancelado',  label: 'Cancelado'  },
]

interface Props {
  informeId:    string
  estadoActual: string
  entregadoAt:  string | null
  archivoUrl:   string | null
}

export default function EditarInforme({ informeId, estadoActual, entregadoAt, archivoUrl }: Props) {
  const router    = useRouter()
  const btnRef    = useRef<HTMLButtonElement>(null)
  const panelRef  = useRef<HTMLDivElement>(null)

  const [open,         setOpen]         = useState(false)
  const [estado,       setEstado]       = useState(estadoActual)
  const [fechaEntrega, setFechaEntrega] = useState(
    entregadoAt ? new Date(entregadoAt).toISOString().split('T')[0] : ''
  )
  const [archivo,      setArchivo]      = useState<File | null>(null)
  const [urlActual,    setUrlActual]    = useState(archivoUrl)
  const [uploading,    setUploading]    = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [error,        setError]        = useState('')
  const [panelPos,     setPanelPos]     = useState({ top: 0, right: 0 })

  // Calcular posición del panel relativo al viewport
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPanelPos({
        top:   rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right,
      })
    }
  }, [open])

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current   && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  async function handleGuardar() {
    setLoading(true)
    setError('')
    setSaved(false)

    // Usar cliente con service role para admin
    const adminClient = createAdminClient()
    // Usar cliente normal para storage (necesita auth)
    const supabase = createClient()

    let nuevoArchivoUrl = urlActual

    // Subir archivo si hay uno nuevo
    if (archivo) {
      setUploading(true)
      const ext  = archivo.name.split('.').pop()
      const path = `informes/${informeId}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('informes')
        .upload(path, archivo, { upsert: true })

      if (upErr) {
        setError('Error al subir el archivo.')
        setLoading(false)
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('informes')
        .getPublicUrl(path)

      nuevoArchivoUrl = publicUrl
      setUrlActual(publicUrl)
      setUploading(false)
    }

    const update: Record<string, unknown> = {
      estado,
      archivo_url: nuevoArchivoUrl,
    }

    if (fechaEntrega) {
      update.entregado_at = new Date(fechaEntrega).toISOString()
    } else {
      update.entregado_at = null
    }

    // Si estado es entregado y no hay fecha, poner hoy
    if (estado === 'entregado' && !fechaEntrega) {
      update.entregado_at = new Date().toISOString()
    }

    const { error: err } = await adminClient
      .from('informes')
      .update(update as never)
      .eq('id', informeId)

    if (err) {
      setError('Error al guardar.')
    } else {
      setSaved(true)
      setArchivo(null)
      router.refresh()
      setTimeout(() => { setSaved(false); setOpen(false) }, 2000)
    }
    setLoading(false)
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 border border-gray-200 font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
      >
        Editar <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          ref={panelRef}
          className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-5 w-72"
          style={{ top: panelPos.top, right: panelPos.right }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-navy">Editar informe</p>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>

          {/* Estado */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Estado
            </label>
            <select
              value={estado}
              onChange={e => setEstado(e.target.value)}
              className="input-field text-sm py-2 bg-white"
            >
              {ESTADOS.map(e => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>

          {/* Fecha de entrega */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Fecha de entrega
            </label>
            <input
              type="date"
              value={fechaEntrega}
              onChange={e => setFechaEntrega(e.target.value)}
              className="input-field text-sm py-2"
            />
          </div>

          {/* Subir archivo */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Archivo del informe (PDF)
            </label>

            {urlActual && !archivo && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-2">
                <FileText size={13} className="text-green-600 shrink-0" />
                <a href={urlActual} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-green-700 font-medium hover:underline truncate flex-1">
                  Ver archivo actual
                </a>
              </div>
            )}

            {archivo ? (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <FileText size={13} className="text-blue-600 shrink-0" />
                <span className="text-xs text-blue-700 truncate flex-1">{archivo.name}</span>
                <button onClick={() => setArchivo(null)} className="text-gray-400 hover:text-red-500">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-200 rounded-lg px-3 py-2.5 hover:border-navy/40 hover:bg-navy/5 transition-all">
                <Upload size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">
                  {urlActual ? 'Reemplazar archivo' : 'Subir PDF'}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={e => setArchivo(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>

          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 py-2 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={loading || uploading}
              className="flex-1 py-2 text-xs font-semibold bg-navy text-white rounded-lg hover:bg-navy-mid transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {(loading || uploading)
                ? <Loader2 size={12} className="animate-spin" />
                : saved
                  ? <><CheckCircle size={12} /> Guardado</>
                  : 'Guardar'
              }
            </button>
          </div>
        </div>
      )}
    </>
  )
}
