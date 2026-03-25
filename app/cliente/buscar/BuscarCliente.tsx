'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import ProfesionalCard from '@/components/dashboard/ProfesionalCard'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { ProfesionalConPerfil } from '@/lib/supabase/types'

const ESPECIALIDADES = [
  { value: 'todos',             label: 'Todos' },
  { value: 'contador',          label: 'Contador' },
  { value: 'asesor_tributario', label: 'Asesor Tributario' },
  { value: 'abogado',           label: 'Abogado' },
  { value: 'auditor',           label: 'Auditor' },
  { value: 'ifrs',              label: 'IFRS' },
]

interface Props {
  profesionales:   ProfesionalConPerfil[]
  clienteId:       string
  conectadosSet:   string[]
  filtrosActivos:  { q?: string; esp?: string; disponible?: string }
}

export default function BuscarCliente({ profesionales, clienteId, conectadosSet, filtrosActivos }: Props) {
  const router     = useRouter()
  const pathname   = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [texto, setTexto] = useState(filtrosActivos.q ?? '')

  const createQueryString = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [k, v] of Object.entries(updates)) {
        if (v === undefined || v === '' || v === 'todos') params.delete(k)
        else params.set(k, v)
      }
      return params.toString()
    },
    [searchParams]
  )

  function pushFilter(updates: Record<string, string | undefined>) {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString(updates)}`)
    })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    pushFilter({ q: texto })
  }

  const espActiva    = filtrosActivos.esp ?? 'todos'
  const soloDisp     = filtrosActivos.disponible === 'true'
  const hayFiltros   = !!(filtrosActivos.q || (espActiva !== 'todos') || soloDisp)

  return (
    <div className="space-y-5">

      {/* Barra de búsqueda */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Buscar por nombre, especialidad, servicio…"
            className="input-field pl-9 py-3"
          />
          {texto && (
            <button type="button" onClick={() => { setTexto(''); pushFilter({ q: undefined }) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <button type="submit" className="btn-primary px-5">Buscar</button>
      </form>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-gray-400">
          <SlidersHorizontal size={14} />
          <span className="text-xs font-medium">Filtrar:</span>
        </div>

        {/* Especialidad */}
        <div className="flex gap-1.5 flex-wrap">
          {ESPECIALIDADES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => pushFilter({ esp: value })}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                espActiva === value
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-navy hover:text-navy'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Disponible */}
        <button
          onClick={() => pushFilter({ disponible: soloDisp ? undefined : 'true' })}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
            soloDisp
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-500 border-gray-200 hover:border-green-500 hover:text-green-600'
          }`}
        >
          ✅ Disponibles ahora
        </button>

        {/* Limpiar filtros */}
        {hayFiltros && (
          <button
            onClick={() => { setTexto(''); router.push(pathname) }}
            className="text-xs text-red-400 hover:text-red-600 underline ml-1"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Resultados */}
      {isPending ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="flex gap-1.5 mb-3">
                <div className="h-5 bg-gray-100 rounded-full w-16" />
                <div className="h-5 bg-gray-100 rounded-full w-20" />
              </div>
              <div className="h-8 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : profesionales.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-500 font-medium">Sin resultados</p>
          <p className="text-gray-400 text-sm mt-1">Intenta con otros filtros o términos de búsqueda.</p>
          <button onClick={() => { setTexto(''); router.push(pathname) }}
            className="btn-outline mt-4 text-sm px-5 py-2">
            Ver todos los profesionales
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400">
            {profesionales.length} profesional{profesionales.length !== 1 ? 'es' : ''} encontrado{profesionales.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-3 gap-4">
            {profesionales.map(p => (
              <ProfesionalCard
                key={p.id}
                profesional={p}
                clienteId={clienteId}
                yaConectado={conectadosSet.includes(p.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
