'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle } from 'lucide-react'

export default function RecuperarPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: err } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/actualizar-password` }
    )

    if (err) {
      setError('Error al enviar el correo. Verifica el email ingresado.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <CheckCircle size={52} className="text-green-500 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-navy mb-2">Correo enviado</h2>
          <p className="text-gray-500 text-sm mb-6">
            Revisa tu bandeja de entrada en <strong>{email}</strong> y sigue las instrucciones para restablecer tu contraseña.
          </p>
          <Link href="/login" className="btn-gold block text-center py-3 rounded">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Link href="/" className="block mb-6">
            <img src="/logo.png" alt="Cerovueltas" className="h-10 object-contain" />
          </Link>

          <h1 className="font-display text-2xl text-navy mb-1">Recuperar contraseña</h1>
          <p className="text-gray-500 text-sm mb-7">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tucorreo@empresa.cl"
                required className="input-field"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Enviando…' : 'Enviar enlace'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            <Link href="/login" className="text-gold hover:underline">
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
