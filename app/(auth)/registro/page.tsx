'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import type { UserRole } from '@/lib/supabase/types'

const RELACION_EMPRESA = [
  'Gerente General',
  'Gerente de Compras',
  'Gerente de Contabilidad',
]

export default function RegistroPage() {
  const router  = useRouter()
  const [role, setRole] = useState<UserRole>('cliente')

  // Datos comunes
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [nombre,   setNombre]   = useState('')
  const [apellido, setApellido] = useState('')

  // Datos PYME
  const [nombreEmpresa,     setNombreEmpresa]     = useState('')
  const [rutEmpresa,        setRutEmpresa]        = useState('')
  const [giro,              setGiro]              = useState('')
  const [rutRepresentante,  setRutRepresentante]  = useState('')
  const [relacionEmpresa,   setRelacionEmpresa]   = useState(RELACION_EMPRESA[0])
  const [trabajadoresContrato,   setTrabajadoresContrato]   = useState('')
  const [trabajadoresHonorarios, setTrabajadoresHonorarios] = useState('')
  const [promedioVentas,   setPromedioVentas]   = useState('')

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  function formatRut(value: string) {
    const clean = value.replace(/[^0-9kK]/g, '')
    if (clean.length <= 1) return clean
    const body = clean.slice(0, -1)
    const dv   = clean.slice(-1).toUpperCase()
    const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return `${formatted}-${dv}`
  }

  function formatMonto(value: string) {
    const clean = value.replace(/\D/g, '')
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      setLoading(false)
      return
    }

    const metadata: Record<string, string> = {
      nombre, apellido, role,
    }

    if (role === 'cliente') {
      metadata.empresa             = nombreEmpresa
      metadata.rut_empresa         = rutEmpresa
      metadata.giro                = giro
      metadata.rut_representante   = rutRepresentante
      metadata.relacion_empresa    = relacionEmpresa
      metadata.trabajadores_contrato   = trabajadoresContrato
      metadata.trabajadores_honorarios = trabajadoresHonorarios
      metadata.promedio_ventas     = promedioVentas.replace(/\./g, '')
    }

    const { error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: metadata,
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

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <CheckCircle size={52} className="text-green-500 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-navy mb-2">¡Cuenta creada!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Te enviamos un email de confirmación a <strong>{email}</strong>.
            Revisa tu bandeja y haz clic en el enlace para activar tu cuenta.
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
        <Link href="/">
          <img src="/logo.png" alt="Cerovueltas" className="h-12" />
        </Link>
        <div>
          <h2 className="font-display text-4xl text-white leading-tight mb-4">
            Conecta tu PYME con el{' '}
            <span className="text-gold">profesional indicado</span>{' '}
              en Antofagasta
          </h2>
          <ul className="space-y-3 mt-6">
            {[
              'Profesionales 100% verificados',
              'Conexión directa en minutos',
              'Garantía de satisfacción',
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-white/70 text-sm">
                <span className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center text-gold text-xs">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-white/30 text-xs">© 2025 Cerovueltas</p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-start justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-xl py-4">
          <Link href="/" className="block lg:hidden mb-8 text-center">
            <img src="/logo.png" alt="Cerovueltas" className="h-10 mx-auto" />
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="font-display text-2xl text-navy mb-1">Crear cuenta</h1>
            <p className="text-gray-500 text-sm mb-6">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-gold font-semibold hover:underline">Inicia sesión</Link>
            </p>

            {/* Selector de rol */}
            <div className="grid grid-cols-2 gap-2 mb-7 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setRole('cliente')}
                className={`py-2.5 rounded-md text-sm font-semibold transition-all ${
                  role === 'cliente' ? 'bg-navy text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                🏢 Soy PYME
              </button>
              <Link
                href="/registro/profesional"
                className="py-2.5 rounded-md text-sm font-semibold text-gray-500 hover:text-gray-700 text-center transition-all hover:bg-white/50">
                👤 Soy Profesional
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleRegistro} className="space-y-5">

              {/* ── DATOS PYME ─────────────────────────────────── */}
              {role === 'cliente' && (
                <>
                  <div className="pb-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-navy uppercase tracking-wider">Datos de la Empresa</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de la Empresa *</label>
                    <input value={nombreEmpresa} onChange={e => setNombreEmpresa(e.target.value)}
                      className="input-field" required placeholder="Mi Empresa SpA" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">RUT de la Empresa *</label>
                      <input value={rutEmpresa}
                        onChange={e => setRutEmpresa(formatRut(e.target.value))}
                        className="input-field" required placeholder="76.123.456-7" maxLength={12} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Giro *</label>
                      <input value={giro} onChange={e => setGiro(e.target.value)}
                        className="input-field" required placeholder="Comercio al por menor" />
                    </div>
                  </div>

                  <div className="pb-2 border-b border-gray-100 pt-2">
                    <p className="text-xs font-bold text-navy uppercase tracking-wider">Representante Legal</p>
                  </div>

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
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">RUT Representante *</label>
                      <input value={rutRepresentante}
                        onChange={e => setRutRepresentante(formatRut(e.target.value))}
                        className="input-field" required placeholder="12.345.678-9" maxLength={12} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Cargo *</label>
                      <select value={relacionEmpresa} onChange={e => setRelacionEmpresa(e.target.value)}
                        className="input-field bg-white">
                        {RELACION_EMPRESA.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pb-2 border-b border-gray-100 pt-2">
                    <p className="text-xs font-bold text-navy uppercase tracking-wider">Información Laboral y Financiera</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Trabajadores contratados *</label>
                      <input type="number" min="0" value={trabajadoresContrato}
                        onChange={e => setTrabajadoresContrato(e.target.value)}
                        className="input-field" required placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Trabajadores a honorarios *</label>
                      <input type="number" min="0" value={trabajadoresHonorarios}
                        onChange={e => setTrabajadoresHonorarios(e.target.value)}
                        className="input-field" required placeholder="0" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Promedio de ventas últimos 3 meses (CLP) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input value={promedioVentas}
                        onChange={e => setPromedioVentas(formatMonto(e.target.value))}
                        className="input-field pl-7" required placeholder="1.500.000" />
                    </div>
                  </div>

                  <div className="pb-2 border-b border-gray-100 pt-2">
                    <p className="text-xs font-bold text-navy uppercase tracking-wider">Acceso a la Plataforma</p>
                  </div>
                </>
              )}

              {/* ── DATOS PROFESIONAL ──────────────────────────── */}
              {role === 'profesional' && (
                <div className="grid grid-cols-2 gap-3">
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
                </div>
              )}

              {/* ── EMAIL Y CONTRASEÑA ─────────────────────────── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input-field" required placeholder="tucorreo@empresa.cl" />
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

              <button type="submit" disabled={loading}
                className="btn-gold w-full flex items-center justify-center gap-2 py-3 mt-2">
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Creando cuenta…' : 'Crear cuenta gratis'}
              </button>
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
