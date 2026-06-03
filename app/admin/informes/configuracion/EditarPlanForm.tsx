'use client'

import { useState } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { Loader2, Plus, Trash2, CheckCircle } from 'lucide-react'
import { formatCLP } from '@/lib/utils'

interface Plan {
  tipo:     string
  label:    string
  precio:   number
  dias:     string
  servicios: string[]
}

export default function EditarPlanForm({ plan }: { plan: Plan }) {
  const [label,     setLabel]     = useState(plan.label)
  const [precio,    setPrecio]    = useState(plan.precio.toString())
  const [dias,      setDias]      = useState(plan.dias)
  const [servicios, setServicios] = useState<string[]>(plan.servicios)
  const [loading,   setLoading]   = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState('')

  function agregarServicio() {
    setServicios(prev => [...prev, ''])
  }

  function eliminarServicio(index: number) {
    setServicios(prev => prev.filter((_, i) => i !== index))
  }

  function actualizarServicio(index: number, valor: string) {
    setServicios(prev => prev.map((s, i) => i === index ? valor : s))
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaved(false)
    setLoading(true)

    const serviciosFiltrados = servicios.filter(s => s.trim() !== '')

    if (!label.trim()) { setError('El nombre es obligatorio.'); setLoading(false); return }
    if (!precio || isNaN(Number(precio))) { setError('El precio debe ser un número válido.'); setLoading(false); return }
    if (serviciosFiltrados.length === 0) { setError('Agrega al menos un servicio.'); setLoading(false); return }

    const supabase = createAdminClient()

    const { error: err } = await supabase
      .from('config_informes')
      .upsert({
        tipo:      plan.tipo,
        label:     label.trim(),
        precio:    parseInt(precio.replace(/\./g, '')),
        dias:      dias.trim(),
        servicios: serviciosFiltrados,
      }, { onConflict: 'tipo' })

    if (err) {
      setError('Error al guardar. Intenta nuevamente.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setLoading(false)
  }

  const colorBorde = plan.tipo === 'basico' ? 'border-gray-200'
    : plan.tipo === 'completo' ? 'border-gold'
    : 'border-navy'

  const colorHeader = plan.tipo === 'basico' ? 'bg-gray-50'
    : plan.tipo === 'completo' ? 'bg-gold/5'
    : 'bg-navy/5'

  return (
    <form onSubmit={handleGuardar}
      className={`bg-white rounded-xl border-2 ${colorBorde} overflow-hidden`}>

      {/* Header */}
      <div className={`px-5 py-4 border-b border-gray-100 ${colorHeader}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Plan {plan.tipo}
          </span>
          {plan.tipo === 'completo' && (
            <span className="bg-gold text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Popular
            </span>
          )}
        </div>
        <p className="text-lg font-bold text-navy mt-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-700">
          {formatCLP(parseInt(precio.replace(/\./g, '')) || 0)}
        </p>
      </div>

      <div className="p-5 space-y-4">

        {/* Nombre del plan */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Nombre del plan
          </label>
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            className="input-field"
            placeholder="Ej: Básico"
          />
        </div>

        {/* Precio */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Precio (CLP)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              value={precio}
              onChange={e => setPrecio(e.target.value.replace(/[^0-9]/g, ''))}
              className="input-field pl-7"
              placeholder="49900"
            />
          </div>
        </div>

        {/* Días de entrega */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Días de entrega
          </label>
          <input
            value={dias}
            onChange={e => setDias(e.target.value)}
            className="input-field"
            placeholder="Ej: 5-7"
          />
        </div>

        {/* Servicios incluidos */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Servicios incluidos
          </label>
          <div className="space-y-2">
            {servicios.map((servicio, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-green-500 text-xs shrink-0">✓</span>
                <input
                  value={servicio}
                  onChange={e => actualizarServicio(index, e.target.value)}
                  className="input-field flex-1 text-sm py-1.5"
                  placeholder="Descripción del servicio"
                />
                <button
                  type="button"
                  onClick={() => eliminarServicio(index)}
                  className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={agregarServicio}
            className="mt-2 flex items-center gap-1.5 text-xs text-navy font-medium hover:text-navy-mid transition-colors"
          >
            <Plus size={13} /> Agregar servicio
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-xs">{error}</p>
        )}

        {/* Botón guardar */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${
            plan.tipo === 'completo'
              ? 'bg-gold text-white hover:bg-gold-dark'
              : 'bg-navy text-white hover:bg-navy-mid'
          }`}
        >
          {loading
            ? <><Loader2 size={14} className="animate-spin" /> Guardando…</>
            : saved
              ? <><CheckCircle size={14} /> Guardado</>
              : 'Guardar cambios'
          }
        </button>
      </div>
    </form>
  )
}
