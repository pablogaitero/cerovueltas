'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import type { UserRole } from '@/lib/supabase/types'

export default function RegistroPage() {
  const router = useRouter()

  const [role, setRole] = useState<UserRole>('cliente')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      setLoading(false)
      return
    }

    const { error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { nombre, apellido, empresa, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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
          <div className="flex justify-center mb-4">
            <CheckCircle size={52} className="text-green-500" />
          </div>
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
      <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col justify-between p-12">
        <Link href="/" className="block">
          <img src="/logo.png" alt="Cerovueltas" className="h-12" />
        </Link>
        <div>
          <h2 className="font-display text-4xl text-white leading-tight mb-4">
            Únete a más de{' '}
            <span className="text-gold">8.400 empresas</span>{' '}
            que ya encontraron su profesional
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
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">
          <Link href="/" className="block lg:hidden mb-8 text-center">
            <img src="/logo.png" alt="Cerovueltas" className="h-10 mx-auto" />
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="font-display text-2xl text-navy mb-1">Crear cuenta</h1>
            <p className="text-gray-500 text-sm mb-6">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-gold font-semibold hover:underline">
                Inicia sesión
              </Link>
            </p>

            {/* Selector de rol */}
            <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
              {(['cliente', 'profesional'] as UserRole[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 rounded-md text-sm font-semibold transition-all ${
                    role === r
                      ? 'bg-navy text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {r === 'cliente' ? '🏢 Soy PYME' : '👤 Soy Profesional'}
                </button>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleRegistro} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
                  <input
                    type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                    placeholder="Juan" required className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellido</label>
                  <input
                    type="text" value={apellido} onChange={e => setApellido(e.target.value)}
                    placeholder="Pérez" className="input-field"
                  />
                </div>
              </div>

              {role === 'cliente' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Empresa</label>
                  <input
                    type="text" value={empresa} onChange={e => setEmpresa(e.target.value)}
                    placeholder="Mi Empresa SpA" className="input-field"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="tucorreo@empresa.cl" required className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contraseña <span className="text-gray-400 font-normal">(mín. 8 caracteres)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required className="input-field pr-10"
                  />
                  <button
                    type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="btn-gold w-full flex items-center justify-center gap-2 py-3 mt-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Creando cuenta…' : 'Crear cuenta gratis'}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-5">
              Al registrarte aceptas nuestros{' '}
              <Link href="/terminos" className="underline">Términos de Uso</Link>
              {' '}y{' '}
              <Link href="/privacidad" className="underline">Política de Privacidad</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
