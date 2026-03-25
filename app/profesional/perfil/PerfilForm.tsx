'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle } from 'lucide-react'
import type { Profile, Profesional, Especialidad } from '@/lib/supabase/types'
import { ESPECIALIDAD_LABELS } from '@/lib/utils'

const ESPECIALIDADES = Object.entries(ESPECIALIDAD_LABELS) as [Especialidad, string][]

interface Props {
  profile:     Profile | null
  profesional: Profesional | null
  userId:      string
}

export default function PerfilForm({ profile, profesional, userId }: Props) {
  const router   = useRouter()
  const supabase = createClient()

  const [loading,   setLoading]   = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState('')

  // Campos del profile
  const [nombre,    setNombre]    = useState(profile?.nombre ?? '')
  const [apellido,  setApellido]  = useState(profile?.apellido ?? '')
  const [telefono,  setTelefono]  = useState(profile?.telefono ?? '')

  // Campos del profesional
  const [titulo,      setTitulo]      = useState(profesional?.titulo ?? '')
  const [badge,       setBadge]       = useState(profesional?.badge ?? '')
  const [bio,         setBio]         = useState(profesional?.bio ?? '')
  const [anosExp,     setAnosExp]     = useState(profesional?.anos_exp?.toString() ?? '0')
  const [tarifaHora,  setTarifaHora]  = useState(profesional?.tarifa_hora?.toString() ?? '')
  const [linkedin,    setLinkedin]    = useState(profesional?.linkedin_url ?? '')
  const [especialidades, setEspecialidades] = useState<Especialidad[]>(
    profesional?.especialidades ?? []
  )

  function toggleEsp(esp: Especialidad) {
    setEspecialidades(prev =>
      prev.includes(esp) ? prev.filter(e => e !== esp) : [...prev, esp]
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaved(false)
    setLoading(true)

    if (!titulo.trim()) {
      setError('El título profesional es obligatorio.')
      setLoading(false)
      return
    }
    if (!especialidades.length) {
      setError('Selecciona al menos una especialidad.')
      setLoading(false)
      return
    }

    // Actualizar profile
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ nombre, apellido, telefono })
      .eq('id', userId)

    if (profileErr) {
      setError('Error al guardar perfil.')
      setLoading(false)
      return
    }

    // Upsert profesional
    const profData = {
      user_id:        userId,
      titulo,
      badge:          badge || null,
      bio:            bio || null,
      anos_exp:       parseInt(anosExp) || 0,
      tarifa_hora:    tarifaHora ? parseInt(tarifaHora) : null,
      linkedin_url:   linkedin || null,
      especialidades,
    }

    const { error: profErr } = profesional
      ? await supabase.from('profesionales').update(profData).eq('id', profesional.id)
      : await supabase.from('profesionales').insert(profData)

    if (profErr) {
      setError('Error al guardar datos profesionales.')
      setLoading(false)
      return
    }

    setSaved(true)
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">

      {/* Datos personales */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-display text-lg text-navy mb-5">Datos Personales</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)}
              className="input-field" required placeholder="Juan" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellido</label>
            <input value={apellido} onChange={e => setApellido(e.target.value)}
              className="input-field" placeholder="Pérez" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
            <input value={telefono} onChange={e => setTelefono(e.target.value)}
              className="input-field" placeholder="+56 9 1234 5678" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn</label>
            <input value={linkedin} onChange={e => setLinkedin(e.target.value)}
              className="input-field" placeholder="https://linkedin.com/in/tu-perfil" />
          </div>
        </div>
      </section>

      {/* Datos profesionales */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-display text-lg text-navy mb-5">Datos Profesionales</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Título Profesional *
              </label>
              <input value={titulo} onChange={e => setTitulo(e.target.value)}
                className="input-field" required
                placeholder="Ej: Contadora Pública Certificada" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Credencial / Badge
              </label>
              <input value={badge} onChange={e => setBadge(e.target.value)}
                className="input-field" placeholder="Ej: CPC, MBA, CPA" maxLength={10} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Años de experiencia
              </label>
              <input type="number" min="0" max="50"
                value={anosExp} onChange={e => setAnosExp(e.target.value)}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tarifa por hora (CLP)
              </label>
              <input type="number" min="0" step="1000"
                value={tarifaHora} onChange={e => setTarifaHora(e.target.value)}
                className="input-field" placeholder="90000" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Biografía / Descripción
            </label>
            <textarea
              value={bio} onChange={e => setBio(e.target.value)}
              rows={4} maxLength={500}
              className="input-field resize-none"
              placeholder="Describe tu experiencia, logros y especialidades…"
            />
            <p className="text-gray-400 text-xs mt-1 text-right">{bio.length}/500</p>
          </div>
        </div>
      </section>

      {/* Especialidades */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-display text-lg text-navy mb-2">Especialidades *</h2>
        <p className="text-gray-400 text-sm mb-4">Selecciona las áreas en que ofreces servicios.</p>
        <div className="flex flex-wrap gap-2.5">
          {ESPECIALIDADES.map(([value, label]) => {
            const sel = especialidades.includes(value)
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleEsp(value)}
                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                  sel
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-navy hover:text-navy'
                }`}
              >
                {sel && <span className="mr-1.5">✓</span>}
                {label}
              </button>
            )
          })}
        </div>
      </section>

      {/* Guardar */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit" disabled={loading}
          className="btn-gold flex items-center gap-2 px-8 py-3"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Guardando…' : 'Guardar cambios'}
        </button>

        {saved && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircle size={16} />
            Perfil guardado correctamente
          </div>
        )}
      </div>
    </form>
  )
}
