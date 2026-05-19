'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Eye, EyeOff, Loader2, CheckCircle,
  Plus, Trash2, Upload, X, FileText, User, BookOpen
} from 'lucide-react'

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Estudio {
  id:          string
  universidad: string
  titulo:      string
  inicio:      string
  termino:     string
}

interface Documento {
  nombre:   string
  archivo:  File | null
  preview:  string | null
}

// ─── Paso indicator ───────────────────────────────────────────────────────────
const PASOS = [
  { num: 1, label: 'Datos Personales',  icon: User },
  { num: 2, label: 'Estudios',          icon: BookOpen },
  { num: 3, label: 'Documentos',        icon: FileText },
]

function PasoIndicator({ actual }: { actual: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {PASOS.map((paso, i) => {
        const completado = actual > paso.num
        const activo     = actual === paso.num
        const Icon       = paso.icon
        return (
          <div key={paso.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${completado ? 'bg-green-500 text-white'
                  : activo   ? 'bg-navy text-white ring-4 ring-navy/20'
                  :            'bg-gray-100 text-gray-400'}
              `}>
                {completado ? <CheckCircle size={18} /> : <Icon size={16} />}
              </div>
              <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                activo ? 'text-navy' : completado ? 'text-green-600' : 'text-gray-400'
              }`}>
                {paso.label}
              </span>
            </div>
            {i < PASOS.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 mb-5 transition-all ${
                actual > paso.num ? 'bg-green-400' : 'bg-gray-200'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Componente de upload de documento ────────────────────────────────────────
function DocumentoUpload({
  label, doc, onChange, onClear, multiple = false,
}: {
  label:    string
  doc:      Documento | Documento[]
  onChange: (files: FileList) => void
  onClear:  (index?: number) => void
  multiple?: boolean
}) {
  const docs = Array.isArray(doc) ? doc : [doc]
  const tieneArchivo = docs.some(d => d.archivo !== null)

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className={`
        border-2 border-dashed rounded-xl p-5 transition-all
        ${tieneArchivo ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-navy/40 hover:bg-navy/5'}
      `}>
        {!tieneArchivo ? (
          <label className="flex flex-col items-center gap-2 cursor-pointer">
            <Upload size={24} className="text-gray-400" />
            <span className="text-sm text-gray-500">
              {multiple ? 'Subir archivos (PDF, JPG, PNG)' : 'Subir archivo (PDF, JPG, PNG)'}
            </span>
            <span className="text-xs text-gray-400">Máximo 10MB por archivo</span>
            <input
              type="file" className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple={multiple}
              onChange={e => e.target.files && onChange(e.target.files)}
            />
          </label>
        ) : (
          <div className="space-y-2">
            {docs.filter(d => d.archivo).map((d, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-green-200">
                <FileText size={16} className="text-green-600 shrink-0" />
                <span className="text-sm text-gray-700 flex-1 truncate">{d.archivo?.name}</span>
                <button type="button" onClick={() => onClear(i)}
                  className="text-gray-400 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-navy font-medium mt-1">
              <Plus size={13} /> Agregar otro
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                multiple={multiple}
                onChange={e => e.target.files && onChange(e.target.files)} />
            </label>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function RegistroProfesionalPage() {
  const supabase = createClient()
  const [paso, setPaso] = useState(1)
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Paso 1
  const [nombre,    setNombre]    = useState('')
  const [apellido,  setApellido]  = useState('')
  const [rut,       setRut]       = useState('')
  const [email,     setEmail]     = useState('')
  const [celular,   setCelular]   = useState('')
  const [resumen,   setResumen]   = useState('')
  const [password,  setPassword]  = useState('')
  const [showPass,  setShowPass]  = useState(false)

  // Paso 2
  const [estudios, setEstudios] = useState<Estudio[]>([
    { id: '1', universidad: '', titulo: '', inicio: '', termino: '' }
  ])

  // Paso 3
  const [tituloDoc,   setTituloDoc]   = useState<Documento[]>([])
  const [carnetAnv,   setCarnetAnv]   = useState<Documento | null>(null)
  const [carnetRev,   setCarnetRev]   = useState<Documento | null>(null)
  const [antecedentes, setAntecedentes] = useState<Documento | null>(null)

  // ── Helpers RUT ────────────────────────────────────────────────────────────
  function formatRut(value: string) {
    const clean = value.replace(/[^0-9kK]/g, '')
    if (clean.length <= 1) return clean
    const body = clean.slice(0, -1)
    const dv   = clean.slice(-1).toUpperCase()
    return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`
  }

  // ── Estudios ───────────────────────────────────────────────────────────────
  function agregarEstudio() {
    setEstudios(prev => [...prev, {
      id: Date.now().toString(), universidad: '', titulo: '', inicio: '', termino: ''
    }])
  }

  function eliminarEstudio(id: string) {
    setEstudios(prev => prev.filter(e => e.id !== id))
  }

  function actualizarEstudio(id: string, campo: keyof Estudio, valor: string) {
    setEstudios(prev => prev.map(e => e.id === id ? { ...e, [campo]: valor } : e))
  }

  // ── Documentos ─────────────────────────────────────────────────────────────
  function agregarTitulo(files: FileList) {
    const nuevos: Documento[] = Array.from(files).map(f => ({
      nombre: f.name, archivo: f, preview: null
    }))
    setTituloDoc(prev => [...prev, ...nuevos])
  }

  function limpiarTitulo(index?: number) {
    if (index !== undefined) setTituloDoc(prev => prev.filter((_, i) => i !== index))
    else setTituloDoc([])
  }

  // ── Guardar borrador ───────────────────────────────────────────────────────
  async function guardarBorrador() {
    setGuardando(true)
    // Guardar en localStorage como borrador
    const borrador = {
      paso, nombre, apellido, rut, email, celular, resumen, estudios,
      guardadoEn: new Date().toISOString()
    }
    localStorage.setItem('cerovueltas_borrador_pro', JSON.stringify(borrador))
    await new Promise(r => setTimeout(r, 600))
    setGuardando(false)
    alert('Borrador guardado. Puedes continuar más tarde.')
  }

  // ── Validar paso ───────────────────────────────────────────────────────────
  function validarPaso1(): string | null {
    if (!nombre.trim())   return 'El nombre es obligatorio.'
    if (!apellido.trim()) return 'El apellido es obligatorio.'
    if (!rut.trim())      return 'El RUT es obligatorio.'
    if (!email.trim())    return 'El email es obligatorio.'
    if (!celular.trim())  return 'El celular es obligatorio.'
    if (!resumen.trim())  return 'El resumen ejecutivo es obligatorio.'
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
    return null
  }

  function validarPaso2(): string | null {
    for (const e of estudios) {
      if (!e.universidad.trim()) return 'Completa la universidad en todos los estudios.'
      if (!e.titulo.trim())      return 'Completa el título en todos los estudios.'
      if (!e.inicio)             return 'Ingresa el año de inicio en todos los estudios.'
    }
    return null
  }

  function handleContinuar() {
    setError('')
    if (paso === 1) {
      const err = validarPaso1()
      if (err) { setError(err); return }
    }
    if (paso === 2) {
      const err = validarPaso2()
      if (err) { setError(err); return }
    }
    setPaso(p => p + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Submit final ───────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          nombre, apellido, role: 'profesional',
          rut, celular, resumen,
          estudios: JSON.stringify(estudios),
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message === 'User already registered'
        ? 'Este email ya está registrado.'
        : 'Error al crear la cuenta. Intenta nuevamente.')
      setLoading(false)
      return
    }

    // TODO: subir documentos a Supabase Storage en etapa siguiente
    localStorage.removeItem('cerovueltas_borrador_pro')
    setSuccess(true)
    setLoading(false)
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <CheckCircle size={52} className="text-green-500 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-navy mb-2">¡Registro enviado!</h2>
          <p className="text-gray-500 text-sm mb-2">
            Confirmamos tu email a <strong>{email}</strong>.
          </p>
          <p className="text-gray-400 text-xs mb-6">
            Tu perfil será revisado por nuestro equipo en un plazo de 24-48 horas hábiles. 
            Te notificaremos cuando esté verificado.
          </p>
          <Link href="/login" className="btn-gold block text-center py-3 rounded">
            Ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-2/5 bg-navy flex-col justify-between p-12 sticky top-0 h-screen">
        <Link href="/"><img src="/logo.png" alt="Cerovueltas" className="h-12" /></Link>
        <div>
          <h2 className="font-display text-3xl text-white leading-tight mb-4">
            Conecta con cientos de <span className="text-gold">PYMEs en Antofagasta</span>
          </h2>
          <ul className="space-y-3 mt-4">
            {['Perfil verificado por nuestro equipo', 'Acceso a clientes activos 24/7', 'Pagos seguros garantizados', 'Soporte dedicado'].map(item => (
              <li key={item} className="flex items-center gap-3 text-white/70 text-sm">
                <span className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center text-gold text-xs shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-white/30 text-xs">© 2025 Cerovueltas</p>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex items-start justify-center p-6 lg:p-10 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-xl py-4">
          <Link href="/" className="block lg:hidden mb-6 text-center">
            <img src="/logo.png" alt="Cerovueltas" className="h-9 mx-auto" />
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="font-display text-2xl text-navy mb-0.5">Registro Profesional</h1>
              <p className="text-gray-400 text-sm">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-gold font-semibold hover:underline">Inicia sesión</Link>
              </p>
            </div>

            {/* Indicador de pasos */}
            <PasoIndicador actual={paso} />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
                {error}
              </div>
            )}

            <form onSubmit={paso === 3 ? handleSubmit : e => { e.preventDefault(); handleContinuar() }}>

              {/* ══ PASO 1: Datos Personales ══════════════════════════════ */}
              {paso === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
                      <input value={nombre} onChange={e => setNombre(e.target.value)}
                        className="input-field" required placeholder="Juan" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellido *</label>
                      <input value={apellido} onChange={e => setApellido(e.target.value)}
                        className="input-field" required placeholder="Pérez" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">RUT *</label>
                      <input value={rut} onChange={e => setRut(formatRut(e.target.value))}
                        className="input-field" required placeholder="12.345.678-9" maxLength={12} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Celular *</label>
                      <input value={celular} onChange={e => setCelular(e.target.value)}
                        className="input-field" required placeholder="+56 9 1234 5678" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="input-field" required placeholder="tucorreo@profesional.cl" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Contraseña <span className="text-gray-400 font-normal">(mín. 8 caracteres)</span>
                    </label>
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••" required className="input-field pr-10" />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Resumen Ejecutivo *
                      <span className="text-gray-400 font-normal ml-1">(describe tu experiencia y especialidades)</span>
                    </label>
                    <textarea value={resumen} onChange={e => setResumen(e.target.value)}
                      rows={4} maxLength={600} required
                      className="input-field resize-none"
                      placeholder="Soy contador con 10 años de experiencia en PYMEs, especializado en declaraciones tributarias y estados financieros bajo norma IFRS…" />
                    <p className="text-right text-xs text-gray-400 mt-1">{resumen.length}/600</p>
                  </div>
                </div>
              )}

              {/* ══ PASO 2: Estudios ══════════════════════════════════════ */}
              {paso === 2 && (
                <div className="space-y-5">
                  <p className="text-sm text-gray-500">Agrega todos tus títulos y estudios relevantes.</p>

                  {estudios.map((estudio, index) => (
                    <div key={estudio.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100 relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-navy uppercase tracking-wider">
                          Estudio {index + 1}
                        </span>
                        {estudios.length > 1 && (
                          <button type="button" onClick={() => eliminarEstudio(estudio.id)}
                            className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Universidad / Instituto *</label>
                          <input value={estudio.universidad}
                            onChange={e => actualizarEstudio(estudio.id, 'universidad', e.target.value)}
                            className="input-field" placeholder="Universidad de Antofagasta" required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Título obtenido *</label>
                          <input value={estudio.titulo}
                            onChange={e => actualizarEstudio(estudio.id, 'titulo', e.target.value)}
                            className="input-field" placeholder="Contador Público y Auditor" required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Año de inicio *</label>
                            <input type="number" min="1970" max={new Date().getFullYear()}
                              value={estudio.inicio}
                              onChange={e => actualizarEstudio(estudio.id, 'inicio', e.target.value)}
                              className="input-field" placeholder="2010" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Año de término</label>
                            <input type="number" min="1970" max={new Date().getFullYear() + 6}
                              value={estudio.termino}
                              onChange={e => actualizarEstudio(estudio.id, 'termino', e.target.value)}
                              className="input-field" placeholder="2015 (o en curso)" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button type="button" onClick={agregarEstudio}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-500 hover:border-navy hover:text-navy transition-all flex items-center justify-center gap-2">
                    <Plus size={15} /> Agregar otro estudio
                  </button>
                </div>
              )}

              {/* ══ PASO 3: Documentos ════════════════════════════════════ */}
              {paso === 3 && (
                <div className="space-y-5">
                  <p className="text-sm text-gray-500">
                    Sube tus documentos para verificar tu identidad y credenciales. Formatos aceptados: PDF, JPG, PNG.
                  </p>

                  <DocumentoUpload
                    label="Título Universitario *"
                    doc={tituloDoc.length > 0 ? tituloDoc : [{ nombre: '', archivo: null, preview: null }]}
                    onChange={agregarTitulo}
                    onClear={limpiarTitulo}
                    multiple
                  />

                  <DocumentoUpload
                    label="Carnet de Identidad — Anverso (lado con foto) *"
                    doc={carnetAnv ?? { nombre: '', archivo: null, preview: null }}
                    onChange={files => setCarnetAnv({ nombre: files[0].name, archivo: files[0], preview: null })}
                    onClear={() => setCarnetAnv(null)}
                  />

                  <DocumentoUpload
                    label="Carnet de Identidad — Reverso *"
                    doc={carnetRev ?? { nombre: '', archivo: null, preview: null }}
                    onChange={files => setCarnetRev({ nombre: files[0].name, archivo: files[0], preview: null })}
                    onClear={() => setCarnetRev(null)}
                  />

                  <DocumentoUpload
                    label="Certificado de Antecedentes *"
                    doc={antecedentes ?? { nombre: '', archivo: null, preview: null }}
                    onChange={files => setAntecedentes({ nombre: files[0].name, archivo: files[0], preview: null })}
                    onClear={() => setAntecedentes(null)}
                  />

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 leading-relaxed">
                    <strong>Nota:</strong> Tus documentos son tratados de forma confidencial y solo serán utilizados para verificar tu identidad y credenciales. Una vez verificado, tu perfil aparecerá en la plataforma.
                  </div>
                </div>
              )}

              {/* ══ BOTONES ═══════════════════════════════════════════════ */}
              <div className="flex items-center gap-3 mt-7 pt-5 border-t border-gray-100">
                {/* Volver */}
                {paso > 1 && (
                  <button type="button" onClick={() => { setPaso(p => p - 1); setError('') }}
                    className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                    ← Volver
                  </button>
                )}

                {/* Guardar borrador */}
                <button type="button" onClick={guardarBorrador} disabled={guardando}
                  className="px-5 py-2.5 rounded-lg border border-navy/30 text-navy text-sm font-medium hover:bg-navy/5 transition-colors flex items-center gap-2 disabled:opacity-50">
                  {guardando && <Loader2 size={13} className="animate-spin" />}
                  {guardando ? 'Guardando…' : 'Guardar borrador'}
                </button>

                <div className="flex-1" />

                {/* Continuar / Guardar */}
                {paso < 3 ? (
                  <button type="submit"
                    className="btn-gold px-7 py-2.5 flex items-center gap-2 text-sm">
                    Continuar →
                  </button>
                ) : (
                  <button type="submit" disabled={loading}
                    className="btn-gold px-7 py-2.5 flex items-center gap-2 text-sm disabled:opacity-50">
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {loading ? 'Enviando…' : 'Crear cuenta'}
                  </button>
                )}
              </div>
            </form>

            <p className="text-xs text-gray-400 text-center mt-5">
              Al registrarte aceptas nuestros{' '}
              <Link href="/terminos" className="underline">Términos de Uso</Link>{' '}y{' '}
              <Link href="/privacidad" className="underline">Política de Privacidad</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Alias para el indicador (fix typo en el JSX)
function PasoIndicador({ actual }: { actual: number }) {
  return <PasoIndicator actual={actual} />
}
