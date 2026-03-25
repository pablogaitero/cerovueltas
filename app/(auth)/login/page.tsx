'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || null

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError, data } = await supabase.auth.signInWithPassword({
      email:    email.trim().toLowerCase(),
      password,
    })

    if (authError || !data.user) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    const userId = data.user.id

    const { data: rawProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    const profile = rawProfile as { role: string } | null
    const destino = profile?.role === 'profesional' ? '/profesional' : '/cliente'

    router.push(redirectTo ?? destino)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col justify-between p-12">
        <Link href="/">
          <img src="/logo.png" alt="Cerovueltas" className="h-12" />
        </Link>
        <div>
          <h2 className="font-display text-4xl text-white leading-tight mb-4">
            Conecta tu PYME con el{' '}
            <em className="text-gold">profesional indicado</em>
          </h2>
          <p className="text-white/60 text-lg">
            Contadores y abogados verificados en Antofagasta.
          </p>
        </div>
        <div className="flex gap-8">
          {[['247', 'Profesionales'], ['8.4K', 'PYMEs'], ['4.9★', 'Rating']].map(([n, l]) => (
            <div key={l}>
              <div className="text-2xl font-bold text-gold">{n}</div>
              <div className="text-white/50 text-sm">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Link href="/" className="block lg:hidden mb-8 text-center">
            <img src="/logo.png" alt="Cerovueltas" className="h-10 mx-auto" />
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="font-display text-2xl text-navy mb-1">Iniciar sesión</h1>
            <p className="text-gray-500 text-sm mb-7">
              ¿No tienes cuenta?{' '}
              <Link href="/registro" className="text-gold font-semibold hover:underline">
                Regístrate gratis
              </Link>
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tucorreo@empresa.cl"
                  required className="input-field"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <Link href="/recuperar-password" className="text-xs text-gold hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
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
                className="btn-gold w-full flex items-center justify-center gap-2 py-3"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Ingresando…' : 'Ingresar'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © 2025 Cerovueltas — Antofagasta, Chile
          </p>
        </div>
      </div>
    </div>
  )
}